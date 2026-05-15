const Application = require('../models/Application');
const Job = require('../models/Job');
const { sendStatusUpdateEmail } = require('../services/emailService');
const cloudinary = require('../config/cloudinaryConfig');
const { evaluateResume } = require('../services/atsService');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');


const submitApplication = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Resume file is required' });
    }

    try {
        const trimmedPhone = (req.body.phone || '').trim();
        const normalizedEmail = (req.body.email || '').trim().toLowerCase();
        const normalizedPhone = trimmedPhone.replace(/\D/g, '');
        const experienceYears = Number(req.body.experienceYears);

        if (!normalizedEmail || !normalizedPhone) {
            return res.status(400).json({ message: 'Email and Phone number are required' });
        }

        const existingApplication = await Application.findOne({
            jobId: req.body.jobId,
            $or: [
                { email: normalizedEmail },
                { phone: trimmedPhone },
                { phoneNormalized: normalizedPhone },
            ]
        }).lean();

        if (existingApplication) {
            const duplicateFields = [];
            if (existingApplication.email === normalizedEmail) duplicateFields.push('email');
            if (existingApplication.phone === trimmedPhone || existingApplication.phoneNormalized === normalizedPhone) duplicateFields.push('phone number');

            return res.status(409).json({
                message: `You have already applied for this job with this ${duplicateFields.join(' and ')}.`
            });
        }
        // stream to Cloudinary
        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                const isRaw = req.file.originalname.toLowerCase().match(/\.(docx|doc)$/);
                const options = {
                    folder: 'resumes',
                    resource_type: isRaw ? 'raw' : 'auto',
                    type: 'upload',
                    access_mode: 'public', // Ensure public access
                };

                if (isRaw) {
                    const ext = require('path').extname(req.file.originalname);
                    options.public_id = `resume_${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
                }

                const stream = cloudinary.uploader.upload_stream(
                    options,
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                stream.end(req.file.buffer);
            });
        };

        const result = await streamUpload(req);

        let atsScore = null;
        let missingSkills = [];
        let presentSkills = [];

        try {
            let resumeText = '';

            // check file type and parse accordingly
            if (req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf')) {
                const pdfData = await pdfParse(req.file.buffer);
                resumeText = pdfData.text;
            } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || req.file.originalname.toLowerCase().endsWith('.docx')) {
                const docxData = await mammoth.extractRawText({ buffer: req.file.buffer });
                resumeText = docxData.value;
            } else {
                console.warn(`Unsupported file type for ATS evaluation: ${req.file.originalname}`);
            }

            if (resumeText) {
                // evaluate ATS score
                const job = await Job.findById(req.body.jobId);
                if (job) {
                    const evaluation = await evaluateResume(resumeText, job.description, job.skills);
                    atsScore = evaluation.atsScore;
                    missingSkills = evaluation.missingSkills;
                    presentSkills = evaluation.presentSkills;
                }
            }
        } catch (err) {
            console.error('Error during ATS evaluation:', err);
        }

        const application = new Application({
            jobId: req.body.jobId,
            name: req.body.name,
            email: normalizedEmail,
            phone: trimmedPhone,
            phoneNormalized: normalizedPhone,
            experienceYears: isNaN(experienceYears) ? 0 : experienceYears,
            resumePath: result.secure_url, // Storing Cloudinary URL
            atsScore,
            missingSkills,
            presentSkills
        });

        const newApplication = await application.save();
        res.status(201).json(newApplication);
    } catch (err) {
        console.error('Cloudinary upload error:', err);
        res.status(400).json({ message: 'Error uploading resume: ' + err.message });
    }
};

const getAllApplications = async (req, res) => {
    try {
        const applications = await Application.find().sort({ submittedAt: -1 }).populate('jobId', 'title skills');
        res.json(applications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        const { status: newStatus } = req.body;

        if (!newStatus) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const application = await Application.findById(req.params.id).populate('jobId', 'title');
        if (!application) return res.status(404).json({ message: 'Application not found' });

        const oldStatus = application.status;

        if (oldStatus === newStatus) {
            return res.json({ ...application.toObject(), emailSent: false });
        }

        // Use updateOne to bypass unique index conflicts on deleted-job applications
        await Application.updateOne({ _id: req.params.id }, { $set: { status: newStatus } });

        // Send email notification
        const jobTitle = application.jobId ? application.jobId.title : 'Position';
        const emailResult = await sendStatusUpdateEmail(
            application.email,
            application.name,
            jobTitle,
            newStatus
        );

        if (!emailResult.success) {
            console.error('Failed to send email:', emailResult.error);
        }

        const updatedApplication = await Application.findById(req.params.id).populate('jobId', 'title');

        res.json({
            ...updatedApplication.toObject(),
            emailSent: emailResult.success
        });
    } catch (err) {
        console.error('Status update error:', err.message);
        res.status(500).json({ message: err.message });
    }
};

const deleteApplication = async (req, res) => {
    try {
        const application = await Application.findByIdAndDelete(req.params.id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }
        res.json({ message: 'Application deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const toggleSavedResume = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id).populate('jobId', 'title');
        if (!application) return res.status(404).json({ message: 'Application not found' });

        const shouldSave = Boolean(req.body.isSavedForFuture);
        application.isSavedForFuture = shouldSave;
        application.savedForFutureAt = shouldSave ? new Date() : null;

        const updatedApplication = await application.save();
        res.json(updatedApplication);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const deleteAllApplications = async (req, res) => {
    try {
        const { before, jobRole, status, experience, atsScore } = req.query;

        const filter = {};

        // Date filter — required
        if (before) {
            filter.submittedAt = { $lt: new Date(before) };
        }

        // Status filter
        if (status && status !== 'all') {
            filter.status = status;
        }

        // ATS score filter — delete below this threshold
        if (atsScore && atsScore !== 'all') {
            const threshold = parseInt(atsScore, 10);
            filter.atsScore = { $lt: threshold };
        }

        // Experience filter
        if (experience && experience !== 'all') {
            if (experience === '0') {
                filter.experienceYears = 0;
            } else if (experience === '1-2') {
                filter.experienceYears = { $gte: 1, $lte: 2 };
            } else if (experience === '3-5') {
                filter.experienceYears = { $gte: 3, $lte: 5 };
            } else if (experience === '6+') {
                filter.experienceYears = { $gte: 6 };
            }
        }

        // Job role filter — need to look up the job _id by title
        if (jobRole && jobRole !== 'all') {
            const job = await Job.findOne({ title: jobRole });
            if (job) {
                filter.jobId = job._id;
            } else {
                // No matching job found — nothing to delete
                return res.json({ message: '0 application(s) deleted' });
            }
        }

        const result = await Application.deleteMany(filter);
        res.json({ message: `${result.deletedCount} application(s) deleted` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    submitApplication,
    getAllApplications,
    updateApplicationStatus,
    toggleSavedResume,
    deleteApplication,
    deleteAllApplications
};

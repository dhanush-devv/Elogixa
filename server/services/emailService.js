const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates based on status
const getEmailTemplate = (applicantName, jobTitle, status) => {
    const templates = {
        'Under Review': {
            subject: `Application Update: ${jobTitle} - Under Review`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #3b82f6;">Application Under Review</h2>
                    <p>Dear ${applicantName},</p>
                    <p>Thank you for your application for the position of <strong>${jobTitle}</strong>.</p>
                    <p>We are pleased to inform you that your application is currently <strong>under review</strong> by our hiring team.</p>
                    <p>We will get back to you soon with further updates.</p>
                    <br>
                    <p>Best regards,<br>
                    <strong>Elogixa HR Team</strong><br>
                    contact@elogixa.co.in</p>
                </div>
            `
        },
        'Shortlisted': {
            subject: `Congratulations! You've been Shortlisted for ${jobTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #10b981;">Congratulations!</h2>
                    <p>Dear ${applicantName},</p>
                    <p>We are excited to inform you that you have been <strong>shortlisted</strong> for the position of <strong>${jobTitle}</strong>!</p>
                    <p>Our team was impressed with your qualifications and experience. We will contact you shortly to schedule the next round of interviews.</p>
                    <p>Please keep an eye on your email and phone for further communication.</p>
                    <br>
                    <p>Best regards,<br>
                    <strong>Elogixa HR Team</strong><br>
                    contact@elogixa.co.in</p>
                </div>
            `
        },
        'Rejected': {
            subject: `Application Update: ${jobTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #64748b;">Application Update</h2>
                    <p>Dear ${applicantName},</p>
                    <p>Thank you for your interest in the position of <strong>${jobTitle}</strong> at Elogixa.</p>
                    <p>After careful consideration, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely match our current needs.</p>
                    <p>We appreciate the time and effort you invested in the application process. We encourage you to apply for future openings that match your skills and experience.</p>
                    <p>We wish you all the best in your job search.</p>
                    <br>
                    <p>Best regards,<br>
                    <strong>Elogixa HR Team</strong><br>
                    contact@elogixa.co.in</p>
                </div>
            `
        },
        'Accepted': {
            subject: `Offer Letter: ${jobTitle} at Elogixa`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #10b981;">Congratulations! 🎉</h2>
                    <p>Dear ${applicantName},</p>
                    <p>We are delighted to offer you the position of <strong>${jobTitle}</strong> at Elogixa!</p>
                    <p>Your skills, experience, and enthusiasm impressed our team, and we believe you will be a valuable addition to our organization.</p>
                    <p>Our HR team will contact you shortly with the official offer letter and next steps regarding onboarding.</p>
                    <p>Welcome to the Elogixa family!</p>
                    <br>
                    <p>Best regards,<br>
                    <strong>Elogixa HR Team</strong><br>
                    contact@elogixa.co.in</p>
                </div>
            `
        }
    };

    return templates[status] || {
        subject: `Application Status Update: ${jobTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3b82f6;">Application Status Update</h2>
                <p>Dear ${applicantName},</p>
                <p>Your application status for <strong>${jobTitle}</strong> has been updated to: <strong>${status}</strong></p>
                <br>
                <p>Best regards,<br>
                <strong>Elogixa HR Team</strong><br>
                contact@elogixa.co.in</p>
            </div>
        `
    };
};

// Send status update email to applicant
const sendStatusUpdateEmail = async (applicantEmail, applicantName, jobTitle, newStatus) => {
    try {
        if (newStatus === 'Pending') {
            return { success: true, message: 'No email sent for Pending status' };
        }

        const template = getEmailTemplate(applicantName, jobTitle, newStatus);

        const { data, error } = await resend.emails.send({
            from: 'Elogixa HR <onboarding@resend.dev>',
            to: applicantEmail,
            subject: template.subject,
            html: template.html
        });

        if (error) {
            console.error('Error sending status email:', error);
            return { success: false, error: error.message };
        }

        console.log('Status update email sent:', data.id);
        return { success: true, messageId: data.id };
    } catch (error) {
        console.error('Error sending status email:', error);
        return { success: false, error: error.message };
    }
};

// Send contact notification email to admin
const sendContactNotificationEmail = async ({ name, email, country, service, message }) => {
    try {
        const safeName = name || 'Unknown sender';
        const safeEmail = email || 'No email provided';
        const safeCountry = country || 'Not provided';
        const safeService = service || 'Not provided';
        const safeMessage = message || 'No message provided';

        console.log('📧 Sending contact notification to:', process.env.CONTACT_NOTIFICATION_EMAIL);

        const { data, error } = await resend.emails.send({
            from: 'Elogixa Website <onboarding@resend.dev>',
            to: process.env.CONTACT_NOTIFICATION_EMAIL,
            reply_to: safeEmail,
            subject: `New client website enquiry from ${safeName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
                    <h2 style="color: #0f172a;">New Contact Form Submission</h2>
                    <p>A new message was submitted from the client website.</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700;">Name</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">${safeName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700;">Email</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">${safeEmail}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700;">Country</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">${safeCountry}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700;">Service Involved</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">${safeService}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700;">Message</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap;">${safeMessage}</td>
                        </tr>
                    </table>
                </div>
            `
        });

        if (error) {
            console.error('Error sending contact notification email:', error);
            return { success: false, error: error.message };
        }

        console.log('Contact notification email sent:', data.id);
        return { success: true, messageId: data.id };
    } catch (error) {
        console.error('Error sending contact notification email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendStatusUpdateEmail, sendContactNotificationEmail };

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Plus, Trash2, FileText, LogOut, Loader2, Bookmark, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

const AdminDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [messages, setMessages] = useState([]);
    const [pendingAdmins, setPendingAdmins] = useState([]);
    const [activeTab, setActiveTab] = useState('jobs');
    const [newJob, setNewJob] = useState({
        title: '', description: '', skills: '', openings: 1, location: 'Remote', salaryRange: ''
    });
    const [resumeModal, setResumeModal] = useState({ isOpen: false, url: '', name: '' });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, type: null });
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCreatingJob, setIsCreatingJob] = useState(false);
    const [actioningAdmins, setActioningAdmins] = useState({});
    const [applicationFilters, setApplicationFilters] = useState({
        jobRole: 'all',
        experience: 'all',
        skill: 'all',
        atsScore: 'all',
    });
    const [messageSearch, setMessageSearch] = useState('');
    const [messageFilters, setMessageFilters] = useState({ service: 'all', country: 'all', dateSort: 'newest' });
    const [isDeletingAllMessages, setIsDeletingAllMessages] = useState(false);
    const [deleteBeforeModal, setDeleteBeforeModal] = useState(false);
    const [deleteBeforeDate, setDeleteBeforeDate] = useState('');
    const [deleteAppBeforeModal, setDeleteAppBeforeModal] = useState(false);
    const [deleteAppBeforeDate, setDeleteAppBeforeDate] = useState('');
    const [isDeletingAllApps, setIsDeletingAllApps] = useState(false);
    const [deleteAppFilters, setDeleteAppFilters] = useState({ jobRole: 'all', status: 'all', experience: 'all', atsScore: 'all' });
    const navigate = useNavigate();
    const savedApplications = applications.filter((app) => app.isSavedForFuture);

    const authAxios = useMemo(() => {
        const instance = axios.create({ baseURL: `${API_BASE_URL}/api` });
        instance.interceptors.request.use((config) => {
            const token = localStorage.getItem('adminToken');
            if (token) config.headers.Authorization = `Bearer ${token}`;
            return config;
        });
        return instance;
    }, []);

    const handleAuthError = useCallback((err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('adminToken');
            navigate('/admin/login');
            return true;
        }
        return false;
    }, [navigate]);

    const fetchData = useCallback(async () => {
        try {
            const jobsRes = await axios.get(`${API_BASE_URL}/api/jobs`);
            const appsRes = await authAxios.get('/applications');
            const msgsRes = await authAxios.get('/contact');
            const pendingAdminsRes = await authAxios.get('/auth/pending-admins');

            setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
            setApplications(Array.isArray(appsRes.data) ? appsRes.data : []);
            setMessages(Array.isArray(msgsRes.data) ? msgsRes.data : []);
            setPendingAdmins(Array.isArray(pendingAdminsRes.data) ? pendingAdminsRes.data : []);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            if (!handleAuthError(err)) {
                toast.error('Failed to load dashboard data');
            }
        }
    }, [authAxios, handleAuthError]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateJob = async (e) => {
        e.preventDefault();
        setIsCreatingJob(true);
        const skillsArray = newJob.skills.split(',').map(s => s.trim());
        try {
            await authAxios.post('/jobs', { ...newJob, skills: skillsArray });
            toast.success('Job posted successfully!');
            setNewJob({ title: '', description: '', skills: '', openings: 1, location: 'Remote', salaryRange: '' });
            fetchData();
        } catch (err) {
            console.error(err);
            if (!handleAuthError(err)) {
                toast.error('Failed to post job');
            }
        } finally {
            setIsCreatingJob(false);
        }
    };

    const handleDeleteJob = (id) => {
        setDeleteModal({ isOpen: true, id, type: 'job' });
    };

    const handleDeleteApplication = (id) => {
        setDeleteModal({ isOpen: true, id, type: 'application' });
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            if (deleteModal.type === 'job') {
                await authAxios.delete(`/jobs/${deleteModal.id}`);
                toast.success('Job deleted successfully!');
            } else if (deleteModal.type === 'application') {
                await authAxios.delete(`/applications/${deleteModal.id}`);
                toast.success('Application deleted successfully!');
            } else if (deleteModal.type === 'message') {
                await authAxios.delete(`/contact/${deleteModal.id}`);
                toast.success('Message deleted.');
            }
            setDeleteModal({ isOpen: false, id: null, type: null });
            fetchData();
        } catch (err) {
            console.error(err);
            if (!handleAuthError(err)) {
                toast.error(`Failed to delete ${deleteModal.type}`);
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const handleApproveAdmin = async (id) => {
        setActioningAdmins(prev => ({ ...prev, [id]: 'approving' }));
        try {
            await authAxios.put(`/auth/pending-admins/${id}/approve`);
            toast.success('Admin request approved!');
            fetchData();
        } catch (err) {
            console.error(err);
            if (!handleAuthError(err)) {
                toast.error('Failed to approve admin');
            }
        } finally {
            setActioningAdmins(prev => ({ ...prev, [id]: null }));
        }
    };

    const handleRejectAdmin = async (id) => {
        setActioningAdmins(prev => ({ ...prev, [id]: 'rejecting' }));
        try {
            await authAxios.delete(`/auth/pending-admins/${id}/reject`);
            toast.success('Admin request rejected.');
            fetchData();
        } catch (err) {
            console.error(err);
            if (!handleAuthError(err)) {
                toast.error('Failed to reject admin');
            }
        } finally {
            setActioningAdmins(prev => ({ ...prev, [id]: null }));
        }
    };

    const handleDeleteMessage = (id) => {
        setDeleteModal({ isOpen: true, id, type: 'message' });
    };

    const handleDeleteAllMessages = async () => {
        if (!deleteBeforeDate) return;
        setIsDeletingAllMessages(true);
        try {
            // Set time to end of selected day so the full day is included
            const endOfDay = new Date(deleteBeforeDate);
            endOfDay.setHours(23, 59, 59, 999);
            await authAxios.delete(`/contact?before=${endOfDay.toISOString()}`);
            toast.success(`Messages before ${new Date(deleteBeforeDate).toLocaleDateString()} deleted.`);
            setDeleteBeforeModal(false);
            setDeleteBeforeDate('');
            fetchData();
        } catch (err) {
            if (!handleAuthError(err)) toast.error('Failed to delete messages');
        } finally {
            setIsDeletingAllMessages(false);
        }
    };

    const handleDeleteAllApplications = async () => {
        if (!deleteAppBeforeDate) return;
        setIsDeletingAllApps(true);
        try {
            const endOfDay = new Date(deleteAppBeforeDate);
            endOfDay.setHours(23, 59, 59, 999);
            const params = new URLSearchParams({ before: endOfDay.toISOString() });
            if (deleteAppFilters.jobRole !== 'all') params.set('jobRole', deleteAppFilters.jobRole);
            if (deleteAppFilters.status !== 'all') params.set('status', deleteAppFilters.status);
            if (deleteAppFilters.experience !== 'all') params.set('experience', deleteAppFilters.experience);
            if (deleteAppFilters.atsScore !== 'all') params.set('atsScore', deleteAppFilters.atsScore);
            await authAxios.delete(`/applications?${params.toString()}`);
            toast.success(`Applications deleted.`);
            setDeleteAppBeforeModal(false);
            setDeleteAppBeforeDate('');
            setDeleteAppFilters({ jobRole: 'all', status: 'all', experience: 'all', atsScore: 'all' });
            fetchData();
        } catch (err) {
            if (!handleAuthError(err)) toast.error('Failed to delete applications');
        } finally {
            setIsDeletingAllApps(false);
        }
    };

    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            const response = await authAxios.patch(`/applications/${applicationId}/status`, {
                status: newStatus
            });

            if (response.data.emailSent) {
                toast.success('Status updated and email sent!');
            } else {
                toast.success('Status updated successfully!');
            }

            fetchData();
        } catch (err) {
            console.error(err);
            if (!handleAuthError(err)) {
                toast.error('Failed to update status');
            }
        }
    };

    const handleToggleSavedApplicant = async (applicationId, isCurrentlySaved) => {
        try {
            await authAxios.patch(`/applications/${applicationId}/save`, {
                isSavedForFuture: !isCurrentlySaved
            });

            toast.success(isCurrentlySaved ? 'Applicant removed from saved list.' : 'Applicant saved for future.');
            fetchData();
        } catch (err) {
            console.error(err);
            if (!handleAuthError(err)) {
                toast.error('Failed to update saved applicant');
            }
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'bg-amber-100 text-amber-700',
            'Under Review': 'bg-blue-100 text-blue-700',
            'Shortlisted': 'bg-green-100 text-green-700',
            'Rejected': 'bg-red-100 text-red-700',
            'Accepted': 'bg-emerald-100 text-emerald-700'
        };
        return colors[status] || 'bg-slate-100 text-slate-600';
    };

    const applicationRoleOptions = useMemo(() => {
        return [...new Set(
            jobs
                .map((job) => job.title)
                .filter(Boolean)
        )].sort((a, b) => a.localeCompare(b));
    }, [jobs]);



    const filteredApplications = useMemo(() => {
        return applications.filter((app) => {
            const jobRoleMatches =
                applicationFilters.jobRole === 'all' ||
                app.jobId?.title === applicationFilters.jobRole;

            const experienceYears = Number(app.experienceYears ?? 0);
            const experienceMatches =
                applicationFilters.experience === 'all' ||
                (applicationFilters.experience === '0' && experienceYears === 0) ||
                (applicationFilters.experience === '1-2' && experienceYears >= 1 && experienceYears <= 2) ||
                (applicationFilters.experience === '3-5' && experienceYears >= 3 && experienceYears <= 5) ||
                (applicationFilters.experience === '6+' && experienceYears >= 6);

            const skillSearch = applicationFilters.skill === 'all' ? '' : applicationFilters.skill.trim().toLowerCase();
            let skillMatches = true;
            if (skillSearch) {
                if (app.presentSkills && app.presentSkills.length > 0) {
                    // Fast logic for newly submitted resumes with full extracted skills
                    skillMatches = app.presentSkills.some(s => s.toLowerCase().includes(skillSearch));
                } else {
                    // Fallback logic for old applications created before AI extracted presentSkills
                    const jobRequiresIt = (app.jobId?.skills || []).some(s => s.toLowerCase().includes(skillSearch));
                    const aiFlaggedMissing = (app.missingSkills || []).some(m => m.toLowerCase().includes(skillSearch));
                    skillMatches = jobRequiresIt && !aiFlaggedMissing;
                }
            }

            let atsMatches = true;
            if (applicationFilters.atsScore !== 'all') {
                const requiredScore = parseInt(applicationFilters.atsScore, 10);
                atsMatches = (app.atsScore || 0) >= requiredScore;
            }

            return jobRoleMatches && experienceMatches && skillMatches && atsMatches;
        });
    }, [applications, applicationFilters]);

    const filteredMessages = useMemo(() => {
        let result = [...messages];
        const q = messageSearch.trim().toLowerCase();
        if (q) {
            result = result.filter(m =>
                m.name?.toLowerCase().includes(q) ||
                m.email?.toLowerCase().includes(q) ||
                m.message?.toLowerCase().includes(q) ||
                m.country?.toLowerCase().includes(q)
            );
        }
        if (messageFilters.service !== 'all') {
            result = result.filter(m => m.service === messageFilters.service);
        }
        if (messageFilters.country !== 'all') {
            result = result.filter(m => m.country?.toLowerCase() === messageFilters.country.toLowerCase());
        }
        result.sort((a, b) => {
            const da = new Date(a.createdAt), db = new Date(b.createdAt);
            return messageFilters.dateSort === 'newest' ? db - da : da - db;
        });
        return result;
    }, [messages, messageSearch, messageFilters]);

    const messageServiceOptions = useMemo(() => [...new Set(messages.map(m => m.service).filter(Boolean))].sort(), [messages]);
    const messageCountryOptions = useMemo(() => [...new Set(messages.map(m => m.country).filter(Boolean))].sort(), [messages]);

    return (
        <div className="min-h-screen bg-[#fffdf7]">
            <div className="border-b border-[#ece7d8] bg-white/90 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <img src="/elogixa-logo.png" alt="Elogixa" className="h-10 sm:h-11 w-auto object-contain" />
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Admin Dashboard</h1>
                            <p className="text-sm text-slate-500">Manage careers, applications, and contact requests.</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn-outline flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50 w-full sm:w-auto justify-center">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-3 mb-8 overflow-x-auto pb-1">
                    {[
                        { key: 'jobs', label: 'Manage Jobs' },
                        { key: 'applications', label: 'View Applications' },
                        { key: 'messages', label: 'Contact Messages' },
                        { key: 'saved-applicants', label: 'Saved Applicants' },
                        { key: 'admin-requests', label: pendingAdmins.length > 0 ? `Admin Requests (${pendingAdmins.length})` : 'Admin Requests' }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap border transition-colors ${activeTab === tab.key
                                ? 'bg-accent text-white border-accent'
                                : 'bg-white text-slate-600 border-[#e7e0c6] hover:bg-amber-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'jobs' && (
                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="card h-fit bg-white shadow-lg shadow-amber-100/40">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800"><Plus size={20} /> Post a New Job</h3>
                            <form onSubmit={handleCreateJob} className="space-y-4">
                                <input type="text" placeholder="Job Title" className="input-field" required value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} />
                                <textarea placeholder="Description" className="input-field min-h-25" required value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} />
                                <input type="text" placeholder="Skills (comma separated)" className="input-field" required value={newJob.skills} onChange={e => setNewJob({ ...newJob, skills: e.target.value })} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input type="number" placeholder="Openings" className="input-field" required value={newJob.openings} onChange={e => setNewJob({ ...newJob, openings: e.target.value })} />
                                    <input type="text" placeholder="Location" className="input-field" required value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} />
                                </div>
                                <input type="text" placeholder="Salary Range (e.g. 10LPA - 15LPA)" className="input-field" value={newJob.salaryRange} onChange={e => setNewJob({ ...newJob, salaryRange: e.target.value })} />
                                <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2 py-3" disabled={isCreatingJob}>
                                    {isCreatingJob ? <><Loader2 className="animate-spin" size={20} /> Posting...</> : 'Post Job'}
                                </button>
                            </form>
                        </div>

                        <div className="space-y-4">
                            {jobs.map(job => (
                                <div key={job._id} className="card flex justify-between items-center gap-4 p-4 bg-white shadow-sm">
                                    <div>
                                        <h4 className="font-bold text-slate-800">{job.title}</h4>
                                        <p className="text-xs text-slate-500">{job.location} • {job.openings > 0 ? `${job.openings} Openings` : 'No Openings'}</p>
                                    </div>
                                    <button onClick={() => handleDeleteJob(job._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'applications' && (
                    <div className="card p-0 overflow-hidden bg-white shadow-lg shadow-amber-100/30">
                        <div className="border-b border-[#ece7d8] bg-[#fffaf0] px-4 sm:px-6 py-4">
                            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Application Filters</h3>

                                </div>
                                <div className="flex items-center gap-3 self-start lg:self-auto">
                                    <button
                                        type="button"
                                        onClick={() => setApplicationFilters({ jobRole: 'all', experience: 'all', skill: 'all', atsScore: 'all' })}
                                        className="text-sm font-medium text-accent hover:underline"
                                    >
                                        Clear filters
                                    </button>
                                    {applications.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => { setDeleteAppBeforeDate(''); setDeleteAppFilters({ jobRole: 'all', status: 'all', experience: 'all', atsScore: 'all' }); setDeleteAppBeforeModal(true); }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                                        >
                                            <Trash2 size={14} /> Delete All
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Job Role</label>
                                    <select
                                        value={applicationFilters.jobRole}
                                        onChange={(e) => setApplicationFilters((prev) => ({ ...prev, jobRole: e.target.value }))}
                                        className="input-field"
                                    >
                                        <option value="all">All job roles</option>
                                        {applicationRoleOptions.map((role) => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Experience</label>
                                    <select
                                        value={applicationFilters.experience}
                                        onChange={(e) => setApplicationFilters((prev) => ({ ...prev, experience: e.target.value }))}
                                        className="input-field"
                                    >
                                        <option value="all">All experience levels</option>
                                        <option value="0">Freshers only</option>
                                        <option value="1-2">1 to 2 years</option>
                                        <option value="3-5">3 to 5 years</option>
                                        <option value="6+">6+ years</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Search Skills</label>
                                    <div className="relative">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                        <input
                                            type="text"
                                            placeholder="e.g. React, Node..."
                                            value={applicationFilters.skill === 'all' ? '' : applicationFilters.skill}
                                            onChange={(e) => setApplicationFilters((prev) => ({ ...prev, skill: e.target.value }))}
                                            className="input-field pl-9 h-11"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Minimum ATS Score</label>
                                    <select
                                        value={applicationFilters.atsScore}
                                        onChange={(e) => setApplicationFilters((prev) => ({ ...prev, atsScore: e.target.value }))}
                                        className="input-field h-11"
                                    >
                                        <option value="all">All scores</option>
                                        <option value="90">90% and above</option>
                                        <option value="75">75% and above</option>
                                        <option value="50">50% and above</option>
                                    </select>
                                </div>
                            </div>

                            <p className="mt-4 text-sm text-slate-600">
                                Showing <span className="font-semibold text-slate-800">{filteredApplications.length}</span> of <span className="font-semibold text-slate-800">{applications.length}</span> applications
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-245">
                                <thead>
                                    <tr className="bg-[#fff8e8] border-b border-[#ece7d8]">
                                        <th className="p-4 font-medium text-slate-700">Applicant</th>
                                        <th className="p-4 font-medium text-slate-700">Job Role</th>
                                        <th className="p-4 font-medium text-slate-700">Contact</th>
                                        <th className="p-4 font-medium text-slate-700">Experience</th>
                                        <th className="p-4 font-medium text-slate-700">Resume</th>
                                        <th className="p-4 font-medium text-slate-700">ATS Score</th>
                                        <th className="p-4 font-medium text-slate-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredApplications.map((app, index) => (
                                        <tr key={app._id} className="border-b border-[#f1ecdf] hover:bg-[#fffdf7]">
                                            <td className="p-4 font-medium text-slate-800">{app.name}</td>
                                            <td className="p-4 text-slate-600">{app.jobId ? app.jobId.title : 'Deleted Job'}</td>
                                            <td className="p-4 text-sm text-slate-600">
                                                <div className="text-slate-800">{app.email}</div>
                                                <div className="text-slate-500">{app.phone}</div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-600">
                                                {app.experienceYears ?? 0} {Number(app.experienceYears ?? 0) === 1 ? 'year' : 'years'}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-3 items-center">
                                                    <button
                                                        onClick={() => setResumeModal({ isOpen: true, url: app.resumePath, name: app.resumeOriginalName || app.name })}
                                                        className="text-accent flex items-center gap-1 hover:underline cursor-pointer"
                                                        title="Preview Resume"
                                                    >
                                                        <FileText size={16} /> View
                                                    </button>
                                                    <a
                                                        href={app.resumePath}
                                                        download
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-slate-500 hover:text-slate-800 transition-colors"
                                                        title="Download Resume"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                                    </a>
                                                    <button
                                                        onClick={() => handleToggleSavedApplicant(app._id, app.isSavedForFuture)}
                                                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${app.isSavedForFuture
                                                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                            }`}
                                                        title={app.isSavedForFuture ? 'Remove applicant from saved list' : 'Save applicant for future'}
                                                    >
                                                        <Bookmark size={14} />
                                                        {app.isSavedForFuture ? 'Saved Applicant' : 'Save Applicant'}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {app.atsScore !== undefined && app.atsScore !== null ? (
                                                    <div className="flex flex-col">
                                                        <span className={`text-lg font-bold ${app.atsScore >= 75 ? 'text-green-600' : app.atsScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                                            {app.atsScore}%
                                                        </span>
                                                        {app.missingSkills && app.missingSkills.length > 0 && (
                                                            <div className="relative group mt-1">
                                                                <span className="text-xs text-slate-500 cursor-help border-b border-dashed border-slate-400 pb-0.5">
                                                                    Misses {app.missingSkills.length} {app.missingSkills.length === 1 ? 'skill' : 'skills'}
                                                                </span>
                                                                <div className={`absolute z-[100] ${index >= filteredApplications.length - 2 && filteredApplications.length > 2 ? 'bottom-full mb-2' : 'top-full mt-2'} left-0 hidden group-hover:block w-64 max-h-56 overflow-y-auto p-2 bg-white text-slate-700 text-xs rounded-lg shadow-xl border border-[#e7e0c6]`}>
                                                                    <div className="font-bold text-slate-500 mb-1.5 border-b border-[#ece7d8] pb-1 sticky top-0 bg-white">Missing Skills:</div>
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {app.missingSkills.map((skill, i) => (
                                                                            <span key={i} className="bg-[#f7f5ec] px-1.5 py-0.5 rounded text-[10px] text-slate-600 border border-[#e7e0c6]">
                                                                                {skill}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500 italic text-sm">N/A</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={app.status}
                                                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer appearance-none ${getStatusColor(app.status)}`}
                                                        style={{
                                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='currentColor' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                                            backgroundRepeat: 'no-repeat',
                                                            backgroundPosition: 'right 0.5rem center',
                                                            paddingRight: '2rem'
                                                        }}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Under Review">Under Review</option>
                                                        <option value="Shortlisted">Shortlisted</option>
                                                        <option value="Rejected">Rejected</option>
                                                        <option value="Accepted">Accepted</option>
                                                    </select>

                                                    {app.status === 'Rejected' && (
                                                        <button
                                                            onClick={() => handleDeleteApplication(app._id)}
                                                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                                            title="Delete Application"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredApplications.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="p-8 text-center text-slate-500">
                                                No applications match the selected filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'messages' && (
                    <div>
                        {/* Toolbar */}
                        <div className="bg-white border border-[#ece7d8] rounded-2xl p-4 sm:p-5 mb-6 shadow-sm">
                            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                                {/* Search */}
                                <div className="flex-1 relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, message, country..."
                                        value={messageSearch}
                                        onChange={e => setMessageSearch(e.target.value)}
                                        className="input-field pl-9 h-10 w-full"
                                    />
                                    {messageSearch && (
                                        <button onClick={() => setMessageSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Service filter */}
                                <div className="w-full lg:w-52">
                                    <select
                                        value={messageFilters.service}
                                        onChange={e => setMessageFilters(p => ({ ...p, service: e.target.value }))}
                                        className="input-field h-10 w-full"
                                    >
                                        <option value="all">All Services</option>
                                        {messageServiceOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                {/* Country filter */}
                                <div className="w-full lg:w-44">
                                    <select
                                        value={messageFilters.country}
                                        onChange={e => setMessageFilters(p => ({ ...p, country: e.target.value }))}
                                        className="input-field h-10 w-full"
                                    >
                                        <option value="all">All Countries</option>
                                        {messageCountryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                {/* Date sort */}
                                <div className="w-full lg:w-40">
                                    <select
                                        value={messageFilters.dateSort}
                                        onChange={e => setMessageFilters(p => ({ ...p, dateSort: e.target.value }))}
                                        className="input-field h-10 w-full"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f0eadc]">
                                <p className="text-sm text-slate-600">
                                    Showing <span className="font-semibold text-slate-800">{filteredMessages.length}</span> of <span className="font-semibold text-slate-800">{messages.length}</span> messages
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setMessageSearch(''); setMessageFilters({ service: 'all', country: 'all', dateSort: 'newest' }); }}
                                        className="text-sm text-accent hover:underline"
                                    >
                                        Clear filters
                                    </button>
                                    {messages.length > 0 && (
                                        <button
                                            onClick={() => { setDeleteBeforeDate(''); setDeleteBeforeModal(true); }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                                        >
                                            <Trash2 size={14} /> Delete All
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Cards */}
                        {filteredMessages.length === 0 ? (
                            <p className="text-slate-500 text-center py-12">No messages match your filters.</p>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredMessages.map(msg => (
                                    <div key={msg._id} className="card bg-white shadow-sm flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <h4 className="font-bold text-slate-800 truncate">{msg.name}</h4>
                                                    <p className="text-xs text-accent truncate">{msg.email}</p>
                                                    {msg.service && <p className="text-xs text-slate-500 font-medium mt-1">Service: {msg.service}</p>}
                                                </div>
                                                <div className="flex flex-col items-end gap-1 shrink-0">
                                                    <span className="text-xs text-slate-500">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                                    {msg.country && <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px] text-slate-600">{msg.country}</span>}
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{msg.message}</p>
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-[#f0eadc] flex justify-end">
                                            <button
                                                onClick={() => handleDeleteMessage(msg._id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={13} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'saved-applicants' && (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {savedApplications.length === 0 ? (
                            <p className="text-slate-500 col-span-full text-center py-8">No applicants saved for future yet.</p>
                        ) : (
                            savedApplications.map((app) => (
                                <div key={app._id} className="card bg-white shadow-sm border border-[#ece7d8]">
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div>
                                            <h4 className="font-bold text-slate-800">{app.name}</h4>
                                            <p className="text-sm text-slate-500">{app.jobId ? app.jobId.title : 'Deleted Job'}</p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </div>

                                    <div className="space-y-1 text-sm text-slate-600 mb-4">
                                        <p>{app.email}</p>
                                        <p>{app.phone}</p>
                                        <p>{app.experienceYears ?? 0} {Number(app.experienceYears ?? 0) === 1 ? 'year' : 'years'} experience</p>
                                        <p className="text-xs text-slate-500">
                                            Saved on {app.savedForFutureAt ? new Date(app.savedForFutureAt).toLocaleDateString() : 'Recently'}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-3 items-center">
                                        <button
                                            onClick={() => setResumeModal({ isOpen: true, url: app.resumePath, name: app.resumeOriginalName || app.name })}
                                            className="text-accent flex items-center gap-1 hover:underline cursor-pointer"
                                        >
                                            <FileText size={16} /> View Resume
                                        </button>
                                        <button
                                            onClick={() => handleToggleSavedApplicant(app._id, app.isSavedForFuture)}
                                            className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                                        >
                                            <Bookmark size={14} />
                                            Remove Applicant
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'admin-requests' && (
                    <div className="card p-0 overflow-hidden bg-white shadow-lg shadow-amber-100/30">
                        <div className="border-b border-[#ece7d8] bg-[#fffaf0] px-4 sm:px-6 py-4">
                            <h3 className="text-lg font-bold text-slate-800">Pending Admin Approvals</h3>
                            <p className="text-sm text-slate-600">Review users who have registered and requested administrator access.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[500px]">
                                <thead>
                                    <tr className="bg-[#fff8e8] border-b border-[#ece7d8]">
                                        <th className="p-4 font-medium text-slate-700">Name / Username</th>
                                        <th className="p-4 font-medium text-slate-700">Email Address</th>
                                        <th className="p-4 font-medium text-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingAdmins.map(admin => (
                                        <tr key={admin._id} className="border-b border-[#f1ecdf] hover:bg-[#fffdf7]">
                                            <td className="p-4 font-bold text-slate-800">{admin.username}</td>
                                            <td className="p-4 text-slate-600">{admin.email}</td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleApproveAdmin(admin._id)} disabled={actioningAdmins[admin._id]} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                                                        {actioningAdmins[admin._id] === 'approving' && <Loader2 size={14} className="animate-spin" />} Accept
                                                    </button>
                                                    <button onClick={() => handleRejectAdmin(admin._id)} disabled={actioningAdmins[admin._id]} className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                                                        {actioningAdmins[admin._id] === 'rejecting' && <Loader2 size={14} className="animate-spin" />} Decline
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {pendingAdmins.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="p-8 text-center text-slate-500">
                                                No pending admin requests.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {resumeModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setResumeModal({ isOpen: false, url: '', name: '' })}>
                    <div className="bg-white rounded-lg w-full max-w-5xl h-[90vh] flex flex-col border border-[#ece7d8] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b border-[#ece7d8]">
                            <h3 className="text-lg font-bold text-slate-800">{resumeModal.name}</h3>
                            <button
                                onClick={() => setResumeModal({ isOpen: false, url: '', name: '' })}
                                className="text-slate-400 hover:text-slate-700 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <iframe
                                src={resumeModal.url.toLowerCase().includes('.doc') ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(resumeModal.url)}` : resumeModal.url}
                                className="w-full h-full border-0"
                                title="Resume Preview"
                            />
                        </div>
                    </div>
                </div>
            )}

            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDeleteModal({ isOpen: false, id: null, type: null })}>
                    <div className="bg-white rounded-lg w-full max-w-md p-6 flex flex-col border border-[#ece7d8] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Confirm Deletion</h3>
                        <p className="text-slate-600 mb-6">Are you sure you want to delete this {deleteModal.type}? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteModal({ isOpen: false, id: null, type: null })}
                                className="px-4 py-2 bg-[#f7f5ec] text-slate-700 rounded-lg hover:bg-[#efe9d8] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:bg-red-400 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? <><Loader2 size={16} className="animate-spin" /> Deleting...</> : <><Trash2 size={16} /> Delete</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteBeforeModal && (
                <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDeleteBeforeModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 border border-[#ece7d8] shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Delete Messages by Date</h3>
                        <p className="text-sm text-slate-500 mb-5">
                            All contact queries received <span className="font-semibold text-slate-700">on or before</span> the selected date will be permanently deleted.
                        </p>

                        <label className="block text-sm font-medium text-slate-700 mb-2">Select date</label>
                        <input
                            type="date"
                            value={deleteBeforeDate}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={e => setDeleteBeforeDate(e.target.value)}
                            className="input-field w-full mb-2"
                        />
                        {deleteBeforeDate && (
                            <p className="text-xs text-red-500 mb-4">
                                This will delete all messages received on or before <span className="font-semibold">{new Date(deleteBeforeDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>.
                            </p>
                        )}

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setDeleteBeforeModal(false)}
                                className="px-4 py-2 bg-[#f7f5ec] text-slate-700 rounded-lg hover:bg-[#efe9d8] transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAllMessages}
                                disabled={!deleteBeforeDate || isDeletingAllMessages}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeletingAllMessages ? <><Loader2 size={15} className="animate-spin" /> Deleting...</> : <><Trash2 size={15} /> Confirm Delete</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteAppBeforeModal && (
                <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDeleteAppBeforeModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 border border-[#ece7d8] shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Delete Applications</h3>
                        <p className="text-sm text-slate-500 mb-5">
                            Set filters below. All matching applications submitted <span className="font-semibold text-slate-700">on or before</span> the selected date will be permanently deleted.
                        </p>

                        <div className="space-y-3">
                            {/* Date — required */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    value={deleteAppBeforeDate}
                                    max={new Date().toISOString().split('T')[0]}
                                    onChange={e => setDeleteAppBeforeDate(e.target.value)}
                                    className="input-field w-full"
                                />
                            </div>

                            {/* Job Role */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Job Role</label>
                                <select
                                    value={deleteAppFilters.jobRole}
                                    onChange={e => setDeleteAppFilters(p => ({ ...p, jobRole: e.target.value }))}
                                    className="input-field w-full"
                                >
                                    <option value="all">All job roles</option>
                                    {applicationRoleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                <select
                                    value={deleteAppFilters.status}
                                    onChange={e => setDeleteAppFilters(p => ({ ...p, status: e.target.value }))}
                                    className="input-field w-full"
                                >
                                    <option value="all">All statuses</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Under Review">Under Review</option>
                                    <option value="Shortlisted">Shortlisted</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Accepted">Accepted</option>
                                </select>
                            </div>

                            {/* Experience */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Experience</label>
                                <select
                                    value={deleteAppFilters.experience}
                                    onChange={e => setDeleteAppFilters(p => ({ ...p, experience: e.target.value }))}
                                    className="input-field w-full"
                                >
                                    <option value="all">All experience levels</option>
                                    <option value="0">Freshers only (0 years)</option>
                                    <option value="1-2">1 to 2 years</option>
                                    <option value="3-5">3 to 5 years</option>
                                    <option value="6+">6+ years</option>
                                </select>
                            </div>

                            {/* ATS Score */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Maximum ATS Score (delete below)</label>
                                <select
                                    value={deleteAppFilters.atsScore}
                                    onChange={e => setDeleteAppFilters(p => ({ ...p, atsScore: e.target.value }))}
                                    className="input-field w-full"
                                >
                                    <option value="all">All scores</option>
                                    <option value="50">Below 50%</option>
                                    <option value="75">Below 75%</option>
                                    <option value="90">Below 90%</option>
                                </select>
                            </div>
                        </div>

                        {deleteAppBeforeDate && (
                            <p className="text-xs text-red-500 mt-3">
                                ⚠ This will permanently delete all matching applications on or before <span className="font-semibold">{new Date(deleteAppBeforeDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>.
                            </p>
                        )}

                        <div className="flex justify-end gap-3 mt-5">
                            <button
                                onClick={() => setDeleteAppBeforeModal(false)}
                                className="px-4 py-2 bg-[#f7f5ec] text-slate-700 rounded-lg hover:bg-[#efe9d8] transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAllApplications}
                                disabled={!deleteAppBeforeDate || isDeletingAllApps}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeletingAllApps ? <><Loader2 size={15} className="animate-spin" /> Deleting...</> : <><Trash2 size={15} /> Confirm Delete</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

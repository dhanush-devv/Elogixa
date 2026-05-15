const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const {
    submitApplication,
    getAllApplications,
    updateApplicationStatus,
    toggleSavedResume,
    deleteApplication,
    deleteAllApplications
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

// POST submit application (Public)
router.post('/', upload.single('resume'), submitApplication);

// GET all applications (Admin)
router.get('/', protect, getAllApplications);

// DELETE all applications before a date (Admin)
router.delete('/', protect, deleteAllApplications);

// UPDATE application status (Admin only)
router.patch('/:id/status', protect, updateApplicationStatus);

// SAVE / UNSAVE application resume for future (Admin only)
router.patch('/:id/save', protect, toggleSavedResume);

// DELETE application (Admin only)
router.delete('/:id', protect, deleteApplication);

module.exports = router;


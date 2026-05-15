const express = require('express');
const router = express.Router();
const { submitContactMessage, getAllMessages, deleteMessage, deleteAllMessages } = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');

// @desc    Submit a contact message
// @route   POST /api/contact
router.post('/', submitContactMessage);

// @desc    Get all contact messages
// @route   GET /api/contact
router.get('/', protect, getAllMessages);

// @desc    Delete a single message
// @route   DELETE /api/contact/:id
router.delete('/:id', protect, deleteMessage);

// @desc    Delete all messages
// @route   DELETE /api/contact
router.delete('/', protect, deleteAllMessages);

module.exports = router;

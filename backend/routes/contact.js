const express = require('express');
const router = express.Router();
const { validateContact, validatePagination } = require('../middleware/validation');
const { verifyToken } = require('../middleware/auth');
const {
    submitContact,
    getContacts,
    getContactById,
    updateContactStatus,
    deleteContact,
    getContactStats
} = require('../controllers/contactController');

// Public Routes

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', validateContact, submitContact);

// Protected Routes (Admin Only)

// @route   GET /api/contact
// @desc    Get all contacts with pagination
// @access  Private
router.get('/', verifyToken, validatePagination, getContacts);

// @route   GET /api/contact/stats
// @desc    Get contact statistics
// @access  Private
router.get('/stats', verifyToken, getContactStats);

// @route   GET /api/contact/:id
// @desc    Get single contact
// @access  Private
router.get('/:id', verifyToken, getContactById);

// @route   PATCH /api/contact/:id
// @desc    Update contact status
// @access  Private
router.patch('/:id', verifyToken, updateContactStatus);

// @route   DELETE /api/contact/:id
// @desc    Delete contact
// @access  Private
router.delete('/:id', verifyToken, deleteContact);

module.exports = router;

const express = require('express');
const router = express.Router();
const { validateBooking, validatePagination } = require('../middleware/validation');
const { verifyToken } = require('../middleware/auth');
const {
    createBooking,
    getBookings,
    getBookingById,
    updateBooking,
    cancelBooking,
    getAvailableSlots,
    getBookingStats
} = require('../controllers/bookingController');

// Public Routes

// @route   POST /api/booking
// @desc    Create new booking
// @access  Public
router.post('/', validateBooking, createBooking);

// @route   GET /api/booking/available-slots/:date
// @desc    Get available time slots for a date
// @access  Public
router.get('/available-slots/:date', getAvailableSlots);

// Protected Routes (Admin Only)

// @route   GET /api/booking
// @desc    Get all bookings with pagination and filters
// @access  Private
router.get('/', verifyToken, validatePagination, getBookings);

// @route   GET /api/booking/stats
// @desc    Get booking statistics
// @access  Private
router.get('/stats', verifyToken, getBookingStats);

// @route   GET /api/booking/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', verifyToken, getBookingById);

// @route   PATCH /api/booking/:id
// @desc    Update booking
// @access  Private
router.patch('/:id', verifyToken, updateBooking);

// @route   DELETE /api/booking/:id
// @desc    Cancel booking
// @access  Private
router.delete('/:id', verifyToken, cancelBooking);

module.exports = router;

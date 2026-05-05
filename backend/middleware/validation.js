const { validationResult } = require('express-validator');
const { body, query } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg
        }));
        
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errorMessages
        });
    }
    
    next();
};

// Contact Form Validation
const validateContact = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
    
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[0-9+\-\s()]{10,}$/).withMessage('Please provide a valid phone number'),
    
    body('email')
        .optional({ checkFalsy: true })
        .trim()
        .isEmail().withMessage('Please provide a valid email address'),
    
    body('service')
        .optional()
        .trim()
        .isIn(['Hair Styling', 'Facial Treatments', 'Manicure & Pedicure', 'Body Massage', 'Hair Treatment', 'Makeup Services', 'Other'])
        .withMessage('Invalid service selected'),
    
    body('message')
        .trim()
        .notEmpty().withMessage('Message is required')
        .isLength({ min: 5, max: 5000 }).withMessage('Message must be between 5-5000 characters'),
    
    handleValidationErrors
];

// Booking Validation
const validateBooking = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
    
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[0-9+\-\s()]{10,}$/).withMessage('Please provide a valid phone number'),
    
    body('email')
        .optional({ checkFalsy: true })
        .trim()
        .isEmail().withMessage('Please provide a valid email address'),
    
    body('service')
        .trim()
        .notEmpty().withMessage('Service is required')
        .isIn(['Hair Styling', 'Facial Treatments', 'Manicure & Pedicure', 'Body Massage', 'Hair Treatment', 'Makeup Services'])
        .withMessage('Invalid service selected'),
    
    body('date')
        .custom((value, { req }) => {
            const selectedDate = req.body.date || req.body.appointmentDate;

            if (!selectedDate) {
                throw new Error('Appointment date is required');
            }

            const date = new Date(selectedDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            date.setHours(0, 0, 0, 0);
            
            if (Number.isNaN(date.getTime())) {
                throw new Error('Please provide a valid appointment date');
            }

            if (date < today) {
                throw new Error('Appointment date cannot be in the past');
            }
            
            const maxDate = new Date(today);
            maxDate.setDate(today.getDate() + 30);
            
            if (date > maxDate) {
                throw new Error('Appointment date cannot be more than 30 days in advance');
            }
            
            return true;
        }),
    
    body('time')
        .custom((value, { req }) => {
            const selectedTime = req.body.time || req.body.appointmentTime;

            if (!selectedTime) {
                throw new Error('Appointment time is required');
            }

            if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(selectedTime)) {
                throw new Error('Please provide valid time in HH:MM format');
            }

            return true;
        }),
    
    body('duration')
        .optional()
        .custom(value => {
            if (![30, 60, 90, 120].includes(Number(value))) {
                throw new Error('Duration must be 30, 60, 90, or 120 minutes');
            }

            return true;
        }),
    
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
    
    handleValidationErrors
];

// Pagination Validation
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
    
    query('sort')
        .optional()
        .matches(/^-?[A-Za-z]+$/).withMessage('Sort must be a valid field name'),
    
    handleValidationErrors
];

// Update Booking Status Validation
const validateBookingStatus = [
    body('status')
        .trim()
        .notEmpty().withMessage('Status is required')
        .isIn(['Pending', 'Confirmed', 'Completed', 'Cancelled', 'No-Show'])
        .withMessage('Invalid status provided'),
    
    handleValidationErrors
];

// Sanitization function to prevent XSS
const sanitizeInput = (req, res, next) => {
    Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
            req.body[key] = req.body[key]
                .replace(/[<>]/g, '')
                .trim();
        }
    });
    next();
};

module.exports = {
    validateContact,
    validateBooking,
    validatePagination,
    validateBookingStatus,
    handleValidationErrors,
    sanitizeInput
};

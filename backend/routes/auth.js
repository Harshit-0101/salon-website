const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { appendCsvRecord, readCsvRows } = require('../utils/csvFile');
const { verifyToken } = require('../middleware/auth');

const CUSTOMER_FILE = 'users.csv';
const CUSTOMER_HEADERS = [
    { id: 'name', title: 'Name' },
    { id: 'phone', title: 'Phone' },
    { id: 'email', title: 'Email' },
    { id: 'passwordHash', title: 'PasswordHash' },
    { id: 'createdAt', title: 'CreatedAt' }
];
const OTP_EXPIRY_MS = 5 * 60 * 1000;
const otpStore = new Map();

function formatCsvTimestamp(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function normalizePhone(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
}

function generateOtp() {
    return String(crypto.randomInt(100000, 1000000));
}

async function sendOtpSms(phone, otp) {
    const apiKey = process.env.FAST2SMS_API_KEY;

    if (!apiKey) {
        const error = new Error('SMS OTP is not configured. Add FAST2SMS_API_KEY in backend/.env.');
        error.statusCode = 503;
        throw error;
    }

    const params = new URLSearchParams({
        authorization: apiKey,
        variables_values: otp,
        route: 'otp',
        numbers: normalizePhone(phone)
    });
    const response = await fetch(`https://www.fast2sms.com/dev/bulkV2?${params.toString()}`);
    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.return === false) {
        const error = new Error(result.message || 'OTP SMS could not be sent.');
        error.statusCode = 502;
        throw error;
    }

    return { sent: true, provider: 'fast2sms' };
}

function publicCustomer(row) {
    return {
        name: row.Name,
        phone: row.Phone,
        email: row.Email,
        createdAt: row.CreatedAt
    };
}

function handleAuthValidation(req, res) {
    const errors = validationResult(req);
    if (errors.isEmpty()) return false;

    res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => ({ field: err.path || err.param, message: err.msg }))
    });
    return true;
}

// @route   POST /api/auth/send-otp
// @desc    Send signup OTP to customer phone
// @access  Public
router.post(
    '/send-otp',
    [
        body('phone')
            .trim()
            .notEmpty().withMessage('Phone number is required')
            .matches(/^[0-9+\-\s()]{10,}$/).withMessage('Please provide a valid phone number')
    ],
    async (req, res, next) => {
        try {
            if (handleAuthValidation(req, res)) return;

            const phone = normalizePhone(req.body.phone);
            const otp = generateOtp();
            const smsResult = await sendOtpSms(phone, otp);

            otpStore.set(phone, {
                otp,
                expiresAt: Date.now() + OTP_EXPIRY_MS
            });

            res.status(200).json({
                success: true,
                message: 'OTP sent to your phone number.',
                data: {
                    expiresInMinutes: OTP_EXPIRY_MS / 60000,
                    sentBySms: smsResult.sent
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

// Simple Admin Login Route
// Note: In production, use a proper User model with password hashing

// @route   POST /api/auth/login
// @desc    Admin login to get JWT token
// @access  Public
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(err => ({ field: err.param, message: err.msg }))
            });
        }

        const { email, password } = req.body;

        // Simple credentials check (change these in production)
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@salon.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        if (email !== adminEmail || password !== adminPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: 'admin',
                email: email,
                role: 'admin'
            },
            process.env.JWT_SECRET || 'your-secret-key',
            {
                expiresIn: '7d'
            }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: 'admin',
                email: email,
                role: 'admin'
            }
        });
    }
);

// @route   POST /api/auth/signup
// @desc    Customer sign-up saved to users.csv
// @access  Public
router.post(
    '/signup',
    [
        body('name')
            .trim()
            .notEmpty().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
        body('phone')
            .trim()
            .notEmpty().withMessage('Phone number is required')
            .matches(/^[0-9+\-\s()]{10,}$/).withMessage('Please provide a valid phone number'),
        body('email')
            .trim()
            .isEmail().withMessage('Please provide a valid email'),
        body('password')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('otp')
            .trim()
            .matches(/^\d{6}$/).withMessage('Please enter the 6 digit OTP')
    ],
    async (req, res, next) => {
        try {
            if (handleAuthValidation(req, res)) return;

            const name = req.body.name.trim();
            const phone = normalizePhone(req.body.phone);
            const email = normalizeEmail(req.body.email);
            const otpRecord = otpStore.get(phone);

            if (!otpRecord || otpRecord.expiresAt < Date.now() || otpRecord.otp !== req.body.otp.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired OTP. Please request a new OTP.'
                });
            }

            const existingUsers = await readCsvRows(CUSTOMER_FILE);
            const existingUser = existingUsers.find((user) => normalizeEmail(user.Email) === email);

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'An account with this email already exists. Please login.'
                });
            }

            const passwordHash = await bcrypt.hash(req.body.password, 10);
            const createdAt = formatCsvTimestamp(new Date());

            await appendCsvRecord(CUSTOMER_FILE, CUSTOMER_HEADERS, {
                name,
                phone,
                email,
                passwordHash,
                createdAt
            });
            otpStore.delete(phone);

            res.status(201).json({
                success: true,
                message: 'Account created and saved to users CSV.',
                data: {
                    name,
                    phone,
                    email,
                    createdAt
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   POST /api/auth/customer-login
// @desc    Customer login from users.csv
// @access  Public
router.post(
    '/customer-login',
    [
        body('email').trim().isEmail().withMessage('Please provide a valid email'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    async (req, res, next) => {
        try {
            if (handleAuthValidation(req, res)) return;

            const email = normalizeEmail(req.body.email);
            const users = await readCsvRows(CUSTOMER_FILE);
            const user = users.find((row) => normalizeEmail(row.Email) === email);

            if (!user || !(await bcrypt.compare(req.body.password, user.PasswordHash || ''))) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            const token = jwt.sign(
                {
                    email: user.Email,
                    role: 'customer'
                },
                process.env.JWT_SECRET || 'your-secret-key',
                {
                    expiresIn: '7d'
                }
            );

            res.status(200).json({
                success: true,
                message: 'Customer login successful',
                token,
                user: publicCustomer(user)
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   GET /api/auth/users
// @desc    Owner view of customer accounts without password hashes
// @access  Private
router.get('/users', verifyToken, async (req, res, next) => {
    try {
        const users = await readCsvRows(CUSTOMER_FILE);

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully.',
            data: users.map(publicCustomer)
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/verify
// @desc    Verify token
// @access  Private
router.post('/verify', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        res.status(200).json({
            success: true,
            message: 'Token is valid',
            user: decoded
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
});

module.exports = router;

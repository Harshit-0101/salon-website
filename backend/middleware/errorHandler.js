// Global Error Handler Middleware

// Custom Error Class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // Wrong MongoDB ID Error
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new AppError(message, 400);
    }

    // Mongoose Duplicate Key Error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field} already exists. Please try a different value.`;
        err = new AppError(message, 400);
    }

    // JWT Wrong Signature
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token. Please login again.';
        err = new AppError(message, 401);
    }

    // JWT Expired
    if (err.name === 'TokenExpiredError') {
        const message = 'Token has expired. Please login again.';
        err = new AppError(message, 401);
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        const message = `Validation error: ${messages.join(', ')}`;
        err = new AppError(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { error: err })
    });
};

// Catch async errors
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 Handler
const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
};

module.exports = {
    AppError,
    errorHandler,
    asyncHandler,
    notFound
};

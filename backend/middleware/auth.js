const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

// Verify JWT Token
const verifyToken = (req, res, next) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Please login.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired. Please login again.'
            });
        }
        
        return res.status(401).json({
            success: false,
            message: 'Invalid token. Please login again.'
        });
    }
};

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d'
        }
    );
};

module.exports = {
    verifyToken,
    generateToken
};

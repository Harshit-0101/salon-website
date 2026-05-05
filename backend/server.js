// ============================================
// LOCAL BUSINESS BACKEND SERVER
// ============================================

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const { errorHandler, notFound } = require('./middleware/errorHandler');
const { sanitizeInput } = require('./middleware/validation');
const contactRoutes = require('./routes/contact');
const bookingRoutes = require('./routes/booking');
const authRoutes = require('./routes/auth');

const app = express();
const frontendPath = path.join(__dirname, '..', 'Frontend');

// ============================================
// MIDDLEWARE
// ============================================

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(sanitizeInput);

app.use(process.env.NODE_ENV === 'development' ? morgan('dev') : morgan('combined'));

// ============================================
// OPTIONAL DATABASE CONNECTION
// ============================================

if (process.env.USE_MONGO === 'true') {
    const connectDB = require('./config/db');
    connectDB();
} else {
    console.log('[INFO] MongoDB disabled. Public APIs are using CSV files in backend/data.');
}

// ============================================
// STATIC FRONTEND
// ============================================

app.use(express.static(frontendPath));

// ============================================
// API ROUTES
// ============================================

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Local Business Backend API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            contact: '/api/contact',
            booking: '/api/booking'
        }
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/booking', bookingRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ============================================
// ERROR HANDLING
// ============================================

app.use(notFound);
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log('');
    console.log('==================================================');
    console.log('LOCAL BUSINESS BACKEND SERVER');
    console.log('==================================================');
    console.log(`[OK] Website: http://localhost:${PORT}`);
    console.log(`[OK] API: http://localhost:${PORT}/api`);
    console.log(`[OK] Health: http://localhost:${PORT}/health`);
    console.log(`[ENV] ${process.env.NODE_ENV || 'development'}`);
    console.log('');
    console.log('Public endpoints:');
    console.log('POST /api/contact');
    console.log('POST /api/booking');
    console.log('GET  /api/booking/available-slots/:date');
    console.log('');
    console.log('Admin endpoints require JWT auth under /api/auth.');
    console.log('==================================================');
    console.log('');
});

process.on('SIGTERM', () => {
    console.log('[WARN] SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('[OK] Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('[WARN] SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('[OK] Server closed');
        process.exit(0);
    });
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[ERROR] Unhandled rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

module.exports = app;

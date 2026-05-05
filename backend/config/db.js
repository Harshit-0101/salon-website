const mongoose = require('mongoose');

// MongoDB Connection Configuration
const connectDB = async () => {
    try {
        const mongoURI = process.env.NODE_ENV === 'production'
            ? process.env.MONGODB_CLOUD_URI
            : process.env.MONGODB_URI || 'mongodb://localhost:27017/local-business';

        await mongoose.connect(mongoURI);

        console.log('[OK] MongoDB connected successfully');
        console.log(`[DB] ${mongoURI.includes('mongodb+srv') ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB'}`);

        return mongoose.connection;
    } catch (error) {
        console.error('[ERROR] MongoDB connection error:', error.message);
        process.exit(1);
    }
};

mongoose.connection.on('connected', () => {
    console.log('[OK] Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('[ERROR] Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('[WARN] Mongoose disconnected from MongoDB');
});

module.exports = connectDB;

const mongoose = require('mongoose');

// Contact Schema for storing contact form submissions
const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [100, 'Name cannot exceed 100 characters']
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                'Please provide a valid email address'
            ]
        },
        phone: {
            type: String,
            required: [true, 'Please provide a phone number'],
            trim: true,
            match: [
                /^[0-9+\-\s()]{10,}$/,
                'Please provide a valid phone number'
            ]
        },
        service: {
            type: String,
            trim: true,
            enum: [
                'Hair Styling',
                'Facial Treatments',
                'Manicure & Pedicure',
                'Body Massage',
                'Hair Treatment',
                'Makeup Services',
                'Other'
            ]
        },
        message: {
            type: String,
            required: [true, 'Please provide a message'],
            trim: true,
            minlength: [5, 'Message must be at least 5 characters'],
            maxlength: [5000, 'Message cannot exceed 5000 characters']
        },
        source: {
            type: String,
            enum: ['Website', 'Mobile App', 'WhatsApp', 'Other'],
            default: 'Website'
        },
        status: {
            type: String,
            enum: ['New', 'Read', 'Responded', 'Archived'],
            default: 'New'
        },
        ipAddress: {
            type: String
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
        collection: 'contacts'
    }
);

// Index for faster queries
contactSchema.index({ createdAt: -1 });
contactSchema.index({ phone: 1 });
contactSchema.index({ status: 1 });

// Middleware to update updatedAt before save
contactSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Contact', contactSchema);

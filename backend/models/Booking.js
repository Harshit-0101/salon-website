const mongoose = require('mongoose');

// Booking Schema for storing appointment bookings
const bookingSchema = new mongoose.Schema(
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
            required: [true, 'Please select a service'],
            enum: [
                'Hair Styling',
                'Facial Treatments',
                'Manicure & Pedicure',
                'Body Massage',
                'Hair Treatment',
                'Makeup Services'
            ]
        },
        appointmentDate: {
            type: Date,
            required: [true, 'Please provide an appointment date']
        },
        appointmentTime: {
            type: String,
            required: [true, 'Please provide an appointment time'],
            match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time (HH:MM format)']
        },
        duration: {
            type: Number,
            default: 30, // minutes
            enum: [30, 60, 90, 120]
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [500, 'Notes cannot exceed 500 characters']
        },
        status: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'No-Show'],
            default: 'Pending'
        },
        stylist: {
            type: String,
            trim: true
        },
        price: {
            type: Number,
            min: 0
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Paid', 'Partial', 'Refunded'],
            default: 'Pending'
        },
        reminder_sent: {
            type: Boolean,
            default: false
        },
        reminder_sent_at: {
            type: Date
        },
        source: {
            type: String,
            enum: ['Website', 'Mobile App', 'Phone', 'WhatsApp', 'Walk-in'],
            default: 'Website'
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
        collection: 'bookings'
    }
);

// Indexes for faster queries
bookingSchema.index({ appointmentDate: 1, appointmentTime: 1 });
bookingSchema.index({ phone: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ service: 1 });

// Middleware to update updatedAt before save
bookingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to check if time slot is available
bookingSchema.statics.isTimeSlotAvailable = async function(date, time, excludeBookingId = null) {
    const query = {
        appointmentDate: {
            $gte: new Date(date.setHours(0, 0, 0, 0)),
            $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
        },
        appointmentTime: time,
        status: { $in: ['Pending', 'Confirmed'] }
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    const existingBooking = await this.findOne(query);
    return !existingBooking;
};

// Virtual to get full appointment datetime
bookingSchema.virtual('appointmentDateTime').get(function() {
    if (this.appointmentDate && this.appointmentTime) {
        const [hours, minutes] = this.appointmentTime.split(':');
        const dateTime = new Date(this.appointmentDate);
        dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return dateTime;
    }
    return null;
});

module.exports = mongoose.model('Booking', bookingSchema);

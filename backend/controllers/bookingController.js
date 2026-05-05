const { appendCsvRecord, readCsvRows } = require('../utils/csvFile');
const { asyncHandler } = require('../middleware/errorHandler');

const BOOKING_FILE = 'booking.csv';
const BOOKING_HEADERS = [
    { id: 'name', title: 'Name' },
    { id: 'phone', title: 'Phone' },
    { id: 'email', title: 'Email' },
    { id: 'service', title: 'Service' },
    { id: 'date', title: 'Date' },
    { id: 'time', title: 'Time' },
    { id: 'message', title: 'Message' },
    { id: 'createdAt', title: 'CreatedAt' }
];

const allSlots = [
    '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00',
    '17:00', '18:00'
];

function getBookingDate(body) {
    return body.date || body.appointmentDate;
}

function getBookingTime(body) {
    return body.time || body.appointmentTime;
}

async function getBookedTimesForDate(date) {
    const rows = await readCsvRows(BOOKING_FILE);
    return rows
        .filter((row) => row.Date === date)
        .map((row) => row.Time);
}

// @desc    Create booking and save it to booking.csv
// @route   POST /api/booking
// @access  Public
const createBooking = asyncHandler(async (req, res) => {
    const { name, phone, email = '', service, message = '', notes = '' } = req.body;
    const date = getBookingDate(req.body);
    const time = getBookingTime(req.body);
    const createdAt = formatCsvTimestamp(new Date());

    const bookedTimes = await getBookedTimesForDate(date);

    if (bookedTimes.includes(time)) {
        return res.status(400).json({
            success: false,
            message: 'This date and time is already booked. Please choose another slot.'
        });
    }

    await appendCsvRecord(BOOKING_FILE, BOOKING_HEADERS, {
        name,
        phone,
        email,
        service,
        date,
        time,
        message: message || notes,
        createdAt
    });

    console.log(`[OK] Booking saved to CSV: ${name} - ${service} on ${date} at ${time}`);

    res.status(200).json({
        success: true,
        message: 'Booking saved successfully.',
        data: {
            name,
            phone,
            email,
            service,
            date,
            time,
            message: message || notes,
            createdAt
        }
    });
});

function formatCsvTimestamp(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

const getAvailableSlots = asyncHandler(async (req, res) => {
    const { date } = req.params;
    const bookedTimes = await getBookedTimesForDate(date);
    const availableSlots = allSlots.filter((slot) => !bookedTimes.includes(slot));

    res.status(200).json({
        success: true,
        message: 'Available slots retrieved successfully.',
        data: {
            date,
            totalSlots: allSlots.length,
            bookedSlots: bookedTimes.length,
            availableSlots: availableSlots.length,
            slots: availableSlots
        }
    });
});

const getBookings = asyncHandler(async (req, res) => {
    const bookings = await readCsvRows(BOOKING_FILE);

    res.status(200).json({
        success: true,
        message: 'Bookings retrieved successfully.',
        data: bookings
    });
});

const getBookingById = asyncHandler(async (req, res) => {
    const bookings = await readCsvRows(BOOKING_FILE);
    const booking = bookings[Number(req.params.id)];

    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found.'
        });
    }

    res.status(200).json({
        success: true,
        data: booking
    });
});

const updateBooking = asyncHandler(async (req, res) => {
    res.status(400).json({
        success: false,
        message: 'CSV demo storage does not support updating booking rows.'
    });
});

const cancelBooking = asyncHandler(async (req, res) => {
    res.status(400).json({
        success: false,
        message: 'CSV demo storage does not support deleting booking rows.'
    });
});

const getBookingStats = asyncHandler(async (req, res) => {
    const bookings = await readCsvRows(BOOKING_FILE);

    res.status(200).json({
        success: true,
        data: {
            total: bookings.length
        }
    });
});

module.exports = {
    createBooking,
    getBookings,
    getBookingById,
    updateBooking,
    cancelBooking,
    getAvailableSlots,
    getBookingStats
};

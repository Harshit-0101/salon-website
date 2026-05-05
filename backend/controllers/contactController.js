const { appendCsvRecord, readCsvRows } = require('../utils/csvFile');
const { asyncHandler } = require('../middleware/errorHandler');

const CONTACT_FILE = 'contact.csv';
const CONTACT_HEADERS = [
    { id: 'name', title: 'Name' },
    { id: 'phone', title: 'Phone' },
    { id: 'message', title: 'Message' },
    { id: 'date', title: 'Date' }
];

// @desc    Submit contact form and save it to contact.csv
// @route   POST /api/contact
// @access  Public
const submitContact = asyncHandler(async (req, res) => {
    const { name, phone, message } = req.body;
    const createdAt = formatCsvTimestamp(new Date());

    await appendCsvRecord(CONTACT_FILE, CONTACT_HEADERS, {
        name,
        phone,
        message,
        date: createdAt
    });

    console.log(`[OK] Contact saved to CSV: ${name} (${phone})`);

    res.status(200).json({
        success: true,
        message: 'Contact form saved successfully.',
        data: {
            name,
            phone,
            message,
            date: createdAt
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

// Simple CSV-backed admin helpers, useful while learning and testing.
const getContacts = asyncHandler(async (req, res) => {
    const contacts = await readCsvRows(CONTACT_FILE);

    res.status(200).json({
        success: true,
        message: 'Contacts retrieved successfully.',
        data: contacts
    });
});

const getContactById = asyncHandler(async (req, res) => {
    const contacts = await readCsvRows(CONTACT_FILE);
    const contact = contacts[Number(req.params.id)];

    if (!contact) {
        return res.status(404).json({
            success: false,
            message: 'Contact not found.'
        });
    }

    res.status(200).json({
        success: true,
        data: contact
    });
});

const updateContactStatus = asyncHandler(async (req, res) => {
    res.status(400).json({
        success: false,
        message: 'CSV demo storage does not support updating contact status.'
    });
});

const deleteContact = asyncHandler(async (req, res) => {
    res.status(400).json({
        success: false,
        message: 'CSV demo storage does not support deleting contact rows.'
    });
});

const getContactStats = asyncHandler(async (req, res) => {
    const contacts = await readCsvRows(CONTACT_FILE);

    res.status(200).json({
        success: true,
        data: {
            total: contacts.length
        }
    });
});

module.exports = {
    submitContact,
    getContacts,
    getContactById,
    updateContactStatus,
    deleteContact,
    getContactStats
};

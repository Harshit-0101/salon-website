const API_BASE_URLS = [
    window.API_BASE_URL,
    'http://localhost:5000',
    'http://localhost:5001'
].filter(Boolean);
const CUSTOMER_TOKEN_KEY = 'premiumSalonCustomerToken';
const BOOKED_SLOTS_KEY = 'premiumSalonBookedSlots';

if (!localStorage.getItem(CUSTOMER_TOKEN_KEY)) {
    window.location.replace(`auth.html?next=${encodeURIComponent('booking.html')}`);
}

const slots = [
    '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00',
    '17:00', '18:00'
];

const bookingForm = document.getElementById('bookingForm');
const slotGrid = document.getElementById('slotGrid');
const dateInput = document.getElementById('appointmentDate');
const appointmentTimeInput = document.getElementById('appointmentTime');
const selectedTimeInput = document.getElementById('selectedTime');
const submitButton = document.getElementById('submitButton');
const formMessage = document.getElementById('formMessage');

let serverAvailableSlots = null;

function toDateValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatTime(value) {
    const [hourText, minute] = value.split(':');
    const hour = Number(hourText);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${minute} ${suffix}`;
}

function setBookingDateBounds() {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);

    dateInput.min = toDateValue(today);
    dateInput.max = toDateValue(maxDate);
    dateInput.value = dateInput.value || toDateValue(today);
}

function getBookedSlots() {
    try {
        return JSON.parse(localStorage.getItem(BOOKED_SLOTS_KEY)) || {};
    } catch (error) {
        return {};
    }
}

function saveBookedSlot(date, time) {
    const bookedSlots = getBookedSlots();
    bookedSlots[date] = [...new Set([...(bookedSlots[date] || []), time])];
    localStorage.setItem(BOOKED_SLOTS_KEY, JSON.stringify(bookedSlots));
}

function isSlotBooked(date, time) {
    const localBooked = getBookedSlots()[date] || [];
    const unavailableFromServer = Array.isArray(serverAvailableSlots) && !serverAvailableSlots.includes(time);
    return localBooked.includes(time) || unavailableFromServer;
}

function clearSelectedSlot() {
    appointmentTimeInput.value = '';
    selectedTimeInput.value = '';
}

function renderSlots() {
    const date = dateInput.value;
    slotGrid.innerHTML = '';
    clearSelectedSlot();

    slots.forEach((time) => {
        const booked = isSlotBooked(date, time);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `slot-button${booked ? ' is-booked' : ''}`;
        button.textContent = booked ? `${formatTime(time)} Booked` : formatTime(time);
        button.disabled = booked;
        button.setAttribute('aria-pressed', 'false');

        button.addEventListener('click', () => {
            document.querySelectorAll('.slot-button').forEach((slot) => {
                slot.classList.remove('is-selected');
                slot.setAttribute('aria-pressed', 'false');
            });

            button.classList.add('is-selected');
            button.setAttribute('aria-pressed', 'true');
            appointmentTimeInput.value = time;
            selectedTimeInput.value = formatTime(time);
            showError('appointmentTime', '');
        });

        slotGrid.appendChild(button);
    });
}

async function loadServerSlots() {
    serverAvailableSlots = null;

    try {
        const response = await fetchFromBackend(`/api/booking/available-slots/${dateInput.value}`);
        if (!response.ok) throw new Error('Unable to load backend slots');

        const result = await response.json();
        serverAvailableSlots = Array.isArray(result?.data?.slots) ? result.data.slots : null;
    } catch (error) {
        serverAvailableSlots = null;
    }

    renderSlots();
}

function showError(field, message) {
    const target = document.getElementById(`${field}Error`);
    if (target) target.textContent = message;
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach((error) => {
        error.textContent = '';
    });
}

function showMessage(type, message) {
    formMessage.className = `form-message ${type}`;
    formMessage.textContent = message;
}

function showMessageHtml(type, html) {
    formMessage.className = `form-message ${type}`;
    formMessage.innerHTML = html;
}

function validate(data) {
    clearErrors();
    let isValid = true;

    if (!data.service) {
        showError('service', 'Choose a service.');
        isValid = false;
    }

    if (!data.appointmentDate) {
        showError('appointmentDate', 'Choose a date.');
        isValid = false;
    }

    if (!data.appointmentTime) {
        showError('appointmentTime', 'Choose an available time.');
        isValid = false;
    } else if (isSlotBooked(data.appointmentDate, data.appointmentTime)) {
        showError('appointmentTime', 'This time is already booked.');
        isValid = false;
    }

    if (data.name.length < 2) {
        showError('name', 'Enter your full name.');
        isValid = false;
    }

    if (!/^[0-9+\-\s()]{10,}$/.test(data.phone)) {
        showError('phone', 'Enter a valid phone number.');
        isValid = false;
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        showError('email', 'Enter a valid email address.');
        isValid = false;
    }

    if (data.message.length < 5) {
        showError('message', 'Add a short note.');
        isValid = false;
    }

    return isValid;
}

async function submitToBackend(data) {
    const response = await fetchFromBackend('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: data.name,
            phone: data.phone,
            email: data.email,
            service: data.service,
            date: data.appointmentDate,
            time: data.appointmentTime,
            message: data.message
        })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false) {
        const error = new Error(result.message || result.errors?.[0]?.message || 'Backend booking failed');
        error.status = response.status;
        throw error;
    }

    return result;
}

async function fetchFromBackend(endpoint, options) {
    let lastError;
    let lastResponse;

    for (const baseUrl of API_BASE_URLS) {
        try {
            const response = await fetch(`${baseUrl}${endpoint}`, options);

            if (response.status >= 500) {
                lastResponse = response;
                continue;
            }

            return response;
        } catch (error) {
            lastError = error;
        }
    }

    if (lastResponse) return lastResponse;

    throw lastError || new Error('Backend server is not reachable');
}

function normalizeWhatsAppNumber(phone) {
    const digits = phone.replace(/\D/g, '');

    if (digits.length === 10) {
        return `91${digits}`;
    }

    return digits;
}

function buildCustomerConfirmationUrl(data) {
    const message = [
        `Hi ${data.name}, your Premium Salon booking is confirmed.`,
        `Service: ${data.service}`,
        `Date: ${data.appointmentDate}`,
        `Time: ${formatTime(data.appointmentTime)}`,
        'Thank you.'
    ].filter(Boolean).join('\n');

    return `https://wa.me/${normalizeWhatsAppNumber(data.phone)}?text=${encodeURIComponent(message)}`;
}

bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(bookingForm);
    const data = Object.fromEntries(formData.entries());
    data.appointmentTime = appointmentTimeInput.value;

    Object.keys(data).forEach((key) => {
        if (typeof data[key] === 'string') data[key] = data[key].trim();
    });

    if (!validate(data)) {
        showMessage('error', 'Please complete the highlighted fields.');
        return;
    }

    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Reserving...';
    showMessage('success', 'Reserving your slot...');

    try {
        await submitToBackend(data);
        saveBookedSlot(data.appointmentDate, data.appointmentTime);
        const confirmationUrl = buildCustomerConfirmationUrl(data);
        showMessageHtml(
            'success',
            `Saved to CSV. Slot reserved. <a class="inline-action" href="${confirmationUrl}" target="_blank" rel="noopener">Send confirmation to customer</a>`
        );
    } catch (error) {
        if (error.status === 400 && /not available|booked/i.test(error.message)) {
            showMessage('error', 'That slot was just booked. Please choose another time.');
            await loadServerSlots();
            return;
        }

        showMessage('error', error.message || 'CSV was not updated. Start the backend server, then submit again.');
        return;
    } finally {
        if (formMessage.classList.contains('success')) {
            bookingForm.reset();
            setBookingDateBounds();
            await loadServerSlots();
        }

        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-lock"></i> Reserve Slot';
    }
});

dateInput.addEventListener('change', loadServerSlots);

const serviceFromUrl = new URLSearchParams(window.location.search).get('service');
if (serviceFromUrl) {
    document.getElementById('service').value = serviceFromUrl;
}

setBookingDateBounds();
loadServerSlots();

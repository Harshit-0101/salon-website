const API_BASE_URLS = [
    window.API_BASE_URL,
    'http://localhost:5000',
    'http://localhost:5001'
].filter(Boolean);

const TOKEN_KEY = 'premiumSalonOwnerToken';

const loginPanel = document.getElementById('loginPanel');
const dashboardContent = document.getElementById('dashboardContent');
const loginForm = document.getElementById('loginForm');
const loginButton = document.getElementById('loginButton');
const loginMessage = document.getElementById('loginMessage');
const logoutButton = document.getElementById('logoutButton');
const refreshButton = document.getElementById('refreshButton');
const dashboardMessage = document.getElementById('dashboardMessage');
const searchInput = document.getElementById('dashboardSearch');
const bookingRows = document.getElementById('bookingRows');
const contactRows = document.getElementById('contactRows');
const userRows = document.getElementById('userRows');
const bookingsPanel = document.getElementById('bookingsPanel');
const contactsPanel = document.getElementById('contactsPanel');
const usersPanel = document.getElementById('usersPanel');
const tabs = document.querySelectorAll('.dashboard-tab');

let authToken = localStorage.getItem(TOKEN_KEY);
let bookings = [];
let contacts = [];
let users = [];
let activeView = 'bookings';

function showLoginMessage(type, message) {
    loginMessage.className = `form-message ${type}`;
    loginMessage.textContent = message;
}

function showDashboardMessage(type, message) {
    dashboardMessage.className = `dashboard-alert ${type}`;
    dashboardMessage.textContent = message;
}

function clearLoginErrors() {
    document.querySelectorAll('#loginForm .error-message').forEach((error) => {
        error.textContent = '';
    });
}

function setLoginError(field, message) {
    const target = document.getElementById(`${field}Error`);
    if (target) target.textContent = message;
}

function showDashboard() {
    loginPanel.hidden = true;
    dashboardContent.hidden = false;
    logoutButton.hidden = false;
}

function showLogin() {
    loginPanel.hidden = false;
    dashboardContent.hidden = true;
    logoutButton.hidden = true;
}

function clearDashboardData() {
    bookings = [];
    contacts = [];
    users = [];
    searchInput.value = '';
    dashboardMessage.className = 'dashboard-alert';
    dashboardMessage.textContent = '';
    document.getElementById('totalBookings').textContent = '0';
    document.getElementById('todayBookings').textContent = '0';
    document.getElementById('upcomingBookings').textContent = '0';
    document.getElementById('totalContacts').textContent = '0';
    document.getElementById('totalUsers').textContent = '0';
    document.getElementById('bookingCount').textContent = '0 records';
    document.getElementById('contactCount').textContent = '0 records';
    document.getElementById('userCount').textContent = '0 records';
    bookingRows.innerHTML = '';
    contactRows.innerHTML = '';
    userRows.innerHTML = '';
}

function lockDashboard() {
    localStorage.removeItem(TOKEN_KEY);
    authToken = null;
    clearDashboardData();
    showLogin();
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}

function getField(row, key) {
    return row[key] || row[key.toLowerCase()] || '';
}

function toDateValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function normalizeDate(value) {
    const text = String(value || '').trim();
    if (!text) return '';

    if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
        return text.slice(0, 10);
    }

    const dayFirst = text.match(/^(\d{2})-(\d{2})-(\d{4})/);
    if (dayFirst) {
        return `${dayFirst[3]}-${dayFirst[2]}-${dayFirst[1]}`;
    }

    return text;
}

function isUpcoming(row) {
    const bookingDate = normalizeDate(getField(row, 'Date'));
    return bookingDate >= toDateValue(new Date());
}

function matchesSearch(row, query) {
    if (!query) return true;
    return Object.values(row).some((value) => String(value).toLowerCase().includes(query));
}

function renderStats() {
    const today = toDateValue(new Date());
    const todayCount = bookings.filter((row) => normalizeDate(getField(row, 'Date')) === today).length;
    const upcomingCount = bookings.filter(isUpcoming).length;

    document.getElementById('totalBookings').textContent = bookings.length;
    document.getElementById('todayBookings').textContent = todayCount;
    document.getElementById('upcomingBookings').textContent = upcomingCount;
    document.getElementById('totalContacts').textContent = contacts.length;
    document.getElementById('totalUsers').textContent = users.length;
}

function renderBookings() {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = bookings.filter((row) => matchesSearch(row, query));

    document.getElementById('bookingCount').textContent = `${filtered.length} record${filtered.length === 1 ? '' : 's'}`;

    if (!filtered.length) {
        bookingRows.innerHTML = '<tr><td colspan="7" class="dashboard-empty">No bookings found.</td></tr>';
        return;
    }

    bookingRows.innerHTML = filtered.map((row) => `
        <tr>
            <td>${escapeHtml(getField(row, 'Name'))}</td>
            <td><a href="tel:${escapeHtml(getField(row, 'Phone'))}">${escapeHtml(getField(row, 'Phone'))}</a></td>
            <td>${escapeHtml(getField(row, 'Service'))}</td>
            <td>${escapeHtml(getField(row, 'Date'))}</td>
            <td>${escapeHtml(getField(row, 'Time'))}</td>
            <td>${escapeHtml(getField(row, 'Message'))}</td>
            <td>${escapeHtml(getField(row, 'CreatedAt'))}</td>
        </tr>
    `).join('');
}

function renderContacts() {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = contacts.filter((row) => matchesSearch(row, query));

    document.getElementById('contactCount').textContent = `${filtered.length} record${filtered.length === 1 ? '' : 's'}`;

    if (!filtered.length) {
        contactRows.innerHTML = '<tr><td colspan="4" class="dashboard-empty">No contact messages found.</td></tr>';
        return;
    }

    contactRows.innerHTML = filtered.map((row) => `
        <tr>
            <td>${escapeHtml(getField(row, 'Name'))}</td>
            <td><a href="tel:${escapeHtml(getField(row, 'Phone'))}">${escapeHtml(getField(row, 'Phone'))}</a></td>
            <td>${escapeHtml(getField(row, 'Message'))}</td>
            <td>${escapeHtml(getField(row, 'Date'))}</td>
        </tr>
    `).join('');
}

function renderUsers() {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = users.filter((row) => matchesSearch(row, query));

    document.getElementById('userCount').textContent = `${filtered.length} record${filtered.length === 1 ? '' : 's'}`;

    if (!filtered.length) {
        userRows.innerHTML = '<tr><td colspan="4" class="dashboard-empty">No customer accounts found.</td></tr>';
        return;
    }

    userRows.innerHTML = filtered.map((row) => `
        <tr>
            <td>${escapeHtml(getField(row, 'name'))}</td>
            <td><a href="tel:${escapeHtml(getField(row, 'phone'))}">${escapeHtml(getField(row, 'phone'))}</a></td>
            <td><a href="mailto:${escapeHtml(getField(row, 'email'))}">${escapeHtml(getField(row, 'email'))}</a></td>
            <td>${escapeHtml(getField(row, 'createdAt'))}</td>
        </tr>
    `).join('');
}

function renderCurrentView() {
    renderStats();
    renderBookings();
    renderContacts();
    renderUsers();
}

function setActiveView(view) {
    activeView = view;
    tabs.forEach((tab) => {
        tab.classList.toggle('is-active', tab.dataset.view === view);
    });
    bookingsPanel.hidden = view !== 'bookings';
    contactsPanel.hidden = view !== 'contacts';
    usersPanel.hidden = view !== 'users';
}

async function fetchFromBackend(endpoint, options = {}) {
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

async function login(credentials) {
    const response = await fetchFromBackend('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Login failed');
    }

    authToken = result.token;
    localStorage.setItem(TOKEN_KEY, authToken);
}

async function fetchProtected(endpoint) {
    const response = await fetchFromBackend(endpoint, {
        headers: {
            Authorization: `Bearer ${authToken}`
        }
    });
    const result = await response.json().catch(() => ({}));

    if (response.status === 401) {
        lockDashboard();
        throw new Error('Owner session expired. Please login again.');
    }

    if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Unable to load dashboard data');
    }

    return result.data || [];
}

async function loadDashboard() {
    refreshButton.disabled = true;
    refreshButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading';
    showDashboardMessage('success', 'Loading owner data...');

    try {
        const [bookingData, contactData, userData] = await Promise.all([
            fetchProtected('/api/booking'),
            fetchProtected('/api/contact'),
            fetchProtected('/api/auth/users')
        ]);

        bookings = Array.isArray(bookingData) ? bookingData : [];
        contacts = Array.isArray(contactData) ? contactData : [];
        users = Array.isArray(userData) ? userData : [];
        renderCurrentView();
        showDashboardMessage('success', 'Dashboard updated from CSV files.');
    } catch (error) {
        showDashboardMessage('error', error.message || 'Dashboard could not load.');
    } finally {
        refreshButton.disabled = false;
        refreshButton.innerHTML = '<i class="fas fa-rotate"></i> Refresh';
    }
}

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearLoginErrors();

    const formData = new FormData(loginForm);
    const credentials = Object.fromEntries(formData.entries());
    credentials.email = credentials.email.trim();

    let valid = true;
    if (!credentials.email) {
        setLoginError('adminEmail', 'Enter owner email.');
        valid = false;
    }
    if (!credentials.password) {
        setLoginError('adminPassword', 'Enter owner password.');
        valid = false;
    }
    if (!valid) return;

    loginButton.disabled = true;
    loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in';
    showLoginMessage('success', 'Checking owner login...');

    try {
        await login(credentials);
        showDashboard();
        await loadDashboard();
    } catch (error) {
        showLoginMessage('error', error.message || 'Login failed.');
    } finally {
        loginButton.disabled = false;
        loginButton.innerHTML = '<i class="fas fa-lock"></i> Login';
    }
});

logoutButton.addEventListener('click', () => {
    lockDashboard();
    loginForm.reset();
    document.getElementById('adminEmail').value = 'admin@salon.com';
    showLoginMessage('success', 'Logged out. Owner details are locked.');
});

refreshButton.addEventListener('click', loadDashboard);
searchInput.addEventListener('input', renderCurrentView);
tabs.forEach((tab) => {
    tab.addEventListener('click', () => setActiveView(tab.dataset.view));
});

setActiveView(activeView);

if (authToken) {
    showDashboard();
    loadDashboard();
} else {
    showLogin();
}

const API_BASE_URLS = [
    window.API_BASE_URL,
    'http://localhost:5000',
    'http://localhost:5001'
].filter(Boolean);

const CUSTOMER_TOKEN_KEY = 'premiumSalonCustomerToken';
const CUSTOMER_USER_KEY = 'premiumSalonCustomerUser';
const nextPage = new URLSearchParams(window.location.search).get('next') || 'index.html';

const tabs = document.querySelectorAll('.auth-tab');
const loginForm = document.getElementById('customerLoginForm');
const signupForm = document.getElementById('customerSignupForm');
const loginButton = document.getElementById('customerLoginButton');
const signupButton = document.getElementById('customerSignupButton');
const sendOtpButton = document.getElementById('sendOtpButton');
const authMessage = document.getElementById('authMessage');
const authSession = document.getElementById('authSession');
const sessionName = document.getElementById('sessionName');
const sessionEmail = document.getElementById('sessionEmail');
const logoutButton = document.getElementById('customerLogoutButton');

function setView(view) {
    tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.authView === view));
    loginForm.hidden = view !== 'login';
    signupForm.hidden = view !== 'signup';
    clearErrors();
    showMessage('', '');
}

function clearErrors() {
    document.querySelectorAll('.auth-card .error-message').forEach((error) => {
        error.textContent = '';
    });
}

function showError(id, message) {
    const target = document.getElementById(`${id}Error`);
    if (target) target.textContent = message;
}

function showMessage(type, message) {
    authMessage.className = type ? `form-message ${type}` : 'form-message';
    authMessage.textContent = message;
}

function getFormData(form) {
    const data = Object.fromEntries(new FormData(form).entries());
    Object.keys(data).forEach((key) => {
        data[key] = String(data[key] || '').trim();
    });
    return data;
}

function validateLogin(data) {
    clearErrors();
    let valid = true;

    if (!data.email) {
        showError('loginEmail', 'Enter your email.');
        valid = false;
    }
    if (!data.password) {
        showError('loginPassword', 'Enter your password.');
        valid = false;
    }

    return valid;
}

function validateSignup(data) {
    clearErrors();
    let valid = true;

    if (data.name.length < 2) {
        showError('signupName', 'Enter your full name.');
        valid = false;
    }
    if (!/^[0-9+\-\s()]{10,}$/.test(data.phone)) {
        showError('signupPhone', 'Enter a valid phone number.');
        valid = false;
    }
    if (!/^\d{6}$/.test(data.otp)) {
        showError('signupOtp', 'Enter the 6 digit OTP.');
        valid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        showError('signupEmail', 'Enter a valid email.');
        valid = false;
    }
    if (data.password.length < 6) {
        showError('signupPassword', 'Use at least 6 characters.');
        valid = false;
    }

    return valid;
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

async function postJson(endpoint, data) {
    const response = await fetchFromBackend(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false) {
        throw new Error(result.message || result.errors?.[0]?.message || 'Request failed');
    }

    return result;
}

function saveSession(result) {
    if (result.token) {
        localStorage.setItem(CUSTOMER_TOKEN_KEY, result.token);
    }

    localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(result.user || result.data));
    renderSession();
}

function goToNextPage() {
    window.location.href = nextPage;
}

function renderSession() {
    let user = null;

    try {
        user = JSON.parse(localStorage.getItem(CUSTOMER_USER_KEY));
    } catch (error) {
        user = null;
    }

    authSession.hidden = !user;

    if (!user) return;

    sessionName.textContent = user.name || 'Customer';
    sessionEmail.textContent = user.email || '';
}

tabs.forEach((tab) => {
    tab.addEventListener('click', () => setView(tab.dataset.authView));
});

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = getFormData(loginForm);

    if (!validateLogin(data)) return;

    loginButton.disabled = true;
    loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in';
    showMessage('success', 'Checking login...');

    try {
        const result = await postJson('/api/auth/customer-login', data);
        saveSession(result);
        showMessage('success', 'Login successful. Opening your page...');
        setTimeout(goToNextPage, 600);
    } catch (error) {
        showMessage('error', error.message || 'Login failed.');
    } finally {
        loginButton.disabled = false;
        loginButton.innerHTML = '<i class="fas fa-lock"></i> Login';
    }
});

sendOtpButton.addEventListener('click', async () => {
    clearErrors();
    const phone = document.getElementById('signupPhone').value.trim();

    if (!/^[0-9+\-\s()]{10,}$/.test(phone)) {
        showError('signupPhone', 'Enter a valid phone number first.');
        return;
    }

    sendOtpButton.disabled = true;
    sendOtpButton.textContent = 'Sending';
    showMessage('success', 'Sending OTP...');

    try {
        const result = await postJson('/api/auth/send-otp', { phone });
        showMessage('success', result.message || 'OTP sent to your phone number.');
    } catch (error) {
        showMessage('error', error.message || 'OTP could not be sent.');
    } finally {
        sendOtpButton.disabled = false;
        sendOtpButton.textContent = 'Send OTP';
    }
});

signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = getFormData(signupForm);

    if (!validateSignup(data)) return;

    signupButton.disabled = true;
    signupButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving';
    showMessage('success', 'Saving account to users CSV...');

    try {
        await postJson('/api/auth/signup', data);
        signupForm.reset();
        setView('login');
        document.getElementById('loginEmail').value = data.email;
        showMessage('success', 'Account saved to users CSV. You can login now.');
    } catch (error) {
        showMessage('error', error.message || 'Sign-up failed.');
    } finally {
        signupButton.disabled = false;
        signupButton.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
    }
});

logoutButton.addEventListener('click', () => {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_USER_KEY);
    renderSession();
    showMessage('success', 'Customer logged out.');
});

renderSession();

if (localStorage.getItem(CUSTOMER_TOKEN_KEY) && nextPage !== 'auth.html') {
    showMessage('success', 'You are already logged in.');
}

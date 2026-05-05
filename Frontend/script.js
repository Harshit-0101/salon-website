const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const scrollTopButton = document.getElementById('scrollTop');
const CUSTOMER_TOKEN_KEY = 'premiumSalonCustomerToken';

if (!localStorage.getItem(CUSTOMER_TOKEN_KEY)) {
    window.location.replace(`auth.html?next=${encodeURIComponent('index.html')}`);
}

const API_BASE_URLS = [
    window.API_BASE_URL,
    'http://localhost:5000',
    'http://localhost:5001'
].filter(Boolean);
const contactForm = document.getElementById('contactForm');
const contactSubmitButton = document.getElementById('contactSubmitButton');
const contactFormMessage = document.getElementById('contactFormMessage');

function closeMenu() {
    navMenu?.classList.remove('is-open');
    menuToggle?.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
}

menuToggle?.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    menuToggle.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
        const targetId = anchor.getAttribute('href');
        const target = targetId && targetId !== '#' ? document.querySelector(targetId) : null;

        if (!target) return;

        event.preventDefault();
        closeMenu();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

window.addEventListener('scroll', () => {
    scrollTopButton?.classList.toggle('show', window.scrollY > 500);
    setActiveNavLink();
});

scrollTopButton?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
});

function setActiveNavLink() {
    const sections = [...document.querySelectorAll('section[id], header[id]')];
    const current = sections.reduce((active, section) => {
        return section.getBoundingClientRect().top <= 120 ? section.id : active;
    }, 'home');

    navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
}

function showContactError(field, message) {
    const target = document.getElementById(`${field}Error`);
    if (target) target.textContent = message;
}

function clearContactErrors() {
    document.querySelectorAll('#contactForm .error-message').forEach((error) => {
        error.textContent = '';
    });
}

function showContactMessage(type, message) {
    if (!contactFormMessage) return;

    contactFormMessage.className = `form-message ${type}`;
    contactFormMessage.textContent = message;
}

function validateContact(data) {
    clearContactErrors();
    let isValid = true;

    if (data.name.length < 2) {
        showContactError('contactName', 'Enter your full name.');
        isValid = false;
    }

    if (!/^[0-9+\-\s()]{10,}$/.test(data.phone)) {
        showContactError('contactPhone', 'Enter a valid phone number.');
        isValid = false;
    }

    if (data.message.length < 5) {
        showContactError('contactMessage', 'Add a short message.');
        isValid = false;
    }

    return isValid;
}

async function submitContact(data) {
    const response = await fetchFromBackend('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false) {
        throw new Error(result.message || result.errors?.[0]?.message || 'Contact form failed');
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

contactForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    Object.keys(data).forEach((key) => {
        if (typeof data[key] === 'string') data[key] = data[key].trim();
    });

    if (!validateContact(data)) {
        showContactMessage('error', 'Please complete the highlighted fields.');
        return;
    }

    contactSubmitButton.disabled = true;
    contactSubmitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    showContactMessage('success', 'Sending your message...');

    try {
        await submitContact(data);
        contactForm.reset();
        showContactMessage('success', 'Saved to contact CSV. We will call you soon.');
    } catch (error) {
        showContactMessage('error', 'Contact CSV was not updated. Start the backend server, then submit again.');
    } finally {
        contactSubmitButton.disabled = false;
        contactSubmitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
    }
});

setActiveNavLink();

# 🔌 Frontend-Backend Integration Guide

Complete guide to connect your website frontend with the backend API.

---

## 📋 Table of Contents

1. [Setup](#setup)
2. [Backend API Configuration](#backend-api-configuration)
3. [Frontend Integration Examples](#frontend-integration-examples)
4. [Contact Form Integration](#contact-form-integration)
5. [Booking System Integration](#booking-system-integration)
6. [Admin Dashboard](#admin-dashboard)
7. [Error Handling](#error-handling)
8. [Testing](#testing)

---

## 🔧 Setup

### 1. Ensure Both Run Simultaneously

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend  # or your frontend folder
# Run your frontend development server
# Usually on http://localhost:3000 or http://localhost:8000
```

### 2. Configure Backend URL

Create a `.env` file in your frontend root (if using React):

```env
REACT_APP_API_URL=http://localhost:5000
```

Or in your code:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

---

## 🌐 Backend API Configuration

### Base URL
```
Development: http://localhost:5000
Production: https://your-domain.com
```

### API Response Format

All responses follow this format:

**Success (200, 201, etc.):**
```json
{
    "success": true,
    "message": "Operation successful",
    "data": { ... }
}
```

**Error (400, 401, 500, etc.):**
```json
{
    "success": false,
    "message": "Error description",
    "errors": [
        {
            "field": "fieldName",
            "message": "Specific error"
        }
    ]
}
```

---

## 📡 Frontend Integration Examples

### Basic API Call Function

```javascript
// api/client.js or api/config.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Generic fetch function
async function apiCall(endpoint, options = {}) {
    const {
        method = 'GET',
        body = null,
        headers = {},
        token = null
    } = options;

    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...headers
    };

    // Add authorization header if token provided
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers: defaultHeaders,
            body: body ? JSON.stringify(body) : null,
            credentials: 'include' // Include cookies if needed
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API Error');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

export default apiCall;
```

### Service Functions

```javascript
// api/services.js

import apiCall from './client';

// ============================================
// CONTACT SERVICE
// ============================================

export const contactService = {
    submit: async (data) => {
        return apiCall('/api/contact', {
            method: 'POST',
            body: data
        });
    },

    getAll: async (token, page = 1, limit = 10) => {
        return apiCall(`/api/contact?page=${page}&limit=${limit}`, {
            method: 'GET',
            token
        });
    },

    getById: async (id, token) => {
        return apiCall(`/api/contact/${id}`, {
            method: 'GET',
            token
        });
    },

    updateStatus: async (id, status, token) => {
        return apiCall(`/api/contact/${id}`, {
            method: 'PATCH',
            body: { status },
            token
        });
    },

    delete: async (id, token) => {
        return apiCall(`/api/contact/${id}`, {
            method: 'DELETE',
            token
        });
    },

    getStats: async (token) => {
        return apiCall('/api/contact/stats', {
            method: 'GET',
            token
        });
    }
};

// ============================================
// BOOKING SERVICE
// ============================================

export const bookingService = {
    create: async (data) => {
        return apiCall('/api/booking', {
            method: 'POST',
            body: data
        });
    },

    getAll: async (token, page = 1, limit = 10, filters = {}) => {
        const queryParams = new URLSearchParams({
            page,
            limit,
            ...filters
        }).toString();
        
        return apiCall(`/api/booking?${queryParams}`, {
            method: 'GET',
            token
        });
    },

    getById: async (id, token) => {
        return apiCall(`/api/booking/${id}`, {
            method: 'GET',
            token
        });
    },

    getAvailableSlots: async (date) => {
        return apiCall(`/api/booking/available-slots/${date}`);
    },

    update: async (id, data, token) => {
        return apiCall(`/api/booking/${id}`, {
            method: 'PATCH',
            body: data,
            token
        });
    },

    cancel: async (id, token) => {
        return apiCall(`/api/booking/${id}`, {
            method: 'DELETE',
            token
        });
    },

    getStats: async (token) => {
        return apiCall('/api/booking/stats', {
            method: 'GET',
            token
        });
    }
};

// ============================================
// AUTH SERVICE
// ============================================

export const authService = {
    login: async (email, password) => {
        return apiCall('/api/auth/login', {
            method: 'POST',
            body: { email, password }
        });
    },

    verifyToken: async (token) => {
        return apiCall('/api/auth/verify', {
            method: 'POST',
            token
        });
    }
};
```

---

## 📝 Contact Form Integration

### HTML Integration (Vanilla JS)

```html
<!-- In your index.html -->
<form id="contactForm">
    <input type="text" name="name" placeholder="Your Name" required>
    <input type="email" name="email" placeholder="Email (Optional)">
    <input type="tel" name="phone" placeholder="Phone Number" required>
    <select name="service" required>
        <option value="">Select Service</option>
        <option value="Hair Styling">Hair Styling</option>
        <option value="Facial Treatments">Facial Treatments</option>
        <!-- More options -->
    </select>
    <textarea name="message" placeholder="Your Message" required></textarea>
    <button type="submit">Send Message</button>
    <div id="formMessage"></div>
</form>
```

```javascript
// In your script.js
const API_URL = 'http://localhost:5000';

document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        service: formData.get('service'),
        message: formData.get('message')
    };

    try {
        const response = await fetch(`${API_URL}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            document.getElementById('formMessage').innerHTML = 
                `<p style="color: green;">${result.message}</p>`;
            e.target.reset();
        } else {
            document.getElementById('formMessage').innerHTML = 
                `<p style="color: red;">${result.message}</p>`;
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('formMessage').innerHTML = 
            `<p style="color: red;">Failed to submit form. Please try again.</p>`;
    }
});
```

### React Integration

```jsx
// components/ContactForm.jsx
import { useState } from 'react';
import { contactService } from '../api/services';

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await contactService.submit(formData);
            setMessage({
                type: 'success',
                text: 'Thank you! We will contact you soon.'
            });
            setFormData({
                name: '',
                email: '',
                phone: '',
                service: '',
                message: ''
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.message || 'Failed to submit form'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
            />
            <input
                type="email"
                name="email"
                placeholder="Email (Optional)"
                value={formData.email}
                onChange={handleChange}
            />
            <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
            />
            <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                required
            >
                <option value="">Select Service</option>
                <option value="Hair Styling">Hair Styling</option>
                <option value="Facial Treatments">Facial Treatments</option>
                {/* More options */}
            </select>
            <textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
            </button>
            {message && (
                <div style={{ color: message.type === 'success' ? 'green' : 'red' }}>
                    {message.text}
                </div>
            )}
        </form>
    );
}
```

---

## 📅 Booking System Integration

### React Booking Component

```jsx
// components/BookingForm.jsx
import { useState, useEffect } from 'react';
import { bookingService } from '../api/services';

export default function BookingForm() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        service: 'Hair Styling',
        appointmentDate: '',
        appointmentTime: '10:00',
        notes: ''
    });
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Load available slots when date changes
    useEffect(() => {
        if (formData.appointmentDate) {
            loadAvailableSlots(formData.appointmentDate);
        }
    }, [formData.appointmentDate]);

    const loadAvailableSlots = async (date) => {
        try {
            const response = await bookingService.getAvailableSlots(date);
            setAvailableSlots(response.data.slots);
        } catch (error) {
            console.error('Failed to load slots:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await bookingService.create(formData);
            setMessage({
                type: 'success',
                text: 'Booking created! We will confirm your appointment soon.'
            });
            // Reset form or redirect
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.message || 'Failed to create booking'
            });
        } finally {
            setLoading(false);
        }
    };

    // Get minimum date (today)
    const minDate = new Date().toISOString().split('T')[0];

    // Get maximum date (30 days from today)
    const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
            />
            <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
            />
            <input
                type="email"
                name="email"
                placeholder="Email (Optional)"
                value={formData.email}
                onChange={handleChange}
            />
            <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                required
            >
                <option value="Hair Styling">Hair Styling</option>
                <option value="Facial Treatments">Facial Treatments</option>
                <option value="Manicure & Pedicure">Manicure & Pedicure</option>
                {/* More services */}
            </select>

            <label>Appointment Date:</label>
            <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                min={minDate}
                max={maxDate}
                required
            />

            {availableSlots.length > 0 && (
                <>
                    <label>Appointment Time:</label>
                    <select
                        name="appointmentTime"
                        value={formData.appointmentTime}
                        onChange={handleChange}
                        required
                    >
                        {availableSlots.map(slot => (
                            <option key={slot} value={slot}>{slot}</option>
                        ))}
                    </select>
                </>
            )}

            <textarea
                name="notes"
                placeholder="Special requests (Optional)"
                value={formData.notes}
                onChange={handleChange}
            />

            <button type="submit" disabled={loading}>
                {loading ? 'Booking...' : 'Book Appointment'}
            </button>

            {message && (
                <div style={{ color: message.type === 'success' ? 'green' : 'red' }}>
                    {message.text}
                </div>
            )}
        </form>
    );
}
```

---

## 👨‍💼 Admin Dashboard

### Login Implementation

```jsx
// pages/AdminLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/services';

export default function AdminLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: 'admin@salon.com',
        password: 'admin123'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.login(
                formData.email,
                formData.password
            );

            // Store token
            localStorage.setItem('token', response.token);

            // Redirect to dashboard
            navigate('/admin/dashboard');
        } catch (error) {
            setError(error.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Admin Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
            />
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
}
```

### Contacts List

```jsx
// components/ContactsList.jsx
import { useState, useEffect } from 'react';
import { contactService } from '../api/services';

export default function ContactsList() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('all');

    const token = localStorage.getItem('token');

    useEffect(() => {
        loadContacts();
    }, [page, status]);

    const loadContacts = async () => {
        try {
            const response = await contactService.getAll(
                token,
                page,
                10,
                status !== 'all' ? { status } : {}
            );
            setContacts(response.data);
        } catch (error) {
            console.error('Failed to load contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await contactService.updateStatus(id, newStatus, token);
            loadContacts(); // Refresh list
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h2>Contacts</h2>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="all">All</option>
                <option value="New">New</option>
                <option value="Read">Read</option>
                <option value="Responded">Responded</option>
            </select>

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Service</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {contacts.map(contact => (
                        <tr key={contact._id}>
                            <td>{contact.name}</td>
                            <td>{contact.phone}</td>
                            <td>{contact.service}</td>
                            <td>
                                <select
                                    value={contact.status}
                                    onChange={(e) => updateStatus(contact._id, e.target.value)}
                                >
                                    <option value="New">New</option>
                                    <option value="Read">Read</option>
                                    <option value="Responded">Responded</option>
                                    <option value="Archived">Archived</option>
                                </select>
                            </td>
                            <td>
                                <button onClick={() => {/* View details */}}>View</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
```

---

## ⚠️ Error Handling

```javascript
// utils/errorHandler.js

export const handleApiError = (error) => {
    if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const message = error.response.data?.message;

        switch (status) {
            case 400:
                return 'Invalid request. Please check your input.';
            case 401:
                return 'Unauthorized. Please login again.';
            case 404:
                return 'Resource not found.';
            case 500:
                return 'Server error. Please try again later.';
            default:
                return message || 'An error occurred.';
        }
    } else if (error.request) {
        // Request made but no response
        return 'No response from server. Check your connection.';
    } else {
        // Error in request setup
        return error.message || 'An error occurred.';
    }
};

// Usage in components
try {
    // API call
} catch (error) {
    const errorMessage = handleApiError(error);
    setMessage({ type: 'error', text: errorMessage });
}
```

---

## 🧪 Testing Checklist

- [ ] Contact form submits successfully
- [ ] Contact data appears in admin dashboard
- [ ] Available time slots load correctly
- [ ] Booking creates successfully
- [ ] Booking appears in admin dashboard
- [ ] Admin can login
- [ ] Admin token works for protected routes
- [ ] Error messages display properly
- [ ] CORS works without errors
- [ ] All validations work

---

## 🚀 Production Deployment

### Environment Variables

Change `.env` to production values:
```env
NODE_ENV=production
MONGODB_URI=<production-mongodb-uri>
JWT_SECRET=<strong-secret-key>
CORS_ORIGIN=https://your-domain.com
```

### Frontend API URL

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.your-domain.com';
```

### Deploy Frontend & Backend

- Deploy backend to: Heroku, DigitalOcean, AWS, etc.
- Deploy frontend to: Vercel, Netlify, etc.
- Update API URL in frontend
- Enable HTTPS everywhere

---

## 📚 Additional Resources

- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [React Hooks Guide](https://react.dev/reference/react)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Query Guide](https://docs.mongodb.com/manual/tutorial/query-documents/)

---

**Integration Guide Complete!** You now have a fully integrated full-stack application. 🎉

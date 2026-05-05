# Local Business Backend API

A complete, production-ready Node.js backend for local business websites (Salon, Gym, Restaurant, etc.). Built with Express.js and MongoDB.

## 🎯 Features

- ✅ **Contact Form Management** - Receive and manage contact submissions
- ✅ **Appointment Booking System** - Complete booking management with time slot availability
- ✅ **Admin Dashboard Ready** - APIs for retrieving and managing data
- ✅ **JWT Authentication** - Secure admin routes with token-based auth
- ✅ **Input Validation** - Comprehensive validation for all inputs
- ✅ **Error Handling** - Centralized error handling with proper status codes
- ✅ **CORS Enabled** - Ready for frontend integration
- ✅ **MongoDB Integration** - Data persistence with Mongoose
- ✅ **Statistics API** - Get insights with analytics endpoints
- ✅ **Pagination** - Built-in pagination for large datasets
- ✅ **Environment Variables** - Secure configuration management
- ✅ **Request Logging** - Morgan logging for debugging
- ✅ **Security** - Helmet for security headers, input sanitization

## 📁 Project Structure

```
backend/
├── server.js                    # Main entry point
├── package.json                 # Dependencies
├── .env.example                 # Environment template
│
├── config/
│   └── db.js                   # MongoDB connection
│
├── models/
│   ├── Contact.js              # Contact schema
│   └── Booking.js              # Booking schema
│
├── controllers/
│   ├── contactController.js    # Contact logic
│   └── bookingController.js    # Booking logic
│
├── routes/
│   ├── contact.js              # Contact endpoints
│   ├── booking.js              # Booking endpoints
│   └── auth.js                 # Authentication
│
└── middleware/
    ├── validation.js           # Input validation
    ├── errorHandler.js         # Error handling
    └── auth.js                 # JWT middleware
```

## 🚀 Quick Start

### 1. Installation

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install
```

### 2. Setup Environment Variables

```bash
# Copy example to .env
cp .env.example .env

# Edit .env with your configuration
# Windows: notepad .env
# Mac/Linux: nano .env
```

**Required in .env:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/local-business
JWT_SECRET=your-super-secret-jwt-key
ADMIN_EMAIL=admin@salon.com
ADMIN_PASSWORD=admin123
```

### 3. Setup MongoDB

#### Option 1: Local MongoDB (Recommended for Development)

**Windows:**
```bash
# Install MongoDB Community Edition from:
# https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/

# Start MongoDB service
mongod
```

**Mac:**
```bash
# Install using Homebrew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

**Linux:**
```bash
# Install MongoDB
sudo apt-get install -y mongodb

# Start MongoDB service
sudo systemctl start mongod
```

#### Option 2: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Get connection string
4. Update `.env`:
```env
MONGODB_CLOUD_URI=mongodb+srv://username:password@cluster.mongodb.net/local-business
NODE_ENV=production
```

### 4. Start Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

**Expected Output:**
```
==================================================
🚀 LOCAL BUSINESS BACKEND SERVER
==================================================

    ✅ Server running on: http://localhost:5000
    📍 Environment: development
    ✅ MongoDB Connected Successfully
```

### 5. Test API

Visit in browser or use Postman:
```
http://localhost:5000/health
```

## 📚 API Documentation

### Authentication

#### Login (Get JWT Token)
```
POST /api/auth/login
Content-Type: application/json

{
    "email": "admin@salon.com",
    "password": "admin123"
}

Response:
{
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "id": "admin",
        "email": "admin@salon.com",
        "role": "admin"
    }
}
```

#### Verify Token
```
POST /api/auth/verify
Authorization: Bearer <your_token>
```

---

### Contact Management

#### Submit Contact Form (Public)
```
POST /api/contact
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "service": "Hair Styling",
    "message": "I want to book a hair cutting session"
}

Response:
{
    "success": true,
    "message": "Thank you! We have received your message.",
    "data": {
        "id": "60d5ec49c1234567890abc12",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+919876543210",
        "createdAt": "2024-05-05T10:30:00.000Z"
    }
}
```

#### Get All Contacts (Admin)
```
GET /api/contact?page=1&limit=10&status=New
Authorization: Bearer <your_token>

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 10)
- status: Filter by status (New, Read, Responded, Archived)
- sort: Sort order (default: -createdAt)
```

#### Get Contact Statistics (Admin)
```
GET /api/contact/stats
Authorization: Bearer <your_token>

Response:
{
    "success": true,
    "data": {
        "total": 25,
        "newContacts": 5,
        "responded": 15,
        "archived": 5,
        "recentContactsLastWeek": 8,
        "serviceStats": [
            {"_id": "Hair Styling", "count": 10},
            {"_id": "Facial Treatments", "count": 8}
        ]
    }
}
```

#### Update Contact Status (Admin)
```
PATCH /api/contact/:id
Authorization: Bearer <your_token>
Content-Type: application/json

{
    "status": "Responded"
}
```

#### Delete Contact (Admin)
```
DELETE /api/contact/:id
Authorization: Bearer <your_token>
```

---

### Booking Management

#### Create Booking (Public)
```
POST /api/booking
Content-Type: application/json

{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+919876543210",
    "service": "Facial Treatments",
    "appointmentDate": "2024-05-15",
    "appointmentTime": "14:30",
    "duration": 60,
    "notes": "First time customer"
}

Response:
{
    "success": true,
    "message": "Booking created successfully!",
    "data": {
        "id": "60d5ec49c1234567890abc13",
        "name": "Jane Smith",
        "phone": "+919876543210",
        "service": "Facial Treatments",
        "appointmentDate": "2024-05-15T00:00:00.000Z",
        "appointmentTime": "14:30",
        "status": "Pending",
        "createdAt": "2024-05-05T10:30:00.000Z"
    }
}
```

#### Get Available Time Slots (Public)
```
GET /api/booking/available-slots/2024-05-15

Response:
{
    "success": true,
    "data": {
        "date": "2024-05-15",
        "totalSlots": 18,
        "bookedSlots": 2,
        "availableSlots": 16,
        "slots": [
            "10:00", "10:30", "11:00", "11:30", "12:00",
            "13:00", "13:30", "14:00", "15:00", "15:30",
            "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"
        ]
    }
}
```

#### Get All Bookings (Admin)
```
GET /api/booking?page=1&limit=10&status=Confirmed&service=Hair%20Styling
Authorization: Bearer <your_token>

Query Parameters:
- page: Page number
- limit: Items per page
- status: Filter by status (Pending, Confirmed, Completed, Cancelled, No-Show)
- service: Filter by service name
- sort: Sort order (default: -appointmentDate)
```

#### Get Booking Statistics (Admin)
```
GET /api/booking/stats
Authorization: Bearer <your_token>

Response:
{
    "success": true,
    "data": {
        "total": 50,
        "confirmed": 30,
        "pending": 10,
        "completed": 8,
        "cancelled": 2,
        "upcomingBookings": 15,
        "serviceStats": [...],
        "revenue": {
            "totalRevenue": 15000,
            "totalBookings": 30
        }
    }
}
```

#### Update Booking (Admin)
```
PATCH /api/booking/:id
Authorization: Bearer <your_token>
Content-Type: application/json

{
    "status": "Confirmed",
    "stylist": "Priya",
    "price": 500,
    "paymentStatus": "Paid",
    "notes": "Payment received"
}
```

#### Cancel Booking (Admin)
```
DELETE /api/booking/:id
Authorization: Bearer <your_token>
```

---

## 🔧 Configuration Guide

### Change Admin Credentials

Edit `.env`:
```env
ADMIN_EMAIL=your-email@business.com
ADMIN_PASSWORD=your-secure-password
```

### Change MongoDB Connection

**Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/your-database-name
```

**MongoDB Atlas (Cloud):**
```env
MONGODB_CLOUD_URI=mongodb+srv://username:password@cluster-name.mongodb.net/database-name
```

### Customize CORS

```env
# Allow specific origin
CORS_ORIGIN=https://yourdomain.com

# Or allow all (development only)
CORS_ORIGIN=*
```

### Change Port

```env
PORT=3000
```

---

## 🧪 Testing with Postman

### 1. Import Collection

Create a new Postman collection or download from:
```
https://www.postman.com/
```

### 2. Test Public Endpoints

**Contact Form:**
```
POST http://localhost:5000/api/contact
```

**Available Slots:**
```
GET http://localhost:5000/api/booking/available-slots/2024-05-15
```

### 3. Test Protected Endpoints

**Step 1: Get Token**
```
POST http://localhost:5000/api/auth/login

Body (raw JSON):
{
    "email": "admin@salon.com",
    "password": "admin123"
}
```

**Step 2: Copy token and use in headers:**
```
Authorization: Bearer <paste_token_here>
```

**Step 3: Test admin endpoints**
```
GET http://localhost:5000/api/contact
```

---

## 🛡️ Security Best Practices

1. **Change Admin Password** - Update in `.env` immediately
2. **Use Strong JWT Secret** - Generate with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. **Use HTTPS** - In production, always use HTTPS
4. **Environment Variables** - Never commit `.env` to git
5. **Input Validation** - All inputs are validated
6. **Rate Limiting** - Consider adding express-rate-limit
7. **Database Backups** - Regular backups in production

---

## 🚀 Deployment

### Option 1: Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

### Option 2: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Option 3: AWS, DigitalOcean, Railway, etc.

Deploy as standard Node.js app with your hosting provider.

---

## 📊 Database Schema

### Contact Document
```json
{
    "_id": "ObjectId",
    "name": "string",
    "email": "string",
    "phone": "string",
    "service": "string",
    "message": "string",
    "status": "New|Read|Responded|Archived",
    "source": "Website|Mobile|WhatsApp",
    "ipAddress": "string",
    "createdAt": "Date",
    "updatedAt": "Date"
}
```

### Booking Document
```json
{
    "_id": "ObjectId",
    "name": "string",
    "email": "string",
    "phone": "string",
    "service": "string",
    "appointmentDate": "Date",
    "appointmentTime": "HH:MM",
    "duration": "number (30|60|90|120)",
    "status": "Pending|Confirmed|Completed|Cancelled|No-Show",
    "notes": "string",
    "stylist": "string",
    "price": "number",
    "paymentStatus": "Pending|Paid|Partial|Refunded",
    "reminder_sent": "boolean",
    "source": "Website|Mobile|Phone|WhatsApp",
    "createdAt": "Date",
    "updatedAt": "Date"
}
```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017

Solution:
1. Start MongoDB: mongod (Windows/Mac/Linux)
2. Verify connection string in .env
3. Check MongoDB is running: mongo --version
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000

Solution:
1. Change PORT in .env
2. Or kill process: lsof -i :5000
```

### JWT Token Expired
```
Error: Token has expired

Solution:
1. Get new token from /api/auth/login
2. Update Authorization header
```

### Validation Error
```
Check request body matches required fields
Use Content-Type: application/json header
Validate date format: YYYY-MM-DD
Validate time format: HH:MM
```

---

## 📝 API Response Format

### Success Response
```json
{
    "success": true,
    "message": "Operation successful",
    "data": { ... }
}
```

### Error Response
```json
{
    "success": false,
    "message": "Error description",
    "errors": [
        {
            "field": "fieldName",
            "message": "Error message"
        }
    ]
}
```

---

## 🔄 Integration with Frontend

### From React/Vue/Frontend:

```javascript
// Contact form submission
const submitContact = async (data) => {
    const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return await response.json();
};

// Create booking
const createBooking = async (data) => {
    const response = await fetch('http://localhost:5000/api/booking', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return await response.json();
};

// Get available slots
const getAvailableSlots = async (date) => {
    const response = await fetch(`http://localhost:5000/api/booking/available-slots/${date}`);
    return await response.json();
};

// Admin: Get all contacts (with token)
const getContacts = async (token) => {
    const response = await fetch('http://localhost:5000/api/contact', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return await response.json();
};
```

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)

---

## 📄 License

MIT License - Feel free to use for your projects

---

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check console logs for error details

---

**Version:** 1.0.0  
**Last Updated:** May 2024  
**Status:** Production Ready

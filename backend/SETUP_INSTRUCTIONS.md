# Backend Setup Instructions

Complete setup guide for the Local Business Backend.

## 📋 Prerequisites

Before starting, ensure you have:
- Node.js installed (v14+) - Download from https://nodejs.org
- npm (comes with Node.js)
- Git (optional) - Download from https://git-scm.com
- MongoDB or MongoDB Atlas account

Check installation:
```bash
node --version
npm --version
```

---

## 🔧 Installation Steps

### 1. Navigate to Backend Folder

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages listed in `package.json`:
- express - Web framework
- mongoose - MongoDB library
- dotenv - Environment variables
- cors - Cross-origin requests
- jwt - Authentication tokens
- validation - Input validation
- and more...

**Installation time: 2-5 minutes depending on internet speed**

### 3. Create Environment File

```bash
# Copy example file
cp .env.example .env

# Edit the file
# Windows: notepad .env
# Mac: nano .env
# Linux: vim .env
```

### 4. Configure .env File

Open `.env` and set these critical variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database Connection
# Choose ONE of the following:

# Option A: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/local-business

# Option B: MongoDB Atlas Cloud
MONGODB_CLOUD_URI=mongodb+srv://username:password@cluster.mongodb.net/local-business

# Security (Generate strong secret)
JWT_SECRET=your-super-secret-key-minimum-32-characters-long

# Admin Credentials (Change these!)
ADMIN_EMAIL=admin@salon.com
ADMIN_PASSWORD=admin123

# CORS
CORS_ORIGIN=*

# Business Info
BUSINESS_NAME=Premium Salon
BUSINESS_PHONE=+919876543210
BUSINESS_EMAIL=info@premiumsalon.com
```

### 5. Setup Database

#### Local MongoDB Setup

**Windows:**
1. Download from: https://www.mongodb.com/try/download/community
2. Run installer with default options
3. MongoDB Community Server starts automatically
4. Verify: Open Command Prompt and type:
   ```bash
   mongod
   ```
   Should show "waiting for connections on port 27017"

**Mac:**
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify
brew services list
```

**Linux (Ubuntu/Debian):**
```bash
# Update package manager
sudo apt-get update

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Verify
sudo systemctl status mongod
```

#### MongoDB Atlas Setup (Cloud - Recommended for Production)

1. Visit: https://www.mongodb.com/cloud/atlas
2. Sign up (free)
3. Create a project
4. Create a cluster (select M0 free tier)
5. Set database access:
   - Create database user
   - Set password
6. Set network access:
   - Add 0.0.0.0/0 (allow all IPs for development)
   - For production: Add specific IP
7. Get connection string:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy MongoDB URI
8. Update `.env`:
   ```env
   MONGODB_CLOUD_URI=mongodb+srv://user:password@cluster-name.mongodb.net/database-name
   ```

### 6. Start the Server

```bash
# Development mode (auto-reload on file changes)
npm run dev

# Or Production mode
npm start
```

Expected output:
```
==================================================
🚀 LOCAL BUSINESS BACKEND SERVER
==================================================

    ✅ Server running on: http://localhost:5000
    📍 Environment: development
    
    📚 API Endpoints:
    ├─ POST   /api/contact
    ├─ POST   /api/booking
    ├─ GET    /api/auth/login
    └─ ...
    
    ✅ MongoDB Connected Successfully
```

---

## ✅ Verification

### 1. Test Server Health

```bash
curl http://localhost:5000/health
```

Or open in browser:
```
http://localhost:5000/health
```

Expected response:
```json
{
    "success": true,
    "message": "Server is running",
    "timestamp": "2024-05-05T10:30:00.000Z",
    "environment": "development"
}
```

### 2. Test Contact Form

```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "+919876543210",
    "message": "Test message"
  }'
```

### 3. Test Booking

```bash
curl -X POST http://localhost:5000/api/booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "+919876543210",
    "service": "Hair Styling",
    "appointmentDate": "2024-05-15",
    "appointmentTime": "14:30"
  }'
```

### 4. Test Admin Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@salon.com",
    "password": "admin123"
  }'
```

---

## 🔐 Security Configuration

### Generate Strong JWT Secret

```bash
# Node.js method
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output example:
# a7f3c9e1b2d4f6g8h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8

# Copy and paste into .env as JWT_SECRET
```

### Create .gitignore (Important!)

```bash
# Create .gitignore file in backend folder
echo ".env" > .gitignore
echo "node_modules/" >> .gitignore
echo ".DS_Store" >> .gitignore
```

---

## 🚀 Running the Backend

### Development

```bash
npm run dev
```

Features:
- Auto-reload on file changes
- Detailed error messages
- Console logging
- Slower performance

### Production

```bash
npm start
```

Features:
- Optimized for performance
- Requires manual restart on changes
- Less logging

### Keep Running in Background

**Mac/Linux:**
```bash
nohup npm start > server.log 2>&1 &
```

**Windows:**
```bash
# Use PM2 (process manager)
npm install -g pm2
pm2 start server.js
pm2 save
```

---

## 📱 Integration with Frontend

### CORS Setup for Specific Domain

Edit `.env`:
```env
CORS_ORIGIN=https://your-domain.com
```

### Frontend API Configuration

**React Example:**
```javascript
// config/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const contactService = {
    submit: async (data) => {
        const response = await fetch(`${API_BASE_URL}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }
};

export const bookingService = {
    create: async (data) => {
        const response = await fetch(`${API_BASE_URL}/api/booking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }
};
```

---

## 🐛 Troubleshooting

### Port 5000 Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change PORT in .env
PORT=3000
```

### MongoDB Connection Failed

```bash
# Check if MongoDB is running
# Windows: Check Services for "MongoDB"
# Mac: brew services list
# Linux: sudo systemctl status mongod

# Start MongoDB
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### CORS Errors in Frontend

Update `.env`:
```env
CORS_ORIGIN=http://localhost:3000
# Or for production:
CORS_ORIGIN=https://your-domain.com
```

### Out of Memory

```bash
# Increase Node.js memory
NODE_OPTIONS=--max-old-space-size=4096 npm start
```

---

## 📚 Project Structure Explained

```
backend/
│
├── server.js
│   └─ Main entry point, creates Express app, starts server
│
├── config/
│   └── db.js
│       └─ MongoDB connection setup
│
├── models/
│   ├── Contact.js
│   │   └─ Contact form data structure
│   └── Booking.js
│       └─ Appointment booking structure
│
├── controllers/
│   ├── contactController.js
│   │   └─ Contact form logic (submit, list, delete)
│   └── bookingController.js
│       └─ Booking logic (create, list, manage)
│
├── routes/
│   ├── contact.js
│   │   └─ /api/contact endpoints
│   ├── booking.js
│   │   └─ /api/booking endpoints
│   └── auth.js
│       └─ /api/auth/login endpoint
│
├── middleware/
│   ├── validation.js
│   │   └─ Input validation rules
│   ├── errorHandler.js
│   │   └─ Error handling
│   └── auth.js
│       └─ JWT authentication
│
├── .env.example
│   └─ Environment variables template
│
├── package.json
│   └─ Dependencies and scripts
│
└── README.md
    └─ Full documentation
```

---

## 🔄 Next Steps

1. ✅ Backend is running
2. 📝 Test all endpoints with Postman or cURL
3. 🔌 Connect frontend to backend APIs
4. 🧪 Test contact form submission
5. 📅 Test appointment booking
6. 👨‍💼 Test admin dashboard features
7. 🚀 Deploy to production

---

## 📞 Quick Reference

**Server URL:** http://localhost:5000

**Main Endpoints:**
- Contact: `POST /api/contact`
- Booking: `POST /api/booking`
- Available Slots: `GET /api/booking/available-slots/:date`
- Admin Login: `POST /api/auth/login`

**Admin Credentials (Default):**
- Email: admin@salon.com
- Password: admin123

**Database:**
- Local: mongodb://localhost:27017/local-business
- Cloud: Check your MongoDB Atlas cluster

---

## 📖 Documentation

- Full API docs: See README.md
- Database schema: See models folder
- Examples: See controllers folder

---

**Setup Complete! Your backend is ready.** ✅

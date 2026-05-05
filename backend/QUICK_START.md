# 🚀 Backend Quick Start Guide

Get your backend running in 5 minutes!

## Step 1: Install Dependencies (1 minute)

```bash
# Navigate to backend folder
cd backend

# Install all dependencies
npm install
```

You'll see packages being installed. Wait for completion.

## Step 2: Setup Database (2 minutes)

### Option A: Local MongoDB (Easiest for Development)

**Windows:**
1. Download from: https://www.mongodb.com/try/download/community
2. Run installer (keep default settings)
3. MongoDB starts automatically
4. Done! ✅

**Mac:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongod
```

### Option B: MongoDB Atlas (Cloud - Easiest for Production)

1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (Free tier)
4. Get connection string
5. Copy into `.env` as `MONGODB_CLOUD_URI`

## Step 3: Setup Environment Variables (1 minute)

```bash
# Copy example to .env
cp .env.example .env
```

**Edit .env file:**

```env
# Core Setup
PORT=5000
NODE_ENV=development

# Database (choose one)
MONGODB_URI=mongodb://localhost:27017/local-business
# OR
MONGODB_CLOUD_URI=mongodb+srv://user:pass@cluster.mongodb.net/local-business

# Security
JWT_SECRET=your-super-secret-key-change-this

# Admin Login (change these!)
ADMIN_EMAIL=admin@salon.com
ADMIN_PASSWORD=admin123
```

## Step 4: Start Server (1 minute)

```bash
# Development mode (auto-reload)
npm run dev

# OR Production mode
npm start
```

You should see:
```
✅ Server running on: http://localhost:5000
✅ MongoDB Connected Successfully
```

## Step 5: Test It Works (1 minute)

Open in browser or Postman:
```
http://localhost:5000/health
```

You should see:
```json
{
    "success": true,
    "message": "Server is running"
}
```

---

## 🧪 Quick API Tests

### Test Contact Form (Public - No Auth Needed)

**Using Postman or cURL:**

```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "service": "Hair Styling",
    "message": "I want to book an appointment"
  }'
```

### Test Booking (Public - No Auth Needed)

```bash
curl -X POST http://localhost:5000/api/booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "phone": "+919876543210",
    "email": "jane@example.com",
    "service": "Facial Treatments",
    "appointmentDate": "2024-05-15",
    "appointmentTime": "14:30"
  }'
```

### Get Available Slots

```bash
curl http://localhost:5000/api/booking/available-slots/2024-05-15
```

### Admin Login (Get Token)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@salon.com",
    "password": "admin123"
  }'
```

Response will include:
```json
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Get All Contacts (Admin - Requires Token)

```bash
curl http://localhost:5000/api/contact \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📁 Project Folders

After installation, you'll have:

```
backend/
├── server.js           ← Main file
├── package.json        ← Dependencies
├── .env               ← Config (create this)
├── config/db.js       ← Database setup
├── models/            ← Database schemas
├── routes/            ← API endpoints
├── controllers/       ← Business logic
└── middleware/        ← Validation, auth, errors
```

---

## ✅ Checklist

- [ ] `npm install` completed
- [ ] MongoDB running (local or cloud)
- [ ] `.env` file created and filled
- [ ] `npm run dev` or `npm start` running
- [ ] `http://localhost:5000/health` returns success
- [ ] Can submit contact form
- [ ] Can create booking
- [ ] Can login as admin

---

## 🔥 Common Issues & Fixes

### "EADDRINUSE: address already in use :::5000"
**Solution:** Change PORT in .env to 5001 or 3000

### "MongoDB connection failed"
**Solution:** Make sure `mongod` is running, or check MONGODB_URI in .env

### "Cannot find module 'express'"
**Solution:** Run `npm install` again

### "Invalid token"
**Solution:** Get new token from `/api/auth/login`

---

## 🌐 API Base URL

In development:
```
http://localhost:5000
```

When deployed:
```
https://your-domain.com
```

---

## 🔧 Update Frontend URLs

In your frontend (React/Vue), update API calls:

```javascript
// Old
const API_URL = 'http://localhost:5000';

// In production
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

---

## 📚 Next Steps

1. ✅ Backend is running
2. 📝 Test all endpoints with Postman
3. 🔌 Connect frontend to backend
4. 🚀 Deploy to production

---

## 💡 Pro Tips

- Use Postman for API testing: https://www.postman.com/downloads/
- Change admin password immediately
- Keep `.env` file secret (add to `.gitignore`)
- Use MongoDB Atlas for production
- Enable HTTPS in production

---

## 🆘 Need Help?

1. Check backend console for errors
2. Check browser console for CORS errors
3. Verify all fields are required in requests
4. Check Authorization header format: `Bearer TOKEN`
5. Read full README.md for detailed docs

---

**You're all set! Your backend is ready to receive data from your frontend.** 🎉

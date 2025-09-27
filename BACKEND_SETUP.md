# Backend Email Service Setup

This guide will help you set up the backend API to send real OTP emails.

## 🚀 Quick Start

### Option 1: Automated Setup

```bash
# Set up Gmail credentials
npm run backend:setup

# Start both frontend and backend
npm start
```

### Option 2: Manual Setup

```bash
# 1. Set up backend credentials
cd backend
node setup.js

# 2. Start backend (in one terminal)
npm run backend

# 3. Start frontend (in another terminal)
npm run dev
```

## 📧 Gmail Configuration

### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click "2-Step Verification"
3. Follow the setup process

### Step 2: Generate App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" as the app
3. Select "Other" as the device and enter "SPE Elections"
4. Click "Generate"
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 3: Configure Backend

```bash
cd backend
node setup.js
```

Or manually create `backend/.env`:

```bash
USER_EMAIL=your-email@gmail.com
USER_PW=your-16-character-app-password
PORT=3001
```

## 🧪 Testing

### Test Backend API

```bash
# Health check
curl http://localhost:3001/api/email/health

# Send test email
curl http://localhost:3001/api/email/test
```

### Test Frontend Integration

1. Open http://localhost:5173
2. Enter any email from `data/voters.json`
3. Check your email for the OTP code
4. Enter the OTP to authenticate

## 📁 Project Structure

```
voter/
├── backend/                 # Backend API
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   ├── .env               # Gmail credentials
│   └── README.md          # Backend documentation
├── src/                    # Frontend React app
│   └── services/
│       └── emailService.ts # Email service (auto-detects backend)
├── data/                   # Voter and candidate data
└── start-both.js          # Script to run both servers
```

## 🔧 Available Scripts

- `npm start` - Start both frontend and backend
- `npm run backend` - Start only backend
- `npm run backend:setup` - Set up Gmail credentials
- `npm run dev` - Start only frontend

## 🐛 Troubleshooting

### Backend Issues

- **"Email service not configured"** - Run `npm run backend:setup`
- **"SMTP configuration error"** - Check Gmail credentials
- **"Authentication failed"** - Verify 2FA is enabled and App Password is correct

### Frontend Issues

- **404 errors** - Make sure backend is running on port 3001
- **CORS errors** - Backend is configured to allow frontend origin

### Email Issues

- **Emails not received** - Check spam folder
- **"Less secure app" error** - Use App Password, not regular password
- **Connection timeout** - Check internet connection and firewall

## 🔒 Security Notes

- Never commit `.env` files to version control
- Use App Passwords instead of main Gmail password
- Consider using a dedicated Gmail account for the elections system
- App Passwords can be revoked and regenerated if needed

## 📊 Monitoring

The backend provides detailed logging:

- ✅ Successful email sends
- ❌ Error messages with details
- 📧 Email delivery confirmations
- 🔍 Health check status

## 🚀 Production Deployment

For production:

1. Use environment variables on your hosting platform
2. Consider using a professional email service (SendGrid, AWS SES)
3. Set up proper error monitoring and logging
4. Use HTTPS for all API calls
5. Implement rate limiting for email sending

## 📞 Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify your Gmail account settings
3. Test with the provided curl commands
4. Check the backend README for detailed troubleshooting

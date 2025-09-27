# SPE UNIBEN Elections - Backend Email API

This is the backend API for sending real OTP emails to voters.

## Quick Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up Gmail credentials:**

   ```bash
   node setup.js
   ```

   Or manually create a `.env` file with your Gmail credentials.

3. **Start the server:**
   ```bash
   npm run dev
   ```

## Manual Setup

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password** at [Google App Passwords](https://myaccount.google.com/apppasswords)
3. **Create `.env` file:**
   ```bash
   USER_EMAIL=your-email@gmail.com
   USER_PW=your-16-character-app-password
   PORT=3001
   ```

## API Endpoints

- `GET /api/email/health` - Health check
- `POST /api/email/send` - Send OTP email
- `GET /api/email/test` - Send test email

## Testing

1. **Health check:**

   ```bash
   curl http://localhost:3001/api/email/health
   ```

2. **Test email:**

   ```bash
   curl http://localhost:3001/api/email/test
   ```

3. **Send OTP:**
   ```bash
   curl -X POST http://localhost:3001/api/email/send \
     -H "Content-Type: application/json" \
     -d '{"to":"test@example.com","subject":"Test","html":"<h1>Test</h1>"}'
   ```

## Frontend Integration

The frontend will automatically detect this backend when it's running on port 3001. No additional configuration needed!

## Troubleshooting

- **"Email service not configured"** - Check your `.env` file
- **"SMTP configuration error"** - Verify your Gmail credentials
- **"Authentication failed"** - Make sure 2FA is enabled and App Password is correct

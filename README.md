# SPE UNIBEN Elections Voting System

A secure online voting system for SPE UNIBEN elections with OTP-based authentication.

## Features

- **OTP Authentication**: Secure login using email and one-time password
- **Voter Management**: Pre-registered voter verification
- **Voting Interface**: Clean, intuitive voting experience
- **Real-time Results**: Live election results display
- **Responsive Design**: Works on desktop and mobile devices

## Authentication Flow

1. **Email Entry**: Voter enters their registered email address
2. **OTP Generation**: System generates a 6-digit OTP and sends it via email
3. **OTP Verification**: Voter enters the OTP to gain access
4. **Voting**: Once authenticated, voter can cast their votes
5. **Results**: View real-time election results

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Email Service**: Configurable email service (currently mock for development)

## Development Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start development server:

   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the provided local URL

## Email Service Configuration

The application uses a mock email service for development. For production, you need a backend API to send real emails.

### Development (Mock Service)

The frontend automatically uses a mock email service that logs OTP codes to the console. No setup required.

### Production (Real Emails)

To send real emails, you need to set up a backend API:

1. **Create a backend project** (see `backend-email-api.js` example)
2. **Install dependencies:**
   ```bash
   npm install express nodemailer cors dotenv
   ```
3. **Set up environment variables:**
   ```bash
   USER_EMAIL=your-email@gmail.com
   USER_PW=your-16-character-app-password
   ```
4. **Run the backend API** on port 3001
5. **The frontend will automatically detect and use the backend service**

### Backend Setup

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password** at [Google App Passwords](https://myaccount.google.com/apppasswords)
3. **Use the provided `backend-email-api.js` as a starting point**

### Alternative Email Services

For production, you can replace the backend email service with:

- SendGrid
- AWS SES
- Mailgun
- Custom SMTP server

## Security Features

- OTP expires in 5 minutes
- One-time use OTPs
- Email-based authentication
- Secure vote storage
- Voter verification

## Project Structure

```
src/
├── components/          # React components
│   ├── LoginForm.tsx   # OTP authentication form
│   ├── VotingBallot.tsx # Voting interface
│   └── VoteSuccess.tsx # Results display
├── services/           # Business logic services
│   ├── otpService.ts   # OTP generation and validation
│   └── emailService.ts # Email sending service
├── hooks/              # Custom React hooks
│   └── useElectionData.ts # Election data management
└── types/              # TypeScript type definitions
    └── election.ts     # Election-related types
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for SPE UNIBEN internal use only.

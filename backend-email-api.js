// Backend Email API Example
// This is a Node.js/Express backend that handles real email sending
// Place this in a separate backend project

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Email configuration
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PW
  }
});

// Health check endpoint
app.get('/api/email/health', (req, res) => {
  res.json({ status: 'OK', service: 'Email API' });
});

// Send email endpoint
app.post('/api/email/send', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const info = await transporter.sendMail({
      from: `"SPE UNIBEN Elections" <${process.env.USER_EMAIL}>`,
      to,
      subject,
      html,
      text
    });

    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Email API server running on port ${PORT}`);
});

// Package.json for backend:
/*
{
  "name": "spe-elections-email-api",
  "version": "1.0.0",
  "description": "Backend email service for SPE UNIBEN Elections",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "nodemailer": "^6.9.7",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
*/

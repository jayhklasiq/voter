#!/usr/bin/env node

// Quick setup script for backend email configuration
// Run with: node setup.js

import { createInterface } from 'readline';
import { writeFileSync, existsSync } from 'fs';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupBackend() {
  console.log('🚀 SPE UNIBEN Elections - Backend Email Setup');
  console.log('==============================================\n');

  console.log('This script will help you configure Gmail SMTP for the backend API.\n');

  console.log('Prerequisites:');
  console.log('1. Gmail account with 2-Factor Authentication enabled');
  console.log('2. App Password generated from Google Account settings\n');

  const gmailUser = await question('Enter your Gmail address: ');
  const appPassword = await question('Enter your 16-character App Password: ');

  if (!gmailUser.includes('@gmail.com')) {
    console.log('❌ Please enter a valid Gmail address');
    process.exit(1);
  }

  if (appPassword.length !== 16) {
    console.log('❌ App Password should be 16 characters long');
    process.exit(1);
  }

  // Create .env file
  const envContent = `USER_EMAIL=${gmailUser}
USER_PW=${appPassword}
PORT=3001
`;

  try {
    writeFileSync('.env', envContent);
    console.log('\n✅ Configuration saved to .env');

    console.log('\n🎉 Backend setup complete!');
    console.log('You can now run:');
    console.log('  npm install  # Install dependencies');
    console.log('  npm run dev  # Start the backend server');
    console.log('\nThe backend will automatically send real OTP emails to voters.');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }

  rl.close();
}

setupBackend().catch(console.error);

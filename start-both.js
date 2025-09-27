#!/usr/bin/env node

// Script to start both frontend and backend
// Run with: node start-both.js

import { spawn } from 'child_process';
import { existsSync } from 'fs';

console.log('🚀 Starting SPE UNIBEN Elections System...\n');

// Check if backend exists
if (!existsSync('./backend/package.json')) {
  console.error('❌ Backend not found. Please run this from the project root.');
  process.exit(1);
}

// Start backend
console.log('📧 Starting backend email service...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: './backend',
  stdio: 'pipe',
  shell: true
});

backend.stdout.on('data', (data) => {
  console.log(`[Backend] ${data.toString().trim()}`);
});

backend.stderr.on('data', (data) => {
  console.error(`[Backend Error] ${data.toString().trim()}`);
});

// Start frontend
console.log('🌐 Starting frontend application...');
const frontend = spawn('npm', ['run', 'dev'], {
  stdio: 'pipe',
  shell: true
});

frontend.stdout.on('data', (data) => {
  console.log(`[Frontend] ${data.toString().trim()}`);
});

frontend.stderr.on('data', (data) => {
  console.error(`[Frontend Error] ${data.toString().trim()}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

console.log('\n✅ Both servers are starting...');
console.log('📧 Backend API: http://localhost:3001');
console.log('🌐 Frontend: http://localhost:5173');
console.log('\nPress Ctrl+C to stop both servers\n');

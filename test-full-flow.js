// Test script to verify the complete OTP flow
import fetch from 'node-fetch';

const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:5174';

async function testBackendHealth() {
  try {
    console.log('🔍 Testing backend health...');
    const response = await fetch(`${BACKEND_URL}/api/email/health`);
    const data = await response.json();
    console.log('✅ Backend health check:', data);
    return true;
  } catch (error) {
    console.log('❌ Backend not running:', error.message);
    return false;
  }
}

async function testEmailSending() {
  try {
    console.log('📧 Testing email sending...');
    const response = await fetch(`${BACKEND_URL}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'test@example.com',
        subject: 'Test OTP Email',
        html: '<h1>Your OTP is: 123456</h1>',
        text: 'Your OTP is: 123456'
      })
    });
    
    const data = await response.json();
    console.log('✅ Email test result:', data);
    return true;
  } catch (error) {
    console.log('❌ Email sending failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting full flow test...\n');
  
  const backendHealthy = await testBackendHealth();
  if (!backendHealthy) {
    console.log('\n❌ Backend is not running. Please start it with:');
    console.log('   cd backend && npm run dev');
    return;
  }
  
  await testEmailSending();
  
  console.log('\n✅ Tests completed!');
  console.log('🌐 Frontend should be running at:', FRONTEND_URL);
  console.log('🔧 Backend should be running at:', BACKEND_URL);
}

runTests();

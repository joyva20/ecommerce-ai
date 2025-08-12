// Simple test untuk debugging forgot password flow
// Jalankan: node debug_forgot_password.js

const axios = require('axios');

const BACKEND_URL = 'http://localhost:4000';

async function debugForgotPassword() {
  console.log('🔍 Debugging Forgot Password Flow...\n');

  try {
    // Step 1: Test verification endpoint
    console.log('1. Testing user verification...');
    const verifyData = {
      email: 'joyva@gmail.com', // Sesuaikan dengan email yang ada di database
      username: 'Joy'           // Sesuaikan dengan username yang ada
    };
    
    console.log('Sending verification request:', verifyData);
    
    const verifyResponse = await axios.post(`${BACKEND_URL}/api/user/forgot-password`, verifyData);
    console.log('Verification response:', verifyResponse.data);
    
    if (verifyResponse.data.success && verifyResponse.data.resetToken) {
      console.log('✅ Verification successful');
      console.log('Reset token received:', verifyResponse.data.resetToken.substring(0, 20) + '...');
      
      // Step 2: Test reset password
      console.log('\n2. Testing password reset...');
      const resetData = {
        resetToken: verifyResponse.data.resetToken,
        newPassword: 'Admin1234!@#'
      };
      
      console.log('Sending reset request with token:', resetData.resetToken.substring(0, 20) + '...');
      
      const resetResponse = await axios.post(`${BACKEND_URL}/api/user/reset-password`, resetData);
      console.log('Reset response:', resetResponse.data);
      
      if (resetResponse.data.success) {
        console.log('✅ Password reset successful');
      } else {
        console.log('❌ Password reset failed:', resetResponse.data.message);
      }
    } else {
      console.log('❌ Verification failed:', verifyResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

debugForgotPassword();

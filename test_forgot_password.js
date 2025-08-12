// Test script untuk forgot password functionality
// Jalankan dengan: node test_forgot_password.js

const axios = require('axios');

const BACKEND_URL = 'http://localhost:4000'; // Sesuaikan dengan port backend Anda

async function testForgotPasswordFlow() {
  console.log('🔍 Testing Forgot Password Flow...\n');

  try {
    // Test 1: Verifikasi user dengan email dan username yang benar
    console.log('1. Testing user verification with correct email & username...');
    const verifyResponse = await axios.post(`${BACKEND_URL}/api/user/forgot-password`, {
      email: 'test@example.com', // Ganti dengan email user yang ada
      username: 'Test User'       // Ganti dengan username yang ada
    });
    
    if (verifyResponse.data.success) {
      console.log('✅ User verification successful');
      console.log('Reset token received:', verifyResponse.data.resetToken ? 'Yes' : 'No');
      
      // Test 2: Reset password dengan token yang valid
      console.log('\n2. Testing password reset with valid token...');
      const resetResponse = await axios.post(`${BACKEND_URL}/api/user/reset-password`, {
        resetToken: verifyResponse.data.resetToken,
        newPassword: 'NewPassword123!@#'
      });
      
      if (resetResponse.data.success) {
        console.log('✅ Password reset successful');
      } else {
        console.log('❌ Password reset failed:', resetResponse.data.message);
      }
    } else {
      console.log('❌ User verification failed:', verifyResponse.data.message);
    }

    // Test 3: Verifikasi dengan email/username yang salah
    console.log('\n3. Testing verification with incorrect credentials...');
    const wrongVerifyResponse = await axios.post(`${BACKEND_URL}/api/user/forgot-password`, {
      email: 'nonexistent@example.com',
      username: 'NonExistent User'
    });
    
    if (!wrongVerifyResponse.data.success) {
      console.log('✅ Correctly rejected invalid credentials');
    } else {
      console.log('❌ Should have rejected invalid credentials');
    }

    // Test 4: Reset password dengan token yang invalid
    console.log('\n4. Testing password reset with invalid token...');
    const invalidResetResponse = await axios.post(`${BACKEND_URL}/api/user/reset-password`, {
      resetToken: 'invalid.token.here',
      newPassword: 'NewPassword123!@#'
    });
    
    if (!invalidResetResponse.data.success) {
      console.log('✅ Correctly rejected invalid token');
    } else {
      console.log('❌ Should have rejected invalid token');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }

  console.log('\n✨ Test completed!');
}

// Jalankan test
testForgotPasswordFlow();

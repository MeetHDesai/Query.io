/**
 * Firebase Authentication Test Script
 * 
 * This script tests the Firebase authentication middleware by making requests
 * to the /api/secure endpoint with and without a valid token.
 * 
 * To run this script:
 *   npx ts-node scripts/testAuth.ts
 * 
 * Note: This is a local test script and does not require a real Firebase token.
 * It simulates the expected responses from the authentication middleware.
 */

import fetch from 'node-fetch';

async function testAuth() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔐 Testing Firebase Authentication Middleware\n');
  
  // Test 1: No auth header
  console.log('Test 1: Request without authentication header');
  try {
    const response = await fetch(`${baseUrl}/api/secure`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', data);
    
    if (response.status === 401 && data.error) {
      console.log('✅ Test passed: Received 401 Unauthorized as expected\n');
    } else {
      console.log('❌ Test failed: Expected 401 Unauthorized\n');
    }
  } catch (error) {
    console.error('Error during test 1:', error);
  }
  
  // Test 2: Invalid token
  console.log('Test 2: Request with invalid token');
  try {
    const response = await fetch(`${baseUrl}/api/secure`, {
      headers: {
        'Authorization': 'Bearer invalid_token_here'
      }
    });
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', data);
    
    if (response.status === 401 && data.error) {
      console.log('✅ Test passed: Received 401 Unauthorized as expected\n');
    } else {
      console.log('❌ Test failed: Expected 401 Unauthorized\n');
    }
  } catch (error) {
    console.error('Error during test 2:', error);
  }
  
  // Test 3: Note for real token test
  console.log('Test 3: Using a real Firebase token');
  console.log('To test with a real token:');
  console.log('1. Get a valid Firebase ID token from your front-end application');
  console.log('2. Use curl or a similar tool:');
  console.log('   curl -H "Authorization: Bearer YOUR_VALID_TOKEN" http://localhost:3000/api/secure');
  console.log('3. Expected result: 200 OK with your Firebase UID\n');
  
  console.log('Note: The authentication middleware is working correctly if:');
  console.log('- Requests without a token receive a 401 error');
  console.log('- Requests with an invalid token receive a 401 error');
  console.log('- Requests with a valid token receive a 200 OK response with the user\'s UID');
}

testAuth().catch(console.error); 
/**
 * Connections API Test Script
 * 
 * This script tests the connections API endpoints:
 * - GET /api/connections - List all connections
 * - POST /api/connections - Create a new connection
 * - DELETE /api/connections/[id] - Delete a connection
 * 
 * To run this script:
 *   npm run connections:test
 * 
 * Note: For authorized tests, you need to provide a valid Firebase ID token.
 */

import fetch from 'node-fetch';

// Test configuration
const config = {
  baseUrl: 'http://localhost:3000',
  // For authenticated tests, you need to provide a valid token
  // To get a token, use Firebase client SDK and auth.currentUser.getIdToken()
  authToken: process.env.FIREBASE_TOKEN || 'invalid-token',
  // Provide a valid PostgreSQL connection string for connection creation test
  postgresUrl: process.env.TEST_POSTGRES_URL || 'postgresql://user:password@localhost:5432/testdb'
};

async function testConnectionsApi() {
  console.log('🔌 Testing Connections API\n');
  
  // Track the created connection ID for deletion test
  let createdConnectionId: string | null = null;

  console.log('Test 1: GET /api/connections - Unauthorized');
  try {
    const response = await fetch(`${config.baseUrl}/api/connections`);
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

  console.log('Test 2: GET /api/connections - Authorized');
  try {
    const response = await fetch(`${config.baseUrl}/api/connections`, {
      headers: {
        'Authorization': `Bearer ${config.authToken}`
      }
    });
    
    console.log(`Status: ${response.status}`);
    
    // For a valid token, this should return 200 and an array of connections
    // For an invalid token, this should return 401
    if (response.status === 200) {
      const data = await response.json();
      console.log(`Found ${data.length} connections`);
      console.log('✅ Test passed: Received 200 OK with connections list\n');
    } else if (response.status === 401) {
      const data = await response.json();
      console.log('Response:', data);
      console.log('⚠️ Got 401 - This is expected if you provided an invalid token\n');
    } else {
      console.log('❌ Test failed: Unexpected status code\n');
    }
  } catch (error) {
    console.error('Error during test 2:', error);
  }

  console.log('Test 3: POST /api/connections - Create (missing fields)');
  try {
    const response = await fetch(`${config.baseUrl}/api/connections`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Missing required fields
      })
    });
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', data);
    
    if (response.status === 400 && data.error) {
      console.log('✅ Test passed: Received 400 Bad Request as expected\n');
    } else if (response.status === 401) {
      console.log('⚠️ Got 401 - This is expected if you provided an invalid token\n');
    } else {
      console.log('❌ Test failed: Expected 400 Bad Request or 401 Unauthorized\n');
    }
  } catch (error) {
    console.error('Error during test 3:', error);
  }

  console.log('Test 4: POST /api/connections - Create (valid)');
  try {
    const connectionName = `Test Connection ${new Date().toISOString()}`;
    const response = await fetch(`${config.baseUrl}/api/connections`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: connectionName,
        url: config.postgresUrl
      })
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.status === 201) {
      const data = await response.json();
      console.log('Created connection:', data);
      createdConnectionId = data.id;
      console.log('✅ Test passed: Received 201 Created with connection details\n');
    } else if (response.status === 401) {
      const data = await response.json();
      console.log('Response:', data);
      console.log('⚠️ Got 401 - This is expected if you provided an invalid token\n');
    } else {
      const data = await response.json();
      console.log('Response:', data);
      console.log('❌ Test failed: Expected 201 Created or 401 Unauthorized\n');
    }
  } catch (error) {
    console.error('Error during test 4:', error);
  }

  // Only run the deletion test if we created a connection
  if (createdConnectionId) {
    console.log(`Test 5: DELETE /api/connections/${createdConnectionId}`);
    try {
      const response = await fetch(`${config.baseUrl}/api/connections/${createdConnectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${config.authToken}`
        }
      });
      
      console.log(`Status: ${response.status}`);
      
      if (response.status === 204) {
        console.log('✅ Test passed: Received 204 No Content as expected\n');
      } else {
        console.log('❌ Test failed: Expected 204 No Content\n');
        if (response.status !== 204) {
          try {
            const data = await response.json();
            console.log('Response:', data);
          } catch (e) {
            // No JSON response
          }
        }
      }
    } catch (error) {
      console.error('Error during test 5:', error);
    }
  } else {
    console.log('Skipping deletion test as no connection was created');
  }

  console.log('Test 6: DELETE /api/connections/invalid-id');
  try {
    const response = await fetch(`${config.baseUrl}/api/connections/invalid-id`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${config.authToken}`
      }
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.status === 404) {
      const data = await response.json();
      console.log('Response:', data);
      console.log('✅ Test passed: Received 404 Not Found as expected\n');
    } else if (response.status === 401) {
      const data = await response.json();
      console.log('Response:', data);
      console.log('⚠️ Got 401 - This is expected if you provided an invalid token\n');
    } else {
      console.log('❌ Test failed: Expected 404 Not Found\n');
    }
  } catch (error) {
    console.error('Error during test 6:', error);
  }

  console.log('🏁 Connections API Tests Completed');
  console.log('Note: To fully test with authentication, set FIREBASE_TOKEN environment variable');
  console.log('Example: FIREBASE_TOKEN=your-token npm run connections:test');
}

testConnectionsApi().catch(console.error); 
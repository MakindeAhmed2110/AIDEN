#!/usr/bin/env node

// Simple test script to verify backend functionality
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001';

async function testBackend() {
  console.log('🧪 Testing AIDEN DePIN Backend...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    
    if (healthData.success) {
      console.log('✅ Health check passed');
      console.log(`   Message: ${healthData.message}`);
      console.log(`   Version: ${healthData.version}\n`);
    } else {
      console.log('❌ Health check failed\n');
      return;
    }

    // Test 2: User Registration
    console.log('2. Testing user registration...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    const registerResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    const registerData = await registerResponse.json();
    
    if (registerData.success) {
      console.log('✅ User registration successful');
      console.log(`   User ID: ${registerData.data.user.id}`);
      console.log(`   Hedera Account: ${registerData.data.user.hederaAccountId}`);
      console.log(`   Token: ${registerData.data.token.substring(0, 20)}...\n`);
      
      const token = registerData.data.token;
      const userId = registerData.data.user.id;

      // Test 3: Get User Profile
      console.log('3. Testing user profile...');
      const profileResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      const profileData = await profileResponse.json();
      
      if (profileData.success) {
        console.log('✅ Profile retrieval successful');
        console.log(`   Wallet Balance: ${profileData.data.walletBalance} tinybars\n`);
      } else {
        console.log('❌ Profile retrieval failed\n');
      }

      // Test 4: Create DePIN Node
      console.log('4. Testing DePIN node creation...');
      const nodeResponse = await fetch(`${API_BASE_URL}/api/depin/nodes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Node',
          location: 'Test Location'
        })
      });
      
      const nodeData = await nodeResponse.json();
      
      if (nodeData.success) {
        console.log('✅ DePIN node creation successful');
        console.log(`   Node ID: ${nodeData.data.node.nodeId}\n`);
        
        const nodeId = nodeData.data.node.nodeId;

        // Test 5: Get User Nodes
        console.log('5. Testing get user nodes...');
        const nodesResponse = await fetch(`${API_BASE_URL}/api/depin/nodes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        const nodesData = await nodesResponse.json();
        
        if (nodesData.success) {
          console.log('✅ Get nodes successful');
          console.log(`   Total nodes: ${nodesData.data.nodes.length}\n`);
        } else {
          console.log('❌ Get nodes failed\n');
        }

        // Test 6: Measure Bandwidth
        console.log('6. Testing bandwidth measurement...');
        const measureResponse = await fetch(`${API_BASE_URL}/api/depin/nodes/${nodeId}/measure`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        const measureData = await measureResponse.json();
        
        if (measureData.success) {
          console.log('✅ Bandwidth measurement successful');
          console.log(`   Bytes Served: ${measureData.data.metrics.bytesServed}`);
          console.log(`   Download Speed: ${measureData.data.metrics.speedTest.downloadSpeed} Mbps\n`);
        } else {
          console.log('❌ Bandwidth measurement failed\n');
        }

        // Test 7: Get Network Stats
        console.log('7. Testing network stats...');
        const statsResponse = await fetch(`${API_BASE_URL}/api/depin/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
          console.log('✅ Network stats successful');
          console.log(`   Total Nodes: ${statsData.data.stats.totalNodes}`);
          console.log(`   Active Nodes: ${statsData.data.stats.activeNodes}`);
          console.log(`   Total GB Served: ${statsData.data.stats.totalGBServed.toFixed(4)}\n`);
        } else {
          console.log('❌ Network stats failed\n');
        }

      } else {
        console.log('❌ DePIN node creation failed\n');
      }

    } else {
      console.log('❌ User registration failed');
      console.log(`   Error: ${registerData.message}\n`);
    }

    console.log('🎉 Backend testing completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n💡 Make sure the backend server is running on port 3001');
    console.log('   Run: cd depin && npm start');
  }
}

// Run the test
testBackend();

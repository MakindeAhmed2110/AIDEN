/**
 * Test script to verify points are being updated properly
 */

import { dbManager } from './database/manager.js';
import { pointsService } from './services/points-service.js';

async function testPointsUpdate() {
  console.log('🧪 Testing Points Update System...\n');

  try {
    const db = dbManager.getDatabase();
    
    // Get all users with points
    const users = db.prepare(`
      SELECT 
        u.id,
        u.email,
        up.today_points,
        up.total_epoch_points,
        up.last_updated
      FROM users u
      LEFT JOIN user_points up ON u.id = up.user_id
      ORDER BY up.total_epoch_points DESC
    `).all();

    console.log('👥 Current Users and Points:');
    users.forEach(user => {
      console.log(`  User ${user.id} (${user.email}):`);
      console.log(`    Today Points: ${user.today_points || 0}`);
      console.log(`    Total Epoch Points: ${user.total_epoch_points || 0}`);
      console.log(`    Last Updated: ${user.last_updated || 'Never'}`);
      console.log('');
    });

    // Test adding points to a user
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`🔧 Testing points addition for User ${testUser.id}...`);
      
      const updatedPoints = await pointsService.addPoints(testUser.id, 5);
      console.log('✅ Points added successfully:');
      console.log(`  Today Points: ${updatedPoints.todayPoints}`);
      console.log(`  Total Epoch Points: ${updatedPoints.totalEpochPoints}`);
      console.log(`  Last Updated: ${updatedPoints.lastUpdated}`);
    }

    // Test reward calculation
    console.log('\n💰 Testing Reward Calculation:');
    const testPoints = 100; // 100 points
    const hbarAmount = testPoints * 0.001; // 1MB = 0.001 HBAR
    const userReward = hbarAmount * 0.7; // 70% to user
    const charityReward = hbarAmount * 0.3; // 30% to charity
    
    console.log(`  Points: ${testPoints}`);
    console.log(`  Total HBAR: ${hbarAmount.toFixed(6)}`);
    console.log(`  User Reward (70%): ${userReward.toFixed(6)} HBAR`);
    console.log(`  Charity Reward (30%): ${charityReward.toFixed(6)} HBAR`);

    console.log('\n🎉 Points system test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testPointsUpdate().then(() => {
  console.log('\n🏁 Test script completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});




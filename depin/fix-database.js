// Fix database issues - clear users and sessions
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve('depin.db');

try {
  const db = new Database(dbPath);
  
  console.log('🔧 Fixing database issues...');
  
  // Clear all sessions first
  const sessionResult = db.prepare('DELETE FROM user_sessions').run();
  console.log(`✅ Cleared ${sessionResult.changes} sessions`);
  
  // Clear all users
  const userResult = db.prepare('DELETE FROM users').run();
  console.log(`✅ Cleared ${userResult.changes} users`);
  
  // Clear any other related data
  const nodeResult = db.prepare('DELETE FROM depin_nodes').run();
  console.log(`✅ Cleared ${nodeResult.changes} nodes`);
  
  const proofResult = db.prepare('DELETE FROM usage_proofs').run();
  console.log(`✅ Cleared ${proofResult.changes} usage proofs`);
  
  // Verify the database is clean
  const remainingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  const remainingSessions = db.prepare('SELECT COUNT(*) as count FROM user_sessions').get();
  
  console.log(`\n📊 Database status:`);
  console.log(`  Users: ${remainingUsers.count}`);
  console.log(`  Sessions: ${remainingSessions.count}`);
  
  db.close();
  console.log('\n🎉 Database fixed! You can now restart your backend and test fresh wallet creation.');
  
} catch (error) {
  console.error('❌ Failed to fix database:', error.message);
}




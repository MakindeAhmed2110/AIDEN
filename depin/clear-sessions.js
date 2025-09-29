// Clear all existing sessions to start fresh
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve('depin.db');

try {
  const db = new Database(dbPath);
  
  console.log('🧹 Clearing all existing sessions...');
  
  // Clear all sessions
  const result = db.prepare('DELETE FROM user_sessions').run();
  console.log(`✅ Cleared ${result.changes} sessions`);
  
  // Also clear any users for a fresh start
  const userResult = db.prepare('DELETE FROM users').run();
  console.log(`✅ Cleared ${userResult.changes} users`);
  
  db.close();
  console.log('🎉 Database cleared! You can now restart your backend.');
  
} catch (error) {
  console.error('❌ Failed to clear sessions:', error.message);
}










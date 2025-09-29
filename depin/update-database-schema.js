import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve('depin.db');

console.log('Updating database schema to add user_points table...');
console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  
  // Check if user_points table already exists
  const tableExists = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='user_points'
  `).get();

  if (tableExists) {
    console.log('✅ user_points table already exists');
  } else {
    // Create user_points table
    const createTable = db.prepare(`
      CREATE TABLE IF NOT EXISTS user_points (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_epoch_points INTEGER DEFAULT 0,
        today_points INTEGER DEFAULT 0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);
    
    createTable.run();
    console.log('✅ Created user_points table');

    // Create index for user_points
    const createIndex = db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id)
    `);
    
    createIndex.run();
    console.log('✅ Created index for user_points table');
  }

  // Check table structure
  const tableInfo = db.prepare('PRAGMA table_info(user_points)').all();
  console.log('\n📋 user_points table structure:');
  tableInfo.forEach(column => {
    console.log(`  • ${column.name} (${column.type}) ${column.notnull ? 'NOT NULL' : ''} ${column.pk ? 'PRIMARY KEY' : ''}`);
  });

  // Check if there are any existing users to create points records for
  const users = db.prepare('SELECT id, email FROM users').all();
  console.log(`\n👥 Found ${users.length} users in database`);

  if (users.length > 0) {
    // Create points records for existing users
    const insertPoints = db.prepare(`
      INSERT OR IGNORE INTO user_points (user_id, total_epoch_points, today_points)
      VALUES (?, 0, 0)
    `);

    users.forEach(user => {
      insertPoints.run(user.id);
      console.log(`✅ Created points record for user: ${user.email} (ID: ${user.id})`);
    });
  }

  db.close();
  console.log('\n🎉 Database schema update completed successfully!');
  
} catch (error) {
  console.error('❌ Error updating database schema:', error);
  process.exit(1);
}





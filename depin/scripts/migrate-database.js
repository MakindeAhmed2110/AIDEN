// Database migration script to add missing privy_id column
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve('depin.db');
const db = new Database(dbPath);

try {
  // Check if privy_id column exists
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const hasPrivyId = tableInfo.some(column => column.name === 'privy_id');
  
  if (!hasPrivyId) {
    console.log('Adding privy_id column to users table...');
    db.exec('ALTER TABLE users ADD COLUMN privy_id TEXT UNIQUE');
    console.log('✅ privy_id column added successfully');
  } else {
    console.log('✅ privy_id column already exists');
  }
  
  // Verify the schema
  const updatedTableInfo = db.prepare("PRAGMA table_info(users)").all();
  console.log('Current users table schema:');
  updatedTableInfo.forEach(column => {
    console.log(`  - ${column.name}: ${column.type} ${column.notnull ? 'NOT NULL' : ''} ${column.pk ? 'PRIMARY KEY' : ''}`);
  });
  
} catch (error) {
  console.error('Migration failed:', error);
} finally {
  db.close();
}


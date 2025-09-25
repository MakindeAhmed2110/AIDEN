// Simple script to check and fix database schema
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve('depin.db');
console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  
  // Check current schema
  console.log('\n=== Current users table schema ===');
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  tableInfo.forEach(column => {
    console.log(`- ${column.name}: ${column.type} ${column.notnull ? 'NOT NULL' : ''} ${column.pk ? 'PRIMARY KEY' : ''}`);
  });
  
  // Check if privy_id exists
  const hasPrivyId = tableInfo.some(column => column.name === 'privy_id');
  console.log('\nHas privy_id column:', hasPrivyId);
  
  if (!hasPrivyId) {
    console.log('\nAdding privy_id column...');
    try {
      db.exec('ALTER TABLE users ADD COLUMN privy_id TEXT UNIQUE');
      console.log('✅ privy_id column added successfully');
    } catch (error) {
      console.error('❌ Failed to add privy_id column:', error.message);
    }
  }
  
  // Check again
  console.log('\n=== Updated users table schema ===');
  const updatedTableInfo = db.prepare("PRAGMA table_info(users)").all();
  updatedTableInfo.forEach(column => {
    console.log(`- ${column.name}: ${column.type} ${column.notnull ? 'NOT NULL' : ''} ${column.pk ? 'PRIMARY KEY' : ''}`);
  });
  
  db.close();
  console.log('\n✅ Database check complete');
  
} catch (error) {
  console.error('❌ Database error:', error.message);
}








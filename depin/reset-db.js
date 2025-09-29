// Script to completely reset the database with correct schema
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve('depin.db');

try {
  // Delete existing database files
  console.log('🗑️  Deleting old database files...');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('✅ Deleted depin.db');
  }
  
  const shmPath = dbPath + '-shm';
  if (fs.existsSync(shmPath)) {
    fs.unlinkSync(shmPath);
    console.log('✅ Deleted depin.db-shm');
  }
  
  const walPath = dbPath + '-wal';
  if (fs.existsSync(walPath)) {
    fs.unlinkSync(walPath);
    console.log('✅ Deleted depin.db-wal');
  }
  
  // Create new database with correct schema
  console.log('\n🔨 Creating new database with correct schema...');
  const db = new Database(dbPath);
  
  // Enable WAL mode and foreign keys
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  
  // Create tables with correct schema
  const schema = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      privy_id TEXT UNIQUE,
      hedera_account_id TEXT,
      hedera_private_key_encrypted TEXT,
      hedera_public_key TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT 1
    );

    -- User sessions table
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    -- DePIN nodes table
    CREATE TABLE IF NOT EXISTS depin_nodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      node_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      location TEXT,
      is_active BOOLEAN DEFAULT 1,
      total_bytes_served INTEGER DEFAULT 0,
      total_uptime REAL DEFAULT 0,
      last_activity DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    -- Usage proofs table
    CREATE TABLE IF NOT EXISTS usage_proofs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      node_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      timestamp DATETIME NOT NULL,
      bytes_served INTEGER NOT NULL,
      uptime REAL NOT NULL,
      cryptographic_proof TEXT NOT NULL,
      hedera_transaction_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    -- Indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_privy_id ON users(privy_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_nodes_user_id ON depin_nodes(user_id);
    CREATE INDEX IF NOT EXISTS idx_proofs_user_id ON usage_proofs(user_id);
    CREATE INDEX IF NOT EXISTS idx_proofs_timestamp ON usage_proofs(timestamp);
  `;
  
  db.exec(schema);
  console.log('✅ Database schema created successfully');
  
  // Verify the schema
  console.log('\n📋 Verifying users table schema:');
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  tableInfo.forEach(column => {
    console.log(`  - ${column.name}: ${column.type} ${column.notnull ? 'NOT NULL' : ''} ${column.pk ? 'PRIMARY KEY' : ''}`);
  });
  
  const hasPrivyId = tableInfo.some(column => column.name === 'privy_id');
  console.log('\n✅ Has privy_id column:', hasPrivyId);
  
  db.close();
  console.log('\n🎉 Database reset complete! You can now restart your backend server.');
  
} catch (error) {
  console.error('❌ Database reset failed:', error.message);
}










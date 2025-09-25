import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve('depin.db');

console.log('🔄 Creating bandwidth_contributions table...');

try {
  const db = new Database(dbPath);
  
  // Check if the table already exists
  const tableExists = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='bandwidth_contributions'
  `).get();

  if (tableExists) {
    console.log('✅ bandwidth_contributions table already exists');
    db.close();
    process.exit(0);
  }

  console.log('📊 Creating bandwidth_contributions table...');

  // Create the bandwidth_contributions table
  const createTable = db.prepare(`
    CREATE TABLE bandwidth_contributions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      node_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      contribution_bytes INTEGER NOT NULL,
      download_speed_mbps REAL NOT NULL,
      upload_speed_mbps REAL NOT NULL,
      latency_ms REAL NOT NULL,
      uptime_percentage REAL NOT NULL,
      test_duration_ms INTEGER NOT NULL,
      contribution_timestamp DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  createTable.run();

  // Create indexes for better performance
  console.log('📈 Creating indexes...');
  
  const createIndexes = [
    'CREATE INDEX IF NOT EXISTS idx_contributions_user_id ON bandwidth_contributions(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_contributions_timestamp ON bandwidth_contributions(contribution_timestamp)',
    'CREATE INDEX IF NOT EXISTS idx_contributions_node_id ON bandwidth_contributions(node_id)'
  ];

  createIndexes.forEach(indexSQL => {
    db.prepare(indexSQL).run();
  });

  // Verify the table was created
  const tableInfo = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='bandwidth_contributions'
  `).get();

  if (tableInfo) {
    console.log('✅ bandwidth_contributions table created successfully');
    
    // Show table structure
    const columns = db.prepare(`
      PRAGMA table_info(bandwidth_contributions)
    `).all();
    
    console.log('📋 Table structure:');
    columns.forEach(column => {
      console.log(`   • ${column.name} (${column.type})`);
    });
    
    // Show indexes
    const indexes = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='index' AND tbl_name='bandwidth_contributions'
    `).all();
    
    console.log('📈 Indexes created:');
    indexes.forEach(index => {
      console.log(`   • ${index.name}`);
    });
    
  } else {
    console.log('❌ Failed to create bandwidth_contributions table');
    process.exit(1);
  }

  db.close();
  console.log('✅ Migration completed successfully!');
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}

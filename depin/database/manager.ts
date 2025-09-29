import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export class DatabaseManager {
  private db!: Database.Database;
  private dbPath: string;

  constructor(dbPath: string = 'depin.db') {
    this.dbPath = path.resolve(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase() {
    // Create database directory if it doesn't exist
    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    
    this.createTables();
  }

  private createTables() {
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

      -- Bandwidth contributions table
      CREATE TABLE IF NOT EXISTS bandwidth_contributions (
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
      );

      -- User points table
      CREATE TABLE IF NOT EXISTS user_points (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_epoch_points INTEGER DEFAULT 0,
        today_points INTEGER DEFAULT 0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      -- Indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_nodes_user_id ON depin_nodes(user_id);
      CREATE INDEX IF NOT EXISTS idx_proofs_user_id ON usage_proofs(user_id);
      CREATE INDEX IF NOT EXISTS idx_proofs_timestamp ON usage_proofs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_contributions_user_id ON bandwidth_contributions(user_id);
      CREATE INDEX IF NOT EXISTS idx_contributions_timestamp ON bandwidth_contributions(contribution_timestamp);
      CREATE INDEX IF NOT EXISTS idx_contributions_node_id ON bandwidth_contributions(node_id);
      CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
    `;

    this.db.exec(schema);
  }

  getDatabase(): Database.Database {
    return this.db;
  }

  close() {
    this.db.close();
  }
}

export const dbManager = new DatabaseManager();



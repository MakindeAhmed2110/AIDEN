import { Pool, PoolClient } from 'pg';
import path from 'path';
import fs from 'fs';

export class PostgresManager {
  private pool: Pool;
  private isInitialized: boolean = false;

  constructor() {
    // Get database URL from environment variables
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!databaseUrl) {
      console.warn('⚠️ No DATABASE_URL found, using SQLite fallback');
      throw new Error('DATABASE_URL not configured');
    }

    this.pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    console.log('🐘 PostgreSQL connection pool created');
  }

  async initializeDatabase(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Test connection
      const client = await this.pool.connect();
      console.log('✅ PostgreSQL connection successful');
      
      // Create tables if they don't exist
      await this.createTables(client);
      
      client.release();
      this.isInitialized = true;
      console.log('✅ PostgreSQL database initialized');
    } catch (error) {
      console.error('❌ PostgreSQL initialization failed:', error);
      throw error;
    }
  }

  private async createTables(client: PoolClient): Promise<void> {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        hedera_account_id VARCHAR(255),
        hedera_public_key TEXT,
        hedera_private_key_encrypted TEXT,
        privy_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createSessionsTable = `
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createPointsTable = `
      CREATE TABLE IF NOT EXISTS user_points (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        total_epoch_points INTEGER DEFAULT 0,
        today_points INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createContributionsTable = `
      CREATE TABLE IF NOT EXISTS contributions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        node_id VARCHAR(255),
        bytes_served BIGINT,
        bandwidth_mbps DECIMAL(10,2),
        network_latency_ms INTEGER,
        uptime_percentage DECIMAL(5,2),
        points_earned INTEGER,
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createNodesTable = `
      CREATE TABLE IF NOT EXISTS depin_nodes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        node_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        bandwidth_mbps INTEGER,
        location VARCHAR(255),
        total_bytes_served BIGINT DEFAULT 0,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createRewardsTable = `
      CREATE TABLE IF NOT EXISTS rewards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        epoch_number INTEGER,
        total_points INTEGER,
        hbar_amount DECIMAL(18,8),
        user_reward DECIMAL(18,8),
        charity_reward DECIMAL(18,8),
        transaction_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create indexes for better performance
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_points_user_id ON user_points(user_id);
      CREATE INDEX IF NOT EXISTS idx_contributions_user_id ON contributions(user_id);
      CREATE INDEX IF NOT EXISTS idx_contributions_created_at ON contributions(created_at);
      CREATE INDEX IF NOT EXISTS idx_nodes_user_id ON depin_nodes(user_id);
      CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON rewards(user_id);
      CREATE INDEX IF NOT EXISTS idx_rewards_epoch ON rewards(epoch_number);
    `;

    try {
      await client.query(createUsersTable);
      await client.query(createSessionsTable);
      await client.query(createPointsTable);
      await client.query(createContributionsTable);
      await client.query(createNodesTable);
      await client.query(createRewardsTable);
      await client.query(createIndexes);
      
      console.log('✅ PostgreSQL tables created successfully');
    } catch (error) {
      console.error('❌ Error creating PostgreSQL tables:', error);
      throw error;
    }
  }

  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  async close(): Promise<void> {
    await this.pool.end();
    console.log('🐘 PostgreSQL connection pool closed');
  }

  // Helper methods for common operations
  async getUserByEmail(email: string): Promise<any> {
    const result = await this.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  async createUser(userData: any): Promise<any> {
    const { email, password_hash, hedera_account_id, hedera_public_key, hedera_private_key_encrypted, privy_id } = userData;
    
    const result = await this.query(`
      INSERT INTO users (email, password_hash, hedera_account_id, hedera_public_key, hedera_private_key_encrypted, privy_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [email, password_hash, hedera_account_id, hedera_public_key, hedera_private_key_encrypted, privy_id]);
    
    return result.rows[0];
  }

  async createSession(userId: number, token: string, expiresAt: Date): Promise<any> {
    const result = await this.query(`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [userId, token, expiresAt]);
    
    return result.rows[0];
  }

  async getSessionByToken(token: string): Promise<any> {
    const result = await this.query(`
      SELECT s.*, u.* FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = $1 AND s.expires_at > NOW()
    `, [token]);
    
    return result.rows[0] || null;
  }

  async getUserPoints(userId: number): Promise<any> {
    const result = await this.query('SELECT * FROM user_points WHERE user_id = $1', [userId]);
    return result.rows[0] || null;
  }

  async updateUserPoints(userId: number, points: number): Promise<any> {
    const result = await this.query(`
      INSERT INTO user_points (user_id, total_epoch_points, today_points)
      VALUES ($1, $2, $2)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        total_epoch_points = user_points.total_epoch_points + $2,
        today_points = user_points.today_points + $2,
        last_updated = CURRENT_TIMESTAMP
      RETURNING *
    `, [userId, points]);
    
    return result.rows[0];
  }

  async createContribution(contributionData: any): Promise<any> {
    const { user_id, node_id, bytes_served, bandwidth_mbps, network_latency_ms, uptime_percentage, points_earned, transaction_id } = contributionData;
    
    const result = await this.query(`
      INSERT INTO contributions (user_id, node_id, bytes_served, bandwidth_mbps, network_latency_ms, uptime_percentage, points_earned, transaction_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [user_id, node_id, bytes_served, bandwidth_mbps, network_latency_ms, uptime_percentage, points_earned, transaction_id]);
    
    return result.rows[0];
  }

  async getUserContributions(userId: number, limit: number = 10): Promise<any[]> {
    const result = await this.query(`
      SELECT * FROM contributions 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `, [userId, limit]);
    
    return result.rows;
  }

  async createNode(nodeData: any): Promise<any> {
    const { user_id, node_id, name, status, bandwidth_mbps, location } = nodeData;
    
    const result = await this.query(`
      INSERT INTO depin_nodes (user_id, node_id, name, status, bandwidth_mbps, location)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [user_id, node_id, name, status, bandwidth_mbps, location]);
    
    return result.rows[0];
  }

  async getUserNodes(userId: number): Promise<any[]> {
    const result = await this.query('SELECT * FROM depin_nodes WHERE user_id = $1', [userId]);
    return result.rows;
  }

  async getNetworkStats(): Promise<any> {
    const result = await this.query(`
      SELECT 
        COUNT(DISTINCT n.id) as total_nodes,
        COUNT(DISTINCT CASE WHEN n.status = 'active' THEN n.id END) as active_nodes,
        COALESCE(SUM(c.bytes_served), 0) as total_bytes_served
      FROM depin_nodes n
      LEFT JOIN contributions c ON n.user_id = c.user_id
    `);
    
    return result.rows[0];
  }
}

// Export singleton instance
export const postgresManager = new PostgresManager();

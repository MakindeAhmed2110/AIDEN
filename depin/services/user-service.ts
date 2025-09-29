import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { dbManager } from '../database/manager';
import { hederaWalletManager, HederaWallet } from '../wallet/hedera-wallet';

export interface User {
  id: number;
  email: string;
  hederaAccountId: string | null;
  hederaPublicKey: string | null;
  privyId?: string | null;
  createdAt: Date;
  isActive: boolean;
}

export interface CreateUserData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface PrivyUserData {
  email: string;
}

export class UserService {
  private db = dbManager.getDatabase();
  private jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

  // Create a new user with embedded Hedera wallet
  async createUser(userData: CreateUserData): Promise<{ user: User; wallet: HederaWallet; token: string }> {
    try {
      // Check if user already exists
      const existingUser = this.db.prepare('SELECT id FROM users WHERE email = ?').get(userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 12);

      // Create Hedera wallet
      const wallet = await hederaWalletManager.createUserWallet();

      // Insert user into database
      const insertUser = this.db.prepare(`
        INSERT INTO users (email, password_hash, hedera_account_id, hedera_private_key_encrypted, hedera_public_key)
        VALUES (?, ?, ?, ?, ?)
      `);

      const result = insertUser.run(
        userData.email,
        passwordHash,
        wallet.accountId,
        wallet.encryptedPrivateKey,
        wallet.publicKey
      );

      const userId = result.lastInsertRowid as number;

      // Create session token
      const token = this.generateToken(userId);

      // Store session
      this.createSession(userId, token);

      const user: User = {
        id: userId,
        email: userData.email,
        hederaAccountId: wallet.accountId,
        hederaPublicKey: wallet.publicKey,
        createdAt: new Date(),
        isActive: true
      };

      return { user, wallet, token };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Login user
  async loginUser(loginData: LoginData): Promise<{ user: User; token: string }> {
    try {
      const user = this.db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(loginData.email) as any;
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isValidPassword = await bcrypt.compare(loginData.password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Generate new session token
      const token = this.generateToken(user.id);
      this.createSession(user.id, token);

      const userResponse: User = {
        id: user.id,
        email: user.email,
        hederaAccountId: user.hedera_account_id,
        hederaPublicKey: user.hedera_public_key,
        createdAt: new Date(user.created_at),
        isActive: user.is_active
      };

      return { user: userResponse, token };
    } catch (error) {
      console.error('Error logging in user:', error);
      throw new Error(`Failed to login: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get user by ID
  async getUserById(userId: number): Promise<User | null> {
    try {
      const user = this.db.prepare('SELECT * FROM users WHERE id = ? AND is_active = 1').get(userId) as any;
      
      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        hederaAccountId: user.hedera_account_id,
        hederaPublicKey: user.hedera_public_key,
        createdAt: new Date(user.created_at),
        isActive: user.is_active
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Generate JWT token
  private generateToken(userId: number): string {
    return jwt.sign(
      { 
        userId, 
        iat: Math.floor(Date.now() / 1000),
        jti: uuidv4() // Add unique token ID
      },
      this.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  // Create user session
  private createSession(userId: number, token: string): void {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    // First, delete any existing sessions for this user
    const deleteExisting = this.db.prepare(`
      DELETE FROM user_sessions WHERE user_id = ?
    `);
    deleteExisting.run(userId);
    
    // Then insert the new session
    const insertSession = this.db.prepare(`
      INSERT INTO user_sessions (user_id, session_token, expires_at)
      VALUES (?, ?, ?)
    `);
    
    insertSession.run(userId, token, expiresAt.toISOString());
  }

  // Verify JWT token
  verifyToken(token: string): { userId: number } | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      return { userId: decoded.userId };
    } catch (error) {
      return null;
    }
  }

  // Create a new user with email-only authentication
  async createPrivyUser(userData: PrivyUserData): Promise<{ user: User; wallet: HederaWallet; token: string }> {
    try {
      // Check if user already exists by email only
      const existingUser = this.db.prepare('SELECT id FROM users WHERE email = ?').get(userData.email);
      if (existingUser) {
        console.log('🔄 User exists, returning existing wallet data');
        // If user exists, get their data and return it
        const user = await this.getUserById((existingUser as any).id);
        if (user) {
          const token = this.generateToken((user as any).id);
          this.createSession(user.id, token);
          
          // Return existing wallet data (we don't expose the actual wallet object for security)
          const wallet: HederaWallet = {
            accountId: user.hederaAccountId || '',
            privateKey: '', // Never expose private key
            publicKey: user.hederaPublicKey || '',
            encryptedPrivateKey: '' // Never expose encrypted private key
          };
          
          return { user, wallet, token };
        }
      }

      console.log('🆕 Creating new user with email:', userData.email);
      
      // Create Hedera wallet for new user
      const wallet = await hederaWalletManager.createUserWallet();

      // Insert user into database (no privy_id needed)
      const insertUser = this.db.prepare(`
        INSERT INTO users (email, hedera_account_id, hedera_private_key_encrypted, hedera_public_key)
        VALUES (?, ?, ?, ?)
      `);

      const result = insertUser.run(
        userData.email,
        wallet.accountId,
        wallet.encryptedPrivateKey,
        wallet.publicKey
      );

      const userId = result.lastInsertRowid as number;

      // Create session token
      const token = this.generateToken(userId);

      // Store session
      this.createSession(userId, token);

      const user: User = {
        id: userId,
        email: userData.email,
        hederaAccountId: wallet.accountId,
        hederaPublicKey: wallet.publicKey,
        privyId: null, // No privy_id needed
        createdAt: new Date(),
        isActive: true
      };

      console.log('✅ User created successfully with wallet:', wallet.accountId);
      return { user, wallet, token };
    } catch (error) {
      console.error('Error creating user:', error);
      
      // If it's a UNIQUE constraint error, try to get the existing user
      if (error instanceof Error && error.message.includes('UNIQUE constraint failed: users.email')) {
        console.log('🔄 UNIQUE constraint error, attempting to get existing user');
        const existingUser = this.db.prepare('SELECT id FROM users WHERE email = ?').get(userData.email);
        if (existingUser) {
          const user = await this.getUserById((existingUser as any).id);
          if (user) {
            const token = this.generateToken((user as any).id);
            this.createSession(user.id, token);
            
            const wallet: HederaWallet = {
              accountId: user.hederaAccountId || '',
              privateKey: '',
              publicKey: user.hederaPublicKey || '',
              encryptedPrivateKey: ''
            };
            
            return { user, wallet, token };
          }
        }
      }
      
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get user by Privy ID
  async getUserByPrivyId(privyId: string): Promise<User | null> {
    try {
      const user = this.db.prepare('SELECT * FROM users WHERE privy_id = ? AND is_active = 1').get(privyId) as any;
      
      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        hederaAccountId: user.hedera_account_id,
        hederaPublicKey: user.hedera_public_key,
        privyId: user.privy_id,
        createdAt: new Date(user.created_at),
        isActive: user.is_active
      };
    } catch (error) {
      console.error('Error getting user by Privy ID:', error);
      return null;
    }
  }

  // Get user's Hedera wallet balance
  async getUserWalletBalance(userId: number): Promise<number> {
    try {
      const user = await this.getUserById(userId);
      if (!user || !user.hederaAccountId) {
        throw new Error('User or Hedera account not found');
      }

      return await hederaWalletManager.getAccountBalance(user.hederaAccountId);
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      throw new Error(`Failed to get wallet balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get user points (for reward system)
  async getUserPoints(userId: number): Promise<{
    todayPoints: number;
    totalEpochPoints: number;
    lastUpdated: Date;
  }> {
    try {
      const points = this.db.prepare(`
        SELECT today_points, total_epoch_points, last_updated
        FROM user_points 
        WHERE user_id = ?
      `).get(userId) as any;

      if (!points) {
        return {
          todayPoints: 0,
          totalEpochPoints: 0,
          lastUpdated: new Date()
        };
      }

      return {
        todayPoints: points.today_points || 0,
        totalEpochPoints: points.total_epoch_points || 0,
        lastUpdated: new Date(points.last_updated)
      };
    } catch (error) {
      console.error('Error getting user points:', error);
      throw new Error(`Failed to get user points: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get leaderboard
  async getLeaderboard(limit: number = 10): Promise<Array<{
    userId: number;
    email: string;
    todayPoints: number;
    totalEpochPoints: number;
    potentialRewardHBAR: number;
  }>> {
    try {
      const leaderboard = this.db.prepare(`
        SELECT 
          u.id as user_id,
          u.email,
          up.today_points,
          up.total_epoch_points
        FROM users u
        JOIN user_points up ON u.id = up.user_id
        WHERE u.is_active = 1
        ORDER BY up.total_epoch_points DESC
        LIMIT ?
      `).all(limit) as any[];

      return leaderboard.map(user => ({
        userId: user.user_id,
        email: user.email,
        todayPoints: user.today_points || 0,
        totalEpochPoints: user.total_epoch_points || 0,
        potentialRewardHBAR: (user.today_points || 0) * 0.001 // 1MB = 0.001 HBAR
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw new Error(`Failed to get leaderboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const userService = new UserService();
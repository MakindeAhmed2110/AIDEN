import { dbManager } from '../database/manager';
import { hederaWalletManager } from '../wallet/hedera-wallet';
import { pointsService } from './points-service';
import { userService } from './user-service';
import { contractService } from './contract-service';
import * as cron from 'node-cron';

export interface RewardDistributionResult {
  success: boolean;
  totalUsers: number;
  totalPoints: number;
  totalHBAR: number;
  userRewards: number;
  charityRewards: number;
  transactionId?: string;
  error?: string;
}

export interface UserRewardData {
  userId: number;
  userAddress: string;
  points: number;
  hbarAmount: number;
}

export class RewardDistributionAgent {
  private db = dbManager.getDatabase();
  private centralizedWalletAddress: string;
  private centralizedWalletPrivateKey: string;
  private isRunning: boolean = false;
  private cronTask: any = null;

  constructor() {
    // Centralized wallet for funding rewards (using operator as centralized wallet)
    this.centralizedWalletAddress = process.env.HEDERA_OPERATOR_ID || '0.0.6853766';
    this.centralizedWalletPrivateKey = process.env.HEDERA_OPERATOR_KEY || '0x6d12c47bfca09fc73696f34e5e0294453c12e6d5de29ea628af1daea941a8c9e';

    console.log('🤖 Reward Distribution Agent initialized:');
    console.log(`  Centralized Wallet: ${this.centralizedWalletAddress}`);
    console.log(`  RewardDistributor Contract: ${process.env.REWARD_DISTRIBUTOR_CONTRACT || '0.0.6858707'}`);
    console.log(`  CharityVault Contract: ${process.env.CHARITY_VAULT_CONTRACT || '0.0.6858706'}`);
  }

  /**
   * Start the automated reward distribution agent
   * Runs every 24 hours at midnight
   */
  public startAgent(): void {
    if (this.isRunning) {
      console.log('⚠️ Reward distribution agent is already running');
      return;
    }

    console.log('🚀 Starting automated reward distribution agent...');
    
    // Schedule daily reward distribution at midnight (00:00)
    this.cronTask = cron.schedule('0 0 * * *', async () => {
      console.log('⏰ Daily reward distribution triggered at midnight');
      await this.distributeDailyRewards();
    }, {
      timezone: 'UTC'
    });

    // Also run immediately for testing (remove in production)
    console.log('🧪 Running initial reward distribution for testing...');
    setTimeout(() => {
      this.distributeDailyRewards();
    }, 5000);

    this.isRunning = true;
    console.log('✅ Reward distribution agent started successfully');
  }

  /**
   * Stop the automated reward distribution agent
   */
  public stopAgent(): void {
    if (!this.isRunning) {
      console.log('⚠️ Reward distribution agent is not running');
      return;
    }

    if (this.cronTask) {
      this.cronTask.stop();
    }
    this.isRunning = false;
    console.log('🛑 Reward distribution agent stopped');
  }

  /**
   * Main function to distribute daily rewards
   */
  public async distributeDailyRewards(): Promise<RewardDistributionResult> {
    try {
      console.log('🎯 Starting daily reward distribution...');
      
      // Get all users with points from today
      const usersWithPoints = await this.getUsersWithTodayPoints();
      
      if (usersWithPoints.length === 0) {
        console.log('📊 No users with points found for today');
        return {
          success: true,
          totalUsers: 0,
          totalPoints: 0,
          totalHBAR: 0,
          userRewards: 0,
          charityRewards: 0
        };
      }

      console.log(`👥 Found ${usersWithPoints.length} users with points to distribute`);

      // Calculate total points and HBAR amounts
      const totalPoints = usersWithPoints.reduce((sum, user) => sum + user.points, 0);
      const totalHBAR = this.calculateHBARFromPoints(totalPoints);
      const userRewards = totalHBAR * 0.7; // 70% to users
      const charityRewards = totalHBAR * 0.3; // 30% to charity

      console.log(`💰 Reward calculation:`);
      console.log(`  Total Points: ${totalPoints}`);
      console.log(`  Total HBAR: ${totalHBAR.toFixed(6)}`);
      console.log(`  User Rewards (70%): ${userRewards.toFixed(6)} HBAR`);
      console.log(`  Charity Rewards (30%): ${charityRewards.toFixed(6)} HBAR`);

      // Check if centralized wallet has enough balance
      const centralizedBalance = await this.getCentralizedWalletBalance();
      if (centralizedBalance < totalHBAR) {
        throw new Error(`Insufficient balance in centralized wallet. Required: ${totalHBAR.toFixed(6)} HBAR, Available: ${centralizedBalance.toFixed(6)} HBAR`);
      }

      // Fund the RewardDistributor contract
      await this.fundRewardDistributor(totalHBAR);

      // Distribute rewards using smart contract
      const transactionId = await this.distributeRewardsViaContract(usersWithPoints, totalHBAR);

      // Reset today's points for all users
      await this.resetTodayPointsForAllUsers();

      console.log('✅ Daily reward distribution completed successfully');

      return {
        success: true,
        totalUsers: usersWithPoints.length,
        totalPoints,
        totalHBAR,
        userRewards,
        charityRewards,
        transactionId
      };

    } catch (error) {
      console.error('❌ Error in daily reward distribution:', error);
      return {
        success: false,
        totalUsers: 0,
        totalPoints: 0,
        totalHBAR: 0,
        userRewards: 0,
        charityRewards: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all users who have points from today
   */
  private async getUsersWithTodayPoints(): Promise<UserRewardData[]> {
    try {
      const users = this.db.prepare(`
        SELECT 
          u.id as user_id,
          u.hedera_account_id as user_address,
          up.today_points as points
        FROM users u
        JOIN user_points up ON u.id = up.user_id
        WHERE up.today_points > 0 
          AND u.hedera_account_id IS NOT NULL
          AND u.is_active = 1
        ORDER BY up.today_points DESC
      `).all() as any[];

      return users.map(user => ({
        userId: user.user_id,
        userAddress: user.user_address,
        points: user.points,
        hbarAmount: this.calculateHBARFromPoints(user.points)
      }));
    } catch (error) {
      console.error('Error getting users with today points:', error);
      throw new Error(`Failed to get users with points: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate HBAR amount from points (1MB = 0.001 HBAR)
   */
  private calculateHBARFromPoints(points: number): number {
    // 1 point = 1 MB, 1 MB = 0.001 HBAR
    return points * 0.001;
  }

  /**
   * Get centralized wallet balance
   */
  private async getCentralizedWalletBalance(): Promise<number> {
    try {
      const balance = await hederaWalletManager.getAccountBalance(this.centralizedWalletAddress);
      return balance / 100000000; // Convert tinybars to HBAR
    } catch (error) {
      console.error('Error getting centralized wallet balance:', error);
      return 0;
    }
  }

  /**
   * Fund the RewardDistributor contract with HBAR
   */
  private async fundRewardDistributor(amount: number): Promise<void> {
    try {
      console.log(`💸 Funding RewardDistributor contract with ${amount.toFixed(6)} HBAR...`);
      
      const amountInTinybars = Math.floor(amount * 100000000); // Convert HBAR to tinybars
      
      // Use contract service to deposit HBAR
      const transactionId = await contractService.depositHBAR(amountInTinybars);

      console.log(`✅ Funded contract successfully. Transaction: ${transactionId}`);
    } catch (error) {
      console.error('Error funding RewardDistributor contract:', error);
      throw new Error(`Failed to fund contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Distribute rewards using the smart contract
   */
  private async distributeRewardsViaContract(users: UserRewardData[], totalAmount: number): Promise<string> {
    try {
      console.log('📋 Distributing rewards via smart contract...');

      // Prepare user addresses and amounts for batch distribution
      const userAddresses = users.map(user => user.userAddress);
      const amounts = users.map(user => Math.floor(user.hbarAmount * 100000000)); // Convert to tinybars
      
      console.log(`📤 Batch distributing to ${users.length} users:`);
      users.forEach((user, index) => {
        console.log(`  User ${user.userId}: ${user.hbarAmount.toFixed(6)} HBAR (${user.points} points)`);
      });

      // Use contract service to batch distribute rewards
      const transactionId = await contractService.batchDistributeRewards(
        userAddresses,
        amounts,
        'daily_bandwidth_reward'
      );
      
      console.log(`✅ Rewards distributed via contract. Transaction: ${transactionId}`);
      
      return transactionId;
    } catch (error) {
      console.error('Error distributing rewards via contract:', error);
      throw new Error(`Failed to distribute via contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reset today's points for all users after distribution
   */
  private async resetTodayPointsForAllUsers(): Promise<void> {
    try {
      console.log('🔄 Resetting today points for all users...');
      
      const updateResult = this.db.prepare(`
        UPDATE user_points 
        SET today_points = 0, 
            last_updated = CURRENT_TIMESTAMP
        WHERE today_points > 0
      `).run();

      console.log(`✅ Reset today points for ${updateResult.changes} users`);
    } catch (error) {
      console.error('Error resetting today points:', error);
      throw new Error(`Failed to reset today points: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get reward distribution statistics
   */
  public async getRewardStats(): Promise<{
    totalUsersWithPoints: number;
    totalTodayPoints: number;
    totalTodayHBAR: number;
    centralizedWalletBalance: number;
    lastDistributionTime?: string;
  }> {
    try {
      const stats = this.db.prepare(`
        SELECT 
          COUNT(*) as total_users,
          SUM(today_points) as total_points
        FROM user_points 
        WHERE today_points > 0
      `).get() as any;

      const centralizedBalance = await this.getCentralizedWalletBalance();
      const totalHBAR = this.calculateHBARFromPoints(stats.total_points || 0);

      return {
        totalUsersWithPoints: stats.total_users || 0,
        totalTodayPoints: stats.total_points || 0,
        totalTodayHBAR: totalHBAR,
        centralizedWalletBalance: centralizedBalance
      };
    } catch (error) {
      console.error('Error getting reward stats:', error);
      throw new Error(`Failed to get reward stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Manual trigger for reward distribution (for testing)
   */
  public async triggerManualDistribution(): Promise<RewardDistributionResult> {
    console.log('🔧 Manual reward distribution triggered');
    return await this.distributeDailyRewards();
  }
}

export const rewardAgent = new RewardDistributionAgent();

import { Router, Request, Response } from 'express';
import { rewardAgent } from '../services/reward-agent.js';
import { userService } from '../services/user-service.js';

const router = Router();

// Middleware to verify admin access (you can implement proper admin authentication)
const verifyAdmin = (req: Request, res: Response, next: any) => {
  // For now, we'll allow all requests. In production, implement proper admin authentication
  next();
};

/**
 * GET /api/rewards/stats
 * Get reward distribution statistics
 */
router.get('/stats', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const stats = await rewardAgent.getRewardStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting reward stats:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get reward statistics'
    });
  }
});

/**
 * POST /api/rewards/distribute
 * Manually trigger reward distribution
 */
router.post('/distribute', verifyAdmin, async (req: Request, res: Response) => {
  try {
    console.log('🔧 Manual reward distribution requested');
    
    const result = await rewardAgent.triggerManualDistribution();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Reward distribution completed successfully',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error || 'Reward distribution failed',
        data: result
      });
    }
  } catch (error) {
    console.error('Error in manual reward distribution:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to distribute rewards'
    });
  }
});

/**
 * POST /api/rewards/agent/start
 * Start the automated reward distribution agent
 */
router.post('/agent/start', verifyAdmin, async (req: Request, res: Response) => {
  try {
    rewardAgent.startAgent();
    
    res.json({
      success: true,
      message: 'Reward distribution agent started successfully'
    });
  } catch (error) {
    console.error('Error starting reward agent:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to start reward agent'
    });
  }
});

/**
 * POST /api/rewards/agent/stop
 * Stop the automated reward distribution agent
 */
router.post('/agent/stop', verifyAdmin, async (req: Request, res: Response) => {
  try {
    rewardAgent.stopAgent();
    
    res.json({
      success: true,
      message: 'Reward distribution agent stopped successfully'
    });
  } catch (error) {
    console.error('Error stopping reward agent:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to stop reward agent'
    });
  }
});

/**
 * GET /api/rewards/user/:userId
 * Get user's reward information
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Get user points
    const userPoints = await userService.getUserPoints(userId);
    
    // Get user wallet balance
    const walletBalance = await userService.getUserWalletBalance(userId);
    
    // Calculate potential rewards
    const potentialRewardHBAR = userPoints.todayPoints * 0.001; // 1MB = 0.001 HBAR
    const potentialUserReward = potentialRewardHBAR * 0.7; // 70% to user
    const potentialCharityReward = potentialRewardHBAR * 0.3; // 30% to charity

    res.json({
      success: true,
      data: {
        userId,
        points: {
          today: userPoints.todayPoints,
          total: userPoints.totalEpochPoints,
          lastUpdated: userPoints.lastUpdated
        },
        wallet: {
          balance: walletBalance,
          balanceInHbar: walletBalance / 100000000
        },
        potentialRewards: {
          totalHBAR: potentialRewardHBAR,
          userReward: potentialUserReward,
          charityReward: potentialCharityReward
        }
      }
    });
  } catch (error) {
    console.error('Error getting user reward info:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get user reward information'
    });
  }
});

/**
 * GET /api/rewards/leaderboard
 * Get reward leaderboard
 */
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const leaderboard = await userService.getLeaderboard(limit);
    
    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get leaderboard'
    });
  }
});

export default router;

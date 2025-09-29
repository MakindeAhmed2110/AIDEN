import { Router, Request, Response, NextFunction } from 'express';
import { userService } from '../services/user-service';
import { depinService } from '../services/depin-service';
import { pointsService } from '../services/points-service';

const router = Router();

// Extend Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    res.status(401).json({
      success: false,
      message: 'No token provided'
    });
    return;
  }

  const decoded = userService.verifyToken(token);
  if (!decoded) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
    return;
  }

  req.userId = decoded.userId;
  next();
};

// Create a new DePIN node
router.post('/nodes', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, location } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    if (!name || !location) {
      res.status(400).json({
        success: false,
        message: 'Name and location are required'
      });
      return;
    }

    const node = await depinService.createNode(userId, { name, location });

    res.status(201).json({
      success: true,
      message: 'DePIN node created successfully',
      data: { node }
    });
  } catch (error) {
    console.error('Create node error:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create node'
    });
  }
});

// Get user's DePIN nodes
router.get('/nodes', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const nodes = await depinService.getUserNodes(userId);

    res.json({
      success: true,
      data: { nodes }
    });
  } catch (error) {
    console.error('Get nodes error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get nodes'
    });
  }
});

// Toggle node status
router.patch('/nodes/:nodeId/toggle', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { nodeId } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    if (!nodeId) {
      res.status(400).json({
        success: false,
        message: 'Node ID is required'
      });
      return;
    }

    const success = await depinService.toggleNode(userId, nodeId);

    if (!success) {
      res.status(404).json({
        success: false,
        message: 'Node not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Node status toggled successfully'
    });
  } catch (error) {
    console.error('Toggle node error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to toggle node'
    });
  }
});

// Measure bandwidth for a node
router.post('/nodes/:nodeId/measure', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { nodeId } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    if (!nodeId) {
      res.status(400).json({
        success: false,
        message: 'Node ID is required'
      });
      return;
    }

    const metrics = await depinService.measureNodeBandwidth(userId, nodeId);

    res.json({
      success: true,
      message: 'Bandwidth measured successfully',
      data: { metrics }
    });
  } catch (error) {
    console.error('Measure bandwidth error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to measure bandwidth'
    });
  }
});

// Get usage proofs
router.get('/proofs', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const proofs = await depinService.getUserUsageProofs(userId, limit);

    res.json({
      success: true,
      data: { proofs }
    });
  } catch (error) {
    console.error('Get proofs error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get usage proofs'
    });
  }
});

// Get network statistics
router.get('/stats', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const stats = await depinService.getUserNetworkStats(userId);
    const contributionStats = await depinService.getUserContributionStats(userId);
    const epochEarnings = await depinService.getEpochEarnings(userId, 1);
    const lastSessionData = await depinService.getLastSessionData(userId);

    res.json({
      success: true,
      data: { 
        stats,
        contributionStats,
        epochEarnings,
        lastSessionData
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get network statistics'
    });
  }
});

// Get user points
router.get('/points', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const userPoints = await pointsService.getUserPoints(userId);

    res.json({
      success: true,
      message: 'User points retrieved successfully',
      data: { 
        points: {
          totalEpochPoints: userPoints.totalEpochPoints,
          todayPoints: userPoints.todayPoints,
          lastUpdated: userPoints.lastUpdated
        }
      }
    });
  } catch (error) {
    console.error('Get points error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get user points'
    });
  }
});

// Connect to DePIN network (start measuring)
router.post('/connect', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const nodes = await depinService.getUserNodes(userId);
    
    const activeNodes = nodes.filter(node => node.isActive);
    
    if (activeNodes.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No active nodes found. Please create and activate nodes first.'
      });
      return;
    }

    // Start measuring bandwidth for all active nodes
    const measurements = await Promise.all(
      activeNodes.map(node => 
        depinService.measureNodeBandwidth(userId, node.nodeId)
      )
    );

    const stats = await depinService.getUserNetworkStats(userId);

    res.json({
      success: true,
      message: 'Successfully connected to DePIN network',
      data: {
        activeNodes: activeNodes.length,
        measurements,
        stats
      }
    });
  } catch (error) {
    console.error('Connect network error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to connect to network'
    });
  }
});

// Handle real-time measurement from frontend
router.post('/measurement', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { dataServed, downloadSpeed, uploadSpeed, latency, uptime, pointsEarned } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    // Store the measurement in the database
    await depinService.storeMeasurement(userId, {
      dataServed,
      downloadSpeed,
      uploadSpeed,
      latency,
      uptime,
      pointsEarned
    });

    res.json({
      success: true,
      message: 'Measurement stored successfully',
      data: {
        dataServed,
        pointsEarned,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Store measurement error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to store measurement'
    });
  }
});

// Sync final data when disconnecting
router.post('/sync-final', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { totalBytesServed, totalContributions, totalEpochPoints, todayPoints, averageUptime, lastContributionTime } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    // Update user's final stats
    await depinService.updateUserFinalStats(userId, {
      totalBytesServed,
      totalContributions,
      totalEpochPoints,
      todayPoints,
      averageUptime,
      lastContributionTime
    });

    res.json({
      success: true,
      message: 'Final data synced successfully',
      data: {
        totalBytesServed,
        totalContributions,
        totalEpochPoints,
        todayPoints,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Sync final data error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to sync final data'
    });
  }
});

// Get epoch earnings for a user
router.get('/epoch-earnings/:epochNumber?', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const epochNumber = parseInt(req.params.epochNumber || '1') || 1;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const epochEarnings = await depinService.getEpochEarnings(userId, epochNumber);

    res.json({
      success: true,
      message: `Epoch ${epochNumber} earnings retrieved successfully`,
      data: { epochEarnings }
    });
  } catch (error) {
    console.error('Get epoch earnings error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get epoch earnings'
    });
  }
});

// Get last session data for a user
router.get('/last-session', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const lastSessionData = await depinService.getLastSessionData(userId);

    res.json({
      success: true,
      message: 'Last session data retrieved successfully',
      data: { 
        lastSessionData,
        hasSessionData: lastSessionData !== null
      }
    });
  } catch (error) {
    console.error('Get last session error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get last session data'
    });
  }
});

export default router;
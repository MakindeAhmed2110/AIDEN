import { Router, Request, Response } from 'express';
import { userService, CreateUserData, LoginData } from '../services/user-service';

const router = Router();

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password }: CreateUserData = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Create user
    const result = await userService.createUser({ email, password });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          hederaAccountId: result.user.hederaAccountId,
          hederaPublicKey: result.user.hederaPublicKey,
          createdAt: result.user.createdAt
        },
        token: result.token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Registration failed'
    });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginData = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Login user
    const result = await userService.loginUser({ email, password });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          hederaAccountId: result.user.hederaAccountId,
          hederaPublicKey: result.user.hederaPublicKey,
          createdAt: result.user.createdAt
        },
        token: result.token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Login failed'
    });
  }
});

// Get current user profile
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = userService.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    const user = await userService.getUserById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get wallet balance
    const walletBalance = await userService.getUserWalletBalance(decoded.userId);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          hederaAccountId: user.hederaAccountId,
          hederaPublicKey: user.hederaPublicKey,
          createdAt: user.createdAt
        },
        walletBalance
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get profile'
    });
  }
});

export default router;
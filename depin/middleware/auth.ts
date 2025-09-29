import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user-service.js';

// Extend Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
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

  req.userId = decoded.userId;
  return next();
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    const decoded = userService.verifyToken(token);
    if (decoded) {
      req.userId = decoded.userId;
    }
  }
  
  return next();
};



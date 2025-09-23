import rateLimit from 'express-rate-limit';

// General rate limiter (more lenient for development)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter (more lenient for development)
export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 auth requests per minute (increased for development)
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API rate limiter (for DePIN operations)
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per minute
  message: {
    success: false,
    message: 'Too many API requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check rate limiter (more lenient for development)
export const healthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // limit each IP to 120 health checks per minute (2 per second)
  message: {
    success: false,
    message: 'Too many health check requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});



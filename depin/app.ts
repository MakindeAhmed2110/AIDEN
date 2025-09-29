import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { corsMiddleware } from './middleware/cors';
import { generalLimiter, authLimiter, apiLimiter, healthLimiter } from './middleware/rate-limit';
import authRoutes from './routes/auth';
import depinRoutes from './routes/depin';
import rewardRoutes from './routes/rewards';
import { rewardAgent } from './services/reward-agent';
import { dbManager } from './database/manager';

// Load environment variables
dotenv.config({ path: './env.local' });
// Also load from default .env file if it exists
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// Security middleware
app.use(helmet());
app.use(compression());

// CORS middleware
app.use(corsMiddleware);

// Rate limiting
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint (with more lenient rate limiting)
app.get('/health', healthLimiter, (req, res) => {
  res.json({
    success: true,
    message: 'DePIN API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/depin', apiLimiter, depinRoutes);
app.use('/api/rewards', apiLimiter, rewardRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database
    console.log('🔧 Initializing database...');
    if (dbManager.isUsingPostgres()) {
      console.log('🐘 Using PostgreSQL database');
    } else {
      console.log('📁 Using SQLite database');
    }
    
    // Initialize database connection
    await dbManager.initializeDatabase();
    console.log('✅ Database initialization complete');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 DePIN API server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
      console.log(`🌐 DePIN endpoints: http://localhost:${PORT}/api/depin`);
      console.log(`💰 Reward endpoints: http://localhost:${PORT}/api/rewards`);
      
      // Start the automated reward distribution agent
      console.log('🤖 Starting automated reward distribution agent...');
      rewardAgent.startAgent();
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
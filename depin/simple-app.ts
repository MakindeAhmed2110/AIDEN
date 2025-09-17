import express from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'DePIN API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Simple auth routes (no authentication required for testing)
app.post('/api/auth/register', (req, res) => {
  console.log('Register endpoint hit:', req.body);
  res.json({
    success: true,
    message: 'Registration endpoint working',
    data: {
      user: {
        id: 1,
        email: req.body.email || 'test@example.com',
        hederaAccountId: '0.0.9808695',
        hederaPublicKey: '024a8b96eb220f620740e89d1c96b970265bdab0d94b550959e07116e93b931bd6',
        createdAt: new Date().toISOString()
      },
      token: 'test-jwt-token'
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Login endpoint hit:', req.body);
  res.json({
    success: true,
    message: 'Login endpoint working',
    data: {
      user: {
        id: 1,
        email: req.body.email || 'test@example.com',
        hederaAccountId: '0.0.9808695',
        hederaPublicKey: '024a8b96eb220f620740e89d1c96b970265bdab0d94b550959e07116e93b931bd6',
        createdAt: new Date().toISOString()
      },
      token: 'test-jwt-token'
    }
  });
});

app.get('/api/auth/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
  
  res.json({
    success: true,
    data: {
      user: {
        id: 1,
        email: 'test@example.com',
        hederaAccountId: '0.0.9808695',
        hederaPublicKey: '024a8b96eb220f620740e89d1c96b970265bdab0d94b550959e07116e93b931bd6',
        createdAt: new Date().toISOString()
      },
      walletBalance: '100.0 HBAR'
    }
  });
});

// Simple DePIN routes
app.get('/api/depin/nodes', (req, res) => {
  res.json({
    success: true,
    data: {
      nodes: [
        {
          id: 1,
          nodeId: 'node-1',
          name: 'Test Node 1',
          location: 'New York',
          isActive: true,
          totalBytesServed: 1024000,
          totalUptime: 3600,
          lastActivity: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      ]
    }
  });
});

app.post('/api/depin/connect', (req, res) => {
  res.json({
    success: true,
    message: 'Successfully connected to DePIN network',
    data: {
      activeNodes: 1,
      measurements: [
        {
          nodeId: 'node-1',
          bandwidth: 100,
          latency: 50,
          timestamp: new Date().toISOString()
        }
      ],
      stats: {
        totalGBServed: 1.024,
        activeNodes: 1,
        averageUptime: 99.5,
        totalProofs: 5
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`�� Simple DePIN API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`🌐 DePIN endpoints: http://localhost:${PORT}/api/depin`);
  console.log(`\n📝 Test endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/profile`);
  console.log(`   GET  http://localhost:${PORT}/api/depin/nodes`);
  console.log(`   POST http://localhost:${PORT}/api/depin/connect`);
});

export default app;
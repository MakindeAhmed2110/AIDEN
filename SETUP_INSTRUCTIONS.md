# AIDEN DePIN System Setup Instructions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### 1. Backend Setup (DePIN API)

```bash
# Navigate to backend directory
cd depin

# Install dependencies
npm install

# Create environment file (copy from example)
copy env.local .env

# Start the backend server
npm start
```

The backend will start on `http://localhost:3001`

### 2. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Test the System

```bash
# In the depin directory, run the test script
node test-backend.js
```

## 🔧 Features Implemented

### ✅ Backend Features
- **Real Hedera Wallet Integration**: Uses Hedera SDK for actual testnet wallet creation
- **Embedded Wallet Generation**: Each user gets a Hedera wallet automatically on registration
- **Real Bandwidth Measurement**: Tests actual download speeds using HTTP requests
- **DePIN Node Management**: Create, manage, and monitor bandwidth nodes
- **Usage Proof System**: Cryptographic proofs of bandwidth usage
- **Hedera Integration**: Submits usage proofs to Hedera testnet
- **Secure Authentication**: JWT-based auth with encrypted private key storage

### ✅ Frontend Features
- **Modern UI**: Beautiful Material-UI interface with PolySans fonts
- **Wallet Dashboard**: View Hedera wallet balance and account details
- **Real-time Data**: Connects to backend API for live wallet information
- **Responsive Design**: Works on desktop and mobile devices
- **Copy Functionality**: Easy account ID copying

## 🔑 Key Components

### Backend Structure
```
depin/
├── app.ts                 # Main Express server
├── routes/
│   ├── auth.ts           # Authentication endpoints
│   └── depin.ts          # DePIN functionality endpoints
├── services/
│   ├── user-service.ts   # User management with wallet creation
│   └── depin-service.ts  # DePIN bandwidth measurement
├── wallet/
│   └── hedera-wallet.ts  # Real Hedera SDK integration
└── database/
    └── manager.ts        # SQLite database management
```

### Frontend Structure
```
frontend/
├── app/
│   ├── routes/
│   │   └── dashboard.wallets.tsx  # Wallet dashboard
│   └── services/
│       └── api.ts                 # Backend API integration
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user with embedded wallet
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile and wallet balance

### DePIN Operations
- `POST /api/depin/nodes` - Create new DePIN node
- `GET /api/depin/nodes` - Get user's nodes
- `PATCH /api/depin/nodes/:id/toggle` - Toggle node status
- `POST /api/depin/nodes/:id/measure` - Measure bandwidth
- `GET /api/depin/stats` - Get network statistics
- `POST /api/depin/connect` - Connect to DePIN network

## 🔒 Security Features

- **Encrypted Private Keys**: AES-256-GCM encryption for wallet private keys
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against abuse
- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: All inputs are validated and sanitized

## 🧪 Testing

The system includes a comprehensive test script that verifies:
- Health check endpoint
- User registration with wallet creation
- Profile retrieval
- DePIN node creation
- Bandwidth measurement
- Network statistics

## 🚨 Troubleshooting

### Backend Issues
1. **Port 3001 in use**: Change `API_PORT` in `.env` file
2. **Database errors**: Delete `depin.db` file to reset database
3. **Hedera connection issues**: System falls back to simulated wallets

### Frontend Issues
1. **API connection errors**: Ensure backend is running on port 3001
2. **CORS errors**: Check `CORS_ORIGIN` in backend `.env` file
3. **Authentication errors**: Clear localStorage and re-register

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
API_PORT=3001
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-jwt-secret-key-change-in-production
HEDERA_ENCRYPTION_KEY=your-encryption-key-for-wallets-change-in-production
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.123456
HEDERA_OPERATOR_KEY=your_operator_private_key_here
```

### Frontend
- `VITE_PRIVY_APP_ID` - Privy authentication app ID (for Web3 auth)

## 🎯 Next Steps

1. **Configure Hedera Credentials**: Add real Hedera operator credentials for testnet
2. **Deploy to Production**: Set up production environment variables
3. **Add More Features**: Implement HBAR transfers, transaction history
4. **Enhanced UI**: Add more dashboard features and charts
5. **Mobile App**: Create React Native mobile application

## 📞 Support

If you encounter any issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Run the test script to verify functionality

---

**🎉 Your AIDEN DePIN system is now ready to use!**


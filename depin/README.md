# Aiden DePIN Backend

A comprehensive DePIN (Decentralized Physical Infrastructure Network) backend system with Proof-of-Bandwidth protocol, SQLite user storage, and embedded Hedera wallet functionality.

## Features

- 🔐 **User Authentication** - JWT-based auth with bcrypt password hashing
- 💰 **Embedded Hedera Wallets** - Automatic wallet creation for each user
- 📊 **Proof-of-Bandwidth Protocol** - Real-time bandwidth measurement and cryptographic proofs
- 🗄️ **SQLite Database** - Lightweight, embedded database for user and node data
- 🔗 **Hedera Integration** - Usage proof submission to Hedera network
- 🛡️ **Security** - Rate limiting, CORS, helmet security headers
- 📈 **Real-time Monitoring** - Live bandwidth metrics and network statistics

## Quick Start

### 1. Install Dependencies
```bash
cd depin
npm install
```

### 2. Set Up Environment
Copy the example environment file and configure it:
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
# Hedera Configuration
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.123456
HEDERA_OPERATOR_KEY=your_operator_private_key
HEDERA_ENCRYPTION_KEY=your-encryption-key

# JWT Configuration
JWT_SECRET=your-jwt-secret

# API Configuration
API_PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### 3. Start the Server
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user with embedded Hedera wallet
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile and wallet balance

### DePIN Operations
- `POST /api/depin/nodes` - Create new DePIN node
- `GET /api/depin/nodes` - Get user's DePIN nodes
- `PATCH /api/depin/nodes/:nodeId/toggle` - Toggle node status
- `POST /api/depin/nodes/:nodeId/measure` - Measure bandwidth for node
- `GET /api/depin/proofs` - Get usage proofs
- `GET /api/depin/stats` - Get network statistics
- `POST /api/depin/connect` - Connect to DePIN network

### Health Check
- `GET /health` - API health status

## Database Schema

### Users Table
- `id` - Primary key
- `email` - User email (unique)
- `password_hash` - Bcrypt hashed password
- `hedera_account_id` - Hedera account ID
- `hedera_private_key_encrypted` - Encrypted private key
- `hedera_public_key` - Public key
- `created_at` - Account creation timestamp
- `is_active` - Account status

### DePIN Nodes Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `node_id` - Unique node identifier
- `name` - Node name
- `location` - Node location
- `is_active` - Node status
- `total_bytes_served` - Total data served
- `total_uptime` - Total uptime percentage
- `last_activity` - Last activity timestamp

### Usage Proofs Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `node_id` - Node identifier
- `session_id` - Unique session ID
- `timestamp` - Proof timestamp
- `bytes_served` - Bytes served in this session
- `uptime` - Uptime percentage
- `cryptographic_proof` - SHA-256 proof hash
- `hedera_transaction_id` - Hedera transaction ID

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   DePIN API      │    │   Hedera        │
│   (React)       │◄──►│   Server         │◄──►│   Network       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   SQLite         │
                       │   Database       │
                       └──────────────────┘
```

## Development

### Project Structure
```
depin/
├── app.ts                 # Express app setup
├── index.ts              # Core DePIN system
├── database/
│   └── manager.ts        # SQLite database manager
├── wallet/
│   └── hedera-wallet.ts  # Hedera wallet management
├── services/
│   ├── user-service.ts   # User management
│   └── depin-service.ts  # DePIN operations
├── routes/
│   ├── auth.ts          # Authentication routes
│   └── depin.ts         # DePIN API routes
├── middleware/
│   ├── auth.ts          # JWT authentication
│   ├── cors.ts          # CORS configuration
│   └── rate-limit.ts    # Rate limiting
└── scripts/
    └── start.js         # Startup script
```

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt with salt rounds
- **Rate Limiting** - Prevents abuse and DDoS attacks
- **CORS Protection** - Configurable cross-origin resource sharing
- **Helmet Security** - Security headers for Express
- **Input Validation** - Request validation and sanitization
- **Encrypted Storage** - Private keys encrypted in database

## Hedera Integration

- **Automatic Wallet Creation** - Each user gets a Hedera account
- **Encrypted Key Storage** - Private keys encrypted with AES-256-GCM
- **Usage Proof Submission** - Automatic submission to Hedera network
- **Balance Tracking** - Real-time wallet balance monitoring
- **Transaction History** - Complete transaction logging

## Monitoring

- **Health Checks** - API health monitoring
- **Error Logging** - Comprehensive error tracking
- **Performance Metrics** - Request timing and throughput
- **Database Monitoring** - Query performance tracking

## Production Deployment

1. **Environment Setup**
   - Configure production environment variables
   - Set up Hedera mainnet credentials
   - Configure secure JWT secrets

2. **Database Setup**
   - Ensure SQLite database is properly configured
   - Set up database backups
   - Configure database permissions

3. **Security Configuration**
   - Enable HTTPS
   - Configure firewall rules
   - Set up monitoring and alerting

4. **Deployment**
   ```bash
   npm run build
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.



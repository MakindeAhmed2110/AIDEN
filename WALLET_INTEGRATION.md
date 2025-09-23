# Wallet Integration with Privy Authentication

This document explains how the automatic wallet generation and display system works with Privy email authentication.

## Overview

The system automatically creates a Hedera wallet for each user when they sign in with Privy email authentication. All private keys are securely stored on the backend server and never exposed to the frontend.

## Architecture

### Backend (depin/)
- **User Service** (`services/user-service.ts`): Handles user creation and wallet management
- **Auth Routes** (`routes/auth.ts`): Provides API endpoints for authentication and wallet data
- **Hedera Wallet Manager** (`wallet/hedera-wallet.ts`): Manages Hedera account creation and transactions
- **Database**: Stores encrypted private keys and user information

### Frontend (frontend/)
- **API Service** (`services/api.ts`): Handles communication with backend
- **Wallet Component** (`routes/dashboard.wallets.tsx`): Displays wallet information
- **Privy Integration**: Uses Privy for email authentication

## Security Features

1. **Private Key Security**: Private keys are encrypted and stored only on the backend
2. **Server-Side Signing**: All transactions are signed on the server
3. **No Frontend Exposure**: Private keys are never sent to the frontend
4. **Encrypted Storage**: Private keys are encrypted using AES-256-GCM

## API Endpoints

### Authentication
- `POST /api/auth/privy-auth` - Authenticate with Privy credentials
- `GET /api/auth/profile` - Get user profile information
- `GET /api/auth/wallet` - Get wallet information

### Request/Response Examples

#### Privy Authentication
```json
POST /api/auth/privy-auth
{
  "email": "user@example.com",
  "privyId": "privy_user_id"
}

Response:
{
  "success": true,
  "message": "Privy authentication successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "hederaAccountId": "0.0.123456",
      "hederaPublicKey": "302a300506032b6570032100...",
      "privyId": "privy_user_id",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

#### Wallet Information
```json
GET /api/auth/wallet
Authorization: Bearer jwt_token_here

Response:
{
  "success": true,
  "data": {
    "wallet": {
      "accountId": "0.0.123456",
      "publicKey": "302a300506032b6570032100...",
      "balance": 1000000000,
      "balanceInHbar": 10.0
    }
  }
}
```

## Database Schema

The `users` table has been updated to support Privy authentication:

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,  -- Optional for Privy users
  privy_id TEXT UNIQUE,  -- Privy user ID
  hedera_account_id TEXT,
  hedera_private_key_encrypted TEXT,
  hedera_public_key TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1
);
```

## Frontend Integration

### Environment Variables
Create a `.env.local` file in the frontend directory:
```
VITE_API_BASE_URL=http://localhost:3001/api
VITE_PRIVY_APP_ID=your_privy_app_id_here
```

### Usage Flow

1. User signs in with Privy email authentication
2. Frontend calls `/api/auth/privy-auth` with email and Privy ID
3. Backend creates or retrieves user and wallet information
4. Frontend displays wallet information using the wallet component
5. All subsequent API calls use the JWT token for authentication

## Features

### Wallet Display
- **Balance**: Shows HBAR balance in both HBAR and tinybars
- **Account Information**: Displays Hedera account ID and public key
- **Copy Functionality**: Users can copy account ID and public key
- **Refresh**: Real-time balance updates
- **Security Notice**: Informs users about security measures

### User Information
- **Email**: User's email address from Privy
- **Privy ID**: Unique Privy identifier
- **Account Creation Date**: When the account was created
- **Wallet Status**: Shows if the wallet is active

## Security Considerations

1. **Private Key Protection**: Private keys are encrypted using AES-256-GCM
2. **Server-Only Access**: Private keys are never exposed to the frontend
3. **Secure Storage**: Encrypted keys are stored in the database
4. **Transaction Signing**: All transactions are signed server-side
5. **JWT Authentication**: Secure token-based authentication

## Testing

To test the integration:

1. Start the backend server: `cd depin && npm start`
2. Start the frontend: `cd frontend && npm run dev`
3. Navigate to the application and sign in with Privy
4. Go to the Wallets page to see the generated wallet

## Error Handling

The system includes comprehensive error handling:
- Network errors are caught and displayed to users
- Authentication failures are handled gracefully
- Wallet creation failures fall back to simulated wallets for development
- All errors are logged on the backend for debugging


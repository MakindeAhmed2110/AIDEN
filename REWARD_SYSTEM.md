# 🤖 Automated Reward Distribution System

## Overview

The Automated Reward Distribution System is a comprehensive solution that automatically distributes HBAR rewards to users based on their bandwidth contributions every 24 hours. The system implements a 70/30 split where 70% goes to users and 30% goes to charity through the CharityVault contract.

## 🏗️ Architecture

### Core Components

1. **RewardDistributionAgent** (`depin/services/reward-agent.ts`)
   - Main orchestrator for automated reward distribution
   - Runs on a 24-hour cron schedule (midnight UTC)
   - Calculates rewards based on points (1MB = 0.001 HBAR)
   - Handles the 70/30 split automatically

2. **ContractService** (`depin/services/contract-service.ts`)
   - Interfaces with Hedera smart contracts
   - Handles contract interactions using the Hedera SDK
   - Manages batch reward distributions
   - Provides contract statistics and user reward information

3. **Reward Routes** (`depin/routes/rewards.ts`)
   - REST API endpoints for reward management
   - Admin controls for starting/stopping the agent
   - Statistics and leaderboard endpoints
   - Manual distribution triggers

## 💰 Reward Calculation

### Points System
- **1 MB of bandwidth served = 1 point**
- **1 point = 0.001 HBAR**
- Points are calculated in real-time as users contribute bandwidth
- Daily points are reset after each distribution

### Distribution Split
- **70% to Users**: Direct HBAR transfer to user wallets
- **30% to Charity**: Automatic transfer to CharityVault contract
- Charity funds are distributed to registered NGOs based on their percentages

## 🔄 Daily Distribution Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Midnight      │───▶│  Data Collection │───▶│   Calculation   │
│   Cron Trigger  │    │  (Users + Points)│    │ (Points → HBAR) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Reset Points  │◀───│   Logging &      │◀───│   Distribution  │
│   (Today = 0)   │    │   Statistics     │    │ (70% Users,     │
└─────────────────┘    └──────────────────┘    │  30% Charity)   │
                                               └─────────────────┘
                                                         │
                                               ┌─────────────────┐
                                               │   Funding       │
                                               │ (Centralized →  │
                                               │  Contract)      │
                                               └─────────────────┘
```

1. **Midnight Trigger**: Cron job triggers at 00:00 UTC daily
2. **Data Collection**: System gathers all users with today's points
3. **Calculation**: Converts points to HBAR amounts (1MB = 0.001 HBAR)
4. **Funding**: Transfers total HBAR from centralized wallet to RewardDistributor contract
5. **Distribution**: Smart contract automatically splits and distributes:
   - 70% to user wallets
   - 30% to CharityVault
6. **Reset**: Today's points are reset to 0 for all users
7. **Logging**: Complete transaction logs and statistics

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Hedera testnet access
- Deployed RewardDistributor and CharityVault contracts

### Environment Configuration

Add to your `env.local` file:

```env
# Reward Distribution Agent Configuration
REWARD_AGENT_ENABLED=true
CENTRALIZED_WALLET_ADDRESS=0.0.6853766
CENTRALIZED_WALLET_PRIVATE_KEY=0x6d12c47bfca09fc73696f34e5e0294453c12e6d5de29ea628af1daea941a8c9e

# Smart Contract Addresses
REWARD_DISTRIBUTOR_CONTRACT=0x6e35a1a39F37c92106f91a500df1A0A77a10CdfA
CHARITY_VAULT_CONTRACT=0x8Aa718d2cE41C595298C97bA4a330C0f35028B12
```

### Starting the Agent

The reward agent starts automatically when the backend server starts:

```bash
cd depin
npm run dev
```

You'll see:
```
🤖 Starting automated reward distribution agent...
✅ Reward distribution agent started successfully
```

## 📊 API Endpoints

### Reward Statistics
```http
GET /api/rewards/stats
```
Returns current reward distribution statistics.

### Manual Distribution
```http
POST /api/rewards/distribute
```
Manually triggers reward distribution (for testing).

### Agent Control
```http
POST /api/rewards/agent/start
POST /api/rewards/agent/stop
```
Start or stop the automated agent.

### User Rewards
```http
GET /api/rewards/user/:userId
```
Get specific user's reward information.

### Leaderboard
```http
GET /api/rewards/leaderboard?limit=10
```
Get top users by total points.

## 🧪 Testing

### Test Script
Run the test script to verify the system:

```bash
cd depin
node test-reward-agent.js
```

### Manual Testing
1. Create some test users with points
2. Trigger manual distribution: `POST /api/rewards/distribute`
3. Check the results in the response

## 🔧 Smart Contract Integration

### Required ABI Functions

The system uses these RewardDistributor contract functions:

- `registerUser(address _user, string _userId)`
- `batchDistributeRewards(address[] _users, uint256[] _amounts, string _activityType)`
- `depositHBAR()` (payable)
- `getUserRewardInfo(address _user)`
- `getContractStats()`

### Contract Deployment

Ensure your contracts are deployed with the correct addresses:
- **RewardDistributor**: `0x6e35a1a39F37c92106f91a500df1A0A77a10CdfA`
- **CharityVault**: `0x8Aa718d2cE41C595298C97bA4a330C0f35028B12`

## 📈 Monitoring & Logging

### Console Output
The system provides detailed logging:
```
🎯 Starting daily reward distribution...
👥 Found 15 users with points to distribute
💰 Reward calculation:
  Total Points: 1250
  Total HBAR: 1.250000
  User Rewards (70%): 0.875000 HBAR
  Charity Rewards (30%): 0.375000 HBAR
✅ Daily reward distribution completed successfully
```

### Database Tracking
All reward distributions are tracked in the database:
- User points history
- Distribution timestamps
- Transaction IDs
- Reward amounts

## 🛡️ Security Features

### Authorization
- Only authorized distributors can trigger distributions
- Admin endpoints require proper authentication
- Private keys are encrypted in the database

### Validation
- Balance checks before distribution
- Point validation
- Contract interaction error handling
- Rollback mechanisms for failed transactions

## 🔄 Maintenance

### Daily Operations
- Monitor distribution logs
- Check contract balances
- Verify user rewards
- Update charity allocations if needed

### Weekly Tasks
- Review reward statistics
- Optimize gas usage
- Update contract parameters
- Backup reward data

## 🚨 Troubleshooting

### Common Issues

1. **Insufficient Balance**
   ```
   Error: Insufficient balance in centralized wallet
   ```
   **Solution**: Fund the centralized wallet with HBAR

2. **Contract Not Deployed**
   ```
   Error: Contract not found
   ```
   **Solution**: Deploy contracts and update addresses in env.local

3. **No Users with Points**
   ```
   No users with points found for today
   ```
   **Solution**: This is normal if no users contributed bandwidth today

### Debug Mode
Enable detailed logging by setting:
```env
DEPIN_LOG_LEVEL=debug
```

## 📋 Configuration Options

### Cron Schedule
Default: `0 0 * * *` (midnight UTC)
Modify in `reward-agent.ts`:
```typescript
cron.schedule('0 0 * * *', async () => {
  // Distribution logic
}, { timezone: 'UTC' });
```

### Reward Rates
Modify the calculation in `reward-agent.ts`:
```typescript
private calculateHBARFromPoints(points: number): number {
  return points * 0.001; // 1MB = 0.001 HBAR
}
```

### Distribution Split
The 70/30 split is handled by the smart contract. To modify, update the contract's `charityPercentage` variable.

## 🎯 Future Enhancements

- [ ] Multi-token support
- [ ] Dynamic reward rates
- [ ] Staking mechanisms
- [ ] Governance voting
- [ ] Advanced analytics dashboard
- [ ] Mobile notifications
- [ ] Integration with external DeFi protocols

## 📞 Support

For issues or questions:
1. Check the logs for error messages
2. Verify environment configuration
3. Test with the provided test script
4. Review smart contract deployment

---

**Note**: This system is designed for Hedera testnet. For mainnet deployment, ensure proper security audits and testing.

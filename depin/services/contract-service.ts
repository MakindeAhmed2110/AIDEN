import { 
  Client, 
  PrivateKey, 
  AccountId, 
  ContractCallQuery,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
  TransactionReceipt,
  ContractId,
  ContractInfoQuery,
  TransferTransaction
} from '@hashgraph/sdk';
import rewardDistributorABI from '../contracts/RewardDistributor.json';
import charityVaultABI from '../contracts/CharityVault.json';

export interface ContractConfig {
  rewardDistributorAddress: string;
  charityVaultAddress: string;
  operatorId: string;
  operatorKey: string;
}

export class ContractService {
  private client: Client;
  private config: ContractConfig;
  private rewardDistributorABI: any;
  private charityVaultABI: any;

  constructor() {
    this.config = {
      rewardDistributorAddress: process.env.REWARD_DISTRIBUTOR_CONTRACT || '0.0.6858707',
      charityVaultAddress: process.env.CHARITY_VAULT_CONTRACT || '0.0.6858706',
      operatorId: process.env.HEDERA_OPERATOR_ID || '0.0.6853766',
      operatorKey: process.env.HEDERA_OPERATOR_KEY || '0x6d12c47bfca09fc73696f34e5e0294453c12e6d5de29ea628af1daea941a8c9e'
    };

    // Load ABIs
    this.rewardDistributorABI = rewardDistributorABI;
    this.charityVaultABI = charityVaultABI;

    // Initialize Hedera client
    this.client = Client.forTestnet();
    
    // Set operator credentials - always try to set them
    try {
      const privateKey = PrivateKey.fromStringECDSA(this.config.operatorKey.substring(2));
      this.client.setOperator(AccountId.fromString(this.config.operatorId), privateKey);
      console.log('🔗 Contract service initialized with operator credentials');
      console.log(`  RewardDistributor: ${this.config.rewardDistributorAddress}`);
      console.log(`  CharityVault: ${this.config.charityVaultAddress}`);
    } catch (error) {
      console.warn('⚠️ Could not set operator credentials for contract service:', error);
      // Create a new client instance for fallback
      this.client = Client.forTestnet();
    }
  }

  /**
   * Ensure client is properly configured
   */
  private ensureClientConfigured(): void {
    try {
      // Check if client has operator set by trying to get operator info
      const operatorAccountId = this.client.operatorAccountId;
      if (!operatorAccountId) {
        throw new Error('No operator set');
      }
      console.log(`🔧 Client configured with operator: ${operatorAccountId.toString()}`);
    } catch (error) {
      // If no operator is set, configure it
      try {
        const privateKey = PrivateKey.fromStringECDSA(this.config.operatorKey.substring(2));
        this.client.setOperator(AccountId.fromString(this.config.operatorId), privateKey);
        console.log('🔧 Client configured with operator credentials');
      } catch (configError) {
        console.error('❌ Failed to configure client:', configError);
        throw new Error('Client not properly configured for contract interactions');
      }
    }
  }

  /**
   * Register a user in the RewardDistributor contract
   */
  async registerUser(userAddress: string, userId: string): Promise<string> {
    try {
      this.ensureClientConfigured();
      console.log(`📝 Registering user ${userId} with address ${userAddress} in contract...`);

      const contractId = ContractId.fromString(this.config.rewardDistributorAddress);
      
      // Convert Hedera address to Ethereum-style format for the contract
      let contractAddress = userAddress;
      if (userAddress.includes('.')) {
        const parts = userAddress.split('.');
        const shard = (parts[0] || '').padStart(6, '0');
        const realm = (parts[1] || '').padStart(6, '0');
        const account = (parts[2] || '').padStart(6, '0');
        const hexString = (shard + realm + account).padStart(40, '0');
        contractAddress = '0x' + hexString;
      }
      
      const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction(
          'registerUser',
          new ContractFunctionParameters()
            .addAddress(contractAddress)
            .addString(userId)
        );

      // CRITICAL: Freeze the transaction with the client
      const frozenTransaction = await transaction.freezeWith(this.client);
      const response = await frozenTransaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      
      const transactionId = response.transactionId.toString();
      console.log(`✅ User registered successfully. Transaction: ${transactionId}`);
      
      return transactionId;
    } catch (error) {
      console.error('Error registering user in contract:', error);
      throw new Error(`Failed to register user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Distribute rewards to a single user
   */
  async distributeReward(
    userAddress: string, 
    activityType: string, 
    customAmount: number
  ): Promise<string> {
    try {
      console.log(`💰 Distributing reward to ${userAddress}: ${customAmount} tinybars for ${activityType}`);

      const contractId = ContractId.fromString(this.config.rewardDistributorAddress);
      
      // Convert Hedera address to Ethereum-style format for the contract
      let contractAddress = userAddress;
      if (userAddress.includes('.')) {
        const parts = userAddress.split('.');
        const shard = (parts[0] || '').padStart(6, '0');
        const realm = (parts[1] || '').padStart(6, '0');
        const account = (parts[2] || '').padStart(6, '0');
        const hexString = (shard + realm + account).padStart(40, '0');
        contractAddress = '0x' + hexString;
      }
      
      const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(200000)
        .setFunction(
          'distributeReward',
          new ContractFunctionParameters()
            .addAddress(contractAddress)
            .addString(activityType)
            .addUint256(customAmount)
        );

      // CRITICAL: Freeze the transaction with the client
      const frozenTransaction = await transaction.freezeWith(this.client);
      const response = await frozenTransaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      
      const transactionId = response.transactionId.toString();
      console.log(`✅ Reward distributed successfully. Transaction: ${transactionId}`);
      
      return transactionId;
    } catch (error) {
      console.error('Error distributing reward:', error);
      throw new Error(`Failed to distribute reward: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Batch distribute rewards to multiple users
   */
  async batchDistributeRewards(
    userAddresses: string[],
    amounts: number[],
    activityType: string
  ): Promise<string> {
    try {
      this.ensureClientConfigured();
      console.log(`📦 Batch distributing rewards to ${userAddresses.length} users for ${activityType}`);

      const contractId = ContractId.fromString(this.config.rewardDistributorAddress);
      
      // Convert Hedera addresses to Ethereum-style format for the contract
      const contractUserAddresses = userAddresses.map(addr => {
        // If it's Hedera format (0.0.123456), convert to Ethereum-style
        if (addr.includes('.')) {
          // Convert Hedera address to Ethereum-style by padding and formatting
          const parts = addr.split('.');
          const shard = (parts[0] || '').padStart(6, '0');
          const realm = (parts[1] || '').padStart(6, '0');
          const account = (parts[2] || '').padStart(6, '0');
          // Create a 40-character hex string (without 0x prefix)
          const hexString = (shard + realm + account).padStart(40, '0');
          return '0x' + hexString;
        }
        // If it's already Ethereum format, use as is
        return addr;
      });
      
      const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(500000) // Higher gas limit for batch operations
        .setFunction(
          'batchDistributeRewards',
          new ContractFunctionParameters()
            .addAddressArray(contractUserAddresses)
            .addUint256Array(amounts)
            .addString(activityType)
        );

      // CRITICAL: Freeze the transaction with the client
      const frozenTransaction = await transaction.freezeWith(this.client);
      const response = await frozenTransaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      
      const transactionId = response.transactionId.toString();
      console.log(`✅ Batch rewards distributed successfully. Transaction: ${transactionId}`);
      
      return transactionId;
    } catch (error) {
      console.error('Error batch distributing rewards:', error);
      throw new Error(`Failed to batch distribute rewards: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deposit HBAR to the RewardDistributor contract using CryptoTransfer
   */
  async depositHBAR(amount: number): Promise<string> {
    try {
      this.ensureClientConfigured();
      console.log(`💸 Depositing ${amount} tinybars to RewardDistributor contract...`);

      const contractId = ContractId.fromString(this.config.rewardDistributorAddress);
      const amountHbar = Hbar.fromTinybars(amount);
      
      // Use TransferTransaction for direct HBAR transfer
      const transaction = new TransferTransaction()
        .addHbarTransfer(AccountId.fromString(this.config.operatorId), amountHbar.negated())
        .addHbarTransfer(AccountId.fromString(this.config.rewardDistributorAddress), amountHbar)
        .setTransactionMemo('Reward Distribution Funding');

      // CRITICAL: Freeze the transaction with the client
      const frozenTransaction = await transaction.freezeWith(this.client);
      const response = await frozenTransaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      
      const transactionId = response.transactionId.toString();
      console.log(`✅ HBAR deposited successfully. Transaction: ${transactionId}`);
      
      return transactionId;
    } catch (error) {
      console.error('Error depositing HBAR to contract:', error);
      throw new Error(`Failed to deposit HBAR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user reward information from contract
   */
  async getUserRewardInfo(userAddress: string): Promise<{
    totalEarned: number;
    totalClaimed: number;
    pendingRewards: number;
    totalCharityContributed: number;
    isRegistered: boolean;
  }> {
    try {
      this.ensureClientConfigured();
      const contractId = ContractId.fromString(this.config.rewardDistributorAddress);
      
      const query = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction(
          'getUserRewardInfo',
          new ContractFunctionParameters().addAddress(userAddress)
        )
        .setQueryPayment(new Hbar(1)); // Add query payment

      const response = await query.execute(this.client);
      const results = response.getUint256(0);
      
      return {
        totalEarned: results.toNumber(),
        totalClaimed: 0, // Will be updated when we get the correct response format
        pendingRewards: 0, // Will be updated when we get the correct response format
        totalCharityContributed: 0, // Will be updated when we get the correct response format
        isRegistered: true // Will be updated when we get the correct response format
      };
    } catch (error) {
      console.error('Error getting user reward info from contract:', error);
      throw new Error(`Failed to get user reward info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get contract statistics
   */
  async getContractStats(): Promise<{
    totalDistributed: number;
    totalCharityDonated: number;
    charityPercentage: number;
    contractBalance: number;
  }> {
    try {
      this.ensureClientConfigured();
      const contractId = ContractId.fromString(this.config.rewardDistributorAddress);
      
      // First, get basic contract info to verify it exists
      const contractInfo = new ContractInfoQuery()
        .setContractId(contractId);
      
      const info = await contractInfo.execute(this.client);
      console.log(`📋 Contract info retrieved: ${info.contractId}`);
      
      // Then get contract stats using contract call
      const query = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction('getContractStats')
        .setQueryPayment(new Hbar(1));

      const response = await query.execute(this.client);
      const results = response.getUint256(0);
      
      return {
        totalDistributed: results.toNumber(),
        totalCharityDonated: 0, // Will be updated when we get the correct response format
        charityPercentage: 30, // Default 30%
        contractBalance: 0 // Will be updated when we get the correct response format
      };
    } catch (error) {
      console.error('Error getting contract stats:', error);
      throw new Error(`Failed to get contract stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Set authorized distributor (only owner)
   */
  async setAuthorizedDistributor(distributorAddress: string, authorized: boolean): Promise<string> {
    try {
      console.log(`🔐 Setting authorized distributor ${distributorAddress}: ${authorized}`);

      const contractId = ContractId.fromString(this.config.rewardDistributorAddress);
      
      const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction(
          'setAuthorizedDistributor',
          new ContractFunctionParameters()
            .addAddress(distributorAddress)
            .addBool(authorized)
        );

      // CRITICAL: Freeze the transaction with the client
      const frozenTransaction = await transaction.freezeWith(this.client);
      const response = await frozenTransaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      
      const transactionId = response.transactionId.toString();
      console.log(`✅ Authorized distributor set successfully. Transaction: ${transactionId}`);
      
      return transactionId;
    } catch (error) {
      console.error('Error setting authorized distributor:', error);
      throw new Error(`Failed to set authorized distributor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get contract balance
   */
  async getContractBalance(): Promise<number> {
    try {
      const contractId = ContractId.fromString(this.config.rewardDistributorAddress);
      
      const query = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction('getContractBalance');

      const response = await query.execute(this.client);
      const balance = response.getUint256(0);
      
      return balance.toNumber();
    } catch (error) {
      console.error('Error getting contract balance:', error);
      throw new Error(`Failed to get contract balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const contractService = new ContractService();

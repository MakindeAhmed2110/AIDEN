// API service for connecting to the backend
const API_BASE_URL = 'http://localhost:3001/api';

export interface UserInfo {
  id: number;
  email: string;
  hederaAccountId: string;
  hederaPublicKey: string;
  privyId?: string;
  createdAt: string;
}

export interface WalletInfo {
  accountId: string;
  publicKey: string;
  balance: number;
  balanceInHbar: number;
}

export interface PrivyAuthData {
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

class ApiService {
  private baseUrl: string;
  private healthCheckCache: { result: boolean; timestamp: number } | null = null;
  private readonly HEALTH_CHECK_CACHE_DURATION = 30000; // 30 seconds

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Authenticate with email only
  async authenticateWithPrivy(authData: PrivyAuthData): Promise<ApiResponse<{ user: UserInfo; token: string }>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${this.baseUrl}/auth/privy-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Email authentication error:', error);
      return {
        success: false,
        message: 'Failed to authenticate with backend'
      };
    }
  }

  // Get user profile
  async getUserProfile(token: string): Promise<ApiResponse<{ user: UserInfo; walletBalance: number }>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        message: 'Failed to get user profile'
      };
    }
  }

  // Get wallet information
  async getWalletInfo(token: string): Promise<ApiResponse<{ wallet: WalletInfo }>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/wallet`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get wallet error:', error);
      return {
        success: false,
        message: 'Failed to get wallet information'
      };
    }
  }

  // Check if backend is available (with caching)
  async checkHealth(): Promise<boolean> {
    // Check cache first
    if (this.healthCheckCache) {
      const now = Date.now();
      if (now - this.healthCheckCache.timestamp < this.HEALTH_CHECK_CACHE_DURATION) {
        return this.healthCheckCache.result;
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('http://localhost:3001/health', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      
      // Handle rate limiting
      if (data.message && data.message.includes('Too many requests')) {
        console.warn('Rate limited by backend, using cached result or assuming backend is available');
        // If we get rate limited, assume backend is available since it responded
        this.healthCheckCache = {
          result: true,
          timestamp: Date.now()
        };
        return true;
      }
      
      const result = data.success === true;
      
      // Cache the result
      this.healthCheckCache = {
        result,
        timestamp: Date.now()
      };
      
      return result;
    } catch (error) {
      console.error('Health check failed:', error);
      
      // Cache the failure result too
      this.healthCheckCache = {
        result: false,
        timestamp: Date.now()
      };
      
      return false;
    }
  }

  // Clear health check cache (useful for manual refresh)
  clearHealthCheckCache(): void {
    this.healthCheckCache = null;
  }
}

export const apiService = new ApiService();
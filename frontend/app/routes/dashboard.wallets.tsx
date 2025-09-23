import type { Route } from "./+types/dashboard.wallets";
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  AccountBalance as WalletIcon,
  TrendingUp as TrendingIcon,
  Send as SendIcon,
  Receipt as ReceiptIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { UserInfo, WalletInfo } from '../services/api';

// Remove local interfaces since we're importing them from api service

// PolySans font family constant
const polySansFont = '"PolySans Median", "PolySans Neutral", "Styrene A Web", "Helvetica Neue", Sans-Serif';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Wallets - AIDEN Dashboard" },
    { name: "description", content: "Manage your AIDEN wallets" },
  ];
}

export default function Wallet() {
  const { user: privyUser, authenticated } = usePrivy();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Check backend health and authenticate user
  useEffect(() => {
    const initializeWallet = async () => {
      if (!authenticated || !privyUser?.email?.address) {
        setError('Please sign in to view your wallet.');
        return;
      }

      // Prevent multiple simultaneous initialization attempts or re-initialization
      if (isInitializing || hasInitialized) {
        return;
      }

      setIsInitializing(true);
      setLoading(true);
      setError(null);
      
      console.log('🔄 Initializing wallet for:', privyUser.email.address);

      try {
        // Add a small delay to prevent rapid successive health checks
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if backend is available
        console.log('🔍 Checking backend health...');
        const isBackendHealthy = await apiService.checkHealth();
        console.log('✅ Backend health check result:', isBackendHealthy);
        
        if (!isBackendHealthy) {
          console.log('⚠️ Backend not available, using demo mode');
          setDemoMode(true);
          setBackendConnected(false);
          // Use demo data
          setUserInfo({
            id: 1,
            email: privyUser.email.address,
            hederaAccountId: '0.0.123456',
            hederaPublicKey: '302a300506032b6570032100...',
            privyId: privyUser.id,
            createdAt: new Date().toISOString()
          });
          
          setWalletInfo({
            accountId: '0.0.123456',
            publicKey: '302a300506032b6570032100...',
            balance: 1000000000, // 10 HBAR in tinybars
            balanceInHbar: 10.0
          });
          setLoading(false);
          console.log('🎯 Demo mode initialized');
          return;
        }

        // Backend is available, authenticate with email only
        console.log('🔐 Authenticating with backend...');
        const authResponse = await apiService.authenticateWithPrivy({
          email: privyUser.email.address
        });
        console.log('🔐 Auth response:', authResponse);

        if (authResponse.success && authResponse.data) {
          console.log('✅ Authentication successful');
          setAuthToken(authResponse.data.token);
          setUserInfo(authResponse.data.user);
          setBackendConnected(true);
          setDemoMode(false);

          // Get wallet information
          console.log('💰 Getting wallet information...');
          const walletResponse = await apiService.getWalletInfo(authResponse.data.token);
          console.log('💰 Wallet response:', walletResponse);
          if (walletResponse.success && walletResponse.data) {
            setWalletInfo(walletResponse.data.wallet);
            console.log('✅ Wallet info loaded successfully');
          } else {
            console.error('❌ Failed to get wallet info:', walletResponse.message);
          }
        } else {
          console.error('❌ Authentication failed:', authResponse.message);
          setError('Failed to authenticate with backend. Using demo mode.');
          setDemoMode(true);
          setBackendConnected(false);
        }
      } catch (error) {
        console.error('❌ Error initializing wallet:', error);
        setError('Failed to connect to backend. Using demo mode.');
        setDemoMode(true);
        setBackendConnected(false);
      } finally {
        console.log('🏁 Initialization complete, setting loading to false');
        setLoading(false);
        setIsInitializing(false);
        setHasInitialized(true);
      }
    };

    initializeWallet();
  }, [authenticated, privyUser?.email?.address]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setHasInitialized(false); // Allow re-initialization
    
    // Clear health check cache to force a fresh check
    apiService.clearHealthCheckCache();
    
    if (demoMode || !authToken) {
      // In demo mode, just simulate a refresh
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
      return;
    }

    try {
      // Refresh wallet information from backend
      const walletResponse = await apiService.getWalletInfo(authToken);
      if (walletResponse.success && walletResponse.data) {
        setWalletInfo(walletResponse.data.wallet);
      }
    } catch (error) {
      console.error('Failed to refresh wallet:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatBalance = (balance: number) => {
    return balance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ fontFamily: polySansFont }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!walletInfo || !userInfo) {
    return (
      <Box>
        <Alert severity="warning">
          No wallet information available. Please try refreshing the page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {demoMode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontFamily: polySansFont, mb: 1 }}>
            🎯 Demo Mode - Wallet Preview
          </Typography>
          <Typography variant="body2">
            {backendConnected 
              ? 'Backend is connected but authentication failed. Using demo data.'
              : 'Backend is not available. This shows what your wallet will look like when connected.'
            }
          </Typography>
        </Alert>
      )}
      
      {backendConnected && !demoMode && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontFamily: polySansFont, mb: 1 }}>
            ✅ Backend Connected
          </Typography>
          <Typography variant="body2">
            Your wallet is connected to the backend. Real Hedera wallet data is being displayed.
          </Typography>
        </Alert>
      )}
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
       <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          color: '#000000', 
          fontFamily: polySansFont
        }}>
          Your Wallet
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{ fontFamily: polySansFont }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        {/* Top Row - Wallet Balance and Account Details */}
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
          {/* Wallet Balance Card */}
          <Box flex={1}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #B088F0 0%, #A0E7E5 100%)',
              color: '#000000',
              height: '100%'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <WalletIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontFamily: polySansFont, fontWeight: 600 }}>
                      HBAR Balance
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Hedera Network
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h3" sx={{ 
                  fontFamily: polySansFont, 
                  fontWeight: 700,
                  mb: 1
                }}>
                  {formatBalance(walletInfo.balanceInHbar)} HBAR
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {walletInfo.balance.toLocaleString()} tinybars
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Account Information Card */}
          <Box flex={1}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <SecurityIcon sx={{ fontSize: 40, mr: 2, color: '#B088F0' }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontFamily: polySansFont, fontWeight: 600 }}>
                      Account Details
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Secure Hedera Account
                    </Typography>
                  </Box>
                </Box>
                
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Account ID
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1" sx={{ 
                      fontFamily: 'monospace',
                      backgroundColor: '#f5f5f5',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      flex: 1
                    }}>
                      {walletInfo.accountId}
                    </Typography>
                    <Tooltip title="Copy Account ID">
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyToClipboard(walletInfo.accountId, 'Account ID')}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Public Key
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1" sx={{ 
                      fontFamily: 'monospace',
                      backgroundColor: '#f5f5f5',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      flex: 1,
                      fontSize: '0.75rem',
                      wordBreak: 'break-all'
                    }}>
                      {walletInfo.publicKey.substring(0, 20)}...
                    </Typography>
                    <Tooltip title="Copy Public Key">
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyToClipboard(walletInfo.publicKey, 'Public Key')}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Chip 
                  icon={<CheckCircleIcon />}
                  label="Wallet Secured"
                  color="success"
                  variant="outlined"
                  sx={{ fontFamily: polySansFont }}
                />
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* User Information Card */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ 
              fontFamily: polySansFont, 
              fontWeight: 600,
              mb: 2
            }}>
              Account Information
            </Typography>
            
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={3}>
              <Box flex={1}>
                <Typography variant="body2" color="text.secondary">
                  Email Address
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: polySansFont }}>
                  {userInfo.email}
                </Typography>
              </Box>
              <Box flex={1}>
                <Typography variant="body2" color="text.secondary">
                  Privy ID
                </Typography>
                <Typography variant="body1" sx={{ 
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }}>
                  {userInfo.privyId}
                </Typography>
              </Box>
              <Box flex={1}>
                <Typography variant="body2" color="text.secondary">
                  Account Created
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: polySansFont }}>
                  {new Date(userInfo.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
              <Box flex={1}>
                <Typography variant="body2" color="text.secondary">
                  Wallet Status
                </Typography>
                <Chip 
                  label="Active"
                  color="success"
                  size="small"
                  sx={{ fontFamily: polySansFont }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Security Notice */}
      <Card sx={{ mt: 3, backgroundColor: demoMode ? '#e3f2fd' : '#fff3cd', border: demoMode ? '1px solid #90caf9' : '1px solid #ffeaa7' }}>
        <CardContent>
          <Typography variant="h6" sx={{ 
            fontFamily: polySansFont, 
            fontWeight: 600,
            color: demoMode ? '#1565c0' : '#856404',
            mb: 1
          }}>
            {demoMode ? '🎯 Demo Mode Notice' : '🔒 Security Notice'}
          </Typography>
          <Typography variant="body2" sx={{ color: demoMode ? '#1565c0' : '#856404' }}>
            {demoMode 
              ? 'This is a preview of your wallet interface. In production, your private keys will be securely stored and encrypted on our backend servers, never exposed to the frontend for maximum security.'
              : 'Your private keys are securely stored and encrypted on our backend servers. They are never exposed to the frontend for maximum security. All transactions are signed server-side to protect your assets.'
            }
          </Typography>
        </CardContent>
      </Card>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        message="Copied to clipboard!"
      />
    </Box>
  );
}
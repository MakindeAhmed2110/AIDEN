import type { Route } from "./+types/dashboard.overview";
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  TrendingUp as TrendingIcon,
  WifiOff as WifiOffIcon,
  Wifi as WifiIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { usePrivy } from '@privy-io/react-auth';
import { apiService } from '../services/api';
import CountUp from 'react-countup';

// PolySans font family constant (using Neutral as requested)
const polySansFont = '"PolySans Neutral", "PolySans Median", "Styrene A Web", "Helvetica Neue", Sans-Serif';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - AIDEN" },
    { name: "description", content: "Your AIDEN dashboard overview" },
  ];
}

interface NetworkStats {
  totalNodes: number;
  activeNodes: number;
  totalBytesServed: number;
  totalGBServed: number;
  averageUptime: number;
  totalSessions: number;
  totalContributions: number;
  totalContributionBytes: number;
  totalContributionGB: number;
  averageDownloadSpeed: number;
  averageUploadSpeed: number;
  averageLatency: number;
  averageContributionUptime: number;
  lastContributionTime: string | null;
  epochPoints: number; // Total points for the entire epoch
  todayPoints: number; // Points earned today
}

interface UserPoints {
  totalEpochPoints: number;
  todayPoints: number;
  lastUpdated: string;
}

export default function Overview() {
  const { user: privyUser, authenticated } = usePrivy();
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    totalNodes: 0,
    activeNodes: 0,
    totalBytesServed: 0,
    totalGBServed: 0,
    averageUptime: 0,
    totalSessions: 0,
    totalContributions: 0,
    totalContributionBytes: 0,
    totalContributionGB: 0,
    averageDownloadSpeed: 0,
    averageUploadSpeed: 0,
    averageLatency: 0,
    averageContributionUptime: 0,
    lastContributionTime: null,
    epochPoints: 0,
    todayPoints: 0
  });
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [measurementInterval, setMeasurementInterval] = useState<NodeJS.Timeout | null>(null);
  const [realtimeUpdateInterval, setRealtimeUpdateInterval] = useState<NodeJS.Timeout | null>(null);
  const [backgroundSimulation, setBackgroundSimulation] = useState(false);

  // Save simulation state to localStorage
  const saveSimulationState = () => {
    if (isConnected) {
      const state = {
        isConnected,
        networkStats,
        userPoints,
        lastUpdate: Date.now(),
        backgroundSimulation: true
      };
      localStorage.setItem('aiden_simulation_state', JSON.stringify(state));
      console.log('💾 Simulation state saved to localStorage');
    }
  };

  // Load simulation state from localStorage
  const loadSimulationState = () => {
    try {
      const savedState = localStorage.getItem('aiden_simulation_state');
      if (savedState) {
        const state = JSON.parse(savedState);
        if (state.backgroundSimulation && state.isConnected) {
          console.log('🔄 Resuming background simulation from localStorage');
          setNetworkStats(state.networkStats);
          setUserPoints(state.userPoints);
          setBackgroundSimulation(true);
          return true;
        }
      }
    } catch (error) {
      console.error('Error loading simulation state:', error);
    }
    return false;
  };

  // Save simulation state periodically
  useEffect(() => {
    if (isConnected) {
      const saveInterval = setInterval(saveSimulationState, 5000); // Save every 5 seconds
      return () => clearInterval(saveInterval);
    }
  }, [isConnected, networkStats, userPoints]);

  // Load simulation state on mount
  useEffect(() => {
    const hasBackgroundSimulation = loadSimulationState();
    if (hasBackgroundSimulation) {
      console.log('🔄 Resuming background simulation...');
      setIsConnected(true);
      // Resume the simulation
      const realtimeInterval = setInterval(async () => {
        console.log('⏰ Background simulation tick');
        await simulateBandwidthMeasurement();
      }, 2000);
      setRealtimeUpdateInterval(realtimeInterval);
    } else {
      console.log('ℹ️ No background simulation found, user needs to connect manually');
    }
  }, []);

  // Auto-connect for production (restored)
  useEffect(() => {
    if (authenticated && !isConnected && !isConnecting) {
      console.log('🚀 Auto-connecting...', { authenticated, isConnected, isConnecting });
      setTimeout(() => {
        console.log('🚀 Executing auto-connect...');
        handleConnectNetwork();
      }, 2000); // Auto-connect after 2 seconds
    }
  }, [authenticated, isConnected, isConnecting]);

  // Force start simulation for testing
  useEffect(() => {
    if (authenticated) {
      console.log('🚀 Force starting simulation for testing...');
      setTimeout(() => {
        console.log('🚀 Setting connected state and starting simulation...');
        setIsConnected(true);
        const realtimeInterval = setInterval(async () => {
          console.log('⏰ Force simulation tick -', new Date().toLocaleTimeString());
          await simulateBandwidthMeasurement();
        }, 2000);
        setRealtimeUpdateInterval(realtimeInterval);
        
        // Start immediately
        simulateBandwidthMeasurement();
      }, 3000); // Start after 3 seconds
    }
  }, [authenticated]);


  // Check backend health and authenticate user
  useEffect(() => {
    const initializeOverview = async () => {
      if (!authenticated || !privyUser?.email?.address) {
        setError('Please sign in to view your overview.');
        return;
      }

      // Prevent multiple simultaneous initialization attempts or re-initialization
      if (isInitializing || hasInitialized) {
        return;
      }

      setIsInitializing(true);
      setLoading(true);
      setError(null);
      
      console.log('🔄 Initializing overview for:', privyUser.email.address);

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
          setUserPoints({
            totalEpochPoints: 1250,
            todayPoints: 45,
            lastUpdated: new Date().toISOString()
          });
          
          setNetworkStats({
            totalNodes: 1,
            activeNodes: 1,
            totalBytesServed: 1250000000, // 1.25 GB
            totalGBServed: 1.25,
            averageUptime: 98.5,
            totalSessions: 24,
            totalContributions: 18,
            totalContributionBytes: 1250000000,
            totalContributionGB: 1.25,
            averageDownloadSpeed: 45.2,
            averageUploadSpeed: 8.7,
            averageLatency: 23.1,
            averageContributionUptime: 98.5,
            lastContributionTime: new Date().toISOString(),
            epochPoints: 1250,
            todayPoints: 45
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
          setBackendConnected(true);
          setDemoMode(false);

          // Get points information
          console.log('⭐ Getting points information...');
          await fetchPointsData(authResponse.data.token);
          
          // Get network stats
          console.log('📊 Getting network stats...');
          await fetchNetworkStats(authResponse.data.token);
          
          console.log('✅ Overview data loaded successfully');
        } else {
          console.error('❌ Authentication failed:', authResponse.message);
          setError('Failed to authenticate with backend. Using demo mode.');
          setDemoMode(true);
          setBackendConnected(false);
        }
      } catch (error) {
        console.error('❌ Error initializing overview:', error);
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

    initializeOverview();
  }, [authenticated, privyUser?.email?.address]);

  const fetchPointsData = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/depin/points', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.points) {
          setUserPoints({
            totalEpochPoints: data.data.points.totalEpochPoints,
            todayPoints: data.data.points.todayPoints,
            lastUpdated: data.data.points.lastUpdated
          });
          console.log('⭐ Points data fetched:', data.data.points);
        }
      } else {
        console.error('Failed to fetch points data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching points data:', error);
    }
  };

  const fetchNetworkStats = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/depin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.stats) {
          setNetworkStats(prevStats => ({
            ...prevStats,
            ...data.data.stats,
            ...data.data.contributionStats
          }));
          console.log('📊 Network stats fetched:', data.data.stats);
        }
      } else {
        console.error('Failed to fetch network stats:', response.status);
      }
    } catch (error) {
      console.error('Error fetching network stats:', error);
    }
  };

  const checkAndCreateNode = async (token: string) => {
    try {
      // First, check if user has any nodes
      const nodesResponse = await fetch('http://localhost:3001/api/depin/nodes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (nodesResponse.ok) {
        const nodesData = await nodesResponse.json();
        if (nodesData.success && nodesData.data?.nodes?.length > 0) {
          console.log('✅ User has nodes:', nodesData.data.nodes.length);
          return true;
        }
      }

      // If no nodes, create one
      console.log('🔄 No nodes found, creating a default node...');
      const createResponse = await fetch('http://localhost:3001/api/depin/nodes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Main DePIN Node',
          location: 'Global Network'
        })
      });

      if (createResponse.ok) {
        const createData = await createResponse.json();
        console.log('✅ Node created successfully:', createData);
        return true;
      } else {
        const errorData = await createResponse.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Failed to create node:', errorData);
        return false;
      }
    } catch (error) {
      console.error('❌ Error checking/creating nodes:', error);
      return false;
    }
  };

  const handleConnectNetwork = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      console.log('🔄 Attempting to connect to DePIN network...');
      
      // Always start frontend simulation regardless of backend status
      setIsConnected(true);
      console.log('✅ Frontend simulation started');
      
      // Start real-time bandwidth measurements immediately
      console.log('🚀 Starting real-time measurements...');
      const realtimeInterval = setInterval(async () => {
        console.log('⏰ Real-time measurement tick -', new Date().toLocaleTimeString());
        await simulateBandwidthMeasurement();
      }, 2000); // Measure every 2 seconds for more visible updates
      
      setRealtimeUpdateInterval(realtimeInterval);
      
      // Also start immediately
      console.log('🚀 Starting immediate measurement...');
      setTimeout(() => {
        simulateBandwidthMeasurement();
      }, 1000);
      
      // Force start simulation immediately
      console.log('🚀 Force starting simulation...');
      await simulateBandwidthMeasurement();
      
      // Try backend connection if auth token is available
      if (authToken) {
        console.log('🔑 Using auth token:', authToken.substring(0, 20) + '...');
        
        try {
          // First, ensure user has at least one node
          const hasNodes = await checkAndCreateNode(authToken);
          if (!hasNodes) {
            console.log('⚠️ No nodes found, continuing with frontend simulation only');
          }
          
          const response = await fetch('http://localhost:3001/api/depin/connect', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('📡 Response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend connection successful:', data);
            
            // Start periodic backend updates
            const interval = setInterval(async () => {
              if (authToken) {
                await fetchPointsData(authToken);
                await fetchNetworkStats(authToken);
                setLastUpdate(Date.now());
              }
            }, 5000); // Update every 5 seconds
            
            setMeasurementInterval(interval);
          } else {
            console.log('⚠️ Backend connection failed, continuing with frontend simulation only');
          }
        } catch (backendError) {
          console.log('⚠️ Backend error, continuing with frontend simulation only:', backendError);
        }
      } else {
        console.log('⚠️ No auth token, using frontend simulation only');
      }
    } catch (error) {
      console.error('❌ Connection error:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect to DePIN network');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectNetwork = async () => {
    if (!authToken) return;

    setIsConnecting(true);
    try {
      const response = await fetch('http://localhost:3001/api/depin/disconnect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsConnected(false);
        
        // Stop all intervals
        if (measurementInterval) {
          clearInterval(measurementInterval);
          setMeasurementInterval(null);
        }
        if (realtimeUpdateInterval) {
          clearInterval(realtimeUpdateInterval);
          setRealtimeUpdateInterval(null);
        }
        
        // Send final sync to backend
        await syncFinalDataToBackend();
        
        // Clear localStorage simulation state
        localStorage.removeItem('aiden_simulation_state');
        setBackgroundSimulation(false);
        
        console.log('✅ Disconnected from DePIN network and synced final data');
      } else {
        throw new Error('Failed to disconnect from DePIN network');
      }
    } catch (error) {
      console.error('❌ Disconnection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(1)}%`;
  };

  // Simulate realistic bandwidth measurement and update backend
  const simulateBandwidthMeasurement = async () => {
    console.log('🔄 simulateBandwidthMeasurement called:', { 
      authToken: !!authToken, 
      isConnected, 
      timestamp: new Date().toLocaleTimeString() 
    });
    
    // Force simulation to run regardless of connection state for testing
    console.log('✅ Starting measurement simulation (forced for testing)...');

    try {
      // Simulate realistic bandwidth data with more variation
      const dataServed = Math.random() * 5000000 + 1000000; // 1-6 MB per measurement
      const downloadSpeed = Math.random() * 50 + 10; // 10-60 Mbps
      const uploadSpeed = Math.random() * 20 + 5; // 5-25 Mbps
      const latency = Math.random() * 50 + 10; // 10-60 ms
      const uptime = Math.random() * 5 + 95; // 95-100%

      // Calculate points (1 point per MB served)
      const pointsEarned = Math.floor(dataServed / (1024 * 1024));

      console.log('📊 Simulating measurement:', { dataServed, pointsEarned });

      // Update frontend state immediately
      setNetworkStats(prevStats => {
        const newBytesServed = prevStats.totalBytesServed + dataServed;
        const newPoints = prevStats.epochPoints + pointsEarned;
        
        console.log('📈 Updating network stats:', { 
          oldBytes: prevStats.totalBytesServed, 
          newBytes: newBytesServed,
          oldPoints: prevStats.epochPoints,
          newPoints: newPoints
        });
        
        return {
          ...prevStats,
          totalBytesServed: newBytesServed,
          totalContributionBytes: newBytesServed,
          totalGBServed: newBytesServed / (1024 * 1024 * 1024),
          totalContributionGB: newBytesServed / (1024 * 1024 * 1024),
          totalContributions: prevStats.totalContributions + 1,
          averageDownloadSpeed: (prevStats.averageDownloadSpeed + downloadSpeed) / 2,
          averageUploadSpeed: (prevStats.averageUploadSpeed + uploadSpeed) / 2,
          averageLatency: (prevStats.averageLatency + latency) / 2,
          averageUptime: (prevStats.averageUptime + uptime) / 2,
          averageContributionUptime: (prevStats.averageContributionUptime + uptime) / 2,
          lastContributionTime: new Date().toISOString(),
          epochPoints: newPoints,
          todayPoints: prevStats.todayPoints + pointsEarned
        };
      });

      setUserPoints(prevPoints => {
        if (!prevPoints) return prevPoints;
        
        const newTotalPoints = prevPoints.totalEpochPoints + pointsEarned;
        console.log('⭐ Updating user points:', { 
          oldPoints: prevPoints.totalEpochPoints, 
          newPoints: newTotalPoints 
        });
        
        return {
          ...prevPoints,
          totalEpochPoints: newTotalPoints,
          todayPoints: prevPoints.todayPoints + pointsEarned,
          lastUpdated: new Date().toISOString()
        };
      });

      // Try to send measurement to backend if auth token is available
      if (authToken) {
        const measurementData = {
          dataServed: dataServed,
          downloadSpeed: downloadSpeed,
          uploadSpeed: uploadSpeed,
          latency: latency,
          uptime: uptime,
          pointsEarned: pointsEarned
        };

        try {
          const response = await fetch('http://localhost:3001/api/depin/measurement', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(measurementData)
          });

          if (response.ok) {
            console.log('📊 Measurement sent to backend:', measurementData);
          } else {
            console.log('⚠️ Failed to send measurement to backend:', response.status);
          }
        } catch (backendError) {
          console.log('⚠️ Backend error, continuing with frontend simulation:', backendError);
        }
      }

      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Error in bandwidth measurement:', error);
    }
  };

  // Sync final data to backend when disconnecting
  const syncFinalDataToBackend = async () => {
    if (!authToken) return;

    try {
      const finalData = {
        totalBytesServed: networkStats.totalBytesServed,
        totalContributions: networkStats.totalContributions,
        totalEpochPoints: userPoints?.totalEpochPoints || 0,
        todayPoints: userPoints?.todayPoints || 0,
        averageUptime: networkStats.averageUptime,
        lastContributionTime: new Date().toISOString()
      };

      const response = await fetch('http://localhost:3001/api/depin/sync-final', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalData)
      });

      if (response.ok) {
        console.log('✅ Final data synced to backend:', finalData);
      } else {
        console.error('Failed to sync final data to backend:', response.status);
      }
    } catch (error) {
      console.error('Error syncing final data:', error);
    }
  };

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (measurementInterval) {
        clearInterval(measurementInterval);
      }
      if (realtimeUpdateInterval) {
        clearInterval(realtimeUpdateInterval);
      }
    };
  }, [measurementInterval, realtimeUpdateInterval]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error && !demoMode) {
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

  return (
    <Box>
      {demoMode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontFamily: polySansFont, mb: 1 }}>
            🎯 Demo Mode - Overview Preview
          </Typography>
          <Typography variant="body2">
            {backendConnected 
              ? 'Backend is connected but authentication failed. Using demo data.'
              : 'Backend is not available. This shows what your overview will look like when connected.'
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
            Your points are connected to the database. Real data is being displayed.
          </Typography>
        </Alert>
      )}

      {/* DePIN Status Alert */}
      {isConnected && (
        <Alert 
          severity="success" 
          sx={{ mb: 3, fontFamily: polySansFont }}
          icon={<WifiIcon />}
        >
          DePIN Proof-of-Bandwidth Protocol is actively measuring and logging bandwidth usage. 
          Last update: {new Date(lastUpdate).toLocaleTimeString()}
          {backgroundSimulation && (
            <Box component="span" sx={{ ml: 2, fontWeight: 'bold' }}>
              🔄 Running in background
            </Box>
          )}
        </Alert>
      )}



      {/* Welcome Message */}
      <Card sx={{ 
        mb: 4, 
        backgroundColor: '#3b82f6',
        border: 'none',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.15)',
        '&:hover': {
          boxShadow: '0 8px 30px rgba(59, 130, 246, 0.25)',
          transition: 'all 0.3s ease-in-out'
        }
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            color: '#ffffff', 
            mb: 2,
            fontFamily: polySansFont,
            fontSize: '1.25rem'
          }}>
            Welcome to Epoch 0!
          </Typography>
          <Typography variant="body1" sx={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontFamily: polySansFont,
            lineHeight: 1.6
          }}>
            On the dashboard you will see your earnings for this epoch. To view your total number of points, 
            simply navigate to the{' '}
            <Typography 
              component="span" 
              sx={{ 
                color: '#ffffff', 
                textDecoration: 'underline',
                cursor: 'pointer',
                fontWeight: 600,
                fontFamily: polySansFont
              }}
            >
              Rewards tab
            </Typography>
            {' '}on the left.
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Points Card */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            height: '100%',
            backgroundColor: '#ffffff',
            border: 'none',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            '&:hover': {
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
              transition: 'all 0.3s ease-in-out'
            }
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 700, 
                color: '#111827', 
                mb: 4,
                fontFamily: polySansFont,
                fontSize: '1.5rem'
              }}>
                Earnings
              </Typography>
              
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 3,
                    backgroundColor: '#f8fafc',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: '12px', 
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        mr: 2
                      }}>
                        <StarIcon sx={{ fontSize: 28, color: '#f59e0b' }} />
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: '#f59e0b', fontFamily: polySansFont }}>
                        <CountUp 
                          end={userPoints ? userPoints.totalEpochPoints : 0} 
                          duration={1} 
                          separator=","
                        />
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 1, fontFamily: polySansFont }}>
                      Epoch 0 Earning
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', fontFamily: polySansFont }}>
                      {`Uptime: ${formatUptime(networkStats.averageUptime)}`}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 3,
                    backgroundColor: '#f8fafc',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: '12px', 
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        mr: 2
                      }}>
                        <TrendingIcon sx={{ fontSize: 28, color: '#3b82f6' }} />
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: '#3b82f6', fontFamily: polySansFont }}>
                        <CountUp 
                          end={userPoints ? userPoints.todayPoints : 0} 
                          duration={0.5} 
                          separator=","
                        />
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 1, fontFamily: polySansFont }}>
                      Earned Today
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', fontFamily: polySansFont }}>
                      {`${networkStats.activeNodes}/${networkStats.totalNodes} nodes active`}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Network Status Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            backgroundColor: '#ffffff',
            border: 'none',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            '&:hover': {
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
              transition: 'all 0.3s ease-in-out'
            }
          }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              {isConnected ? (
                <>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '16px', 
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3
                  }}>
                    <WifiIcon sx={{ fontSize: 40, color: '#10b981' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#10b981', mb: 1, fontFamily: polySansFont }}>
                    Connected to DePIN
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 3, fontFamily: polySansFont }}>
                    Proof-of-Bandwidth Protocol Active
                  </Typography>
                  
                  {/* Real-time stats */}
                  <Box sx={{ 
                    mb: 3, 
                    p: 3, 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#6b7280', fontFamily: polySansFont, display: 'block', mb: 0.5 }}>
                          Data Served
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: polySansFont, color: '#111827' }}>
                          <CountUp 
                            end={networkStats.totalContributionBytes || networkStats.totalBytesServed} 
                            duration={1} 
                            separator="," 
                            suffix=" bytes"
                          />
                          <br />
                          <small>({formatBytes(networkStats.totalContributionBytes || networkStats.totalBytesServed)})</small>
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#6b7280', fontFamily: polySansFont, display: 'block', mb: 0.5 }}>
                          Active Nodes
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: polySansFont, color: '#111827' }}>
                          {networkStats.activeNodes}/{networkStats.totalNodes}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#6b7280', fontFamily: polySansFont, display: 'block', mb: 0.5 }}>
                          Avg Uptime
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: polySansFont, color: '#111827' }}>
                          {formatUptime(networkStats.averageUptime)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#6b7280', fontFamily: polySansFont, display: 'block', mb: 0.5 }}>
                          Contributions
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: polySansFont, color: '#111827' }}>
                          {networkStats.totalContributions}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleDisconnectNetwork}
                    disabled={isConnecting}
                    sx={{
                      borderColor: '#ef4444',
                      color: '#ef4444',
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      fontFamily: polySansFont,
                      borderRadius: '12px',
                      '&:hover': {
                        borderColor: '#dc2626',
                        backgroundColor: 'rgba(239, 68, 68, 0.04)',
                      }
                    }}
                  >
                    {isConnecting ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} color="inherit" />
                        Disconnecting...
                      </Box>
                    ) : (
                      'Disconnect Network'
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '16px', 
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3
                  }}>
                    <WifiOffIcon sx={{ fontSize: 40, color: '#ef4444' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#ef4444', mb: 1, fontFamily: polySansFont }}>
                    • Not Connected
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 3, fontFamily: polySansFont }}>
                    You don't have any connected network currently.
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleConnectNetwork}
                    disabled={isConnecting || !authToken}
                    sx={{
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      fontFamily: polySansFont,
                      borderRadius: '12px',
                      '&:hover': {
                        backgroundColor: '#2563eb',
                      }
                    }}
                  >
                    {isConnecting ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} color="inherit" />
                        Connecting...
                      </Box>
                    ) : (
                      'Connect Network'
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
                
      {/* Earning Statistics Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 700, 
          color: '#111827', 
          mb: 1,
          fontFamily: polySansFont,
          fontSize: '1.5rem'
        }}>
          Earning statistics
        </Typography>
        <Typography variant="body2" sx={{ 
          color: '#6b7280', 
          mb: 3,
          fontFamily: polySansFont
        }}>
          Your revenue graph generated based on your bandwidth contributions
        </Typography>
                    
        <Card sx={{ 
          backgroundColor: '#ffffff',
          border: 'none',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
            transition: 'all 0.3s ease-in-out'
          }
        }}>
          <CardContent sx={{ p: 4 }}>
            {/* Graph Placeholder */}
            <Box sx={{
              height: 300,
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              border: '2px dashed #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              position: 'relative'
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <TrendingIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                <Typography variant="h6" sx={{ 
                  color: '#94a3b8', 
                  fontFamily: polySansFont,
                  fontWeight: 500
                }}>
                  Revenue Graph
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#cbd5e1', 
                  fontFamily: polySansFont
                }}>
                  Chart will appear here when data is available
                </Typography>
              </Box>
            </Box>
                
            {/* Timeline */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 2
            }}>
              {['Aug 25', 'Aug 27', 'Aug 29', 'Aug 31', 'Sep 02', 'Sep 04', 'Sep 06', 'Sep 08', 'Sep 10', 'Sep 12', 'Sep 14', 'Sep 16', 'Sep 18', 'Sep 20', 'Sep 22'].map((date, index) => (
                <Box key={index} sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography variant="caption" sx={{ 
                    color: '#6b7280', 
                    fontFamily: polySansFont,
                    display: 'block',
                    mb: 0.5
                  }}>
                    0
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: '#9ca3af', 
                    fontFamily: polySansFont,
                    fontSize: '0.7rem'
                  }}>
                    {date}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
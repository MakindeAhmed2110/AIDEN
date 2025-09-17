import type { Route } from "./+types/dashboard.overview";
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Grid,
  Modal,
  Fade,
  Backdrop,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import { 
  TrendingUp as TrendingIcon,
  SmartToy as AIIcon,
  WifiOff as WifiOffIcon,
  Wifi as WifiIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Storage as StorageIcon,
  Timer as TimerIcon
} from '@mui/icons-material';

// PolySans font family constant
const polySansFont = '"PolySans Median", "PolySans Neutral", "Styrene A Web", "Helvetica Neue", Sans-Serif';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Overview - AIDEN Dashboard" },
    { name: "description", content: "Your AIDEN dashboard overview" },
  ];
}

// Simulated DePIN System (in production, this would be imported from the backend)
class SimulatedDePINSystem {
  private isRunning = false;
  private nodes = [
    {
      id: 'node-001',
      name: 'Bandwidth Node Alpha',
      location: 'US-East',
      isActive: true,
      totalBytesServed: 0,
      totalUptime: 0,
      lastActivity: Date.now(),
      speedTestResults: {
        downloadSpeed: 85.2,
        uploadSpeed: 42.1,
        latency: 12.5
      }
    },
    {
      id: 'node-002', 
      name: 'Bandwidth Node Beta',
      location: 'EU-West',
      isActive: true,
      totalBytesServed: 0,
      totalUptime: 0,
      lastActivity: Date.now(),
      speedTestResults: {
        downloadSpeed: 92.8,
        uploadSpeed: 38.7,
        latency: 8.3
      }
    },
    {
      id: 'node-003',
      name: 'Bandwidth Node Gamma', 
      location: 'Asia-Pacific',
      isActive: true,
      totalBytesServed: 0,
      totalUptime: 0,
      lastActivity: Date.now(),
      speedTestResults: {
        downloadSpeed: 78.5,
        uploadSpeed: 35.2,
        latency: 15.8
      }
    }
  ];

  private usageLogs: any[] = [];
  private interval: NodeJS.Timeout | null = null;

  async connectNetwork() {
    if (this.isRunning) {
      return { success: false, message: 'DePIN system is already running' };
    }
    
    this.isRunning = true;
    
    this.interval = setInterval(() => {
      this.measureBandwidth();
    }, 5000); // Measure every 5 seconds for demo
    
    console.log('🚀 DePIN Proof-of-Bandwidth Protocol started');
    
    // Wait a moment for initial measurements
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      message: 'Successfully connected to DePIN network',
      data: this.getSystemStatus()
    };
  }

  async disconnectNetwork() {
    if (!this.isRunning) {
      return { success: false, message: 'DePIN system is not running' };
    }
    
    this.isRunning = false;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    console.log('⏹️ DePIN Proof-of-Bandwidth Protocol stopped');
    
    return {
      success: true,
      message: 'Successfully disconnected from DePIN network'
    };
  }

  private measureBandwidth() {
    this.nodes.forEach(node => {
      if (node.isActive) {
        const bytesServed = Math.floor(Math.random() * 500000) + 100000; // 100KB - 600KB
        const uptime = Math.random() * 100;
        
        node.totalBytesServed += bytesServed;
        node.totalUptime += uptime;
        node.lastActivity = Date.now();
        
        // Simulate speed test variations
        node.speedTestResults.downloadSpeed += (Math.random() - 0.5) * 5;
        node.speedTestResults.uploadSpeed += (Math.random() - 0.5) * 3;
        node.speedTestResults.latency += (Math.random() - 0.5) * 2;
        
        // Keep values realistic
        node.speedTestResults.downloadSpeed = Math.max(50, Math.min(150, node.speedTestResults.downloadSpeed));
        node.speedTestResults.uploadSpeed = Math.max(25, Math.min(75, node.speedTestResults.uploadSpeed));
        node.speedTestResults.latency = Math.max(5, Math.min(30, node.speedTestResults.latency));

        // Create usage proof
        const usageProof = {
          nodeId: node.id,
          sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          bytesServed,
          uptime,
          cryptographicProof: `proof-${Math.random().toString(36).substr(2, 16)}`,
          hederaTransactionId: `0.0.${Math.floor(Math.random() * 1000000)}@${Date.now()}`
        };

        this.usageLogs.push(usageProof);
        
        // Keep only last 50 logs
        if (this.usageLogs.length > 50) {
          this.usageLogs = this.usageLogs.slice(-50);
        }
      }
    });
  }

  getSystemStatus() {
    const totalBytesServed = this.nodes.reduce((sum, node) => sum + node.totalBytesServed, 0);
    const averageUptime = this.nodes.reduce((sum, node) => sum + node.totalUptime, 0) / this.nodes.length;
    const activeNodes = this.nodes.filter(node => node.isActive).length;

    return {
      totalNodes: this.nodes.length,
      activeNodes,
      totalBytesServed,
      totalGBServed: totalBytesServed / (1024 * 1024 * 1024),
      averageUptime,
      totalSessions: this.usageLogs.length,
      isRunning: this.isRunning
    };
  }

  getNodes() {
    return this.nodes;
  }

  getUsageLogs() {
    return this.usageLogs;
  }

  isSystemRunning() {
    return this.isRunning;
  }
}

export default function Overview() {
  const [comingSoonModalOpen, setComingSoonModalOpen] = useState(false);
  const [depinSystem] = useState(() => new SimulatedDePINSystem());
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkStats, setNetworkStats] = useState(depinSystem.getSystemStatus());
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Update data every second when connected
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setNetworkStats(depinSystem.getSystemStatus());
      setLastUpdate(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, depinSystem]);

  const handleComingSoonModalOpen = () => {
    setComingSoonModalOpen(true);
  };

  const handleComingSoonModalClose = () => {
    setComingSoonModalOpen(false);
  };

  const handleConnectNetwork = async () => {
    setIsConnecting(true);
    try {
      const result = await depinSystem.connectNetwork();
      if (result.success) {
        setIsConnected(true);
        setNetworkStats(result.data);
        console.log('✅ Connected to DePIN network:', result.message);
      } else {
        console.error('❌ Failed to connect:', result.message);
      }
    } catch (error) {
      console.error('❌ Connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectNetwork = async () => {
    setIsConnecting(true);
    try {
      const result = await depinSystem.disconnectNetwork();
      if (result.success) {
        setIsConnected(false);
        setNetworkStats(depinSystem.getSystemStatus());
        console.log('✅ Disconnected from DePIN network:', result.message);
      } else {
        console.error('❌ Failed to disconnect:', result.message);
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

  return (
    <>
      {/* DePIN Status Alert */}
      {isConnected && (
        <Alert 
          severity="success" 
          sx={{ mb: 3, fontFamily: polySansFont }}
          icon={<WifiIcon />}
        >
          DePIN Proof-of-Bandwidth Protocol is actively measuring and logging bandwidth usage. 
          Last update: {new Date(lastUpdate).toLocaleTimeString()}
        </Alert>
      )}

      {/* Welcome Message */}
      <Card sx={{ 
        mb: 3, 
        background: 'linear-gradient(135deg, rgba(176, 136, 240, 0.1) 0%, rgba(160, 231, 229, 0.1) 100%)',
        border: 'none',
        boxShadow: '0 4px 20px rgba(176, 136, 240, 0.1)',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            color: '#1e3a8a', 
            mb: 1,
            fontFamily: polySansFont
          }}>
            Welcome to Epoch 1!
          </Typography>
          <Typography variant="body2" sx={{ 
            color: '#666666',
            fontFamily: polySansFont
          }}>
            On the dashboard you will see your earnings for this epoch. To view your total number of points, 
            simply navigate to the Rewards tab on the left.
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Earnings Card */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ 
            height: '100%',
            border: 'none',
            boxShadow: '0 4px 20px rgba(176, 136, 240, 0.15)',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(176, 136, 240, 0.08) 0%, rgba(160, 231, 229, 0.08) 100%)',
            backdropFilter: 'blur(10px)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 700, 
                color: '#000000', 
                mb: 3,
                fontFamily: polySansFont
              }}>
                Earnings
              </Typography>
              
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <TrendingIcon sx={{ fontSize: 32, color: '#1e3a8a', mr: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e3a8a', fontFamily: polySansFont }}>
                        {isConnected ? (networkStats.totalGBServed * 0.1).toFixed(3) : '0.00'}
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000', mb: 1, fontFamily: polySansFont }}>
                      Epoch 1 Earnings
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666666', fontFamily: polySansFont }}>
                      {isConnected ? `${formatUptime(networkStats.averageUptime)} uptime` : 'Uptime: 0 day, 0 hr, 0 min'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ textAlign: 'center', fontFamily: polySansFont }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <TrendingIcon sx={{ fontSize: 32, color: '#1e3a8a', mr: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e3a8a', fontFamily: polySansFont }}>
                        {isConnected ? (networkStats.totalGBServed * 0.05).toFixed(3) : '0.00'}
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000', mb: 1, fontFamily: polySansFont }}>
                      Today's Earnings
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666666' }}>
                      {isConnected ? `${networkStats.activeNodes}/${networkStats.totalNodes} nodes active` : 'Uptime: 0 day, 0 hr, 0 min'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Network Status Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ 
            height: '100%',
            border: 'none',
            boxShadow: '0 4px 20px rgba(176, 136, 240, 0.15)',
            borderRadius: '16px',
            background: isConnected 
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)'
              : 'linear-gradient(135deg, rgba(176, 136, 240, 0.08) 0%, rgba(160, 231, 229, 0.08) 100%)',
            backdropFilter: 'blur(10px)',
            fontFamily: polySansFont
          }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              {isConnected ? (
                <>
                  <WifiIcon sx={{ fontSize: 48, color: '#059669', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#059669', mb: 1, fontFamily: polySansFont }}>
                    Connected to DePIN
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666', mb: 2, fontFamily: polySansFont }}>
                    Proof-of-Bandwidth Protocol Active
                  </Typography>
                  
                  {/* Real-time stats */}
                  <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: '8px' }}>
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" sx={{ color: '#666666', fontFamily: polySansFont }}>
                          Data Served
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: polySansFont }}>
                          {formatBytes(networkStats.totalBytesServed)}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" sx={{ color: '#666666', fontFamily: polySansFont }}>
                          Active Nodes
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: polySansFont }}>
                          {networkStats.activeNodes}/{networkStats.totalNodes}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" sx={{ color: '#666666', fontFamily: polySansFont }}>
                          Avg Uptime
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: polySansFont }}>
                          {formatUptime(networkStats.averageUptime)}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" sx={{ color: '#666666', fontFamily: polySansFont }}>
                          Proofs
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: polySansFont }}>
                          {networkStats.totalSessions}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleDisconnectNetwork}
                    disabled={isConnecting}
                    sx={{
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#b91c1c',
                      },
                      fontFamily: polySansFont
                    }}
                  >
                    {isConnecting ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} color="inherit" />
                        Disconnecting...
                      </Box>
                    ) : (
                      'DISCONNECT NETWORK'
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <WifiOffIcon sx={{ fontSize: 48, color: '#dc2626', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#dc2626', mb: 1, fontFamily: polySansFont }}>
                    Not Connected
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666', mb: 3, fontFamily: polySansFont }}>
                    You don't have any connected network currently.
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleConnectNetwork}
                    disabled={isConnecting}
                    sx={{
                      backgroundColor: '#1e3a8a',
                      color: '#ffffff',
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#1e40af',
                      },
                      fontFamily: polySansFont
                    }}
                  >
                    {isConnecting ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} color="inherit" />
                        Connecting...
                      </Box>
                    ) : (
                      'CONNECT NETWORK'
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* AIDEN App Coming Soon Card */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ 
            border: 'none',
            boxShadow: '0 4px 20px rgba(176, 136, 240, 0.15)',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(176, 136, 240, 0.08) 0%, rgba(160, 231, 229, 0.08) 100%)',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 4, position: 'relative' }}>
              {/* Slant Badge */}
              <Box sx={{
                position: 'absolute',
                top: 20,
                right: -20,
                backgroundColor: '#1e3a8a',
                color: '#ffffff',
                px: 3,
                py: 1,
                transform: 'rotate(45deg)',
                fontSize: '0.8rem',
                fontWeight: 700,
                fontFamily: polySansFont,
                zIndex: 2,
                boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
                minWidth: '120px',
                textAlign: 'center'
              }}>
                COMING SOON
              </Box>

              <Grid container spacing={4} alignItems="center">
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ 
                    width: '100%', 
                    height: '200px', 
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundImage: 'url(/illustrations/third.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{ 
                      position: 'absolute', 
                      top: -10, 
                      right: 0,
                      backgroundColor: '#1e3a8a',
                      color: '#ffffff',
                      px: 2,
                      py: 0.5,
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}>
                      2.00X
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <NotificationsIcon sx={{ fontSize: 32, color: '#1e3a8a', mr: 1 }} />
                      <Typography variant="h5" sx={{ 
                        fontWeight: 700, 
                        color: '#000000',
                        fontFamily: polySansFont
                      }}>
                        AIDEN APP COMING SOON!
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" sx={{ 
                      color: '#333333', 
                      mb: 3,
                      fontFamily: polySansFont,
                      lineHeight: 1.6
                    }}>
                      We're working hard to bring you the ultimate AIDEN mobile experience. 
                      Get ready for seamless DePIN management, real-time earnings tracking, 
                      and AI-powered insights right in your pocket!
                    </Typography>
                    
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleComingSoonModalOpen}
                      startIcon={<NotificationsIcon />}
                      sx={{
                        backgroundColor: '#1e3a8a',
                        color: '#ffffff',
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        mb: 2,
                        borderRadius: '12px',
                        '&:hover': {
                          backgroundColor: '#1e40af',
                        }
                      }}
                    >
                      GET NOTIFIED
                    </Button>
                    
                    <Typography variant="body2" sx={{ 
                      color: '#333333',
                      fontFamily: polySansFont
                    }}>
                      Be the first to know when we launch!
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Coming Soon Modal */}
      <Modal
        open={comingSoonModalOpen}
        onClose={handleComingSoonModalClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)'
          }
        }}
      >
        <Fade in={comingSoonModalOpen}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '400px' },
              maxWidth: '90vw',
              bgcolor: 'background.paper',
              borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              p: 0,
              outline: 'none',
              background: 'linear-gradient(135deg, rgba(176, 136, 240, 0.1) 0%, rgba(160, 231, 229, 0.1) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Content */}
            <Box sx={{ p: 0, position: 'relative' }}>
              {/* Close Button */}
              <IconButton 
                onClick={handleComingSoonModalClose}
                sx={{ 
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  zIndex: 3,
                  color: '#ffffff',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  '&:hover': { 
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: '#ffffff'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>

              {/* Hero Image Section */}
              <Box sx={{
                height: '250px',
                backgroundImage: 'url(/illustrations/second.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(176, 136, 240, 0.3) 0%, rgba(160, 231, 229, 0.3) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: '#ffffff',
                      fontFamily: polySansFont,
                      mb: 1,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                    }}>
                      COMING SOON
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: '#ffffff',
                      fontFamily: polySansFont,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                    }}>
                      AIDEN Mobile App
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Email Input Section */}
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ 
                  color: '#333333', 
                  mb: 3,
                  fontFamily: polySansFont,
                  lineHeight: 1.6
                }}>
                  Want to be notified when we launch?
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ 
                    flex: 1,
                    maxWidth: '250px'
                  }}>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid rgba(30, 58, 138, 0.2)',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontFamily: '"PolySans Median", "PolySans Neutral", "Styrene A Web", "Helvetica Neue", Sans-Serif',
                        outline: 'none',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)'
                      }}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#1e3a8a',
                      color: '#ffffff',
                      px: 3,
                      py: 1.5,
                      borderRadius: '12px',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#1e40af',
                      }
                    }}
                  >
                    Notify Me
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}

import type { Route } from "./+types/dashboard.rewards";
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  EmojiEvents as RewardsIcon,
  TrendingUp as TrendingIcon,
  AccountBalance as HbarIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { usePrivy } from '@privy-io/react-auth';
import { apiService, type RewardInfo } from '../services/api';
import CountUp from 'react-countup';

// PolySans font family constant
const polySansFont = '"PolySans Neutral", "PolySans Median", "Styrene A Web", "Helvetica Neue", Sans-Serif';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Rewards - AIDEN" },
    { name: "description", content: "View your HBAR rewards and points" },
  ];
}

// Mock data - in a real app this would come from your API
const mockRewardsData = {
  totalPoints: 1250,
  currentEpoch: 1,
  hbarBalance: 15.75,
  pendingRewards: 8.25,
  nextRewardDate: '2024-10-01',
  rewardHistory: [
    { date: '2024-09-15', amount: 12.50, type: 'Bandwidth Sharing', status: 'Completed' },
    { date: '2024-09-10', amount: 8.75, type: 'Referral Bonus', status: 'Completed' },
    { date: '2024-09-05', amount: 15.25, type: 'Node Operation', status: 'Completed' },
    { date: '2024-09-01', amount: 6.50, type: 'Network Participation', status: 'Completed' },
  ],
  achievements: [
    { name: 'First Share', description: 'Shared bandwidth for the first time', points: 100, unlocked: true },
    { name: 'Referral Master', description: 'Referred 5 friends', points: 500, unlocked: true },
    { name: 'Node Runner', description: 'Operated a node for 30 days', points: 1000, unlocked: false },
    { name: 'Network Champion', description: 'Top 10% contributor', points: 2000, unlocked: false },
  ]
};

export default function Rewards() {
  const { user: privyUser, authenticated } = usePrivy();
  const [rewardsData, setRewardsData] = useState<RewardInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  // Initialize authentication and fetch rewards data
  useEffect(() => {
    const initializeRewards = async () => {
      if (!authenticated || !privyUser?.email?.address) {
        setError('Please sign in to view your rewards.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Check if backend is available
        const isBackendHealthy = await apiService.checkHealth();
        
        if (!isBackendHealthy) {
          console.log('⚠️ Backend not available, using demo mode');
          setDemoMode(true);
          setRewardsData({
            userId: 1,
            points: {
              today: 45,
              total: 1250,
              lastUpdated: new Date().toISOString()
            },
            wallet: {
              balance: 1575000000, // 15.75 HBAR in tinybars
              balanceInHbar: 15.75
            },
            potentialRewards: {
              totalHBAR: 8.25,
              userReward: 5.78,
              charityReward: 2.47
            }
          });
          setLoading(false);
          return;
        }

        // Backend is available, authenticate
        const authResponse = await apiService.authenticateWithPrivy({
          email: privyUser.email.address
        });

        if (authResponse.success && authResponse.data) {
          setAuthToken(authResponse.data.token);
          setDemoMode(false);

          // Fetch rewards data
          const rewardsResponse = await apiService.getUserRewards(authResponse.data.user.id, authResponse.data.token);
          if (rewardsResponse.success && rewardsResponse.data) {
            setRewardsData(rewardsResponse.data);
          } else {
            setError('Failed to fetch rewards data');
          }
        } else {
          setError('Failed to authenticate with backend');
          setDemoMode(true);
        }
      } catch (error) {
        console.error('Error initializing rewards:', error);
        setError('Failed to connect to backend');
        setDemoMode(true);
      } finally {
        setLoading(false);
      }
    };

    initializeRewards();
  }, [authenticated, privyUser?.email?.address]);

  const formatHbar = (amount: number) => {
    return `${amount.toFixed(2)} HBAR`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Pending': return 'warning';
      case 'Failed': return 'error';
      default: return 'default';
    }
  };

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

  if (!rewardsData) {
    return (
      <Box>
        <Alert severity="info">
          No rewards data available. Please connect to the DePIN network to start earning rewards.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {demoMode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontFamily: polySansFont, mb: 1 }}>
            🎯 Demo Mode - Rewards Preview
          </Typography>
          <Typography variant="body2">
            Backend is not available. This shows what your rewards will look like when connected.
          </Typography>
        </Alert>
      )}

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          color: '#111827',
          fontFamily: polySansFont,
          mb: 1
        }}>
          Rewards
        </Typography>
        <Typography variant="body1" sx={{ 
          color: '#6b7280',
          fontFamily: polySansFont
        }}>
          Track your HBAR rewards and points for Epoch 0
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Total Points Card */}
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            height: '100%',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: 'none'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StarIcon sx={{ fontSize: 32, color: '#f59e0b', mr: 1 }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: '#111827',
                  fontFamily: polySansFont
                }}>
                  Total Points
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: '#f59e0b',
                fontFamily: polySansFont,
                mb: 1
              }}>
                <CountUp 
                  end={rewardsData.points.total} 
                  duration={1} 
                  separator=","
                />
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#6b7280',
                fontFamily: polySansFont
              }}>
                Earned this epoch
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* HBAR Balance Card */}
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            height: '100%',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: 'none'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HbarIcon sx={{ fontSize: 32, color: '#3b82f6', mr: 1 }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: '#111827',
                  fontFamily: polySansFont
                }}>
                  HBAR Balance
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: '#3b82f6',
                fontFamily: polySansFont,
                mb: 1
              }}>
                <CountUp 
                  end={rewardsData.wallet.balanceInHbar} 
                  duration={1} 
                  decimals={2}
                  suffix=" HBAR"
                />
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#6b7280',
                fontFamily: polySansFont
              }}>
                Available balance
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Rewards Card */}
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            height: '100%',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: 'none'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingIcon sx={{ fontSize: 32, color: '#10b981', mr: 1 }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: '#111827',
                  fontFamily: polySansFont
                }}>
                  Pending Rewards
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: '#10b981',
                fontFamily: polySansFont,
                mb: 1
              }}>
                <CountUp 
                  end={rewardsData.potentialRewards.userReward} 
                  duration={1} 
                  decimals={2}
                  suffix=" HBAR"
                />
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#6b7280',
                fontFamily: polySansFont
              }}>
                Potential user reward
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Epoch Card */}
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            height: '100%',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: 'none'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarIcon sx={{ fontSize: 32, color: '#8b5cf6', mr: 1 }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: '#111827',
                  fontFamily: polySansFont
                }}>
                  Current Epoch
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: '#8b5cf6',
                fontFamily: polySansFont,
                mb: 1
              }}>
                0
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#6b7280',
                fontFamily: polySansFont
              }}>
                Active period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Reward History Table */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: 'none'
          }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: '#111827',
                  fontFamily: polySansFont
                }}>
                  Reward History
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontFamily: polySansFont, fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontFamily: polySansFont, fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontFamily: polySansFont, fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontFamily: polySansFont, fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rewardsData.rewardHistory.map((reward, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontFamily: polySansFont }}>
                          {formatDate(reward.date)}
                        </TableCell>
                        <TableCell sx={{ fontFamily: polySansFont }}>
                          {reward.type}
                        </TableCell>
                        <TableCell sx={{ fontFamily: polySansFont, fontWeight: 600 }}>
                          {formatHbar(reward.amount)}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={reward.status} 
                            color={getStatusColor(reward.status) as any}
                            size="small"
                            sx={{ fontFamily: polySansFont }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Achievements Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: 'none'
          }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: '#111827',
                  fontFamily: polySansFont
                }}>
                  Achievements
                </Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                {rewardsData.achievements.map((achievement, index) => (
                  <Box key={index} sx={{ mb: 3, opacity: achievement.unlocked ? 1 : 0.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ 
                        fontWeight: 600, 
                        color: '#111827',
                        fontFamily: polySansFont
                      }}>
                        {achievement.name}
                      </Typography>
                      <Chip 
                        label={`${achievement.points} pts`}
                        size="small"
                        color={achievement.unlocked ? 'primary' : 'default'}
                        sx={{ fontFamily: polySansFont }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ 
                      color: '#6b7280',
                      fontFamily: polySansFont,
                      fontSize: '0.85rem'
                    }}>
                      {achievement.description}
                    </Typography>
                    {index < rewardsData.achievements.length - 1 && (
                      <Divider sx={{ mt: 2 }} />
                    )}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Claim Rewards Button */}
        <Grid item xs={12}>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<RewardsIcon />}
              disabled={rewardsData.potentialRewards.userReward === 0}
              sx={{
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                fontFamily: polySansFont,
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: '#2563eb',
                },
                '&:disabled': {
                  backgroundColor: '#d1d5db',
                  color: '#9ca3af'
                }
              }}
            >
              Claim {rewardsData.potentialRewards.userReward.toFixed(2)} HBAR Rewards
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

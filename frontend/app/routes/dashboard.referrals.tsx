import type { Route } from "./+types/dashboard.referrals";
import { useState } from 'react';
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
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  LinearProgress,
  Divider
} from '@mui/material';
import { 
  People as PeopleIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  TrendingUp as TrendingIcon,
  Star as StarIcon,
  EmojiEvents as RewardIcon
} from '@mui/icons-material';

// PolySans font family constant
const polySansFont = '"PolySans Neutral", "PolySans Median", "Styrene A Web", "Helvetica Neue", Sans-Serif';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Referral Program - AIDEN" },
    { name: "description", content: "Refer friends and earn rewards" },
  ];
}

// Mock referral data
const mockReferralData = {
  totalReferrals: 12,
  activeReferrals: 8,
  totalEarnings: 245.50,
  pendingEarnings: 48.25,
  referralCode: 'AIDEN-USER123',
  referralLink: 'https://aiden.app/invite/user123',
  currentTier: 'Silver',
  nextTier: 'Gold',
  progressToNextTier: 60,
  referralHistory: [
    { name: 'Alice Johnson', email: 'alice@example.com', joinDate: '2024-09-20', status: 'Active', earnings: 25.50 },
    { name: 'Bob Smith', email: 'bob@example.com', joinDate: '2024-09-18', status: 'Active', earnings: 32.75 },
    { name: 'Carol Davis', email: 'carol@example.com', joinDate: '2024-09-15', status: 'Inactive', earnings: 15.25 },
    { name: 'David Wilson', email: 'david@example.com', joinDate: '2024-09-12', status: 'Active', earnings: 28.50 },
    { name: 'Emma Brown', email: 'emma@example.com', joinDate: '2024-09-10', status: 'Active', earnings: 22.75 },
  ],
  rewards: [
    { tier: 'Bronze', referrals: 5, bonus: '10%', achieved: true },
    { tier: 'Silver', referrals: 10, bonus: '15%', achieved: true },
    { tier: 'Gold', referrals: 20, bonus: '20%', achieved: false },
    { tier: 'Platinum', referrals: 50, bonus: '25%', achieved: false },
  ]
};

export default function ReferralProgram() {
  const [referralData] = useState(mockReferralData);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralData.referralLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralData.referralCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'success' : 'default';
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return '#cd7f32';
      case 'Silver': return '#c0c0c0';
      case 'Gold': return '#ffd700';
      case 'Platinum': return '#e5e4e2';
      default: return '#6b7280';
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          color: '#111827',
          fontFamily: polySansFont,
          mb: 1
        }}>
          Referral Program
        </Typography>
          <Typography variant="body1" sx={{ 
            color: '#6b7280',
            fontFamily: polySansFont
          }}>
            Invite friends to AIDEN and earn rewards together
          </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            height: '100%',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: 'none'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ fontSize: 32, color: '#3b82f6', mr: 1 }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: '#111827',
                  fontFamily: polySansFont
                }}>
                  Total Referrals
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: '#3b82f6',
                fontFamily: polySansFont,
                mb: 1
              }}>
                {referralData.totalReferrals}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#10b981',
                fontFamily: polySansFont
              }}>
                {referralData.activeReferrals} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

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
                  Total Earnings
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: '#10b981',
                fontFamily: polySansFont,
                mb: 1
              }}>
                {referralData.totalEarnings.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#6b7280',
                fontFamily: polySansFont
              }}>
                HBAR earned
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            height: '100%',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: 'none'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <RewardIcon sx={{ fontSize: 32, color: '#f59e0b', mr: 1 }} />
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
                color: '#f59e0b',
                fontFamily: polySansFont,
                mb: 1
              }}>
                {referralData.pendingEarnings.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#6b7280',
                fontFamily: polySansFont
              }}>
                HBAR pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            height: '100%',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: 'none'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StarIcon sx={{ fontSize: 32, color: getTierColor(referralData.currentTier), mr: 1 }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: '#111827',
                  fontFamily: polySansFont
                }}>
                  Current Tier
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: getTierColor(referralData.currentTier),
                fontFamily: polySansFont,
                mb: 1
              }}>
                {referralData.currentTier}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#6b7280',
                fontFamily: polySansFont
              }}>
                {referralData.progressToNextTier}% to {referralData.nextTier}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={referralData.progressToNextTier} 
                sx={{ mt: 1, borderRadius: '4px', height: '6px' }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Referral Links Card */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: 'none'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: '#111827',
                fontFamily: polySansFont,
                mb: 3
              }}>
                Share Your Referral
              </Typography>
              
              {/* Referral Link */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ 
                  color: '#6b7280',
                  fontFamily: polySansFont,
                  mb: 1
                }}>
                  Referral Link:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    value={referralData.referralLink}
                    InputProps={{
                      readOnly: true,
                      sx: {
                        fontFamily: polySansFont,
                        backgroundColor: '#f9fafb',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#e5e7eb',
                        }
                      }
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleCopyLink}
                    startIcon={<CopyIcon />}
                    sx={{
                      borderColor: '#3b82f6',
                      color: '#3b82f6',
                      fontFamily: polySansFont,
                      minWidth: '120px',
                      '&:hover': { borderColor: '#2563eb' }
                    }}
                  >
                    Copy
                  </Button>
                </Box>
              </Box>

              {/* Referral Code */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ 
                  color: '#6b7280',
                  fontFamily: polySansFont,
                  mb: 1
                }}>
                  Referral Code:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    value={referralData.referralCode}
                    InputProps={{
                      readOnly: true,
                      sx: {
                        fontFamily: polySansFont,
                        backgroundColor: '#f9fafb',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#e5e7eb',
                        }
                      }
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleCopyCode}
                    startIcon={<CopyIcon />}
                    sx={{
                      borderColor: '#3b82f6',
                      color: '#3b82f6',
                      fontFamily: polySansFont,
                      minWidth: '120px',
                      '&:hover': { borderColor: '#2563eb' }
                    }}
                  >
                    Copy
                  </Button>
                </Box>
              </Box>

              <Button
                variant="contained"
                startIcon={<ShareIcon />}
                sx={{
                  backgroundColor: '#3b82f6',
                  fontFamily: polySansFont,
                  '&:hover': { backgroundColor: '#2563eb' }
                }}
              >
                Share on Social Media
              </Button>

              {copySuccess && (
                <Typography variant="body2" sx={{ 
                  color: '#10b981',
                  fontFamily: polySansFont,
                  mt: 1
                }}>
                  ✓ Copied to clipboard!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Tier Rewards Card */}
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
                  Tier Rewards
                </Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                {referralData.rewards.map((reward, index) => (
                  <Box key={index} sx={{ mb: 2, opacity: reward.achieved ? 1 : 0.6 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon sx={{ color: getTierColor(reward.tier), fontSize: '1.2rem' }} />
                        <Typography variant="subtitle2" sx={{ 
                          fontWeight: 600, 
                          color: '#111827',
                          fontFamily: polySansFont
                        }}>
                          {reward.tier}
                        </Typography>
                      </Box>
                      <Chip 
                        label={reward.bonus}
                        size="small"
                        color={reward.achieved ? 'success' : 'default'}
                        sx={{ fontFamily: polySansFont }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ 
                      color: '#6b7280',
                      fontFamily: polySansFont,
                      fontSize: '0.85rem'
                    }}>
                      {reward.referrals} referrals required
                    </Typography>
                    {index < referralData.rewards.length - 1 && (
                      <Divider sx={{ mt: 2 }} />
                    )}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Referral History Table */}
        <Grid item xs={12}>
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
                  Referral History
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontFamily: polySansFont, fontWeight: 600 }}>Name</TableCell>
                      <TableCell sx={{ fontFamily: polySansFont, fontWeight: 600 }}>Email</TableCell>
                      <TableCell sx={{ fontFamily: polySansFont, fontWeight: 600 }}>Join Date</TableCell>
                      <TableCell sx={{ fontFamily: polySansFont, fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontFamily: polySansFont, fontWeight: 600 }}>Earnings</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {referralData.referralHistory.map((referral, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.9rem' }}>
                              {referral.name.charAt(0)}
                            </Avatar>
                            <Typography sx={{ fontFamily: polySansFont }}>
                              {referral.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontFamily: polySansFont }}>
                          {referral.email}
                        </TableCell>
                        <TableCell sx={{ fontFamily: polySansFont }}>
                          {formatDate(referral.joinDate)}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={referral.status} 
                            color={getStatusColor(referral.status) as any}
                            size="small"
                            sx={{ fontFamily: polySansFont }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontFamily: polySansFont, fontWeight: 600 }}>
                          {referral.earnings.toFixed(2)} HBAR
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

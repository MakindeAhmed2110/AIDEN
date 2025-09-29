import type { Route } from "./+types/dashboard._index";
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Card, 
  CardContent, 
  Button,
  Grid,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Modal,
  Fade,
  Backdrop,
  TextField,
  Snackbar,
  Alert,
  Chip,
  Menu,
  MenuItem
} from '@mui/material';
import { Outlet } from 'react-router';
import { 
  Dashboard as DashboardIcon,
  Speed as BandwidthIcon,
  AccountBalanceWallet as WalletIcon,
  People as ReferralIcon,
  EmojiEvents as RewardsIcon,
  VolunteerActivism as CharityIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

// PolySans font family constant (using Neutral as requested)
const polySansFont = '"PolySans Neutral", "PolySans Median", "Styrene A Web", "Helvetica Neue", Sans-Serif';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - AIDEN" },
    { name: "description", content: "Your AIDEN dashboard" },
  ];
}

const drawerWidth = 240;

export default function DashboardLayout() {
  const { ready, authenticated, user, logout, login } = usePrivy();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (ready && !authenticated) {
      login();
    }
  }, [ready, authenticated, login]);

  if (!ready) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography sx={{ fontFamily: polySansFont }}>Loading...</Typography>
      </Box>
    );
  }

  if (!authenticated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography sx={{ fontFamily: polySansFont }}>Please sign in to access your dashboard...</Typography>
      </Box>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleShareModalOpen = () => {
    setShareModalOpen(true);
  };

  const handleShareModalClose = () => {
    setShareModalOpen(false);
  };

  const handleCopyLink = async () => {
    const referralLink = `https://aiden.app/invite/${user?.id || 'user'}`;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Updated menu items to match AIDEN design
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard/overview' },
    { text: 'Wallet', icon: <WalletIcon />, path: '/dashboard/wallets' },
    { text: 'Referral Program', icon: <ReferralIcon />, path: '/dashboard/referrals' },
    { text: 'Rewards', icon: <RewardsIcon />, path: '/dashboard/rewards' },
    { text: 'Charity', icon: <CharityIcon />, path: '/dashboard/charity' },
  ];

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      backgroundColor: '#ffffff',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Logo Section */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 700, 
          color: '#000000',
          fontFamily: polySansFont
        }}>
          AIDEN
        </Typography>
        <Chip 
          label="BETA" 
          size="small" 
          sx={{ 
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            fontFamily: polySansFont,
            fontSize: '0.7rem',
            height: '20px'
          }} 
        />
      </Box>

      {/* Navigation */}
      <List sx={{ px: 2, py: 2, flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: '8px',
                backgroundColor: location.pathname === item.path ? '#f3f4f6' : 'transparent',
                '&:hover': {
                  backgroundColor: '#f9fafb',
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path ? '#3b82f6' : '#6b7280',
                minWidth: '40px'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  color: location.pathname === item.path ? '#111827' : '#6b7280',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  fontFamily: polySansFont,
                  '& .MuiTypography-root': {
                    fontFamily: polySansFont
                  }
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Ambassador Program Card */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Card sx={{ 
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          borderRadius: '12px',
          border: 'none',
          boxShadow: 'none'
        }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              color: '#ffffff',
              fontFamily: polySansFont,
              fontSize: '1rem',
              mb: 1
            }}>
              Ambassador Program
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontFamily: polySansFont,
              fontSize: '0.8rem',
              mb: 2,
              lineHeight: 1.4
            }}>
              Earn your passive income by joining DePINed Ambassador Program.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: '#ffffff',
                color: '#3b82f6',
                fontWeight: 600,
                fontFamily: polySansFont,
                fontSize: '0.8rem',
                py: 1,
                '&:hover': {
                  backgroundColor: '#f9fafb',
                }
              }}
            >
              Join Now
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  const currentPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard/overview': return 'Dashboard';
      case '/dashboard/bandwidth': return 'Bandwidth Monitoring';
      case '/dashboard/wallets': return 'Wallet';
      case '/dashboard/referrals': return 'Referral Program';
      case '/dashboard/rewards': return 'Rewards';
      case '/dashboard/charity': return 'Charity';
      default: return 'Dashboard';
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb'
    }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          color: '#000000'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Home Icon and BETA tag */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
            <HomeIcon sx={{ color: '#6b7280' }} />
            <Chip 
              label="BETA" 
              size="small" 
              sx={{ 
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                fontFamily: polySansFont,
                fontSize: '0.7rem',
                height: '20px'
              }} 
            />
          </Box>
          
          <Typography variant="h6" sx={{ 
            flexGrow: 1, 
            fontWeight: 600,
            fontFamily: polySansFont,
            color: '#111827'
          }}>
            {currentPageTitle()}
          </Typography>

          {/* Header Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ 
              color: '#6b7280',
              fontFamily: polySansFont
            }}>
              Referrals: 0
            </Typography>
            
            <Button
              variant="outlined"
              size="small"
              onClick={handleShareModalOpen}
              sx={{
                borderColor: '#3b82f6',
                color: '#3b82f6',
                fontSize: '0.8rem',
                fontFamily: polySansFont,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#2563eb',
                  backgroundColor: 'rgba(59, 130, 246, 0.04)',
                }
              }}
            >
              Share with friends
            </Button>

            <Avatar sx={{ 
              bgcolor: '#3b82f6', 
              width: 32, 
              height: 32,
              fontSize: '0.9rem'
            }}>
              {user?.email?.address?.charAt(0).toUpperCase() || 'U'}
            </Avatar>

            <IconButton
              onClick={handleMenuOpen}
              sx={{
                color: '#6b7280',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e5e7eb',
            mt: 1,
            minWidth: 160,
          }
        }}
      >
        <MenuItem 
          onClick={() => {
            handleMenuClose();
            handleLogout();
          }}
          sx={{
            fontFamily: polySansFont,
            color: '#ef4444',
            '&:hover': {
              backgroundColor: 'rgba(239, 68, 68, 0.04)',
            }
          }}
        >
          <ListItemIcon sx={{ color: '#ef4444', minWidth: 36 }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8
        }}
      >
        <Outlet />
      </Box>

      {/* Share Modal */}
      <Modal
        open={shareModalOpen}
        onClose={handleShareModalClose}
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
        <Fade in={shareModalOpen}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '500px' },
              maxWidth: '90vw',
              bgcolor: 'background.paper',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              p: 0,
              outline: 'none'
            }}
          >
            {/* Modal Header */}
            <Box sx={{ 
              p: 3, 
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ShareIcon sx={{ fontSize: 28, color: '#3b82f6' }} />
                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  color: '#111827',
                  fontFamily: polySansFont
                }}>
                  Share AIDEN
                </Typography>
              </Box>
              <IconButton 
                onClick={handleShareModalClose}
                sx={{ 
                  color: '#6b7280',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Modal Content */}
            <Box sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ 
                color: '#6b7280', 
                mb: 3,
                fontFamily: polySansFont,
                lineHeight: 1.6
              }}>
                Share your referral link with friends and earn points when they join AIDEN. 
                Help them discover the power of DePIN!
              </Typography>

              {/* Referral Link */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ 
                  color: '#111827', 
                  mb: 1, 
                  fontWeight: 600,
                  fontFamily: polySansFont
                }}>
                  Your Referral Link:
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1,
                  alignItems: 'center'
                }}>
                  <TextField
                    fullWidth
                    value={`https://aiden.app/invite/${user?.id || 'user'}`}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      readOnly: true,
                      sx: {
                        fontFamily: polySansFont,
                        fontSize: '0.9rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#e5e7eb',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#d1d5db',
                        }
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleCopyLink}
                    startIcon={<CopyIcon />}
                    sx={{
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      borderRadius: '8px',
                      px: 2,
                      py: 1,
                      minWidth: 'auto',
                      fontFamily: polySansFont,
                      '&:hover': {
                        backgroundColor: '#2563eb',
                      }
                    }}
                  >
                    Copy
                  </Button>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'flex-end'
              }}>
                <Button
                  variant="outlined"
                  onClick={handleShareModalClose}
                  sx={{
                    borderColor: '#d1d5db',
                    color: '#6b7280',
                    borderRadius: '8px',
                    px: 3,
                    fontFamily: polySansFont,
                    '&:hover': {
                      borderColor: '#9ca3af',
                      color: '#374151',
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    }
                  }}
                >
                  Close
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCopyLink}
                  startIcon={<ShareIcon />}
                  sx={{
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    borderRadius: '8px',
                    px: 3,
                    fontFamily: polySansFont,
                    '&:hover': {
                      backgroundColor: '#2563eb',
                    }
                  }}
                >
                  Copy & Share
                </Button>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setCopySuccess(false)} 
          severity="success"
          sx={{ 
            borderRadius: '8px',
            fontFamily: polySansFont
          }}
        >
          Referral link copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
}
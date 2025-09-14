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
  Switch,
  FormControlLabel,
  Modal,
  Fade,
  Backdrop,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { Outlet } from 'react-router';
import { 
  Dashboard as DashboardIcon,
  AccountBalance as WalletIcon,
  Settings as SettingsIcon,
  VolunteerActivism as CharityIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  TrendingUp as TrendingIcon,
  SmartToy as AIIcon,
  WifiOff as WifiOffIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// PolySans font family constant
const polySansFont = '"PolySans Median", "PolySans Neutral", "Styrene A Web", "Helvetica Neue", Sans-Serif';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - AIDEN" },
    { name: "description", content: "Your AIDEN dashboard" },
  ];
}

const drawerWidth = 280;

export default function DashboardLayout() {
  const { ready, authenticated, user, logout, login } = usePrivy();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (ready && !authenticated) {
      login();
    }
  }, [ready, authenticated, login]);

  if (!ready) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!authenticated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Please sign in to access your dashboard...</Typography>
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

  const menuItems = [
    { text: 'Overview', icon: <DashboardIcon />, path: '/dashboard/overview' },
    { text: 'Wallets', icon: <WalletIcon />, path: '/dashboard/wallets' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/dashboard/settings' },
    { text: 'Charity', icon: <CharityIcon />, path: '/dashboard/charity' },
  ];

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      background: 'linear-gradient(135deg, #B088F0 0%, #A0E7E5 100%)',
      position: 'relative'
    }}>
      {/* Logo */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          color: '#000000',
          fontFamily: polySansFont
        }}>
          AIDEN
        </Typography>
      </Box>

      {/* Navigation */}
      <List sx={{ px: 2, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: '12px',
                backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                backdropFilter: location.pathname === item.path ? 'blur(10px)' : 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                }
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? '#000000' : '#000000' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  color: location.pathname === item.path ? '#000000' : '#000000',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  fontFamily: polySansFont
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Logout */}
      <Box sx={{ position: 'absolute', bottom: 20, left: 0, right: 0, px: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: '12px',
              '&:hover': {
                backgroundColor: 'rgba(220, 38, 38, 0.2)',
                backdropFilter: 'blur(10px)',
              }
            }}
          >
            <ListItemIcon sx={{ color: '#dc2626' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              sx={{ 
                color: '#dc2626', 
                fontWeight: 500,
                fontFamily: polySansFont
              }} 
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, rgba(176, 136, 240, 0.05) 0%, rgba(160, 231, 229, 0.05) 100%)'
    }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'linear-gradient(135deg, #B088F0 0%, #A0E7E5 100%)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          color: '#000000',
          backdropFilter: 'blur(10px)'
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
          
          <Typography variant="h6" sx={{ 
            flexGrow: 1, 
            fontWeight: 600,
            fontFamily: polySansFont
          }}>
            {location.pathname === '/dashboard/overview' ? 'Overview' :
             location.pathname === '/dashboard/wallets' ? 'Wallets' :
             location.pathname === '/dashboard/settings' ? 'Settings' :
             location.pathname === '/dashboard/charity' ? 'Charity' : 'Dashboard'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              size="small"
              sx={{
                borderColor: '#1e3a8a',
                color: '#1e3a8a',
                fontSize: '0.8rem',
                '&:hover': {
                  borderColor: '#1e40af',
                  backgroundColor: 'rgba(30, 58, 138, 0.04)',
                }
              }}
            >
              Grow your earnings
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleShareModalOpen}
              startIcon={<ShareIcon />}
              sx={{
                borderColor: '#1e3a8a',
                color: '#1e3a8a',
                fontSize: '0.8rem',
                '&:hover': {
                  borderColor: '#1e40af',
                  backgroundColor: 'rgba(30, 58, 138, 0.04)',
                }
              }}
            >
              SHARE WITH FRIENDS
            </Button>
            
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Light theme"
              sx={{ ml: 2 }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            <Typography variant="body2" sx={{ 
              color: '#666666',
              fontFamily: polySansFont
            }}>
              Hello, {user?.email?.address?.split('@')[0] || 'User'}!
            </Typography>
              <Avatar sx={{ bgcolor: '#1e3a8a', width: 32, height: 32 }}>
                {user?.email?.address?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
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
              borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              p: 0,
              outline: 'none',
              background: 'linear-gradient(135deg, rgba(176, 136, 240, 0.1) 0%, rgba(160, 231, 229, 0.1) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Modal Header */}
            <Box sx={{ 
              p: 3, 
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ShareIcon sx={{ fontSize: 28, color: '#1e3a8a' }} />
                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  color: '#000000',
                  fontFamily: polySansFont
                }}>
                  Share AIDEN
                </Typography>
              </Box>
              <IconButton 
                onClick={handleShareModalClose}
                sx={{ 
                  color: '#333333',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Modal Content */}
            <Box sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ 
                color: '#333333', 
                mb: 3,
                fontFamily: polySansFont,
                lineHeight: 1.6
              }}>
                Share your referral link with friends and earn rewards when they join AIDEN. 
                Help them discover the power of DePIN and AI empowerment!
              </Typography>

              {/* Referral Link */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ 
                  color: '#000000', 
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
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        borderRadius: '12px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(30, 58, 138, 0.2)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(30, 58, 138, 0.4)',
                        }
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleCopyLink}
                    startIcon={<CopyIcon />}
                    sx={{
                      backgroundColor: '#1e3a8a',
                      color: '#ffffff',
                      borderRadius: '12px',
                      px: 2,
                      py: 1,
                      minWidth: 'auto',
                      '&:hover': {
                        backgroundColor: '#1e40af',
                      }
                    }}
                  >
                    Copy
                  </Button>
                </Box>
              </Box>

              {/* Instructions */}
              <Box sx={{ 
                backgroundColor: 'rgba(30, 58, 138, 0.05)',
                borderRadius: '16px',
                p: 3,
                mb: 3
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: '#1e3a8a', 
                  mb: 2,
                  fontFamily: polySansFont
                }}>
                  How it works:
                </Typography>
                <Box component="ul" sx={{ 
                  pl: 2, 
                  m: 0,
                  '& li': {
                    color: '#333333',
                    fontFamily: polySansFont,
                    mb: 1,
                    lineHeight: 1.5
                  }
                }}>
                  <li>Share your unique referral link with friends</li>
                  <li>When they sign up using your link, you both earn rewards</li>
                  <li>Track your referrals and earnings in your dashboard</li>
                  <li>No limit on how many friends you can refer!</li>
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
                    borderColor: '#333333',
                    color: '#333333',
                    borderRadius: '12px',
                    px: 3,
                    '&:hover': {
                      borderColor: '#000000',
                      color: '#000000',
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
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
                    backgroundColor: '#1e3a8a',
                    color: '#ffffff',
                    borderRadius: '12px',
                    px: 3,
                    '&:hover': {
                      backgroundColor: '#1e40af',
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
            borderRadius: '12px',
            fontFamily: polySansFont
          }}
        >
          Referral link copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
}

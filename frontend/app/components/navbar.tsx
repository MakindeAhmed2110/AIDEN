import { AppBar, Button, Toolbar, Typography, Box, Container, IconButton, Menu, MenuItem, Avatar, Drawer, List, ListItem, ListItemButton, ListItemText, Divider } from '@mui/material';
import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

export default function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { ready, authenticated, user, logout, login } = usePrivy();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleLogin = () => {
    if (ready) {
      login();
    }
  };

  return (
    <AppBar 
      position='fixed' 
      elevation={0}
      sx={{ 
        backgroundImage: 'url(/hero.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: '#000000',
        boxShadow: 'none',
        zIndex: 1000,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          zIndex: 1
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Toolbar 
          sx={{ 
            py: { xs: 1, md: 2 },
            px: 0,
            minHeight: { xs: '60px', md: '80px' }
          }}
        >
         
                 {/* Logo Section */}
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img
              src="/logo.jpg"
              alt="AIDEN Logo"
              style={{
                width: '50px',
                height: '50px',
                objectFit: 'contain'
              }}
            />
            <Typography 
              variant="h3" 
              sx={{ 
                fontFamily: '"PolySans Neutral", "PolySans Median", "Styrene A Web", "Helvetica Neue", Sans-Serif',
                fontWeight: 600,
                color: '#000000',
                fontSize: { xs: '1.2rem', md: '2.0rem' },
                lineHeight: 1
              }}
            >
              AIDEN
            </Typography>
          </Box>
          
          {/* Desktop Navigation */}
          <Box sx={{ 
            ml: 'auto', 
            display: { xs: 'none', md: 'flex' }, 
            alignItems: 'center', 
            gap: 4 
          }}>
            {ready && authenticated ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant='outlined'
                  onClick={() => navigate('/dashboard/overview')}
                  sx={{
                    borderColor: '#3b82f6',
                    color: '#3b82f6',
                    borderRadius: '8px',
                    px: 3,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    fontFamily: '"PolySans Neutral", "PolySans Median", "Styrene A Web", "Helvetica Neue", Sans-Serif',
                    '&:hover': {
                      borderColor: '#2563eb',
                      backgroundColor: 'rgba(59, 130, 246, 0.04)',
                    }
                  }}
                >
                  Dashboard
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: '#3b82f6', width: 32, height: 32 }}>
                    {user?.email?.address?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                  <Button
                    variant='text'
                    onClick={handleLogout}
                    sx={{
                      color: '#666666',
                      fontSize: '0.9rem',
                      fontWeight: 400,
                      textTransform: 'none',
                      fontFamily: '"PolySans Neutral", "PolySans Median", "Styrene A Web", "Helvetica Neue", Sans-Serif',
                      '&:hover': { color: '#000000' }
                    }}
                  >
                    Logout
                  </Button>
                </Box>
              </Box>
            ) : (
              <Button
                variant='contained'
                onClick={handleLogin}
                sx={{
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  borderRadius: '8px',
                  px: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  fontFamily: '"PolySans Neutral", "PolySans Median", "Styrene A Web", "Helvetica Neue", Sans-Serif',
                  '&:hover': {
                    backgroundColor: '#2563eb',
                  }
                }}
              >
                Get Started
              </Button>
            )}
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            sx={{ 
              display: { xs: 'block', md: 'none' },
              ml: 'auto',
              color: '#000000'
            }}
            onClick={() => setMobileMenuOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>

        {/* Mobile Drawer */}
        <Drawer
          anchor="right"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: '280px',
              backgroundColor: '#ffffff',
              boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
            }
          }}
        >
          <Box sx={{ p: 3 }}>
            {/* Header with close button */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: '"PolySans Neutral", "PolySans Median", "Styrene A Web", "Helvetica Neue", Sans-Serif',
                  fontWeight: 600,
                  color: '#000000'
                }}
              >
                Menu
              </Typography>
              <IconButton 
                onClick={() => setMobileMenuOpen(false)}
                sx={{ color: '#666666' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* User info if authenticated */}
            {ready && authenticated && (
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#3b82f6', width: 40, height: 40 }}>
                    {user?.email?.address?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                  <Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        color: '#000000',
                        fontFamily: '"PolySans Neutral", "PolySans Median", "Styrene A Web", "Helvetica Neue", Sans-Serif'
                      }}
                    >
                      {user?.email?.address || 'User'}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#666666',
                        fontFamily: '"PolySans Neutral", "PolySans Median", "Styrene A Web", "Helvetica Neue", Sans-Serif'
                      }}
                    >
                      Connected
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Navigation items */}
            <List sx={{ p: 0 }}>
              {ready && authenticated ? (
                <>
                  <ListItem sx={{ p: 0, mb: 1 }}>
                    <ListItemButton
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/dashboard/overview');
                      }}
                      sx={{
                        borderRadius: '8px',
                        py: 1.5,
                        px: 2,
                        '&:hover': {
                          backgroundColor: '#f8fafc'
                        }
                      }}
                    >
                      <ListItemText 
                        primary="Dashboard"
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontSize: '1rem',
                            fontWeight: 500,
                            color: '#000000',
                            fontFamily: '"PolySans Neutral", "PolySans Median", "Styrene A Web", "Helvetica Neue", Sans-Serif'
                          }
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <ListItem sx={{ p: 0 }}>
                    <ListItemButton
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      sx={{
                        borderRadius: '8px',
                        py: 1.5,
                        px: 2,
                        '&:hover': {
                          backgroundColor: '#fef2f2'
                        }
                      }}
                    >
                      <ListItemText 
                        primary="Logout"
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontSize: '1rem',
                            fontWeight: 500,
                            color: '#dc2626',
                            fontFamily: '"PolySans Neutral", "PolySans Median", "Styrene A Web", "Helvetica Neue", Sans-Serif'
                          }
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                </>
              ) : (
                <ListItem sx={{ p: 0 }}>
                  <ListItemButton
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogin();
                    }}
                    sx={{
                      borderRadius: '8px',
                      py: 1.5,
                      px: 2,
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#2563eb'
                      }
                    }}
                  >
                    <ListItemText 
                      primary="Get Started"
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '1rem',
                          fontWeight: 500,
                          color: '#ffffff',
                          fontFamily: '"PolySans Neutral", "PolySans Median", "Styrene A Web", "Helvetica Neue", Sans-Serif'
                        }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              )}
            </List>
          </Box>
        </Drawer>
      </Container>
    </AppBar>
  )
}
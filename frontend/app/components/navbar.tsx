import { AppBar, Button, Toolbar, Typography, Box, Container, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router';
import MenuIcon from '@mui/icons-material/Menu';

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
        background: 'linear-gradient(135deg, #B088F0 0%, #A0E7E5 100%)',
        color: '#000000',
        boxShadow: 'none',
        zIndex: 1000
      }}
    >
      <Container maxWidth="lg">
        <Toolbar 
          sx={{ 
            py: { xs: 1, md: 2 },
            px: 0,
            minHeight: { xs: '60px', md: '80px' }
          }}
        >
          {/* Logo Section */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700,
                color: '#000000',
                fontSize: { xs: '1.8rem', md: '2.5rem' },
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
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#666666',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 400,
                '&:hover': { color: '#000000' }
              }}
            >
              Careers
            </Typography>
            
            {ready && authenticated ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant='outlined'
                  onClick={() => navigate('/dashboard/overview')}
                  sx={{
                    borderColor: '#000000',
                    color: '#000000',
                    borderRadius: '8px',
                    px: 3,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#333333',
                      backgroundColor: 'rgba(0,0,0,0.04)',
                    }
                  }}
                >
                  Dashboard
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: '#000000', width: 32, height: 32 }}>
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
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  borderRadius: '8px',
                  px: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#333333',
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

        {/* Mobile Menu */}
        <Menu
          anchorEl={null}
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiPaper-root': {
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              borderRadius: '12px',
              mt: 1,
              minWidth: '200px'
            }
          }}
        >
          <MenuItem 
            onClick={() => setMobileMenuOpen(false)}
            sx={{ 
              fontSize: '1rem',
              fontWeight: 500,
              color: '#666666',
              '&:hover': { color: '#000000' }
            }}
          >
            Careers
          </MenuItem>
          {ready && authenticated ? (
            <>
              <MenuItem 
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard/overview');
                }}
                sx={{ 
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: '#000000'
                }}
              >
                Dashboard
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                sx={{ 
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: '#666666'
                }}
              >
                Logout
              </MenuItem>
            </>
          ) : (
            <MenuItem 
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogin();
              }}
              sx={{ 
                fontSize: '1rem',
                fontWeight: 500,
                color: '#000000'
              }}
            >
              Get Started
            </MenuItem>
          )}
        </Menu>
      </Container>
    </AppBar>
  )
}
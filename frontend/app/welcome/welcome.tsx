import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";
import { Box, Typography, Button, Container, Grid } from "@mui/material";
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router';
import WhatWeDoSection from "../components/WhatWeDoSection";
import ImpactSection from "../components/ImpactSection";

export function Welcome() {
  const { ready, authenticated, login } = usePrivy();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (ready && authenticated) {
      navigate('/dashboard/overview');
    } else if (ready) {
      login();
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: { xs: 'calc(100vh - 80px)', md: '100vh' },
          backgroundImage: 'url(/hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: 2, md: 0 },
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
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, px: { xs: 2, md: 3 } }}>
          <Grid container spacing={{ xs: 2, md: 8 }} alignItems="center" sx={{ minHeight: { xs: 'auto', md: '80vh' } }}>
            {/* Left Side - Text Content */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ maxWidth: '600px', pr: { md: 4 }, textAlign: { xs: 'center', md: 'left' } }}>
                {/* Main Headline */}
                <Typography
                  variant="h1"
                  sx={{
                    fontFamily: '"PolySans Neutral", "PolySans Median", "Styrene A Web", "Helvetica Neue", Sans-Serif',
                    fontWeight: 700,
                    color: '#000000',
                    mb: 4,
                    lineHeight: 1.1,
                    fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.8rem' },
                    letterSpacing: '-0.02em'
                  }}
                >
                  Decentralizing Power, Empowering Communities
                </Typography>

                {/* Body Paragraph */}
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: '"PolySans Neutral", "PolySans Median", "Styrene A Web", "Helvetica Neue", Sans-Serif',
                    color: '#000000',
                    mb: { xs: 4, md: 6 },
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    lineHeight: 1.6,
                    maxWidth: '520px',
                    fontWeight: 400,
                    mx: { xs: 'auto', md: 0 }
                  }}
                >
                  Get rewarded for your unused internet, and computer resources by powering the AI revolution.
                </Typography>

                {/* Call-to-Action Buttons */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: { xs: 2, md: 4 }, 
                  alignItems: 'center', 
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'center', md: 'flex-start' }
                }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGetStarted}
                    sx={{
                      fontFamily: '"PolySans Neutral", "PolySans Median", "Styrene A Web", "Helvetica Neue", Sans-Serif',
                      px: { xs: 3, md: 4 },
                      py: 2,
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      fontWeight: 500,
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      borderRadius: '8px',
                      '&:hover': {
                        backgroundColor: '#333333',
                      }
                    }}
                  >
                    {ready && authenticated ? 'Go to Dashboard' : 'Start earning now (~ 30s)'}
                  </Button>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontFamily: '"PolySans Neutral", "PolySans Median", "Styrene A Web", "Helvetica Neue", Sans-Serif',
                      fontWeight: 500,
                      color: '#000000',
                      cursor: 'pointer',
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      '&:hover': {
                        color: '#666666'
                      }
                    }}
                  >
                    Learn more about DePIN →
                  </Typography>
                </Box>

                {/* Social Proof Section */}
                <Box sx={{ 
                  mt: 4, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  justifyContent: { xs: 'center', md: 'flex-start' }
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: -1,
                    '& > div': {
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: '2px solid #ffffff',
                      backgroundColor: '#e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#666666'
                    }
                  }}>
                    <Box>👤</Box>
                    <Box sx={{ ml: -1 }}>👤</Box>
                    <Box sx={{ ml: -1 }}>👤</Box>
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: '"PolySans Neutral", "PolySans Median", "Styrene A Web", "Helvetica Neue", Sans-Serif',
                      fontWeight: 500,
                      color: '#666666',
                      fontSize: { xs: '0.8rem', md: '0.9rem' }
                    }}
                  >
                    100k+ users around the world
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Right Side - Hero Image */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: { xs: 'auto', md: '700px' },
                  position: 'relative',
                  py: { xs: 2, md: 0 }
                }}
              >
                {/* Hero Image */}
                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 3,
                    maxWidth: { xs: '280px', md: '500px' },
                    width: '100%',
                    mb: { xs: 2, md: 4 }
                  }}
                >
                  <img
                    src="/hero.jpg"
                    alt="AIDEN DePIN Network"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: { xs: '300px', md: '500px' },
                      objectFit: 'contain',
                      borderRadius: '12px'
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* What We Do Section */}
      <WhatWeDoSection />

      {/* Impact Section */}
      <ImpactSection />
    </Box>
  )
}
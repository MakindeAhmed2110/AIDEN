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
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #B088F0 0%, #A0E7E5 100%)',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          pt: 0
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, px: { xs: 2, md: 3 } }}>
          <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center" sx={{ minHeight: { xs: '70vh', md: '80vh' } }}>
            {/* Left Side - Text Content */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ maxWidth: '600px', pr: { md: 4 }, textAlign: { xs: 'center', md: 'left' } }}>
                {/* Main Headline */}
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 700,
                    color: '#000000',
                    mb: 4,
                    lineHeight: 1.1,
                    fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.8rem' },
                    letterSpacing: '-0.02em'
                  }}
                >
                  Where DePIN meets
                  AI empowerment!
                </Typography>

                {/* Body Paragraph */}
                <Typography
                  variant="body1"
                  sx={{
                    color: '#000000',
                    mb: 6,
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    lineHeight: 1.6,
                    maxWidth: '520px',
                    fontWeight: 400,
                    mx: { xs: 'auto', md: 0 }
                  }}
                >
                  We're a revolutionary DePIN platform that turns your idle device resources into 
                  passive income, automated savings, and charitable impact. From AI-powered resource 
                  optimization to transparent on-chain charity distribution, AIDEN delivers smart, 
                  user-friendly solutions that empower everyone—from tech enthusiasts to impact investors.
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
                    {ready && authenticated ? 'Go to Dashboard' : 'Get Started'}
                  </Button>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 500,
                      color: '#000000',
                      cursor: 'pointer',
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      '&:hover': {
                        color: '#666666'
                      }
                    }}
                  >
                    Explore our platform →
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Right Side - Illustrations */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: { xs: '400px', md: '700px' },
                  position: 'relative'
                }}
              >
                {/* Main Illustration - first.png */}
                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 3,
                    maxWidth: { xs: '300px', md: '500px' },
                    width: '100%'
                  }}
                >
                  <img
                    src="/illustrations/first.png"
                    alt="AIDEN DePIN Network"
                    style={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'contain'
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
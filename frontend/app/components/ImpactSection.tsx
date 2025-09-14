import { Box, Typography, Container, Grid, Card, CardContent, Chip } from "@mui/material";
import { 
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  Verified as EcoIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const impactStats = [
  {
    icon: <TrendingIcon sx={{ fontSize: 40, color: '#1e3a8a' }} />,
    value: "70%",
    label: "Earnings to Personal Savings",
    description: "Automatically deposited into high-yield vaults, withdrawable at any time"
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 40, color: '#1e3a8a' }} />,
    value: "30%",
    label: "Charity Impact",
    description: "Transparent donations to community projects"
  },
  {
    icon: <EcoIcon sx={{ fontSize: 40, color: '#1e3a8a' }} />,
    value: "100%",
    label: "On-Chain Transparency",
    description: "Every transaction verified on Hedera"
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 40, color: '#1e3a8a' }} />,
    value: "AI-Powered",
    label: "Resource Optimization",
    description: "Smart matching maximizes your returns"
  }
];

const benefits = [
  {
    title: "Passive Income Generation",
    description: "Turn your idle device resources into continuous $HBAR earnings without active management.",
    features: ["24/7 Resource Sharing", "Automatic Task Assignment", "Real-time Earnings Tracking"]
  },
  {
    title: "Automated Wealth Building",
    description: "Your earnings are automatically split and invested, building your savings while you sleep.",
    features: ["High-Yield Savings Vault", "Instant Withdrawals Anytime", "Compound Interest Growth"]
  },
  {
    title: "Social Impact Made Easy",
    description: "Contribute to meaningful causes through transparent, automated charitable giving.",
    features: ["Transparent Donations", "Impact Tracking", "Community Development"]
  }
];

export default function ImpactSection() {
  return (
    <Box
      sx={{
        backgroundColor: '#f8fafc',
        py: 12,
        position: 'relative'
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: '#000000',
              mb: 3,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' }
            }}
          >
            Your Impact, Amplified
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#666666',
              fontSize: { xs: '1rem', md: '1.2rem' },
              maxWidth: '700px',
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            AIDEN transforms your device's idle resources into a powerful force for personal wealth 
            and social good, all managed automatically through AI and blockchain technology.
          </Typography>
        </Box>

        {/* Impact Stats */}
        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: { xs: 8, md: 10 } }}>
          {impactStats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card
                sx={{
                  height: '100%',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    transition: 'all 0.3s ease-in-out'
                  }
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {stat.icon}
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: '#1e3a8a',
                      mb: 1,
                      fontSize: { xs: '2rem', md: '2.5rem' }
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: '#000000',
                      mb: 1,
                      fontSize: { xs: '1rem', md: '1.1rem' }
                    }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#666666',
                      fontSize: { xs: '0.8rem', md: '0.9rem' }
                    }}
                  >
                    {stat.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Benefits Section */}
        <Box sx={{ mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#000000',
              mb: { xs: 4, md: 6 },
              textAlign: 'center',
              fontSize: { xs: '1.8rem', md: '2.5rem' }
            }}
          >
            Why Choose AIDEN?
          </Typography>
          
          <Grid container spacing={{ xs: 4, md: 6 }}>
            {benefits.map((benefit, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    border: 'none',
                    boxShadow: 'none',
                    backgroundColor: 'transparent',
                    p: 3
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: '#000000',
                        mb: 2,
                        fontSize: { xs: '1.2rem', md: '1.4rem' }
                      }}
                    >
                      {benefit.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#666666',
                        mb: 3,
                        lineHeight: 1.6,
                        fontSize: { xs: '0.9rem', md: '1rem' }
                      }}
                    >
                      {benefit.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {benefit.features.map((feature, featureIndex) => (
                        <Box key={featureIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: '#1e3a8a'
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#000000',
                              fontSize: { xs: '0.8rem', md: '0.9rem' },
                              fontWeight: 500
                            }}
                          >
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Call to Action */}
        <Box
          sx={{
            backgroundColor: '#1e3a8a',
            borderRadius: '20px',
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            color: '#ffffff'
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: '1.5rem', md: '2.2rem' }
            }}
          >
            Ready to Transform Your Idle Resources?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              fontSize: { xs: '1rem', md: '1.1rem' },
              opacity: 0.9,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Join thousands of users already earning passive income while making a positive impact 
            on their communities through AIDEN's revolutionary DePIN platform.
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, md: 2 }, 
            justifyContent: 'center', 
            flexWrap: 'wrap' 
          }}>
            <Chip
              label="Start Earning Today"
              sx={{
                backgroundColor: '#ffffff',
                color: '#1e3a8a',
                fontWeight: 600,
                px: { xs: 1.5, md: 2 },
                py: 1,
                fontSize: { xs: '0.8rem', md: '1rem' }
              }}
            />
            <Chip
              label="No Setup Fees"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                fontWeight: 500,
                px: { xs: 1.5, md: 2 },
                py: 1,
                fontSize: { xs: '0.8rem', md: '1rem' }
              }}
            />
            <Chip
              label="Transparent Impact"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                fontWeight: 500,
                px: { xs: 1.5, md: 2 },
                py: 1,
                fontSize: { xs: '0.8rem', md: '1rem' }
              }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

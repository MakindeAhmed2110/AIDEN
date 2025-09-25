import type { Route } from "./+types/dashboard.charity";
import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Grid,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  VolunteerActivism as CharityIcon,
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  ContentCopy as CopyIcon,
  OpenInNew as ExternalLinkIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  AccountBalance as VaultIcon,
  CheckCircle as CheckCircleIcon,
  LocalHospital as HealthIcon,
  Home as HomeIcon,
  Restaurant as FoodIcon,
  School as EducationIcon,
  Work as WorkIcon,
  Water as WaterIcon,
  Wifi as ConnectivityIcon
} from '@mui/icons-material';

// PolySans font family constant (using Neutral as requested)
const polySansFont = '"PolySans Neutral", "PolySans Median", "Styrene A Web", "Helvetica Neue", Sans-Serif';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Charity - AIDEN Dashboard" },
    { name: "description", content: "Track your charitable impact" },
  ];
}

export default function Charity() {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Hedera Vault Information
  const vaultAddress = "0.0.6858706";
  const vaultUrl = `https://hashscan.io/testnet/contract/${vaultAddress}/abi`;

  const charityStats = [
    {
      icon: <TrendingIcon sx={{ fontSize: 40, color: '#3b82f6' }} />,
      title: "Total Donated",
      value: "2,450.75 HBAR",
      description: "Lifetime charitable contributions",
      gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)"
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40, color: '#10b981' }} />,
      title: "Lives Impacted",
      value: "1,250",
      description: "People helped through donations",
      gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)"
    },
    {
      icon: <SchoolIcon sx={{ fontSize: 40, color: '#8b5cf6' }} />,
      title: "Projects Funded",
      value: "15",
      description: "Community development projects",
      gradient: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)"
    }
  ];

  const projects = [
    {
      name: "Homeless Children Support",
      progress: 75,
      amount: "1,200 HBAR",
      description: "Providing meals and shelter for homeless children"
    },
    {
      name: "Road Renovation Project",
      progress: 45,
      amount: "800 HBAR",
      description: "Improving local infrastructure and roads"
    },
    {
      name: "Community Development",
      progress: 90,
      amount: "450.75 HBAR",
      description: "Building community centers and facilities"
    }
  ];

  const charitySolutions = [
    {
      category: "Healthcare & Medical Support",
      icon: <HealthIcon sx={{ color: '#e53e3e' }} />,
      solutions: [
        "Medical equipment for rural clinics",
        "Emergency healthcare funding",
        "Mental health support programs",
        "Vaccination campaigns",
        "Mobile health units"
      ]
    },
    {
      category: "Housing & Shelter",
      icon: <HomeIcon sx={{ color: '#38a169' }} />,
      solutions: [
        "Emergency housing for families",
        "Homeless shelter improvements",
        "Affordable housing projects",
        "Disaster relief housing",
        "Senior living facilities"
      ]
    },
    {
      category: "Food Security",
      icon: <FoodIcon sx={{ color: '#d69e2e' }} />,
      solutions: [
        "Community food banks",
        "School meal programs",
        "Nutrition education",
        "Urban farming initiatives",
        "Emergency food distribution"
      ]
    },
    {
      category: "Education & Learning",
      icon: <EducationIcon sx={{ color: '#3182ce' }} />,
      solutions: [
        "School infrastructure improvements",
        "Educational technology access",
        "Scholarship programs",
        "Adult literacy classes",
        "STEM education initiatives"
      ]
    },
    {
      category: "Employment & Skills",
      icon: <WorkIcon sx={{ color: '#805ad5' }} />,
      solutions: [
        "Job training programs",
        "Small business grants",
        "Entrepreneurship workshops",
        "Skills development courses",
        "Employment placement services"
      ]
    },
    {
      category: "Clean Water & Sanitation",
      icon: <WaterIcon sx={{ color: '#00b5d8' }} />,
      solutions: [
        "Water well installations",
        "Water purification systems",
        "Sanitation facilities",
        "Hygiene education programs",
        "Water conservation projects"
      ]
    },
    {
      category: "Digital Connectivity",
      icon: <ConnectivityIcon sx={{ color: '#38b2ac' }} />,
      solutions: [
        "Internet access for underserved areas",
        "Digital literacy training",
        "Computer lab setups",
        "Online education platforms",
        "Telemedicine connectivity"
      ]
    }
  ];

  const handleCopyVaultAddress = () => {
    navigator.clipboard.writeText(vaultAddress);
    setSnackbar({ open: true, message: 'Vault address copied to clipboard!', severity: 'success' });
  };

  const handleOpenVaultExplorer = () => {
    window.open(vaultUrl, '_blank');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          color: '#000000', 
          mb: 2,
          fontFamily: polySansFont
        }}>
          Charity Impact
        </Typography>
        <Typography variant="body1" sx={{ 
          color: '#666666',
          fontFamily: polySansFont
        }}>
          Track your charitable contributions and see the positive impact you're making in the community.
        </Typography>
      </Box>

      {/* Hedera Vault Transparency Section */}
      <Card sx={{ 
        mb: 4,
        border: 'none', 
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
        backdropFilter: 'blur(10px)',
        '&:hover': {
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          transition: 'all 0.3s ease-in-out'
        }
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ 
              p: 2, 
              borderRadius: '12px', 
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              mr: 2 
            }}>
              <VaultIcon sx={{ fontSize: 40, color: '#3b82f6' }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', fontFamily: polySansFont }}>
                Hedera Charity Vault
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', fontFamily: polySansFont }}>
                Transparent and decentralized charity fund management
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ 
            p: 3, 
            backgroundColor: 'rgba(255, 255, 255, 0.8)', 
            borderRadius: '16px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', fontFamily: polySansFont }}>
                Vault Address
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Copy address">
                  <IconButton 
                    onClick={handleCopyVaultAddress} 
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.2)' }
                    }}
                  >
                    <CopyIcon sx={{ color: '#3b82f6' }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="View on Hashscan">
                  <IconButton 
                    onClick={handleOpenVaultExplorer} 
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.2)' }
                    }}
                  >
                    <ExternalLinkIcon sx={{ color: '#10b981' }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Typography variant="body1" sx={{ 
              fontFamily: 'monospace', 
              backgroundColor: 'rgba(0,0,0,0.05)', 
              p: 2, 
              borderRadius: '12px',
              color: '#111827',
              fontWeight: 600,
              border: '1px solid rgba(0,0,0,0.1)'
            }}>
              {vaultAddress}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 1 }}>
              <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: '#6b7280', fontFamily: polySansFont }}>
                Verified smart contract on Hedera Testnet
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {charityStats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Card sx={{ 
              height: '100%', 
              border: 'none', 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              borderRadius: '16px',
              background: stat.gradient,
              backdropFilter: 'blur(10px)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.3s ease-in-out'
              }
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ 
                  mb: 2,
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {stat.icon}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 1, fontFamily: polySansFont }}>
                  {stat.value}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', mb: 1, fontFamily: polySansFont }}>
                  {stat.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', fontFamily: polySansFont }}>
                  {stat.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charity Solutions Section */}
      <Card sx={{ 
        mb: 4,
        border: 'none', 
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
        backdropFilter: 'blur(10px)',
        '&:hover': {
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          transition: 'all 0.3s ease-in-out'
        }
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ 
              p: 2, 
              borderRadius: '12px', 
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              mr: 2 
            }}>
              <SecurityIcon sx={{ fontSize: 40, color: '#8b5cf6' }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', fontFamily: polySansFont }}>
                Charity Solutions
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', fontFamily: polySansFont }}>
                Comprehensive solutions addressing critical community needs
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {charitySolutions.map((category, index) => (
              <Accordion key={index} sx={{ 
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '16px !important',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                '&:before': { display: 'none' },
                '&.Mui-expanded': {
                  margin: '0 0 8px 0'
                },
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease-in-out'
                }
              }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: '#8b5cf6' }} />}
                  sx={{ 
                    backgroundColor: 'transparent',
                    borderRadius: '16px',
                    '&.Mui-expanded': {
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: '8px', 
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {category.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', fontFamily: polySansFont }}>
                      {category.category}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                  <List sx={{ p: 0 }}>
                    {category.solutions.map((solution, solutionIndex) => (
                      <ListItem key={solutionIndex} sx={{ px: 0, py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={solution}
                          primaryTypographyProps={{
                            fontFamily: polySansFont,
                            color: '#666666'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Active Projects */}
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 3, fontFamily: polySansFont }}>
        Active Projects
      </Typography>
      <Grid container spacing={3}>
        {projects.map((project, index) => (
          <Grid size={{ xs: 12, md: 6 }} key={index}>
            <Card sx={{ 
              border: 'none', 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.3s ease-in-out'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '12px', 
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    mr: 2 
                  }}>
                    <CharityIcon sx={{ fontSize: 32, color: '#10b981' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', fontFamily: polySansFont }}>
                      {project.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', fontFamily: polySansFont }}>
                      {project.amount} donated
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 2, fontFamily: polySansFont }}>
                  {project.description}
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#6b7280', fontFamily: polySansFont }}>
                      Progress
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600, fontFamily: polySansFont }}>
                      {project.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={project.progress} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#10b981',
                        borderRadius: 8
                      }
                    }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ fontFamily: polySansFont }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

import type { Route } from "./+types/dashboard.charity";
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Grid,
  LinearProgress
} from '@mui/material';
import { 
  VolunteerActivism as CharityIcon,
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  School as SchoolIcon
} from '@mui/icons-material';

// PolySans font family constant
const polySansFont = '"PolySans Median", "PolySans Neutral", "Styrene A Web", "Helvetica Neue", Sans-Serif';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Charity - AIDEN Dashboard" },
    { name: "description", content: "Track your charitable impact" },
  ];
}

export default function Charity() {
  const charityStats = [
    {
      icon: <TrendingIcon sx={{ fontSize: 40, color: '#1e3a8a' }} />,
      title: "Total Donated",
      value: "2,450.75 HBAR",
      description: "Lifetime charitable contributions"
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40, color: '#1e3a8a' }} />,
      title: "Lives Impacted",
      value: "1,250",
      description: "People helped through donations"
    },
    {
      icon: <SchoolIcon sx={{ fontSize: 40, color: '#1e3a8a' }} />,
      title: "Projects Funded",
      value: "15",
      description: "Community development projects"
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

  return (
    <Box>
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

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {charityStats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Card sx={{ 
              height: '100%', 
              border: 'none', 
              boxShadow: '0 4px 20px rgba(176, 136, 240, 0.15)',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(176, 136, 240, 0.08) 0%, rgba(160, 231, 229, 0.08) 100%)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 30px rgba(176, 136, 240, 0.25)',
                transition: 'all 0.3s ease-in-out'
              }
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000', mb: 1 }}>
                  {stat.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  {stat.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Active Projects */}
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#000000', mb: 3 }}>
        Active Projects
      </Typography>
      <Grid container spacing={3}>
        {projects.map((project, index) => (
          <Grid size={{ xs: 12, md: 6 }} key={index}>
            <Card sx={{ 
              border: 'none', 
              boxShadow: '0 4px 20px rgba(176, 136, 240, 0.15)',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(176, 136, 240, 0.08) 0%, rgba(160, 231, 229, 0.08) 100%)',
              backdropFilter: 'blur(10px)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CharityIcon sx={{ fontSize: 32, color: '#1e3a8a', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000' }}>
                      {project.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666666' }}>
                      {project.amount} donated
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: '#666666', mb: 2 }}>
                  {project.description}
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#666666', mb: 1 }}>
                    Progress: {project.progress}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={project.progress} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'rgba(30, 58, 138, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#1e3a8a'
                      }
                    }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

import type { Route } from "./+types/dashboard.settings";
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Grid,
  Switch,
  FormControlLabel,
  TextField
} from '@mui/material';
import { 
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import { usePrivy } from '@privy-io/react-auth';

// PolySans font family constant
const polySansFont = '"PolySans Median", "PolySans Neutral", "Styrene A Web", "Helvetica Neue", Sans-Serif';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Settings - AIDEN Dashboard" },
    { name: "description", content: "AIDEN application settings" },
  ];
}

export default function Settings() {
  const { user } = usePrivy();

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          color: '#000000', 
          mb: 2,
          fontFamily: polySansFont
        }}>
          Settings
        </Typography>
        <Typography variant="body1" sx={{ 
          color: '#666666',
          fontFamily: polySansFont
        }}>
          Manage your AIDEN application preferences and account settings.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ 
            border: 'none', 
            boxShadow: '0 4px 20px rgba(176, 136, 240, 0.15)',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(176, 136, 240, 0.08) 0%, rgba(160, 231, 229, 0.08) 100%)',
            backdropFilter: 'blur(10px)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <NotificationsIcon sx={{ fontSize: 40, color: '#1e3a8a', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000' }}>
                  Notifications
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Email notifications"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Earnings updates"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Marketing emails"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ 
            border: 'none', 
            boxShadow: '0 4px 20px rgba(176, 136, 240, 0.15)',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(176, 136, 240, 0.08) 0%, rgba(160, 231, 229, 0.08) 100%)',
            backdropFilter: 'blur(10px)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SecurityIcon sx={{ fontSize: 40, color: '#1e3a8a', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000' }}>
                  Security
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Email Address"
                  value={user?.email?.address || ''}
                  disabled
                  fullWidth
                />
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: '#1e3a8a',
                    color: '#1e3a8a',
                    '&:hover': {
                      borderColor: '#1e40af',
                      backgroundColor: 'rgba(30, 58, 138, 0.04)',
                    }
                  }}
                >
                  Change Password
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card sx={{ 
            border: 'none', 
            boxShadow: '0 4px 20px rgba(176, 136, 240, 0.15)',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(176, 136, 240, 0.08) 0%, rgba(160, 231, 229, 0.08) 100%)',
            backdropFilter: 'blur(10px)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PaletteIcon sx={{ fontSize: 40, color: '#1e3a8a', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000' }}>
                  Appearance
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body1">Theme:</Typography>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Light theme"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

import type { Route } from "./+types/dashboard.wallets";
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Grid
} from '@mui/material';
import { 
  AccountBalance as WalletIcon,
  TrendingUp as TrendingIcon,
  Send as SendIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';

// PolySans font family constant
const polySansFont = '"PolySans Median", "PolySans Neutral", "Styrene A Web", "Helvetica Neue", Sans-Serif';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Wallets - AIDEN Dashboard" },
    { name: "description", content: "Manage your AIDEN wallets" },
  ];
}

export default function Wallets() {
  const wallets = [
    {
      name: "Primary Wallet",
      address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      balance: "1,250.50 HBAR",
      type: "Hedera"
    },
    {
      name: "Savings Wallet",
      address: "0x8f2e2d8c9b3a4f5e6d7c8b9a0f1e2d3c4b5a6f7",
      balance: "5,750.25 HBAR",
      type: "Hedera"
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
          Wallets
        </Typography>
        <Typography variant="body1" sx={{ 
          color: '#666666',
          fontFamily: polySansFont
        }}>
          Manage your cryptocurrency wallets and view balances.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {wallets.map((wallet, index) => (
          <Grid size={{ xs: 12, md: 6 }} key={index}>
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
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WalletIcon sx={{ fontSize: 40, color: '#1e3a8a', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000' }}>
                      {wallet.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666666' }}>
                      {wallet.type}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 2 }}>
                  {wallet.balance}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666666', mb: 3, wordBreak: 'break-all' }}>
                  {wallet.address}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SendIcon />}
                    sx={{
                      borderColor: '#1e3a8a',
                      color: '#1e3a8a',
                      '&:hover': {
                        borderColor: '#1e40af',
                        backgroundColor: 'rgba(30, 58, 138, 0.04)',
                      }
                    }}
                  >
                    Send
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ReceiptIcon />}
                    sx={{
                      borderColor: '#1e3a8a',
                      color: '#1e3a8a',
                      '&:hover': {
                        borderColor: '#1e40af',
                        backgroundColor: 'rgba(30, 58, 138, 0.04)',
                      }
                    }}
                  >
                    History
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

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

export default function Wallet() {
  return (
    <Box>
       <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          color: '#000000', 
          mb: 2,
          fontFamily: polySansFont}}>
            Your Wallet : 
          </Typography>
    </Box>
  );

}
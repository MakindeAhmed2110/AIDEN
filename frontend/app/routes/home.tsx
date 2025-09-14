import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

import Footer from '../components/footer';
import CssBaseline from '@mui/material/CssBaseline';
import NavBar from '../components/navbar';
import { Box, ThemeProvider } from '@mui/material';
import { theme } from '../theme';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
   <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: 'background.default'
        }}
      >
        <header>
          <NavBar />
        </header>
        <Box
          flex={1}
          sx={{ p: 0, mt: { xs: '60px', md: '80px' } }}
        >
          <Welcome />
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  );
}

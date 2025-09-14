import { Box, Typography, Container } from '@mui/material';


export default function Footer() {
  return (
    <Box
      sx={{
        backgroundColor: 'rgba(0,0,0,0.05)',
        py: 4,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.9rem'
            }}
          >
            © 2025 AIDEN GROUP. Empowering the future through DePIN and AI.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
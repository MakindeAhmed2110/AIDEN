import { createTheme } from "@mui/material";

export const theme = createTheme({
  typography: {
    fontFamily: '"PolySans Neutral", "PolySans Median", "Styrene A Web", "Helvetica Neue", Sans-Serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      lineHeight: 1.1,
      fontFamily: '"PolySans Median", "PolySans Neutral", "Styrene A Web", "Helvetica Neue", Sans-Serif',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      fontFamily: '"PolySans Median", "PolySans Neutral", "Styrene A Web", "Helvetica Neue", Sans-Serif',
    },
    h3: {
      fontFamily: '"PolySans Median", "PolySans Neutral", "Styrene A Web", "Helvetica Neue", Sans-Serif',
    },
    h4: {
      fontFamily: '"PolySans Median", "PolySans Neutral", "Styrene A Web", "Helvetica Neue", Sans-Serif',
    },
    h5: {
      fontFamily: '"PolySans Median", "PolySans Neutral", "Styrene A Web", "Helvetica Neue", Sans-Serif',
    },
    h6: {
      fontFamily: '"PolySans Median", "PolySans Neutral", "Styrene A Web", "Helvetica Neue", Sans-Serif',
    },
    body1: {
      fontSize: '1.1rem',
      lineHeight: 1.6,
      fontFamily: '"PolySans Neutral", "PolySans Median", "Styrene A Web", "Helvetica Neue", Sans-Serif',
    },
    body2: {
      fontFamily: '"PolySans Neutral", "PolySans Median", "Styrene A Web", "Helvetica Neue", Sans-Serif',
    },
    button: {
      fontFamily: '"PolySans Median", "PolySans Neutral", "Styrene A Web", "Helvetica Neue", Sans-Serif',
    }
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#B088F0', // Light purple from gradient
    },
    background: {
      default: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          padding: '12px 24px',
        },
        contained: {
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333',
          },
        },
        outlined: {
          borderColor: '#000000',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#f5f5f5',
            borderColor: '#000000',
          },
        },
      },
    },
  },
});
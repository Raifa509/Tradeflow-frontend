'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-poppins)',
    fontSize: 14,
  },
   palette: {
    mode: 'dark', 
  },
   components: {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '13px',
        },
      },
    },
  },
  shape: {
    borderRadius: 15, 
  },
});

export default theme;

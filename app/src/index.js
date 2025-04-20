import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Безопасная инициализация Telegram WebApp
if (window.Telegram && window.Telegram.WebApp) {
  try {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
    console.log('Telegram WebApp API инициализирован успешно');
  } catch (error) {
    console.warn('Ошибка при инициализации Telegram WebApp:', error);
  }
} else {
  console.warn('Telegram WebApp API не обнаружен. Работаем в режиме отладки.');
}

// Определяем тему на основе темы Telegram или системной
const isDarkMode = window.Telegram?.WebApp?.colorScheme === 'dark' || 
                 window.matchMedia?.('(prefers-color-scheme: dark)').matches || 
                 false;

const theme = createTheme({
  palette: {
    mode: isDarkMode ? 'dark' : 'light',
    primary: {
      light: '#63ccff',
      main: '#2AABEE',
      dark: '#0088cc',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff9e40',
      main: '#F57C00',
      dark: '#c25e00',
      contrastText: '#fff',
    },
    error: {
      light: '#ff6659',
      main: '#d32f2f',
      dark: '#b61c1c',
    },
    warning: {
      light: '#ffb74d',
      main: '#ff9800',
      dark: '#f57c00',
    },
    success: {
      light: '#81c784',
      main: '#4caf50',
      dark: '#388e3c',
    },
    background: {
      default: window.Telegram?.WebApp?.backgroundColor || (isDarkMode ? '#0E1621' : '#f5f7fa'),
      paper: isDarkMode ? '#17212B' : '#FFFFFF',
      card: isDarkMode ? 'rgba(29, 40, 53, 0.7)' : 'rgba(255, 255, 255, 0.9)',
    },
    text: {
      primary: window.Telegram?.WebApp?.textColor || (isDarkMode ? '#FFFFFF' : '#000000'),
      secondary: isDarkMode ? '#8CACDA' : '#546e7a',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 16px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0, 136, 204, 0.2)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #2AABEE, #0088cc)',
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #F57C00, #FF6F00)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'transform 0.3s, box-shadow 0.3s',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
          boxShadow: isDarkMode 
            ? '0 8px 20px rgba(0, 0, 0, 0.25)' 
            : '0 8px 20px rgba(0, 136, 204, 0.15)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: isDarkMode 
              ? '0 12px 30px rgba(0, 0, 0, 0.35)' 
              : '0 12px 30px rgba(0, 136, 204, 0.25)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'box-shadow 0.3s',
            '&:hover, &.Mui-focused': {
              boxShadow: '0 4px 10px rgba(0, 136, 204, 0.1)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          '&.MuiChip-colorPrimary': {
            background: 'linear-gradient(45deg, #2AABEE, #0088cc)',
          },
          '&.MuiChip-colorSecondary': {
            background: 'linear-gradient(45deg, #F57C00, #FF6F00)',
          },
          '&.MuiChip-colorSuccess': {
            background: 'linear-gradient(45deg, #4caf50, #388e3c)',
          },
          '&.MuiChip-colorWarning': {
            background: 'linear-gradient(45deg, #ff9800, #f57c00)',
          },
          '&.MuiChip-colorError': {
            background: 'linear-gradient(45deg, #f44336, #d32f2f)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
); 
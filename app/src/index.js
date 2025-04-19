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
      main: '#2AABEE', // Синий цвет Telegram
    },
    secondary: {
      main: '#F57C00', // Оранжевый цвет для контраста
    },
    background: {
      default: window.Telegram?.WebApp?.backgroundColor || (isDarkMode ? '#0E1621' : '#F5F5F5'),
      paper: isDarkMode ? '#17212B' : '#FFFFFF',
    },
    text: {
      primary: window.Telegram?.WebApp?.textColor || (isDarkMode ? '#FFFFFF' : '#000000'),
      secondary: isDarkMode ? '#8CACDA' : '#757575',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 'bold',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
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
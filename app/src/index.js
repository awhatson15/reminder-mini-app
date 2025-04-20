import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Создаем контекст для управления темой
export const ThemeContext = React.createContext({
  toggleTheme: () => {},
  isDarkMode: true,
});

// Neumorphic App
const NeuApp = () => {
  // Определяем тему на основе телеграма или системной, по умолчанию - темная
  const [isDarkMode, setIsDarkMode] = useState(
    window.Telegram?.WebApp?.colorScheme === 'dark' || 
    window.matchMedia?.('(prefers-color-scheme: dark)').matches || 
    true // По умолчанию темная тема
  );

  // Функция переключения темы
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Безопасная инициализация Telegram WebApp
  useEffect(() => {
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
  }, []);

  // Вычисляем основные цвета темы
  const darkBackground = '#1A1D23';
  const lightBackground = '#E6EEF8';
  const darkSurface = '#262A33';
  const lightSurface = '#FFFFFF';

  // Создаем тему MUI с поддержкой Neumorphic UI
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
        default: isDarkMode ? darkBackground : lightBackground,
        paper: isDarkMode ? darkSurface : lightSurface,
        elevated: isDarkMode ? '#323642' : '#F0F7FF',
      },
      text: {
        primary: isDarkMode ? '#FFFFFF' : '#2C2F35',
        secondary: isDarkMode ? '#8CACDA' : '#546e7a',
      },
      neumorphic: {
        boxShadow: isDarkMode
          ? 'inset 2px 2px 5px rgba(0, 0, 0, 0.4), inset -2px -2px 5px rgba(255, 255, 255, 0.05), 5px 5px 15px rgba(0, 0, 0, 0.5), -5px -5px 15px rgba(255, 255, 255, 0.05)'
          : 'inset 2px 2px 5px rgba(0, 0, 0, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.1), 5px 5px 15px rgba(0, 0, 0, 0.1), -5px -5px 15px rgba(255, 255, 255, 0.8)',
        boxShadowInset: isDarkMode
          ? '2px 2px 5px rgba(0, 0, 0, 0.6), -2px -2px 5px rgba(255, 255, 255, 0.05)'
          : '2px 2px 5px rgba(0, 0, 0, 0.2), -2px -2px 5px rgba(255, 255, 255, 0.5)',
        boxShadowElevated: isDarkMode
          ? '5px 5px 15px rgba(0, 0, 0, 0.6), -5px -5px 15px rgba(255, 255, 255, 0.03)'
          : '5px 5px 15px rgba(0, 0, 0, 0.1), -5px -5px 15px rgba(255, 255, 255, 0.8)',
        active: isDarkMode
          ? 'inset 5px 5px 10px rgba(0, 0, 0, 0.6), inset -5px -5px 10px rgba(255, 255, 255, 0.03)'
          : 'inset 5px 5px 10px rgba(0, 0, 0, 0.1), inset -5px -5px 10px rgba(255, 255, 255, 0.5)',
      },
      typeColors: {
        birthday: 'linear-gradient(135deg, #FF6B6B 0%, #FFB88C 100%)',
        event: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
        work: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',
        personal: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
        urgent: 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)',
        soon: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 100%)',
      }
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
      borderRadius: 16,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 20px',
            boxShadow: 'none',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'translateY(1px)',
            },
          },
          containedPrimary: {
            background: 'linear-gradient(45deg, #2AABEE, #0088cc)',
            boxShadow: isDarkMode 
              ? '5px 5px 10px rgba(0, 0, 0, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.05)'
              : '5px 5px 10px rgba(0, 0, 0, 0.1), -5px -5px 10px rgba(255, 255, 255, 0.8)',
            '&:hover': {
              boxShadow: isDarkMode 
                ? '7px 7px 15px rgba(0, 0, 0, 0.6), -7px -7px 15px rgba(255, 255, 255, 0.07)'
                : '7px 7px 15px rgba(0, 0, 0, 0.15), -7px -7px 15px rgba(255, 255, 255, 1)',
            },
            '&:active': {
              boxShadow: isDarkMode
                ? 'inset 5px 5px 10px rgba(0, 0, 0, 0.6), inset -5px -5px 10px rgba(255, 255, 255, 0.03)'
                : 'inset 5px 5px 10px rgba(0, 0, 0, 0.1), inset -5px -5px 10px rgba(255, 255, 255, 0.5)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            transition: 'transform 0.3s, box-shadow 0.3s',
            overflow: 'hidden',
            backdropFilter: 'blur(10px)',
            boxShadow: isDarkMode 
              ? '5px 5px 10px rgba(0, 0, 0, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.05)'
              : '5px 5px 10px rgba(0, 0, 0, 0.1), -5px -5px 10px rgba(255, 255, 255, 0.8)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: isDarkMode 
                ? '8px 8px 20px rgba(0, 0, 0, 0.6), -8px -8px 20px rgba(255, 255, 255, 0.07)'
                : '8px 8px 20px rgba(0, 0, 0, 0.15), -8px -8px 20px rgba(255, 255, 255, 1)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 16,
              transition: 'box-shadow 0.3s',
              backgroundColor: isDarkMode ? 'rgba(38, 42, 51, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              boxShadow: isDarkMode
                ? 'inset 2px 2px 5px rgba(0, 0, 0, 0.6), inset -2px -2px 5px rgba(255, 255, 255, 0.05)'
                : 'inset 2px 2px 5px rgba(0, 0, 0, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.5)',
              '&:hover, &.Mui-focused': {
                boxShadow: isDarkMode
                  ? 'inset 3px 3px 7px rgba(0, 0, 0, 0.7), inset -3px -3px 7px rgba(255, 255, 255, 0.07)'
                  : 'inset 3px 3px 7px rgba(0, 0, 0, 0.15), inset -3px -3px 7px rgba(255, 255, 255, 0.7)',
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: isDarkMode 
              ? '5px 5px 10px rgba(0, 0, 0, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.05)'
              : '5px 5px 10px rgba(0, 0, 0, 0.1), -5px -5px 10px rgba(255, 255, 255, 0.8)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            backgroundImage: 'none',
            backdropFilter: 'blur(10px)',
            backgroundColor: isDarkMode ? 'rgba(38, 42, 51, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          },
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(10px)',
            backgroundColor: isDarkMode ? 'rgba(38, 42, 51, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            boxShadow: isDarkMode 
              ? '0 -5px 10px rgba(0, 0, 0, 0.5)'
              : '0 -5px 10px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 60,
            height: 34,
            padding: 7,
          },
          switchBase: {
            padding: 8,
            '&.Mui-checked': {
              transform: 'translateX(26px)',
              '& + .MuiSwitch-track': {
                backgroundColor: '#2AABEE',
                opacity: 1,
              },
            },
          },
          thumb: {
            width: 18,
            height: 18,
            boxShadow: isDarkMode
              ? '2px 2px 3px rgba(0, 0, 0, 0.6), -2px -2px 3px rgba(255, 255, 255, 0.05)'
              : '2px 2px 3px rgba(0, 0, 0, 0.2), -2px -2px 3px rgba(255, 255, 255, 0.5)',
          },
          track: {
            borderRadius: 20,
            backgroundColor: isDarkMode ? '#505565' : '#E6EEF8',
            boxShadow: isDarkMode
              ? 'inset 2px 2px 3px rgba(0, 0, 0, 0.6), inset -2px -2px 3px rgba(255, 255, 255, 0.05)'
              : 'inset 2px 2px 3px rgba(0, 0, 0, 0.1), inset -2px -2px 3px rgba(255, 255, 255, 0.5)',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ toggleTheme, isDarkMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NeuApp />
  </React.StrictMode>
); 
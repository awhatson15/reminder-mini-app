import { createTheme } from '@mui/material/styles';

// Неоморфная тема для приложения
const createNeumorphicTheme = (isDarkMode = false) => {
  // Основные цвета для светлой темы
  const lightBackground = '#F7F7F7';
  const lightSurface = '#EDEDED';
  const lightText = '#2C2F35';
  const lightTextSecondary = '#7A7A7A';
  
  // Основные цвета для темной темы
  const darkBackground = '#1A1A1A';
  const darkSurface = '#2D2D2D';
  const darkText = '#FFFFFF';
  const darkTextSecondary = '#B0B0B0';
  
  // Акцентные цвета
  const accentBlue = '#3D9DF6';
  const accentMint = '#45C4B0';
  
  // Цвета категорий
  const typeColors = {
    birthday: 'linear-gradient(135deg, #FF6B6B 0%, #FFB88C 100%)',
    family: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
    work: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',
    friends: 'linear-gradient(135deg, #9c27b0 0%, #cd66ff 100%)',
    other: 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)',
  };

  // Тени для неоморфного дизайна
  const neumorphicShadows = {
    light: {
      default: '5px 5px 10px rgba(0, 0, 0, 0.1), -5px -5px 10px rgba(255, 255, 255, 0.8)',
      inset: 'inset 2px 2px 5px rgba(0, 0, 0, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.5)',
      elevated: '10px 10px 20px rgba(0, 0, 0, 0.1), -10px -10px 20px rgba(255, 255, 255, 1)',
      pressed: 'inset 4px 4px 8px rgba(0, 0, 0, 0.1), inset -4px -4px 8px rgba(255, 255, 255, 0.8)',
    },
    dark: {
      default: '5px 5px 10px rgba(0, 0, 0, 0.3), -5px -5px 10px rgba(255, 255, 255, 0.05)',
      inset: 'inset 2px 2px 5px rgba(0, 0, 0, 0.3), inset -2px -2px 5px rgba(255, 255, 255, 0.05)',
      elevated: '10px 10px 20px rgba(0, 0, 0, 0.3), -10px -10px 20px rgba(255, 255, 255, 0.05)',
      pressed: 'inset 4px 4px 8px rgba(0, 0, 0, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.05)',
    }
  };
  
  const shadows = isDarkMode ? neumorphicShadows.dark : neumorphicShadows.light;
  const background = isDarkMode ? darkBackground : lightBackground;
  const surface = isDarkMode ? darkSurface : lightSurface;
  const text = isDarkMode ? darkText : lightText;
  const textSecondary = isDarkMode ? darkTextSecondary : lightTextSecondary;
  
  // Создаем тему MUI
  return createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: accentBlue,
        contrastText: '#ffffff',
      },
      secondary: {
        main: accentMint,
        contrastText: '#ffffff',
      },
      background: {
        default: background,
        paper: surface,
      },
      text: {
        primary: text,
        secondary: textSecondary,
      },
      action: {
        active: accentBlue,
        hover: `${accentBlue}22`,
      },
      // Кастомные цвета для неоморфного дизайна
      neumorphic: {
        boxShadow: shadows.default,
        boxShadowInset: shadows.inset,
        boxShadowElevated: shadows.elevated,
        active: shadows.pressed,
        background: background,
        surface: surface,
      },
      typeColors: typeColors,
    },
    typography: {
      fontFamily: '"Inter", "Manrope", "Roboto", sans-serif',
      h1: {
        fontWeight: 500,
        fontSize: '22px',
      },
      h2: {
        fontWeight: 500,
        fontSize: '20px',
      },
      h3: {
        fontWeight: 500,
        fontSize: '18px',
      },
      h4: {
        fontWeight: 500,
        fontSize: '16px',
      },
      h5: {
        fontWeight: 500,
        fontSize: '14px',
      },
      h6: {
        fontWeight: 500,
        fontSize: '12px',
      },
      body1: {
        fontSize: '16px',
        fontWeight: 400,
      },
      body2: {
        fontSize: '14px',
        fontWeight: 400,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
      subtitle1: {
        fontSize: '16px',
        fontWeight: 400,
      },
      subtitle2: {
        fontSize: '14px',
        fontWeight: 300,
        color: textSecondary,
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
            padding: '10px 20px',
            boxShadow: shadows.default,
            textTransform: 'none',
            transition: 'all 0.3s',
            '&:hover': {
              boxShadow: shadows.elevated,
              transform: 'translateY(-2px)',
            },
            '&:active': {
              boxShadow: shadows.pressed,
              transform: 'translateY(0)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            boxShadow: shadows.default,
            background: surface,
            transition: 'all 0.3s',
            '&:hover': {
              boxShadow: shadows.elevated,
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 16,
              boxShadow: shadows.inset,
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: 'transparent',
              },
              '&.Mui-focused fieldset': {
                borderColor: accentBlue,
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: shadows.default,
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: surface,
            boxShadow: shadows.default,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: surface,
            boxShadow: shadows.default,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            margin: '4px 8px',
            '&:hover': {
              background: isDarkMode ? '#3D3D3D' : '#F0F0F0',
            },
          },
        },
      },
    },
  });
};

export default createNeumorphicTheme; 
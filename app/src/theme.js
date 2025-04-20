import { createTheme } from '@mui/material/styles';

// Неоморфная тема для приложения
const createNeumorphicTheme = (isDarkMode = false, accentColor = '#3D9DF6') => {
  // Основные цвета для светлой темы
  const lightBackground = '#F7F7F7';
  const lightSurface = '#EDEDED';
  const lightText = '#2C2F35';
  const lightTextSecondary = '#555B66'; // Увеличен контраст
  
  // Основные цвета для темной темы
  const darkBackground = '#1A1A1A';
  const darkSurface = '#2D2D2D';
  const darkText = '#FFFFFF';
  const darkTextSecondary = '#C4C4C4'; // Увеличен контраст
  
  // Акцентные цвета - настраиваемые
  const accentBlue = accentColor;
  const accentMint = '#45C4B0';
  
  // Цвета категорий
  const typeColors = {
    birthday: 'linear-gradient(135deg, #FF6B6B 0%, #FFB88C 100%)',
    family: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
    work: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',
    friends: 'linear-gradient(135deg, #9c27b0 0%, #cd66ff 100%)',
    other: 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)',
  };

  // Палитра приоритетов для задач
  const priorityColors = {
    high: '#E57373', // красный
    medium: '#FFB74D', // оранжевый
    low: '#81C784', // зеленый
    none: '#90A4AE' // серый
  };

  // Тени для неоморфного дизайна - улучшенный контраст
  const neumorphicShadows = {
    light: {
      default: '6px 6px 12px rgba(0, 0, 0, 0.12), -6px -6px 12px rgba(255, 255, 255, 0.8)',
      inset: 'inset 3px 3px 6px rgba(0, 0, 0, 0.12), inset -3px -3px 6px rgba(255, 255, 255, 0.5)',
      elevated: '10px 10px 20px rgba(0, 0, 0, 0.12), -10px -10px 20px rgba(255, 255, 255, 1)',
      pressed: 'inset 4px 4px 8px rgba(0, 0, 0, 0.12), inset -4px -4px 8px rgba(255, 255, 255, 0.8)',
      focused: `0 0 0 3px ${accentBlue}40`,
    },
    dark: {
      default: '6px 6px 12px rgba(0, 0, 0, 0.35), -6px -6px 12px rgba(255, 255, 255, 0.07)',
      inset: 'inset 3px 3px 6px rgba(0, 0, 0, 0.35), inset -3px -3px 6px rgba(255, 255, 255, 0.07)',
      elevated: '10px 10px 20px rgba(0, 0, 0, 0.35), -10px -10px 20px rgba(255, 255, 255, 0.07)',
      pressed: 'inset 4px 4px 8px rgba(0, 0, 0, 0.35), inset -4px -4px 8px rgba(255, 255, 255, 0.07)',
      focused: `0 0 0 3px ${accentBlue}40`,
    }
  };
  
  const shadows = isDarkMode ? neumorphicShadows.dark : neumorphicShadows.light;
  const background = isDarkMode ? darkBackground : lightBackground;
  const surface = isDarkMode ? darkSurface : lightSurface;
  const text = isDarkMode ? darkText : lightText;
  const textSecondary = isDarkMode ? darkTextSecondary : lightTextSecondary;
  
  // Анимационные константы
  const animations = {
    microInteraction: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    pageTransition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    expandCollapse: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  };
  
  // Размеры касания для интерактивных элементов
  const touchSizes = {
    tiny: '32px',  // минимальный размер для мелких иконок
    small: '40px', // для кнопок и переключателей
    medium: '48px', // стандартный размер для большинства элементов
    large: '56px',  // для важных/основных действий
  };
  
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
        hoverOpacity: 0.2,
        selected: `${accentBlue}29`,
        selectedOpacity: 0.26,
        focus: `${accentBlue}22`,
        focusOpacity: 0.2,
      },
      // Кастомные цвета для неоморфного дизайна
      neumorphic: {
        boxShadow: shadows.default,
        boxShadowInset: shadows.inset,
        boxShadowElevated: shadows.elevated,
        active: shadows.pressed,
        focused: shadows.focused,
        background: background,
        surface: surface,
      },
      typeColors: typeColors,
      priorityColors: priorityColors,
    },
    typography: {
      fontFamily: '"Inter", "Manrope", "Roboto", sans-serif',
      h1: {
        fontWeight: 600,
        fontSize: '22px',
        letterSpacing: '-0.01em',
      },
      h2: {
        fontWeight: 600,
        fontSize: '20px',
        letterSpacing: '-0.01em',
      },
      h3: {
        fontWeight: 600,
        fontSize: '18px',
        letterSpacing: '-0.01em',
      },
      h4: {
        fontWeight: 500,
        fontSize: '16px',
        letterSpacing: '-0.01em',
      },
      h5: {
        fontWeight: 500,
        fontSize: '14px',
        letterSpacing: '-0.01em',
      },
      h6: {
        fontWeight: 500,
        fontSize: '12px',
        letterSpacing: '-0.01em',
      },
      body1: {
        fontSize: '16px',
        fontWeight: 400,
        letterSpacing: '-0.01em',
      },
      body2: {
        fontSize: '14px',
        fontWeight: 400,
        letterSpacing: '-0.01em',
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
        letterSpacing: '-0.01em',
      },
      subtitle1: {
        fontSize: '16px',
        fontWeight: 500,
        letterSpacing: '-0.01em',
      },
      subtitle2: {
        fontSize: '14px',
        fontWeight: 400,
        letterSpacing: '-0.01em',
        color: textSecondary,
      },
      caption: {
        fontSize: '12px',
        fontWeight: 400,
        letterSpacing: '-0.01em',
      },
    },
    shape: {
      borderRadius: 14,
    },
    spacing: (factor) => `${0.5 * factor}rem`,
    transitions: {
      micro: animations.microInteraction,
      page: animations.pageTransition,
      expandCollapse: animations.expandCollapse,
    },
    touchSizes: touchSizes,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            padding: '8px 16px',
            boxShadow: shadows.default,
            textTransform: 'none',
            transition: animations.microInteraction,
            minWidth: touchSizes.small,
            minHeight: touchSizes.small,
            '&:hover': {
              boxShadow: shadows.elevated,
              transform: 'translateY(-2px)',
            },
            '&:active': {
              boxShadow: shadows.pressed,
              transform: 'translateY(0)',
            },
            '&.Mui-focusVisible': {
              boxShadow: `${shadows.default}, ${shadows.focused}`,
            },
          },
        },
        variants: [
          {
            props: { size: 'small' },
            style: {
              padding: '6px 12px',
              fontSize: '0.8125rem',
            },
          },
          {
            props: { size: 'large' },
            style: {
              padding: '10px 22px',
              fontSize: '1rem',
            },
          },
        ],
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            boxShadow: shadows.default,
            background: surface,
            transition: animations.microInteraction,
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
              borderRadius: 14,
              boxShadow: shadows.inset,
              minHeight: touchSizes.medium,
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: 'transparent',
              },
              '&.Mui-focused fieldset': {
                borderColor: accentBlue,
              },
              '&.Mui-focused': {
                boxShadow: `${shadows.inset}, ${shadows.focused}`,
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
            borderRadius: 10,
            margin: '3px 6px',
            minHeight: touchSizes.medium,
            transition: animations.microInteraction,
            '&:hover': {
              background: isDarkMode ? '#3D3D3D' : '#F0F0F0',
              transform: 'translateX(2px)',
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            transition: animations.microInteraction,
            '&:hover': {
              transform: 'translateX(2px)',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: animations.microInteraction,
            minWidth: touchSizes.small,
            minHeight: touchSizes.small,
            '&:hover': {
              transform: 'scale(1.05)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
          },
          sizeSmall: {
            minWidth: touchSizes.tiny,
            minHeight: touchSizes.tiny,
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 42,
            height: 24,
            padding: 0,
          },
          switchBase: {
            padding: 2,
            '&.Mui-checked': {
              transform: 'translateX(18px)',
              '& + .MuiSwitch-track': {
                opacity: 1,
                backgroundColor: accentBlue,
              },
            },
          },
          track: {
            borderRadius: 12,
            opacity: 0.5,
          },
          thumb: {
            width: 20,
            height: 20,
            boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDarkMode ? '#424242' : '#f5f5f5',
            color: isDarkMode ? '#fff' : '#333',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            borderRadius: 8,
            padding: '8px 12px',
          },
          arrow: {
            color: isDarkMode ? '#424242' : '#f5f5f5',
          }
        },
      },
      MuiBadge: {
        styleOverrides: {
          badge: {
            fontWeight: 600,
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            transition: animations.microInteraction,
            '&:hover': {
              transform: 'scale(1.03)',
            },
            '&:active': {
              transform: 'scale(0.97)',
            },
          }
        }
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 14,
            boxShadow: shadows.elevated,
          }
        }
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            transition: animations.microInteraction,
            minHeight: touchSizes.medium,
          }
        }
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            transition: animations.microInteraction,
          }
        }
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            transition: animations.microInteraction,
          },
          indicator: {
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }
        }
      },
      MuiTab: {
        styleOverrides: {
          root: {
            transition: animations.microInteraction,
            minHeight: touchSizes.medium,
          }
        }
      }
    },
  });
};

export default createNeumorphicTheme; 
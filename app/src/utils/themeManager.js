/**
 * Менеджер тем для Telegram Mini App
 * Обеспечивает реагирование на изменения темы Telegram и системной темы
 */

import { createTheme } from '@mui/material/styles';

/**
 * Проверяет, используется ли темная тема
 * @returns {boolean} Использует ли пользователь темную тему
 */
export const isDarkMode = () => {
  return (
    window.Telegram?.WebApp?.colorScheme === 'dark' || 
    window.matchMedia?.('(prefers-color-scheme: dark)').matches || 
    false
  );
};

/**
 * Получает цвет фона из Telegram WebApp или использует резервное значение
 * @returns {string} Цвет фона
 */
export const getBackgroundColor = () => {
  return window.Telegram?.WebApp?.backgroundColor || (isDarkMode() ? '#0E1621' : '#f5f7fa');
};

/**
 * Получает цвет текста из Telegram WebApp или использует резервное значение
 * @returns {string} Цвет текста
 */
export const getTextColor = () => {
  return window.Telegram?.WebApp?.textColor || (isDarkMode() ? '#FFFFFF' : '#000000');
};

/**
 * Создает тему Material UI на основе настроек Telegram
 * @returns {Object} Тема Material UI
 */
export const createAppTheme = () => {
  const darkMode = isDarkMode();
  
  return createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
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
        default: getBackgroundColor(),
        paper: darkMode ? '#17212B' : '#FFFFFF',
        card: darkMode ? 'rgba(29, 40, 53, 0.7)' : 'rgba(255, 255, 255, 0.9)',
      },
      text: {
        primary: getTextColor(),
        secondary: darkMode ? '#8CACDA' : '#546e7a',
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
      MuiButtonBase: {
        defaultProps: {
          disableRipple: false,
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            },
          },
          contained: {
            '&.MuiButton-containedPrimary': {
              background: 'linear-gradient(45deg, #2AABEE, #0088cc)',
            },
            '&.MuiButton-containedSecondary': {
              background: 'linear-gradient(45deg, #F57C00, #FF6F00)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: darkMode
              ? '0 4px 12px rgba(0, 0, 0, 0.5)'
              : '0 4px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: 12,
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
};

/**
 * Настраивает слушатель изменений темы
 * @param {Function} callback - Функция, вызываемая при изменении темы
 * @returns {Function} Функция для удаления слушателя
 */
export const setupThemeListener = (callback) => {
  // Слушатель изменения темы в Telegram
  const handleTelegramThemeChange = () => {
    if (typeof callback === 'function') {
      callback();
    }
  };

  // Слушатель изменения системной темы
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemThemeChange = (e) => {
    if (typeof callback === 'function') {
      callback();
    }
  };

  // Подписываемся на изменения темы в Telegram если API доступен
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.onEvent('themeChanged', handleTelegramThemeChange);
  }

  // Подписываемся на изменения системной темы
  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', handleSystemThemeChange);
  } else if (typeof mediaQuery.addListener === 'function') {
    // Для старых браузеров
    mediaQuery.addListener(handleSystemThemeChange);
  }

  // Возвращаем функцию для удаления слушателей
  return () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.offEvent('themeChanged', handleTelegramThemeChange);
    }

    if (typeof mediaQuery.removeEventListener === 'function') {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } else if (typeof mediaQuery.removeListener === 'function') {
      mediaQuery.removeListener(handleSystemThemeChange);
    }
  };
};

/**
 * Применяет CSS переменные темы к корневому элементу документа
 */
export const applyThemeVariables = () => {
  const darkMode = isDarkMode();
  const backgroundColor = getBackgroundColor();
  const textColor = getTextColor();
  
  document.documentElement.style.setProperty('--app-background-color', backgroundColor);
  document.documentElement.style.setProperty('--app-text-color', textColor);
  document.documentElement.style.setProperty('--app-paper-color', darkMode ? '#17212B' : '#FFFFFF');
  document.documentElement.style.setProperty('--app-card-color', darkMode ? 'rgba(29, 40, 53, 0.7)' : 'rgba(255, 255, 255, 0.9)');
  document.documentElement.style.setProperty('--app-secondary-text-color', darkMode ? '#8CACDA' : '#546e7a');
  document.documentElement.style.setProperty('--app-border-color', darkMode ? '#344859' : '#e0e0e0');
}; 
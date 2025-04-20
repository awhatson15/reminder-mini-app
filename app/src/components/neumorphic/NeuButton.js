import React, { useContext } from 'react';
import { Button, Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../index';

/**
 * Неоморфная кнопка с эффектами при нажатии
 * 
 * @param {Object} props - Свойства компонента
 * @param {ReactNode} props.children - Содержимое кнопки
 * @param {string} props.variant - Вариант кнопки (flat, concave, convex, pressed)
 * @param {string} props.color - Цвет кнопки (primary, secondary, error, warning, info, success)
 * @param {string} props.size - Размер кнопки (small, medium, large)
 * @param {boolean} props.fullWidth - Флаг на всю ширину контейнера
 * @param {boolean} props.disabled - Флаг отключения
 * @param {function} props.onClick - Обработчик клика
 * @param {string} props.startIcon - Иконка в начале
 * @param {string} props.endIcon - Иконка в конце
 * @param {Object} props.sx - Дополнительные стили
 * @returns {JSX.Element}
 */
const NeuButton = ({
  children,
  variant = 'convex',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  onClick,
  startIcon,
  endIcon,
  sx = {},
  ...props
}) => {
  const theme = useTheme();
  const { isDarkMode } = useContext(ThemeContext);

  // Получение базового цвета для кнопки
  const getBaseColor = () => {
    if (disabled) {
      return isDarkMode ? '#424242' : '#e0e0e0';
    }

    switch (color) {
      case 'primary':
        return theme.palette.primary.main;
      case 'secondary':
        return theme.palette.secondary.main;
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
        return theme.palette.info.main;
      case 'success':
        return theme.palette.success.main;
      default:
        return isDarkMode ? '#333' : '#f0f0f0';
    }
  };

  // Установка размеров кнопки
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: '6px 12px',
          fontSize: '0.875rem',
          borderRadius: '10px',
        };
      case 'large':
        return {
          padding: '12px 24px',
          fontSize: '1.125rem',
          borderRadius: '16px',
        };
      case 'medium':
      default:
        return {
          padding: '8px 16px',
          fontSize: '1rem',
          borderRadius: '12px',
        };
    }
  };

  // Определение теней в зависимости от варианта
  const baseColor = getBaseColor();
  const lightShadow = isDarkMode 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(255, 255, 255, 1)';
  const darkShadow = isDarkMode 
    ? 'rgba(0, 0, 0, 0.7)' 
    : 'rgba(0, 0, 0, 0.1)';
  
  // Создание теней в зависимости от варианта
  const getShadows = () => {
    const distance = '6px';
    
    switch (variant) {
      case 'concave':
        return `inset 3px 3px ${distance} ${darkShadow}, 
                inset -3px -3px ${distance} ${lightShadow}`;
      case 'pressed':
        return `inset 3px 3px ${distance} ${darkShadow}, 
                inset -3px -3px ${distance} ${lightShadow}`;
      case 'flat':
        return 'none';
      case 'convex':
      default:
        return `3px 3px ${distance} ${darkShadow}, 
                -3px -3px ${distance} ${lightShadow}`;
    }
  };

  // Контраст текста (темный или светлый) в зависимости от фона
  const getTextColor = () => {
    if (disabled) {
      return isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)';
    }

    // Для нейтральных кнопок берем цвет из темы
    if (color === 'neutral') {
      return isDarkMode ? '#ffffff' : '#000000';
    }

    // Для цветных кнопок определяем контраст
    const isLight = theme.palette[color]?.contrastText === '#fff';
    return isLight ? '#ffffff' : '#000000';
  };

  // Базовые стили кнопки
  const buttonStyles = {
    backgroundColor: baseColor,
    color: getTextColor(),
    boxShadow: getShadows(),
    border: 'none',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.68, -0.6, 0.32, 1.6)',
    width: fullWidth ? '100%' : 'auto',
    fontWeight: 600,
    userSelect: 'none',
    '&:hover': {
      backgroundColor: disabled ? (isDarkMode ? '#424242' : '#e0e0e0') : baseColor,
    },
    ...getSizeStyles(),
    ...sx
  };

  // Анимации кнопки
  const buttonVariants = {
    tap: {
      scale: disabled ? 1 : 0.98,
      boxShadow: `inset 3px 3px 5px ${darkShadow}, inset -3px -3px 5px ${lightShadow}`,
    }
  };

  return (
    <Box
      component={motion.div}
      whileTap={disabled ? {} : 'tap'}
      variants={buttonVariants}
      sx={{
        width: fullWidth ? '100%' : 'auto',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <Button
        component={motion.button}
        disabled={disabled}
        onClick={disabled ? undefined : onClick}
        disableRipple
        startIcon={startIcon}
        endIcon={endIcon}
        sx={buttonStyles}
        {...props}
      >
        {variant === 'convex' && !disabled && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '40%',
              borderRadius: '50% 50% 50% 50% / 0% 0% 100% 100%',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />
        )}
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          {children}
        </Box>
      </Button>
    </Box>
  );
};

export default NeuButton; 
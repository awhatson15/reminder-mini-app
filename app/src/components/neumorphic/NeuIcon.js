import React, { useContext } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../index';

/**
 * Неоморфная иконка с эффектами
 * 
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.icon - Иконка для отображения
 * @param {string} props.variant - Вариант отображения (flat, raised, inset)
 * @param {string} props.size - Размер иконки (small, medium, large)
 * @param {string} props.color - Цвет иконки
 * @param {boolean} props.clickable - Флаг возможности клика
 * @param {boolean} props.disabled - Флаг отключения
 * @param {Function} props.onClick - Обработчик клика
 * @param {Object} props.sx - Дополнительные стили
 * @returns {JSX.Element}
 */
const NeuIcon = ({
  icon,
  variant = 'raised',
  size = 'medium',
  color,
  clickable = false,
  disabled = false,
  onClick,
  sx = {},
  ...props
}) => {
  const { isDarkMode } = useContext(ThemeContext);

  // Определение размеров
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: 36,
          icon: 18,
        };
      case 'large':
        return {
          container: 64,
          icon: 32,
        };
      case 'medium':
      default:
        return {
          container: 48,
          icon: 24,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  // Определение цветов и теней
  const lightShadow = isDarkMode 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.8)';
  
  const darkShadow = isDarkMode 
    ? 'rgba(0, 0, 0, 0.7)' 
    : 'rgba(0, 0, 0, 0.1)';

  // Цвет иконки
  const iconColor = color || (isDarkMode ? '#e0e0e0' : '#333333');

  // Определение стилей в зависимости от варианта
  const getShadowStyles = () => {
    switch (variant) {
      case 'flat':
        return {
          boxShadow: 'none',
          border: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
        };
      case 'inset':
        return {
          boxShadow: `inset 3px 3px 6px ${darkShadow}, inset -3px -3px 6px ${lightShadow}`,
        };
      case 'raised':
      default:
        return {
          boxShadow: `3px 3px 6px ${darkShadow}, -3px -3px 6px ${lightShadow}`,
        };
    }
  };

  // Анимационные варианты
  const iconVariants = {
    initial: {
      ...getShadowStyles(),
    },
    hover: clickable && !disabled ? {
      boxShadow: variant === 'inset' 
        ? `inset 4px 4px 8px ${darkShadow}, inset -4px -4px 8px ${lightShadow}`
        : variant === 'flat'
        ? 'none'
        : `4px 4px 8px ${darkShadow}, -4px -4px 8px ${lightShadow}`,
      scale: variant === 'inset' ? 0.98 : 1.05,
      transition: { duration: 0.3 }
    } : {},
    tap: clickable && !disabled ? {
      scale: 0.95,
      boxShadow: variant === 'inset'
        ? getShadowStyles().boxShadow
        : variant === 'flat'
        ? 'none'
        : `2px 2px 4px ${darkShadow}, -2px -2px 4px ${lightShadow}`,
      transition: { duration: 0.1 }
    } : {},
  };

  // Базовые стили
  const containerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: sizeStyles.container,
    height: sizeStyles.container,
    borderRadius: '50%',
    backgroundColor: isDarkMode ? '#2a2a2a' : '#f0f0f0',
    color: iconColor,
    transition: 'all 0.3s ease',
    opacity: disabled ? 0.5 : 1,
    cursor: (clickable && !disabled) ? 'pointer' : 'default',
    ...getShadowStyles(),
    ...sx,
  };

  return (
    <Box
      component={motion.div}
      initial="initial"
      whileHover={clickable && !disabled ? "hover" : ""}
      whileTap={clickable && !disabled ? "tap" : ""}
      variants={iconVariants}
      onClick={clickable && !disabled ? onClick : undefined}
      sx={containerStyles}
      {...props}
    >
      {/* Обертка для иконки с центрированием */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: sizeStyles.icon,
          height: sizeStyles.icon,
          fontSize: sizeStyles.icon,
          '& > *': {
            width: '100%',
            height: '100%',
          }
        }}
      >
        {icon}
      </Box>
    </Box>
  );
};

export default NeuIcon; 
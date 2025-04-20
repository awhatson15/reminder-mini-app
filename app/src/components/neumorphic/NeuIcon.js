import React, { useContext } from 'react';
import { Box, SvgIcon } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../App';

// Стилизованный контейнер для иконки с неоморфным дизайном
const StyledIconContainer = styled(Box)(({ theme, variant, isClickable, size }) => {
  // Определяем базовый размер
  const sizeValue = {
    small: '32px',
    medium: '40px',
    large: '48px',
  }[size] || '40px';
  
  // Определяем тени в зависимости от варианта
  let boxShadow = theme.palette.neumorphic.boxShadow;
  
  if (variant === 'inset') {
    boxShadow = theme.palette.neumorphic.boxShadowInset;
  }
  
  return {
    width: sizeValue,
    height: sizeValue,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: theme.palette.neumorphic.surface,
    boxShadow,
    cursor: isClickable ? 'pointer' : 'default',
    transition: 'all 0.3s ease',
  };
});

/**
 * Неоморфная иконка
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Иконка (компонент или элемент)
 * @param {string} props.variant - Вариант: 'raised' (по умолчанию) или 'inset'
 * @param {string} props.size - Размер: 'small', 'medium' (по умолчанию), 'large'
 * @param {string} props.color - Цвет иконки
 * @param {boolean} props.clickable - Делает иконку кликабельной с визуальными эффектами
 * @param {function} props.onClick - Обработчик клика
 * @param {Object} props.sx - Дополнительные стили для контейнера
 * @param {Object} props.iconSx - Дополнительные стили для самой иконки
 */
const NeuIcon = ({
  icon,
  variant = 'raised',
  size = 'medium',
  color,
  clickable = false,
  onClick,
  sx = {},
  iconSx = {},
  ...props
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  
  // Определение цвета иконки
  const iconColor = color || (variant === 'inset' 
    ? isDarkMode ? '#B0B0B0' : '#7A7A7A'
    : isDarkMode ? '#3D9DF6' : '#3D9DF6');
  
  // Анимации для иконки
  const iconVariants = {
    hover: clickable ? {
      y: -2,
      boxShadow: variant === 'inset' 
        ? isDarkMode
          ? 'inset 2px 2px 5px rgba(0, 0, 0, 0.3), inset -2px -2px 5px rgba(255, 255, 255, 0.05)'
          : 'inset 2px 2px 5px rgba(0, 0, 0, 0.15), inset -2px -2px 5px rgba(255, 255, 255, 0.7)'
        : isDarkMode
          ? '7px 7px 14px rgba(0, 0, 0, 0.3), -7px -7px 14px rgba(255, 255, 255, 0.05)'
          : '7px 7px 14px rgba(0, 0, 0, 0.15), -7px -7px 14px rgba(255, 255, 255, 1)',
      transition: { duration: 0.3 }
    } : {},
    tap: clickable ? {
      y: 0,
      scale: 0.95,
      boxShadow: isDarkMode
        ? 'inset 4px 4px 8px rgba(0, 0, 0, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.05)'
        : 'inset 4px 4px 8px rgba(0, 0, 0, 0.15), inset -4px -4px 8px rgba(255, 255, 255, 0.7)',
      transition: { duration: 0.1 }
    } : {}
  };

  return (
    <StyledIconContainer
      component={motion.div}
      whileHover="hover"
      whileTap={clickable ? "tap" : ""}
      variants={iconVariants}
      variant={variant}
      isClickable={clickable}
      size={size}
      onClick={clickable ? onClick : undefined}
      sx={sx}
      {...props}
    >
      {React.isValidElement(icon) ? (
        React.cloneElement(icon, {
          style: {
            fontSize: {
              small: '16px',
              medium: '20px',
              large: '24px',
            }[size] || '20px',
            color: iconColor,
            transition: 'color 0.3s ease',
            ...iconSx,
          },
        })
      ) : (
        <SvgIcon
          component={icon}
          sx={{
            fontSize: {
              small: '16px',
              medium: '20px',
              large: '24px',
            }[size] || '20px',
            color: iconColor,
            transition: 'color 0.3s ease',
            ...iconSx,
          }}
        />
      )}
    </StyledIconContainer>
  );
};

export default NeuIcon; 
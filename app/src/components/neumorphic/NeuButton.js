import React from 'react';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Стилизованная кнопка с неоморфным дизайном
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '16px',
  padding: '10px 20px',
  boxShadow: theme.palette.neumorphic.boxShadow,
  backgroundColor: theme.palette.neumorphic.surface,
  color: theme.palette.text.primary,
  transition: 'all 0.3s ease',
  textTransform: 'none',
  fontWeight: 500,
  lineHeight: 1.5,
  border: 'none',
  position: 'relative',
  overflow: 'hidden',
  
  '&:hover': {
    boxShadow: theme.palette.neumorphic.boxShadowElevated,
    backgroundColor: theme.palette.neumorphic.surface,
    transform: 'translateY(-2px)',
  },
  
  '&:active': {
    boxShadow: theme.palette.neumorphic.active,
    transform: 'translateY(0)',
  },
  
  '&.MuiButton-contained': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  
  '&.MuiButton-outlined': {
    backgroundColor: 'transparent',
    border: `1px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
    boxShadow: 'none',
    
    '&:hover': {
      backgroundColor: `${theme.palette.primary.main}10`,
      boxShadow: 'none',
    },
  },
  
  '&.Mui-disabled': {
    opacity: 0.6,
    boxShadow: 'none',
  },
}));

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
  variant = 'neumorphic',
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
  // Варианты анимации
  const buttonVariants = {
    hover: { 
      y: -2,
      transition: { duration: 0.2 }
    },
    tap: { 
      y: 0,
      transition: { duration: 0.1 }
    }
  };

  // Преобразование варианта neumorphic в нужный вариант для MUI
  const getMuiVariant = () => {
    if (variant === 'neumorphic') return 'text';
    return variant;
  };

  return (
    <StyledButton
      component={motion.button}
      whileHover="hover"
      whileTap="tap"
      variants={buttonVariants}
      variant={getMuiVariant()}
      disabled={disabled}
      fullWidth={fullWidth}
      startIcon={startIcon}
      endIcon={endIcon}
      size={size}
      onClick={onClick}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default NeuButton; 
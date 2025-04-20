import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Стилизованная карточка с неоморфным дизайном
const StyledCard = styled(Box)(({ theme, variant, clickable, noShadow, active }) => {
  // Определение стилей теней
  let boxShadow = theme.palette.neumorphic.boxShadow;
  
  if (noShadow) {
    boxShadow = 'none';
  } else if (variant === 'inset') {
    boxShadow = theme.palette.neumorphic.boxShadowInset;
  } else if (active) {
    boxShadow = theme.palette.neumorphic.active;
  }
  
  return {
    backgroundColor: theme.palette.neumorphic.surface,
    borderRadius: '24px',
    padding: '16px',
    boxShadow,
    transition: 'all 0.3s ease',
    cursor: clickable ? 'pointer' : 'default',
  };
});

/**
 * Неоморфная карточка
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Контент карточки
 * @param {string} props.variant - Вариант карточки: 'raised' (по умолчанию) или 'inset'
 * @param {boolean} props.clickable - Делает карточку кликабельной с визуальными эффектами
 * @param {boolean} props.noShadow - Отключает тени
 * @param {boolean} props.active - Активное состояние (нажатое)
 * @param {function} props.onClick - Обработчик клика
 * @param {boolean} props.fullWidth - Растягивает на всю ширину
 * @param {Object} props.sx - Дополнительные стили
 */
const NeuCard = ({
  children,
  variant = 'raised',
  clickable = false,
  noShadow = false,
  active = false,
  onClick,
  fullWidth = false,
  sx = {},
  ...props
}) => {
  // Анимации для карточки
  const cardVariants = {
    initial: {},
    hover: clickable ? { 
      y: -4,
      boxShadow: variant === 'inset' 
        ? '2px 2px 5px rgba(0, 0, 0, 0.1), -2px -2px 5px rgba(255, 255, 255, 0.5)'
        : '8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.8)',
      transition: { duration: 0.3 }
    } : {},
    tap: clickable ? {
      y: 0,
      scale: 0.98,
      boxShadow: 'inset 4px 4px 8px rgba(0, 0, 0, 0.1), inset -4px -4px 8px rgba(255, 255, 255, 0.5)',
      transition: { duration: 0.1 }
    } : {}
  };

  // Объединение стилей
  const styles = {
    width: fullWidth ? '100%' : 'auto',
    ...sx
  };

  return (
    <StyledCard
      component={motion.div}
      initial="initial"
      whileHover={clickable ? "hover" : ""}
      whileTap={clickable ? "tap" : ""}
      variants={cardVariants}
      variant={variant}
      clickable={clickable}
      noShadow={noShadow}
      active={active}
      onClick={clickable ? onClick : undefined}
      sx={styles}
      {...props}
    >
      {children}
    </StyledCard>
  );
};

export default NeuCard; 
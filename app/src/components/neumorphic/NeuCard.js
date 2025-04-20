import React, { useContext } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../index';

/**
 * Неоморфная карточка с эффектами
 * 
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние элементы
 * @param {string} props.variant - Вариант карточки (flat, raised, inset)
 * @param {Object} props.sx - Дополнительные стили
 * @param {boolean} props.clickable - Возможность клика (добавляет визуальные эффекты при наведении)
 * @param {boolean} props.noShadow - Отключение теней
 * @param {Function} props.onClick - Обработчик клика
 * @param {boolean} props.fullWidth - Растягивать на всю ширину
 * @returns {JSX.Element}
 */
const NeuCard = ({
  children,
  variant = 'raised',
  sx = {},
  clickable = false,
  noShadow = false,
  onClick,
  fullWidth = false,
  ...props
}) => {
  const { isDarkMode } = useContext(ThemeContext);

  // Определение цветов теней
  const lightShadow = isDarkMode 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.8)';
  
  const darkShadow = isDarkMode 
    ? 'rgba(0, 0, 0, 0.7)' 
    : 'rgba(0, 0, 0, 0.15)';

  // Определение фоновых цветов
  const backgroundColor = isDarkMode ? '#2a2a2a' : '#f0f0f0';

  // Стили для разных вариантов
  const getShadowStyles = () => {
    if (noShadow) return {};

    switch (variant) {
      case 'flat':
        return {
          boxShadow: 'none',
          border: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
        };
      case 'inset':
        return {
          boxShadow: `inset 5px 5px 10px ${darkShadow}, inset -5px -5px 10px ${lightShadow}`,
        };
      case 'raised':
      default:
        return {
          boxShadow: `5px 5px 10px ${darkShadow}, -5px -5px 10px ${lightShadow}`,
        };
    }
  };

  // Анимационные варианты
  const cardVariants = {
    initial: {
      ...getShadowStyles(),
    },
    hover: clickable ? {
      boxShadow: variant === 'inset' 
        ? `inset 3px 3px 6px ${darkShadow}, inset -3px -3px 6px ${lightShadow}`
        : variant === 'flat'
        ? 'none'
        : `7px 7px 14px ${darkShadow}, -7px -7px 14px ${lightShadow}`,
      scale: variant === 'inset' ? 0.98 : 1.02,
      transition: { duration: 0.3 }
    } : {},
    tap: clickable ? {
      scale: 0.98,
      boxShadow: variant === 'inset'
        ? getShadowStyles().boxShadow
        : variant === 'flat'
        ? 'none'
        : `3px 3px 6px ${darkShadow}, -3px -3px 6px ${lightShadow}`,
      transition: { duration: 0.1 }
    } : {},
  };

  // Базовые стили
  const baseStyles = {
    backgroundColor,
    borderRadius: '16px',
    padding: '16px',
    transition: 'all 0.3s ease',
    width: fullWidth ? '100%' : 'auto',
    cursor: clickable ? 'pointer' : 'default',
    ...getShadowStyles(),
    ...sx
  };

  return (
    <Box
      component={motion.div}
      initial="initial"
      whileHover={clickable ? "hover" : ""}
      whileTap={clickable ? "tap" : ""}
      variants={cardVariants}
      onClick={onClick}
      sx={baseStyles}
      {...props}
    >
      {children}
    </Box>
  );
};

export default NeuCard; 
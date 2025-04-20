import React, { useContext } from 'react';
import { Box, LinearProgress, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../index';

/**
 * Компонент неоморфного прогресс-бара
 * 
 * @param {Object} props - Свойства компонента
 * @param {number} props.value - Значение прогресса (0-100)
 * @param {string} props.color - Цвет прогресс-бара (primary, secondary, success, error, warning, info)
 * @param {number} props.height - Высота прогресс-бара в пикселях
 * @param {boolean} props.showLabel - Показывать ли метку с процентами
 * @param {boolean} props.animation - Добавить анимацию заполнения
 * @param {Object} props.sx - Дополнительные стили
 * @returns {JSX.Element}
 */
const NeuProgress = ({
  value = 0,
  color = 'primary',
  height = 10,
  showLabel = false,
  animation = true,
  sx = {},
  ...props
}) => {
  const theme = useTheme();
  const { isDarkMode } = useContext(ThemeContext);

  // Обеспечиваем, что значение находится в диапазоне 0-100
  const normalizedValue = Math.min(100, Math.max(0, value));
  
  // Получаем цвет из темы
  const getColorFromTheme = () => {
    if (color === 'primary') return theme.palette.primary.main;
    if (color === 'secondary') return theme.palette.secondary.main;
    if (color === 'success') return theme.palette.success.main;
    if (color === 'error') return theme.palette.error.main;
    if (color === 'warning') return theme.palette.warning.main;
    if (color === 'info') return theme.palette.info.main;
    return color; // Если передан пользовательский цвет
  };

  // Стиль для трека (фон) прогресс-бара
  const trackStyle = {
    backgroundColor: isDarkMode 
      ? theme.palette.background.paper 
      : theme.palette.background.default,
    borderRadius: height / 2,
    boxShadow: isDarkMode
      ? 'inset 2px 2px 5px rgba(0, 0, 0, 0.7), inset -2px -2px 5px rgba(255, 255, 255, 0.05)'
      : 'inset 2px 2px 5px rgba(0, 0, 0, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.7)',
    height: `${height}px`,
    position: 'relative',
    ...sx
  };

  // Стиль для индикатора заполнения
  const barStyle = {
    backgroundColor: getColorFromTheme(),
    borderRadius: height / 2,
    boxShadow: isDarkMode
      ? '2px 2px 5px rgba(0, 0, 0, 0.5), -1px -1px 3px rgba(255, 255, 255, 0.05)'
      : '2px 2px 5px rgba(0, 0, 0, 0.1), -1px -1px 3px rgba(255, 255, 255, 0.7)',
    height: '100%',
    width: `${normalizedValue}%`,
    position: 'relative',
    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  // Анимация для индикатора заполнения
  const barVariants = {
    initial: { width: '0%' },
    animate: { 
      width: `${normalizedValue}%`,
      transition: { 
        duration: 1.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <Box sx={trackStyle}>
        <Box
          component={animation ? motion.div : 'div'}
          initial={animation ? "initial" : false}
          animate={animation ? "animate" : false}
          variants={barVariants}
          sx={barStyle}
        />
      </Box>
      
      {showLabel && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: theme.palette.text.primary
          }}
        >
          {`${Math.round(normalizedValue)}%`}
        </Box>
      )}
    </Box>
  );
};

export default NeuProgress; 
import React, { useContext } from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../index';

/**
 * Неоморфный переключатель с эффектами
 * 
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.checked - Состояние переключателя (включен/выключен)
 * @param {function} props.onChange - Обработчик изменения состояния
 * @param {string} props.label - Метка переключателя
 * @param {string} props.labelPosition - Позиция метки (left, right, top, bottom)
 * @param {string} props.size - Размер переключателя (small, medium, large)
 * @param {boolean} props.disabled - Флаг отключения
 * @param {string} props.activeColor - Цвет активного состояния
 * @param {Object} props.sx - Дополнительные стили
 * @returns {JSX.Element}
 */
const NeuSwitch = ({
  checked = false,
  onChange,
  label,
  labelPosition = 'right',
  size = 'medium',
  disabled = false,
  activeColor,
  sx = {},
  ...props
}) => {
  const { isDarkMode } = useContext(ThemeContext);

  // Определение размеров
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          width: 36,
          height: 20,
          thumbSize: 16,
          labelFontSize: '0.75rem',
          labelSpacing: '0.5rem',
        };
      case 'large':
        return {
          width: 56,
          height: 30,
          thumbSize: 26,
          labelFontSize: '1rem',
          labelSpacing: '0.75rem',
        };
      case 'medium':
      default:
        return {
          width: 48,
          height: 24,
          thumbSize: 20,
          labelFontSize: '0.875rem',
          labelSpacing: '0.625rem',
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

  const trackBgColor = isDarkMode 
    ? checked ? (activeColor || '#1E88E5') : '#1a1a1a'
    : checked ? (activeColor || '#1E88E5') : '#e0e0e0';

  // Расчет позиции ползунка
  const thumbPosition = checked 
    ? sizeStyles.width - sizeStyles.thumbSize - 2 
    : 2;

  // Составляем корневой элемент с меткой
  const renderContent = () => {
    const switchComponent = (
      <Box
        component={motion.div}
        sx={{
          position: 'relative',
          width: sizeStyles.width,
          height: sizeStyles.height,
          borderRadius: sizeStyles.height / 2,
          backgroundColor: trackBgColor,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          boxShadow: `inset 2px 2px 4px ${darkShadow}, inset -2px -2px 4px ${lightShadow}`,
          transition: 'background-color 0.3s',
          ...sx
        }}
        initial={false}
        animate={{ backgroundColor: trackBgColor }}
        onClick={!disabled ? onChange : undefined}
        {...props}
      >
        <Box
          component={motion.div}
          sx={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            left: 0,
            width: sizeStyles.thumbSize,
            height: sizeStyles.thumbSize,
            borderRadius: '50%',
            backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
            boxShadow: checked
              ? `0px 2px 4px ${darkShadow}`
              : `2px 2px 4px ${darkShadow}, -2px -2px 4px ${lightShadow}`,
          }}
          initial={false}
          animate={{
            x: thumbPosition,
            boxShadow: checked
              ? `0px 2px 4px ${darkShadow}`
              : `2px 2px 4px ${darkShadow}, -2px -2px 4px ${lightShadow}`,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </Box>
    );

    if (!label) return switchComponent;

    const labelStyles = {
      fontSize: sizeStyles.labelFontSize,
      color: isDarkMode ? '#e0e0e0' : '#333333',
      opacity: disabled ? 0.5 : 1,
      userSelect: 'none',
    };

    // Направление flexbox в зависимости от положения метки
    const containerDirection = () => {
      switch (labelPosition) {
        case 'top': return 'column-reverse';
        case 'bottom': return 'column';
        case 'left': return 'row-reverse';
        case 'right':
        default: return 'row';
      }
    };

    // Отступ для метки в зависимости от ее положения
    const getLabelMargin = () => {
      const spacing = sizeStyles.labelSpacing;
      switch (labelPosition) {
        case 'top': return { marginBottom: spacing };
        case 'bottom': return { marginTop: spacing };
        case 'left': return { marginRight: spacing };
        case 'right':
        default: return { marginLeft: spacing };
      }
    };

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: containerDirection(),
          alignItems: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        onClick={!disabled ? onChange : undefined}
      >
        {switchComponent}
        <Typography 
          sx={{ 
            ...labelStyles, 
            ...getLabelMargin() 
          }}
        >
          {label}
        </Typography>
      </Box>
    );
  };

  return renderContent();
};

export default NeuSwitch; 
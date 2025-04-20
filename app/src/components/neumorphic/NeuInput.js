import React, { useContext } from 'react';
import { Box, InputBase, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../index';

/**
 * Компонент неоморфного текстового поля ввода
 * 
 * @param {Object} props - Свойства компонента
 * @param {string} props.placeholder - Текст placeholder
 * @param {string} props.value - Значение поля ввода
 * @param {Function} props.onChange - Обработчик изменения значения
 * @param {boolean} props.fullWidth - Поле на всю ширину контейнера
 * @param {boolean} props.multiline - Многострочное поле ввода
 * @param {number} props.rows - Количество строк для многострочного поля ввода
 * @param {string} props.startAdornment - Элемент в начале поля ввода
 * @param {string} props.endAdornment - Элемент в конце поля ввода
 * @param {boolean} props.error - Наличие ошибки
 * @param {string} props.helperText - Вспомогательный текст
 * @param {string} props.size - Размер поля ввода (small, medium, large)
 * @param {boolean} props.disabled - Отключенное состояние
 * @param {string} props.type - Тип поля ввода (text, password, email и т.д.)
 * @param {Object} props.sx - Дополнительные стили
 * @returns {JSX.Element}
 */
const NeuInput = ({
  placeholder,
  value,
  onChange,
  fullWidth = false,
  multiline = false,
  rows = 1,
  startAdornment,
  endAdornment,
  error = false,
  helperText,
  size = 'medium',
  disabled = false,
  type = 'text',
  sx = {},
  ...props
}) => {
  const theme = useTheme();
  const { isDarkMode } = useContext(ThemeContext);

  // Определение размеров поля в зависимости от size
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: '8px 12px',
          fontSize: '0.875rem',
        };
      case 'large':
        return {
          padding: '14px 16px',
          fontSize: '1.125rem',
        };
      default: // medium
        return {
          padding: '12px 14px',
          fontSize: '1rem',
        };
    }
  };

  // Стили для поля ввода
  const getInputStyles = () => {
    const baseStyles = {
      width: fullWidth ? '100%' : 'auto',
      borderRadius: '12px',
      backgroundColor: isDarkMode 
        ? theme.palette.background.paper 
        : theme.palette.background.default,
      color: theme.palette.text.primary,
      transition: 'all 0.3s ease',
      position: 'relative',
      ...getSizeStyles(),
      ...sx,
    };

    // Стили для разных состояний (ошибка, отключено)
    if (disabled) {
      return {
        ...baseStyles,
        opacity: 0.7,
        cursor: 'not-allowed',
        boxShadow: isDarkMode
          ? 'inset 2px 2px 5px rgba(0, 0, 0, 0.4), inset -2px -2px 5px rgba(255, 255, 255, 0.04)'
          : 'inset 2px 2px 5px rgba(0, 0, 0, 0.06), inset -2px -2px 5px rgba(255, 255, 255, 0.6)',
      };
    }

    if (error) {
      return {
        ...baseStyles,
        boxShadow: isDarkMode
          ? 'inset 2px 2px 5px rgba(0, 0, 0, 0.4), inset -2px -2px 5px rgba(255, 255, 255, 0.04), 0 0 0 1px rgba(255, 80, 80, 0.5)'
          : 'inset 2px 2px 5px rgba(0, 0, 0, 0.06), inset -2px -2px 5px rgba(255, 255, 255, 0.6), 0 0 0 1px rgba(244, 67, 54, 0.5)',
        '&:focus-within': {
          boxShadow: isDarkMode
            ? 'inset 3px 3px 6px rgba(0, 0, 0, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.05), 0 0 0 2px rgba(255, 80, 80, 0.4)'
            : 'inset 3px 3px 6px rgba(0, 0, 0, 0.08), inset -3px -3px 6px rgba(255, 255, 255, 0.7), 0 0 0 2px rgba(244, 67, 54, 0.4)',
        },
      };
    }

    return {
      ...baseStyles,
      boxShadow: isDarkMode
        ? 'inset 2px 2px 5px rgba(0, 0, 0, 0.4), inset -2px -2px 5px rgba(255, 255, 255, 0.04)'
        : 'inset 2px 2px 5px rgba(0, 0, 0, 0.06), inset -2px -2px 5px rgba(255, 255, 255, 0.6)',
      '&:focus-within': {
        boxShadow: isDarkMode
          ? 'inset 3px 3px 6px rgba(0, 0, 0, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.05), 0 0 0 2px rgba(90, 90, 255, 0.2)'
          : 'inset 3px 3px 6px rgba(0, 0, 0, 0.08), inset -3px -3px 6px rgba(255, 255, 255, 0.7), 0 0 0 2px rgba(0, 120, 255, 0.2)',
      },
    };
  };

  // Стили для InputBase
  const getBaseInputStyles = () => ({
    width: '100%', 
    '& .MuiInputBase-input': {
      padding: 0,
      color: 'inherit',
      '&::placeholder': {
        opacity: isDarkMode ? 0.7 : 0.6,
        color: theme.palette.text.secondary,
      },
    },
  });

  // Стили для вспомогательного текста
  const getHelperTextStyles = () => ({
    fontSize: '0.75rem',
    marginTop: '4px',
    marginLeft: '8px',
    color: error 
      ? isDarkMode ? '#ff6b6b' : theme.palette.error.main
      : theme.palette.text.secondary,
  });

  // Анимации для фокуса
  const inputVariants = {
    hover: {
      scale: 1.005,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25
      }
    }
  };

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      <Box
        component={motion.div}
        whileHover={!disabled ? "hover" : undefined}
        variants={inputVariants}
        sx={getInputStyles()}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          width: '100%',
        }}>
          {startAdornment && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mr: 1, 
              color: theme.palette.text.secondary 
            }}>
              {startAdornment}
            </Box>
          )}
          
          <InputBase
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            multiline={multiline}
            rows={multiline ? rows : undefined}
            disabled={disabled}
            type={type}
            fullWidth
            sx={getBaseInputStyles()}
            {...props}
          />
          
          {endAdornment && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              ml: 1, 
              color: theme.palette.text.secondary 
            }}>
              {endAdornment}
            </Box>
          )}
        </Box>
      </Box>
      
      {helperText && (
        <Box sx={getHelperTextStyles()}>
          {helperText}
        </Box>
      )}
    </Box>
  );
};

export default NeuInput; 
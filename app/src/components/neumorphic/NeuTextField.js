import React, { useContext } from 'react';
import { TextField, Box, InputAdornment, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../index';

/**
 * Неоморфное текстовое поле с эффектами
 * 
 * @param {Object} props - Свойства компонента
 * @param {string} props.label - Метка поля
 * @param {string} props.placeholder - Текст-подсказка
 * @param {string} props.value - Значение поля
 * @param {function} props.onChange - Обработчик изменения
 * @param {boolean} props.fullWidth - Флаг на всю ширину
 * @param {boolean} props.multiline - Флаг многострочного режима
 * @param {number} props.rows - Количество строк для многострочного режима
 * @param {string} props.variant - Вариант поля (flat, inset)
 * @param {boolean} props.error - Флаг ошибки
 * @param {string} props.helperText - Вспомогательный текст
 * @param {boolean} props.disabled - Флаг отключения
 * @param {Object} props.startAdornment - Элемент в начале поля
 * @param {Object} props.endAdornment - Элемент в конце поля
 * @param {string} props.type - Тип поля (text, password, email, etc.)
 * @param {Object} props.sx - Дополнительные стили
 * @returns {JSX.Element}
 */
const NeuTextField = ({
  label,
  placeholder,
  value,
  onChange,
  fullWidth = false,
  multiline = false,
  rows = 1,
  variant = 'inset',
  error = false,
  helperText,
  disabled = false,
  startAdornment,
  endAdornment,
  type = 'text',
  sx = {},
  ...props
}) => {
  const theme = useTheme();
  const { isDarkMode } = useContext(ThemeContext);

  // Определение цветов и теней
  const backgroundColor = isDarkMode 
    ? disabled ? '#333' : '#2a2a2a' 
    : disabled ? '#f0f0f0' : '#ffffff';

  const lightShadow = isDarkMode 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.8)';
  
  const darkShadow = isDarkMode 
    ? 'rgba(0, 0, 0, 0.7)' 
    : 'rgba(0, 0, 0, 0.06)';

  // Определение теней в зависимости от варианта
  const getShadows = () => {
    switch (variant) {
      case 'flat':
        return 'none';
      case 'inset':
      default:
        return `inset 3px 3px 6px ${darkShadow}, inset -3px -3px 6px ${lightShadow}`;
    }
  };

  // Фокусные эффекты
  const getFocusStyles = () => {
    if (disabled) return {};
    
    const focusColor = error 
      ? theme.palette.error.main 
      : theme.palette.primary.main;
    
    return {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'transparent !important',
      },
      '& .MuiOutlinedInput-root.Mui-focused': {
        backgroundColor: isDarkMode ? '#303030' : '#ffffff',
        boxShadow: `inset 0 0 0 1px ${focusColor}`,
      }
    };
  };

  // Базовые стили
  const textFieldStyles = {
    backgroundColor: backgroundColor,
    borderRadius: '12px',
    boxShadow: getShadows(),
    transition: 'all 0.3s ease',
    width: fullWidth ? '100%' : 'auto',
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'transparent',
      borderRadius: '12px',
      '& fieldset': {
        border: 'none',
      },
    },
    '& .MuiInputBase-input': {
      padding: '12px 16px',
      color: isDarkMode ? (disabled ? '#888' : '#fff') : (disabled ? '#777' : '#333'),
    },
    '& .MuiFormLabel-root': {
      color: isDarkMode ? '#aaa' : '#777',
      fontSize: '0.9rem',
      transform: label ? 'translate(16px, -9px) scale(0.75)' : 'none',
      '&.Mui-focused': {
        color: error 
          ? theme.palette.error.main 
          : theme.palette.primary.main,
      },
      '&.Mui-error': {
        color: theme.palette.error.main,
      },
      '&.Mui-disabled': {
        color: isDarkMode ? '#666' : '#aaa',
      },
    },
    '& .MuiFormHelperText-root': {
      marginLeft: '4px',
      fontSize: '0.75rem',
    },
    ...getFocusStyles(),
    ...sx
  };

  // Анимации для фокуса
  const inputVariants = {
    rest: {
      boxShadow: getShadows(),
    },
    focus: {
      boxShadow: disabled 
        ? getShadows() 
        : `inset 3px 3px 8px ${darkShadow}, inset -3px -3px 8px ${lightShadow}, inset 0 0 0 1px ${error ? theme.palette.error.main : theme.palette.primary.main}`,
    }
  };

  return (
    <Box
      component={motion.div}
      initial="rest"
      whileHover={disabled ? 'rest' : 'focus'}
      animate="rest"
      variants={inputVariants}
      sx={{
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.8 : 1,
      }}
    >
      <TextField
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        fullWidth={fullWidth}
        multiline={multiline}
        rows={rows}
        error={error}
        helperText={helperText}
        disabled={disabled}
        type={type}
        variant="outlined"
        InputProps={{
          startAdornment: startAdornment && (
            <InputAdornment position="start">{startAdornment}</InputAdornment>
          ),
          endAdornment: endAdornment && (
            <InputAdornment position="end">{endAdornment}</InputAdornment>
          ),
        }}
        sx={textFieldStyles}
        {...props}
      />
    </Box>
  );
};

export default NeuTextField; 
import React from 'react';
import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

// Стилизованное текстовое поле с неоморфным дизайном
const StyledTextField = styled(TextField)(({ theme, neuVariant }) => {
  const isInset = neuVariant === 'inset';
  
  return {
    '& .MuiOutlinedInput-root': {
      borderRadius: '16px',
      transition: 'all 0.3s ease',
      backgroundColor: theme.palette.background.paper,
      boxShadow: isInset 
        ? theme.palette.neumorphic.boxShadowInset
        : 'none',
      overflow: 'hidden',
      
      '& fieldset': {
        borderColor: 'transparent',
      },
      
      '&:hover fieldset': {
        borderColor: 'transparent',
      },
      
      '&.Mui-focused': {
        boxShadow: isInset 
          ? 'inset 4px 4px 8px rgba(0, 0, 0, 0.1), inset -4px -4px 8px rgba(255, 255, 255, 0.5)'
          : theme.palette.neumorphic.boxShadow,
        
        '& fieldset': {
          borderColor: isInset ? 'transparent' : theme.palette.primary.main,
          borderWidth: isInset ? 0 : 1,
        },
      },
    },
    
    '& .MuiInputLabel-root': {
      transition: 'all 0.3s ease',
      color: theme.palette.text.secondary,
      
      '&.Mui-focused': {
        color: theme.palette.primary.main,
      },
    },
    
    '& .MuiInputBase-input': {
      padding: '14px 16px',
      fontSize: '16px',
      transition: 'all 0.2s ease-in-out',
      
      '&::placeholder': {
        opacity: 0.7,
        color: theme.palette.text.secondary,
      },
    },
  };
});

/**
 * Неоморфное текстовое поле
 * 
 * @param {Object} props
 * @param {string} props.label - Метка поля
 * @param {string} props.variant - Вариант поля: 'outlined' (по умолчанию) или 'inset'
 * @param {string} props.value - Значение поля
 * @param {function} props.onChange - Обработчик изменения
 * @param {string} props.placeholder - Placeholder
 * @param {boolean} props.fullWidth - Растягивает на всю ширину
 * @param {boolean} props.multiline - Многострочное поле
 * @param {number} props.rows - Количество строк для многострочного поля
 * @param {Object} props.InputProps - Дополнительные параметры для Input
 * @param {Object} props.sx - Дополнительные стили
 */
const NeuTextField = ({
  label,
  variant = 'outlined',
  value,
  onChange,
  placeholder,
  fullWidth = true,
  multiline = false,
  rows,
  InputProps,
  sx = {},
  ...props
}) => {
  // Маппинг вариантов на neomorphic/outlined
  const neuVariant = variant === 'inset' ? 'inset' : 'outlined';
  
  return (
    <StyledTextField
      label={label}
      variant="outlined"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      fullWidth={fullWidth}
      multiline={multiline}
      rows={rows}
      InputProps={InputProps}
      neuVariant={neuVariant}
      sx={sx}
      {...props}
    />
  );
};

export default NeuTextField; 
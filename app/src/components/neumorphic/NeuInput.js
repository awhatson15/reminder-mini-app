import React from 'react';
import { InputBase, styled } from '@mui/material';

/**
 * Неоморфное поле ввода
 */
const NeuInput = styled(InputBase)(({ theme, variant }) => {
  const isInset = variant === 'inset';
  
  return {
    'backgroundColor': theme.palette.background.paper,
    'borderRadius': '16px',
    'padding': '10px 16px',
    'fontFamily': theme.typography.fontFamily,
    'fontSize': theme.typography.body1.fontSize,
    'lineHeight': '1.5',
    'width': '100%',
    'transition': 'all 0.3s ease',
    'boxShadow': isInset 
      ? theme.palette.neumorphic.boxShadowInset
      : 'none',
    'border': isInset ? 'none' : `1px solid ${theme.palette.divider}`,
    
    '&:hover': {
      boxShadow: isInset 
        ? 'inset 3px 3px 6px rgba(0, 0, 0, 0.12), inset -3px -3px 6px rgba(255, 255, 255, 0.6)'
        : theme.palette.neumorphic.boxShadow,
    },
    
    '&.Mui-focused': {
      boxShadow: isInset 
        ? 'inset 4px 4px 8px rgba(0, 0, 0, 0.15), inset -4px -4px 8px rgba(255, 255, 255, 0.7)'
        : `0 0 0 2px ${theme.palette.primary.main}30`,
      borderColor: theme.palette.primary.main,
    },
    
    '&.Mui-disabled': {
      opacity: 0.7,
      backgroundColor: theme.palette.action.disabledBackground,
    },
    
    '& input::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 0.7,
    }
  };
});

export default NeuInput; 
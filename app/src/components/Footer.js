import React from 'react';
import { Box, Typography } from '@mui/material';
import { NeuCard } from './neumorphic';

/**
 * Упрощенный компонент нижней части приложения
 */
const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <NeuCard 
      variant="pressed" 
      sx={{ 
        p: 2, 
        mt: 2,
        borderRadius: '12px',
        textAlign: 'center'
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {year} Приложение Напоминания
      </Typography>
    </NeuCard>
  );
};

export default Footer; 
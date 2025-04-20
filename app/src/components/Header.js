import React from 'react';
import { Box, Typography } from '@mui/material';
import { NeuCard } from './neumorphic';

/**
 * Упрощенный компонент заголовка приложения
 */
const Header = () => {
  return (
    <NeuCard 
      variant="raised"
      sx={{
        p: 2,
        mb: 2,
        borderRadius: '12px',
        textAlign: 'center'
      }}
    >
      <Typography 
        variant="h5" 
        component="h1" 
        sx={{ 
          fontWeight: 600,
          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Напоминания
      </Typography>
    </NeuCard>
  );
};

export default Header; 
import React from 'react';
import { Box, Typography } from '@mui/material';
import { NeuCard } from './neumorphic';

/**
 * Компонент статус-бара с основной информацией
 * @param {Object} props - Свойства компонента
 * @param {Object} props.user - Информация о пользователе
 * @param {string} props.user.name - Имя пользователя
 */
const StatusBar = ({ user }) => {
  return (
    <NeuCard variant="flat" sx={{ mb: 3 }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between'
      }}>
        <Typography variant="h6" component="div">
          Напоминания
        </Typography>
        
        {user && (
          <Typography variant="body2" color="text.secondary">
            {user.name}
          </Typography>
        )}
      </Box>
    </NeuCard>
  );
};

export default StatusBar; 
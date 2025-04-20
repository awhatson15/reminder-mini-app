import React, { useContext } from 'react';
import { Box, Typography, styled } from '@mui/material';
import { UserContext } from '../App';
import { NeuCard } from './neumorphic';

// Стилизованный логотип
const Logo = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '20px',
  color: theme.palette.primary.main,
  textShadow: '1px 1px 1px rgba(0, 0, 0, 0.05)',
  letterSpacing: '0.5px',
}));

// Стилизованное имя пользователя
const Username = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  color: theme.palette.text.secondary,
  fontWeight: 400,
}));

/**
 * Компонент строки состояния приложения
 * Отображает логотип и имя пользователя
 */
const StatusBar = () => {
  const { user } = useContext(UserContext);
  
  const fullName = user ? 
    `${user.firstName || ''} ${user.lastName || ''}`.trim() : 
    'Гость';
  
  return (
    <NeuCard variant="raised" sx={{ mb: 3, py: 1.5, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo variant="h1">Reminder</Logo>
        <Username>{fullName}</Username>
      </Box>
    </NeuCard>
  );
};

export default StatusBar; 
import React from 'react';
import { Box } from '@mui/material';
import { NeuIconButton } from './neumorphic';
import { 
  Home as HomeIcon,
  Add as AddIcon
} from '@mui/icons-material';

/**
 * Компонент навигации приложения
 * @param {Function} onAddClick - Функция обработки нажатия на кнопку добавления
 * @param {Function} onHomeClick - Функция обработки нажатия на кнопку главной страницы
 */
const Navigation = ({ onAddClick, onHomeClick }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex',
        justifyContent: 'center',
        padding: 2,
        gap: 2
      }}
    >
      <NeuIconButton onClick={onHomeClick}>
        <HomeIcon />
      </NeuIconButton>
      
      <NeuIconButton onClick={onAddClick} color="primary">
        <AddIcon />
      </NeuIconButton>
    </Box>
  );
};

export default Navigation; 
import React from 'react';
import { Box } from '@mui/material';
import { NeuIcon } from './neumorphic';
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
      <NeuIcon 
        icon={<HomeIcon />}
        clickable
        onClick={onHomeClick}
      />
      
      <NeuIcon 
        icon={<AddIcon />}
        clickable
        color="primary"
        onClick={onAddClick}
      />
    </Box>
  );
};

export default Navigation; 
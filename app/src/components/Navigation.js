import React from 'react';
import { Box, styled } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  Settings as SettingsIcon 
} from '@mui/icons-material';
import { NeuIcon } from './neumorphic';

// Стилизованная навигационная панель
const NavContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  padding: '12px 0',
  backgroundColor: theme.palette.background.default,
  zIndex: 10,
  boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.05)',
  backdropFilter: 'blur(10px)',
}));

// Анимированный индикатор активного пункта
const ActiveIndicator = ({ x }) => (
  <Box
    component={motion.div}
    initial={false}
    animate={{ x }}
    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    sx={{
      position: 'absolute',
      top: '-5px',
      left: '50%',
      width: '4px',
      height: '4px',
      borderRadius: '50%',
      backgroundColor: 'primary.main',
      marginLeft: '-2px',
    }}
  />
);

// Главный компонент навигации
const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Определение активного пункта меню
  const getActiveIndex = () => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path === '/add') return 1;
    if (path.includes('/settings')) return 2;
    return 0;
  };
  
  // Позиции для активного индикатора
  const indicatorPositions = ['25%', '50%', '75%'];
  const activeIndex = getActiveIndex();

  return (
    <NavContainer>
      <ActiveIndicator x={indicatorPositions[activeIndex]} />
      
      {/* Календарь */}
      <NeuIcon
        icon={<CalendarIcon />}
        variant={activeIndex === 0 ? 'inset' : 'raised'}
        color={activeIndex === 0 ? 'primary.main' : 'text.secondary'}
        clickable
        onClick={() => navigate('/')}
      />
      
      {/* Добавить */}
      <NeuIcon
        icon={<AddIcon />}
        variant={activeIndex === 1 ? 'inset' : 'raised'}
        color={activeIndex === 1 ? 'primary.main' : 'text.secondary'}
        clickable
        onClick={() => navigate('/add')}
        size="large"
      />
      
      {/* Настройки */}
      <NeuIcon
        icon={<SettingsIcon />}
        variant={activeIndex === 2 ? 'inset' : 'raised'}
        color={activeIndex === 2 ? 'primary.main' : 'text.secondary'}
        clickable
        onClick={() => navigate('/settings')}
      />
    </NavContainer>
  );
};

export default Navigation; 
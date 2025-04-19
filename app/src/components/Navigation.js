import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Home as HomeIcon, AddCircle as AddIcon } from '@mui/icons-material';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getCurrentValue = () => {
    if (location.pathname === '/') return 0;
    if (location.pathname === '/add') return 1;
    return 0;
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        borderRadius: '0',
        zIndex: 1000
      }} 
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={getCurrentValue()}
        onChange={(event, newValue) => {
          if (newValue === 0) navigate('/');
          if (newValue === 1) navigate('/add');
        }}
      >
        <BottomNavigationAction label="Список" icon={<HomeIcon />} />
        <BottomNavigationAction label="Добавить" icon={<AddIcon />} />
      </BottomNavigation>
    </Paper>
  );
};

export default Navigation; 
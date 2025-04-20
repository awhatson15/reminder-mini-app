import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Paper, BottomNavigation, BottomNavigationAction, Box, useTheme } from '@mui/material';
import { Home as HomeIcon, AddCircleOutline as AddIcon, AddCircle as AddActiveIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  const getCurrentValue = () => {
    if (location.pathname === '/') return 0;
    if (location.pathname === '/add') return 1;
    return 0;
  };

  const currentValue = getCurrentValue();

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        borderRadius: '20px 20px 0 0',
        zIndex: 1000,
        padding: '8px 0',
        backdropFilter: 'blur(10px)',
        background: theme.palette.mode === 'dark' 
          ? 'rgba(29, 40, 53, 0.85)' 
          : 'rgba(255, 255, 255, 0.85)',
        borderTop: `1px solid ${theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.05)' 
          : 'rgba(0, 0, 0, 0.05)'
        }`
      }} 
      elevation={8}
    >
      <BottomNavigation
        showLabels
        value={currentValue}
        onChange={(event, newValue) => {
          if (newValue === 0) navigate('/');
          if (newValue === 1) navigate('/add');
        }}
        sx={{
          bgcolor: 'transparent',
          height: 60
        }}
      >
        <BottomNavigationAction 
          label="Список" 
          icon={
            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <HomeIcon 
                sx={{ 
                  fontSize: currentValue === 0 ? 26 : 24,
                  transition: 'all 0.3s ease'
                }} 
              />
              {currentValue === 0 && (
                <motion.div
                  layoutId="navigationIndicator"
                  initial={false}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: 'absolute',
                    bottom: -12,
                    width: 4,
                    height: 4,
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: '50%'
                  }}
                />
              )}
            </Box>
          }
          sx={{
            '&.Mui-selected': {
              color: theme.palette.primary.main
            }
          }}
        />
        <BottomNavigationAction 
          label="Добавить" 
          icon={
            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {currentValue === 1 ? <AddActiveIcon sx={{ fontSize: 26 }} /> : <AddIcon sx={{ fontSize: 24 }} />}
              {currentValue === 1 && (
                <motion.div
                  layoutId="navigationIndicator"
                  initial={false}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: 'absolute',
                    bottom: -12,
                    width: 4,
                    height: 4,
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: '50%'
                  }}
                />
              )}
            </Box>
          }
          sx={{
            '&.Mui-selected': {
              color: theme.palette.primary.main
            }
          }}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default Navigation; 
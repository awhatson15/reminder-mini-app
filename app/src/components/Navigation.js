import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Fab,
  useTheme,
  alpha,
  Zoom
} from '@mui/material';
import { 
  Add as AddIcon,
  Home as HomeIcon,
  ViewDay as ListIcon,
  DateRange as CalendarIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { ThemeContext } from '../index';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { isDarkMode } = useContext(ThemeContext);
  
  // Не показываем кнопку добавления на страницах добавления/редактирования
  const showAddButton = !location.pathname.includes('/add') && !location.pathname.includes('/edit');
  
  // Neumorphic стили для кнопки
  const neuButtonStyle = {
    boxShadow: isDarkMode 
      ? '5px 5px 10px rgba(0, 0, 0, 0.7), -5px -5px 10px rgba(255, 255, 255, 0.05)'
      : '5px 5px 10px rgba(0, 0, 0, 0.1), -5px -5px 10px rgba(255, 255, 255, 0.8)',
    background: isDarkMode 
      ? 'linear-gradient(145deg, #1f232d, #262a35)'
      : 'linear-gradient(145deg, #f0f7ff, #ffffff)',
    color: theme.palette.primary.main,
    border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
    width: 65,
    height: 65,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: isDarkMode 
        ? '7px 7px 15px rgba(0, 0, 0, 0.8), -7px -7px 15px rgba(255, 255, 255, 0.07)'
        : '7px 7px 15px rgba(0, 0, 0, 0.15), -7px -7px 15px rgba(255, 255, 255, 1)',
      transform: 'translateY(-5px)',
      color: theme.palette.primary.dark,
    },
    '&:active': {
      boxShadow: isDarkMode
        ? 'inset 5px 5px 10px rgba(0, 0, 0, 0.6), inset -5px -5px 10px rgba(255, 255, 255, 0.03)'
        : 'inset 5px 5px 10px rgba(0, 0, 0, 0.1), inset -5px -5px 10px rgba(255, 255, 255, 0.5)',
      transform: 'translateY(0)',
    }
  };
  
  const isActive = (path) => location.pathname === path;
  
  // Кнопки навигации
  const navItems = [
    { icon: <HomeIcon />, path: '/', label: 'Главная' },
    { icon: <CalendarIcon />, path: '/calendar', label: 'Календарь' },
    { icon: <ListIcon />, path: '/list', label: 'Список' }
  ];
  
  return (
    <Box 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        padding: '15px 0',
        backdropFilter: 'blur(10px)',
        backgroundColor: isDarkMode ? 'rgba(26, 29, 35, 0.8)' : 'rgba(230, 238, 248, 0.8)',
        borderTop: isDarkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: isDarkMode 
          ? '0 -5px 15px rgba(0, 0, 0, 0.5)'
          : '0 -5px 15px rgba(0, 0, 0, 0.05)'
      }}
    >
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        maxWidth: 600,
        position: 'relative'
      }}>
        {navItems.map((item) => (
          <motion.div
            key={item.path}
            whileHover={{ y: -5 }}
            whileTap={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Box
              onClick={() => navigate(item.path)}
              sx={{
                ...neuButtonStyle,
                width: 55,
                height: 55,
                color: isActive(item.path) ? theme.palette.primary.main : isDarkMode ? '#8CACDA' : '#546e7a',
                boxShadow: isActive(item.path) 
                  ? isDarkMode
                    ? 'inset 5px 5px 10px rgba(0, 0, 0, 0.6), inset -5px -5px 10px rgba(255, 255, 255, 0.03)'
                    : 'inset 5px 5px 10px rgba(0, 0, 0, 0.1), inset -5px -5px 10px rgba(255, 255, 255, 0.5)'
                  : neuButtonStyle.boxShadow,
              }}
            >
              {item.icon}
            </Box>
          </motion.div>
        ))}
        
        {/* Кнопка добавления, центрирована выше остальных */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '-40px', 
            left: '50%', 
            transform: 'translateX(-50%)'
          }}
        >
          <Zoom in={showAddButton} timeout={300}>
            <motion.div
              whileHover={{ y: -7, scale: 1.05 }}
              whileTap={{ y: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <Box
                onClick={() => navigate('/add')}
                sx={{
                  ...neuButtonStyle,
                  width: 70,
                  height: 70,
                  background: theme.palette.primary.main,
                  color: '#ffffff',
                }}
              >
                <AddIcon sx={{ fontSize: 32 }} />
              </Box>
            </motion.div>
          </Zoom>
        </Box>
      </Box>
    </Box>
  );
};

export default Navigation; 
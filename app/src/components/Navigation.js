import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  useTheme
} from '@mui/material';
import { 
  Add as AddIcon,
  Home as HomeIcon,
  ViewDay as ListIcon,
  DateRange as CalendarIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { ThemeContext } from '../index';
import { NeuCard, NeuIcon } from './neumorphic';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { isDarkMode } = useContext(ThemeContext);
  
  // Не показываем кнопку добавления на страницах добавления/редактирования
  const showAddButton = !location.pathname.includes('/add') && !location.pathname.includes('/edit');
  
  const isActive = (path) => location.pathname === path;
  
  // Кнопки навигации
  const navItems = [
    { icon: <HomeIcon />, path: '/', label: 'Главная' },
    { icon: <CalendarIcon />, path: '/calendar', label: 'Календарь' },
    { icon: <ListIcon />, path: '/list', label: 'Список' }
  ];
  
  return (
    <NeuCard
      variant="raised"
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        padding: '15px 0',
        backdropFilter: 'blur(10px)',
        backgroundColor: isDarkMode ? 'rgba(26, 29, 35, 0.8)' : 'rgba(230, 238, 248, 0.8)',
        borderRadius: '20px 20px 0 0',
      }}
    >
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        maxWidth: 600,
        position: 'relative',
        margin: '0 auto'
      }}>
        {navItems.map((item) => (
          <motion.div
            key={item.path}
            whileHover={{ y: -3 }}
            whileTap={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <NeuIcon
              icon={item.icon}
              variant={isActive(item.path) ? "inset" : "raised"}
              clickable
              color={isActive(item.path) ? theme.palette.primary.main : undefined}
              onClick={() => navigate(item.path)}
            />
          </motion.div>
        ))}
        
        {/* Кнопка добавления, центрирована выше остальных */}
        {showAddButton && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: '-40px', 
              left: '50%', 
              transform: 'translateX(-50%)'
            }}
          >
            <motion.div
              whileHover={{ y: -5 }}
              whileTap={{ y: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <NeuIcon
                icon={<AddIcon fontSize="large" />}
                variant="raised"
                size="large"
                clickable
                color="#fff"
                onClick={() => navigate('/add')}
                sx={{
                  background: theme.palette.primary.main,
                }}
              />
            </motion.div>
          </Box>
        )}
      </Box>
    </NeuCard>
  );
};

export default Navigation; 
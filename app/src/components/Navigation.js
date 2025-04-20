import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Paper, 
  BottomNavigation, 
  BottomNavigationAction,
  Box, 
  Fab,
  useTheme,
  alpha,
  Zoom
} from '@mui/material';
import { 
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  ViewList as ListIcon,
  Home as HomeIcon
} from '@mui/icons-material';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  // Определение текущего маршрута для активной вкладки
  const getCurrentRoute = () => {
    const path = location.pathname;
    
    if (path === '/') return 'calendar';
    if (path === '/list') return 'list';
    if (path.includes('/add') || path.includes('/edit')) return 'none';
    
    return 'calendar';
  };
  
  // Не показываем кнопку добавления на страницах добавления/редактирования
  const showAddButton = !location.pathname.includes('/add') && !location.pathname.includes('/edit');
  
  return (
    <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
      <Paper
        elevation={3}
        sx={{
          position: 'relative',
          borderRadius: '16px 16px 0 0',
          overflow: 'visible',
          bgcolor: alpha(theme.palette.background.paper, 0.98)
        }}
      >
        <BottomNavigation
          value={getCurrentRoute()}
          onChange={(_, newValue) => {
            if (newValue !== 'none') {
              navigate(newValue === 'calendar' ? '/' : `/${newValue}`);
            }
          }}
          showLabels
          sx={{ height: 60 }}
        >
          <BottomNavigationAction
            label="Календарь"
            value="calendar"
            icon={<CalendarIcon />}
          />
          <BottomNavigationAction
            value="none"
            icon={<Box sx={{ width: 0, height: 24 }} />}
            sx={{ 
              opacity: 0,
              pointerEvents: 'none',
              cursor: 'default'
            }}
          />
          <BottomNavigationAction
            label="Список"
            value="list"
            icon={<ListIcon />}
          />
        </BottomNavigation>
        
        {/* Плавающая кнопка добавления */}
        <Zoom in={showAddButton}>
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => navigate('/add')}
            sx={{
              position: 'absolute',
              top: -24,
              left: '50%',
              transform: 'translateX(-50%)',
              boxShadow: theme.shadows[3]
            }}
          >
            <AddIcon />
          </Fab>
        </Zoom>
      </Paper>
    </Box>
  );
};

export default Navigation; 
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
  Dashboard as DashboardIcon,
  EventNote as EventIcon
} from '@mui/icons-material';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  // Определение текущего маршрута для активной вкладки
  const getCurrentRoute = () => {
    const path = location.pathname;
    
    if (path === '/') return 'home';
    if (path.includes('/add') || path.includes('/edit')) return 'none';
    
    return 'home';
  };
  
  // Не показываем кнопку добавления на страницах добавления/редактирования
  const showAddButton = !location.pathname.includes('/add') && !location.pathname.includes('/edit');
  
  return (
    <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
      <Paper
        elevation={4}
        sx={{
          position: 'relative',
          borderRadius: '20px 20px 0 0',
          overflow: 'visible',
          bgcolor: alpha(theme.palette.background.paper, 0.98),
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`
        }}
      >
        <BottomNavigation
          value={getCurrentRoute()}
          onChange={(_, newValue) => {
            if (newValue !== 'none') {
              navigate(newValue === 'home' ? '/' : `/${newValue}`);
            }
          }}
          showLabels
          sx={{ height: 64 }}
        >
          <BottomNavigationAction
            label="Календарь"
            value="home"
            icon={<EventIcon sx={{ fontSize: 24 }} />}
            sx={{
              '&.Mui-selected': {
                color: theme.palette.primary.main
              }
            }}
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
        </BottomNavigation>
        
        {/* Плавающая кнопка добавления */}
        <Zoom in={showAddButton} timeout={300}>
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => navigate('/add')}
            sx={{
              position: 'absolute',
              top: -28,
              left: '50%',
              transform: 'translateX(-50%)',
              boxShadow: theme.shadows[4],
              width: 64,
              height: 64,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                transform: 'translateX(-50%) scale(1.05)',
                transition: 'all 0.2s'
              }
            }}
          >
            <AddIcon sx={{ fontSize: 32 }} />
          </Fab>
        </Zoom>
      </Paper>
    </Box>
  );
};

export default Navigation; 
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Fab,
  useTheme,
  alpha,
  Zoom
} from '@mui/material';
import { 
  Add as AddIcon
} from '@mui/icons-material';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  // Не показываем кнопку добавления на страницах добавления/редактирования
  const showAddButton = !location.pathname.includes('/add') && !location.pathname.includes('/edit');
  
  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      {/* Плавающая кнопка добавления */}
      <Zoom in={showAddButton} timeout={300}>
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => navigate('/add')}
          sx={{
            boxShadow: theme.shadows[6],
            width: 72,
            height: 72,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
              transform: 'scale(1.05)',
              transition: 'all 0.2s'
            }
          }}
        >
          <AddIcon sx={{ fontSize: 36 }} />
        </Fab>
      </Zoom>
    </Box>
  );
};

export default Navigation; 
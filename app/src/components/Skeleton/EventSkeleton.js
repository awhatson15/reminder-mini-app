import React from 'react';
import { Box, Skeleton, useTheme } from '@mui/material';

/**
 * Компонент скелетона для отображения состояния загрузки событий
 * 
 * @param {Object} props - Свойства компонента
 * @param {number} props.count - Количество скелетонов для отображения
 * @param {Object} props.sx - Дополнительные стили
 */
const EventSkeleton = ({ count = 3, sx = {} }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ width: '100%', ...sx }}>
      {Array.from(new Array(count)).map((_, index) => (
        <Box 
          key={index} 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mb: 2,
            p: 2,
            borderRadius: theme.shape.borderRadius,
            background: theme.palette.background.paper,
            boxShadow: theme.palette.neumorphic.boxShadow,
          }}
        >
          <Skeleton 
            variant="circular" 
            width={40} 
            height={40} 
            sx={{ 
              mr: 2,
              backgroundColor: theme.palette.action.hover 
            }} 
          />
          <Box sx={{ width: '100%' }}>
            <Skeleton 
              variant="text" 
              width="60%" 
              height={24}
              sx={{ backgroundColor: theme.palette.action.hover }} 
            />
            <Skeleton 
              variant="text" 
              width="40%" 
              height={18}
              sx={{ 
                mt: 0.5,
                backgroundColor: theme.palette.action.hover 
              }} 
            />
          </Box>
          <Skeleton 
            variant="rectangular" 
            width={24} 
            height={24}
            sx={{ 
              ml: 1,
              borderRadius: '4px',
              backgroundColor: theme.palette.action.hover 
            }} 
          />
        </Box>
      ))}
    </Box>
  );
};

export default EventSkeleton; 
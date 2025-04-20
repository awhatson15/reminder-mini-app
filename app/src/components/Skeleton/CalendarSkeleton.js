import React from 'react';
import { Box, Grid, Skeleton, useTheme } from '@mui/material';

/**
 * Компонент скелетона для отображения состояния загрузки календаря
 * 
 * @param {Object} props - Свойства компонента
 * @param {Object} props.sx - Дополнительные стили
 */
const CalendarSkeleton = ({ sx = {} }) => {
  const theme = useTheme();
  
  // Создаем массив из 7 дней недели
  const weekDayHeaders = Array.from(new Array(7));
  // Создаем сетку из 35 дней (5 недель) календаря
  const calendarDays = Array.from(new Array(35));
  
  return (
    <Box sx={{ width: '100%', ...sx }}>
      {/* Заголовок месяца */}
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>
        <Skeleton 
          variant="circular" 
          width={36} 
          height={36} 
          sx={{ backgroundColor: theme.palette.action.hover }} 
        />
        
        <Skeleton 
          variant="rectangular" 
          width={120} 
          height={32}
          sx={{ 
            borderRadius: '16px',
            backgroundColor: theme.palette.action.hover 
          }} 
        />
        
        <Skeleton 
          variant="circular" 
          width={36} 
          height={36} 
          sx={{ backgroundColor: theme.palette.action.hover }} 
        />
      </Box>
      
      {/* Дни недели */}
      <Grid container spacing={0.5} sx={{ mb: 1 }}>
        {weekDayHeaders.map((_, index) => (
          <Grid item xs={12/7} key={`weekday-${index}`}>
            <Skeleton 
              variant="text" 
              width="100%" 
              height={24}
              sx={{ 
                borderRadius: '4px',
                backgroundColor: theme.palette.action.hover 
              }} 
            />
          </Grid>
        ))}
      </Grid>
      
      {/* Календарная сетка */}
      <Grid container spacing={0.5}>
        {calendarDays.map((_, index) => (
          <Grid item xs={12/7} key={`day-${index}`}>
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={50}
              sx={{ 
                borderRadius: '8px',
                backgroundColor: theme.palette.action.hover 
              }} 
            />
          </Grid>
        ))}
      </Grid>
      
      {/* Выбранный день - события */}
      <Box sx={{ mt: 3 }}>
        <Skeleton 
          variant="rectangular" 
          width="100%" 
          height={200}
          sx={{ 
            borderRadius: '16px',
            backgroundColor: theme.palette.action.hover 
          }} 
        />
      </Box>
    </Box>
  );
};

export default CalendarSkeleton; 
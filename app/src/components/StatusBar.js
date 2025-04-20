import React, { useContext, useEffect, useState } from 'react';
import { Box, Typography, IconButton, Paper, Chip, useTheme } from '@mui/material';
import { UserContext } from '../App';
import { ThemeContext } from '../index';
import { getDaysUntil } from '../utils/dateUtils';
import { getEventIcon, getEventColor } from '../utils/eventUtils';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { fetchReminders } from '../services/reminderService';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';

const StatusBar = () => {
  const { user } = useContext(UserContext);
  const { isDarkMode } = useContext(ThemeContext);
  const theme = useTheme();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const getUpcomingEvents = async () => {
      try {
        setLoading(true);
        const allReminders = await fetchReminders(user.telegramId);
        
        // Фильтруем события, которые наступят в течение недели
        const now = dayjs();
        const oneWeekLater = now.add(7, 'day');
        
        const upcoming = allReminders
          .filter(reminder => {
            const reminderDate = dayjs(reminder.date);
            return reminderDate.isAfter(now) && reminderDate.isBefore(oneWeekLater);
          })
          .sort((a, b) => dayjs(a.date) - dayjs(b.date))
          .slice(0, 5); // Берем только первые 5 событий
        
        setUpcomingEvents(upcoming);
      } catch (error) {
        console.error('Ошибка при получении предстоящих событий:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.telegramId) {
      getUpcomingEvents();
    }
  }, [user]);

  const handleNext = () => {
    if (currentIndex < upcomingEvents.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Базовые стили для неоморфной карточки
  const neuCardStyle = {
    p: 2,
    mb: 3,
    borderRadius: 4,
    background: theme.palette.background.paper,
    boxShadow: theme.palette.neumorphic.boxShadow,
    border: 'none',
    position: 'relative',
    overflow: 'hidden',
  };

  // Стили для кнопок навигации
  const neuButtonStyle = {
    background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    boxShadow: isDarkMode
      ? '2px 2px 5px rgba(0, 0, 0, 0.3), -2px -2px 5px rgba(255, 255, 255, 0.05)'
      : '2px 2px 5px rgba(0, 0, 0, 0.05), -2px -2px 5px rgba(255, 255, 255, 0.8)',
    '&:hover': {
      background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      transform: 'translateY(-2px)',
    },
    '&:active': {
      boxShadow: theme.palette.neumorphic.active,
      transform: 'translateY(0px)',
    }
  };

  // Если нет предстоящих событий или загрузка
  if (loading) {
    return (
      <Paper elevation={0} sx={neuCardStyle}>
        <Typography variant="subtitle2" sx={{ textAlign: 'center', py: 1 }}>
          Загрузка событий...
        </Typography>
      </Paper>
    );
  }

  if (upcomingEvents.length === 0) {
    return (
      <Paper elevation={0} sx={neuCardStyle}>
        <Typography variant="subtitle2" sx={{ textAlign: 'center', py: 1 }}>
          Нет предстоящих событий на ближайшую неделю
        </Typography>
      </Paper>
    );
  }

  const currentEvent = upcomingEvents[currentIndex];
  const daysUntil = getDaysUntil(currentEvent.date);
  const EventIcon = getEventIcon(currentEvent.type);
  const eventColor = getEventColor(currentEvent.type, currentEvent.group);
  
  // Определяем срочность и соответствующий цвет градиента
  let urgencyGradient;
  if (daysUntil <= 1) {
    urgencyGradient = 'linear-gradient(90deg, rgba(244, 67, 54, 0.05) 0%, rgba(244, 67, 54, 0.25) 100%)';
  } else if (daysUntil <= 3) {
    urgencyGradient = 'linear-gradient(90deg, rgba(255, 152, 0, 0.05) 0%, rgba(255, 152, 0, 0.25) 100%)';
  } else {
    urgencyGradient = 'linear-gradient(90deg, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0.25) 100%)';
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30
        }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            ...neuCardStyle,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: urgencyGradient,
              zIndex: 0,
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    mr: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: theme.palette.background.default,
                    boxShadow: theme.palette.neumorphic.boxShadowInset,
                  }}
                >
                  <EventIcon sx={{ color: eventColor, fontSize: 30 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {currentEvent.title}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    py: 0.7,
                    borderRadius: 4,
                    background: theme.palette.background.default,
                    boxShadow: theme.palette.neumorphic.boxShadowInset,
                  }}
                >
                  <AccessTimeIcon sx={{ mr: 1, fontSize: 18, color: eventColor }} />
                  <Typography variant="body2" fontWeight={600}>
                    {`${daysUntil} ${daysUntil === 1 ? 'день' : daysUntil < 5 ? 'дня' : 'дней'}`}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  px: 2,
                  py: 0.7,
                  borderRadius: 4,
                  background: theme.palette.background.default,
                  boxShadow: theme.palette.neumorphic.boxShadowInset,
                }}
              >
                {dayjs(currentEvent.date).format('DD MMMM YYYY')}
              </Typography>
              
              {upcomingEvents.length > 1 && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton 
                    size="small" 
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    sx={neuButtonStyle}
                  >
                    <NavigateBeforeIcon fontSize="small" />
                  </IconButton>
                  
                  <Typography variant="body2" sx={{ mx: 1, fontWeight: 600 }}>
                    {currentIndex + 1}/{upcomingEvents.length}
                  </Typography>
                  
                  <IconButton 
                    size="small" 
                    onClick={handleNext}
                    disabled={currentIndex === upcomingEvents.length - 1}
                    sx={neuButtonStyle}
                  >
                    <NavigateNextIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </AnimatePresence>
  );
};

export default StatusBar; 
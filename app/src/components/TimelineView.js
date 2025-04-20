import React, { useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  useTheme, 
  alpha, 
  Avatar, 
  Chip, 
  IconButton 
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getDaysUntil, formatRelativeTime, getDayOfWeek } from '../utils/dateUtils';
import { getEventIcon, getEventIconByGroup } from '../utils/eventUtils';
import { plural } from '../utils/textUtils';
import dayjs from 'dayjs';

// Анимации
const timelineVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.4 } },
  exit: { opacity: 0, y: -10 }
};

// Анимация элементов ленты
const itemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: (i) => ({ 
    opacity: 1, 
    x: 0, 
    transition: { 
      delay: i * 0.1, 
      duration: 0.4 
    } 
  }),
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

// Категории и их цвета
const CATEGORY_COLORS = {
  'birthday': '#e91e63', // розовый/красный для дней рождения
  'семья': '#4caf50',    // зеленый для семейных событий
  'работа': '#2196f3',   // синий для рабочих событий
  'друзья': '#9c27b0',   // фиолетовый для друзей
  'другое': '#ff9800'    // оранжевый для других событий
};

const TimelineView = ({ reminders }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Сортировка напоминаний по времени (ближайшие вначале)
  const sortedReminders = useMemo(() => {
    return [...reminders].sort((a, b) => {
      const daysUntilA = getDaysUntil(a.date);
      const daysUntilB = getDaysUntil(b.date);
      return daysUntilA - daysUntilB;
    });
  }, [reminders]);
  
  // Получение цвета для события
  const getEventColor = (reminder) => {
    return reminder.type === 'birthday'
      ? CATEGORY_COLORS.birthday
      : CATEGORY_COLORS[reminder.group];
  };
  
  // Получение иконки для события
  const getIconForReminder = (reminder) => {
    return reminder.type === 'birthday'
      ? getEventIcon('birthday')
      : getEventIconByGroup(reminder.group);
  };
  
  // Форматирование относительного времени
  const formatTimeLeft = (reminder) => {
    const daysUntil = getDaysUntil(reminder.date);
    
    if (daysUntil === 0) return 'Сегодня';
    if (daysUntil === 1) return 'Завтра';
    
    return `Через ${daysUntil} ${plural(daysUntil, 'день', 'дня', 'дней')}`;
  };
  
  const formatDate = (date) => {
    const day = getDayOfWeek(date, 'full');
    return `${day}, ${date.format('D MMMM YYYY')}`;
  };
  
  return (
    <motion.div
      variants={timelineVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Box sx={{ width: '100%' }}>
        {sortedReminders.length === 0 ? (
          <Paper 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Нет напоминаний
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Добавьте напоминание, чтобы оно появилось в ленте
            </Typography>
          </Paper>
        ) : (
          <Box 
            sx={{ 
              position: 'relative', 
              pl: 4,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 16,
                top: 0,
                bottom: 0,
                width: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                zIndex: 1
              }
            }}
          >
            {sortedReminders.map((reminder, index) => {
              const eventColor = getEventColor(reminder);
              const eventIcon = getIconForReminder(reminder);
              const timeLeft = formatTimeLeft(reminder);
              const daysUntil = getDaysUntil(reminder.date);
              const formattedDate = formatDate(dayjs(reminder.date));
              
              // Определяем цвет маркера времени
              const getTimeChipColor = () => {
                if (daysUntil === 0) return 'error';
                if (daysUntil <= 3) return 'warning';
                if (daysUntil <= 7) return 'info';
                return 'default';
              };
              
              return (
                <motion.div
                  key={reminder._id}
                  custom={index}
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Box 
                    sx={{ 
                      position: 'relative', 
                      mb: 3,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: -12,
                        top: 16,
                        width: 10,
                        height: 2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        zIndex: 1
                      }
                    }}
                  >
                    {/* Точка на временной шкале */}
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        left: -16,
                        top: 12,
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: eventColor,
                        border: `2px solid ${theme.palette.background.paper}`
                      }}
                    />
                    
                    <Paper
                      sx={{ 
                        p: 2.5,
                        borderRadius: 2,
                        borderLeft: `4px solid ${eventColor}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: `0 6px 16px ${alpha(eventColor, 0.18)}`,
                          transform: 'translateY(-3px)'
                        }
                      }}
                      onClick={() => navigate(`/edit/${reminder._id}`)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            sx={{
                              bgcolor: alpha(eventColor, 0.15),
                              color: eventColor,
                              width: 48,
                              height: 48,
                              mr: 2
                            }}
                          >
                            {eventIcon}
                          </Avatar>
                          
                          <Box>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {reminder.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formattedDate}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <IconButton 
                          size="medium"
                          color="primary"
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.15)
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/edit/${reminder._id}`);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      {reminder.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ mt: 2, mb: 1, pl: 8 }}
                        >
                          {reminder.description}
                        </Typography>
                      )}
                      
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mt: reminder.description ? 2 : 3,
                          pl: 8
                        }}
                      >
                        <Chip
                          label={timeLeft}
                          size="small"
                          color={getTimeChipColor()}
                          variant={daysUntil <= 3 ? "filled" : "outlined"}
                          icon={daysUntil <= 3 ? <ArrowIcon /> : undefined}
                          sx={{
                            height: 28,
                            fontWeight: daysUntil <= 3 ? 'medium' : 'normal'
                          }}
                        />
                        
                        <Typography variant="caption" color="text.secondary">
                          {reminder.type === 'birthday' 
                            ? 'День рождения' 
                            : `Категория: ${reminder.group}`}
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                </motion.div>
              );
            })}
          </Box>
        )}
      </Box>
    </motion.div>
  );
};

export default TimelineView; 
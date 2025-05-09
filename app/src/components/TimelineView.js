import React, { useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  useTheme, 
  alpha, 
  Avatar, 
  Chip, 
  IconButton,
  Divider 
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowForward as ArrowIcon,
  AccessTime as TimeIcon
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

// Анимация элементов ленты - сделаем более сдержанной
const itemVariants = {
  initial: { opacity: 0, x: -10 },
  animate: (i) => ({ 
    opacity: 1, 
    x: 0, 
    transition: { 
      delay: i * 0.05, // Уменьшаем задержку для более быстрого появления
      duration: 0.3 
    } 
  }),
  hover: { 
    scale: 1.01, // Уменьшаем эффект наведения
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.99,
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
  const isMobile = window.innerWidth <= 600;
  
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
    
    return `${daysUntil} ${plural(daysUntil, 'день', 'дня', 'дней')}`;
  };
  
  const formatDate = (date) => {
    const { day, month, year } = date;
    const dateObj = dayjs(new Date(year || new Date().getFullYear(), month - 1, day));
    return `${day} ${dateObj.format('MMM')}`;
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
              p: 2, // Уменьшаем отступы
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
              pl: 3, // Уменьшаем отступ слева
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 12, // Смещаем линию ближе
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
              const formattedDate = formatDate(reminder.date);
              
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
                      mb: 1.5, // Уменьшаем отступ между элементами
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: -9, // Смещаем соединитель
                        top: 16,
                        width: 8, // Уменьшаем ширину соединителя
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
                        left: -13, // Смещаем точку
                        top: 12,
                        width: 8, // Уменьшаем размер точки
                        height: 8, // Уменьшаем размер точки
                        borderRadius: '50%',
                        backgroundColor: eventColor,
                        border: `2px solid ${theme.palette.background.paper}`
                      }}
                    />
                    
                    <Paper
                      sx={{ 
                        p: isMobile ? 1.5 : 2, // Уменьшаем внутренние отступы
                        borderRadius: 2,
                        borderLeft: `3px solid ${eventColor}`, // Уменьшаем ширину бордера
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: `0 4px 12px ${alpha(eventColor, 0.15)}`, // Уменьшаем тень
                          transform: 'translateY(-2px)' // Уменьшаем смещение при наведении
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
                              width: 36, // Уменьшаем аватар
                              height: 36, // Уменьшаем аватар
                              mr: 1.5 // Уменьшаем отступ
                            }}
                          >
                            {eventIcon}
                          </Avatar>
                          
                          <Box>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {reminder.title}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.3 }}>
                              <Chip
                                label={timeLeft}
                                size="small"
                                color={getTimeChipColor()}
                                variant={daysUntil <= 3 ? "filled" : "outlined"}
                                sx={{
                                  height: 20, // Меньший размер чипа
                                  fontSize: '0.7rem', // Меньший шрифт
                                  '& .MuiChip-label': {
                                    px: 1, // Меньший внутренний отступ
                                  }
                                }}
                              />
                              <Typography variant="caption" color="text.secondary" ml={1}>
                                {formattedDate}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        <IconButton 
                          size="small" // Меньшая кнопка
                          color="primary"
                          sx={{
                            p: 0.5, // Меньший отступ
                            ml: 1,
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
                          variant="caption" // Меньший размер шрифта
                          color="text.secondary"
                          sx={{ 
                            display: 'block', 
                            mt: 1, 
                            ml: 7 // Выравнивание с текстом название  
                          }}
                        >
                          {reminder.description.length > 100 ? 
                            `${reminder.description.substring(0, 100)}...` : 
                            reminder.description}
                        </Typography>
                      )}
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
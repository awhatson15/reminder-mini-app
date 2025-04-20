import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  useTheme, 
  alpha, 
  Avatar, 
  Chip, 
  IconButton,
  Button,
  Divider,
  LinearProgress,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import {
  Edit as EditIcon,
  Today as TodayIcon,
  NextWeek as NextWeekIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getDaysUntil, formatDatePretty } from '../utils/dateUtils';
import { getEventIcon, getEventIconByGroup } from '../utils/eventUtils';
import { plural } from '../utils/textUtils';
import dayjs from 'dayjs';

// Анимации
const containerVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.4 } },
  exit: { opacity: 0, y: -10 }
};

const itemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20 }
};

// Категории и их цвета
const CATEGORY_COLORS = {
  'birthday': '#e91e63',
  'семья': '#4caf50',
  'работа': '#2196f3',
  'друзья': '#9c27b0',
  'другое': '#ff9800'
};

// Длительность помодоро в минутах
const POMODORO_DURATION = 25;
const BREAK_DURATION = 5;

const FocusView = ({ reminders }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Состояния
  const [timeFilter, setTimeFilter] = useState('today'); // today, tomorrow, week
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  
  // Фильтрация напоминаний
  const filteredReminders = useMemo(() => {
    return reminders.filter(reminder => {
      const daysUntil = getDaysUntil(reminder.date);
      
      switch (timeFilter) {
        case 'today':
          return daysUntil === 0;
        case 'tomorrow':
          return daysUntil === 1;
        case 'week':
          return daysUntil <= 7;
        default:
          return false;
      }
    }).sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date));
  }, [reminders, timeFilter]);
  
  // Обработка таймера
  const startTimer = (reminderId) => {
    setActiveTimer(reminderId);
    setTimerRunning(true);
    setTimeLeft(POMODORO_DURATION * 60);
    setIsBreak(false);
  };
  
  const pauseTimer = () => {
    setTimerRunning(false);
  };
  
  const stopTimer = () => {
    setActiveTimer(null);
    setTimerRunning(false);
    setTimeLeft(0);
    setIsBreak(false);
  };
  
  const formatTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
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
  
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Box sx={{ width: '100%' }}>
        {/* Фильтры по времени */}
        <Paper 
          sx={{ 
            p: 1, 
            mb: 3,
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'center',
            width: '100%'
          }}
        >
          <ToggleButtonGroup
            value={timeFilter}
            exclusive
            onChange={(_, value) => value && setTimeFilter(value)}
            size="small"
            sx={{ 
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              '& .MuiToggleButton-root': {
                flex: 1,
                px: 2,
                py: 0.75,
                mx: 0.5,
                borderRadius: '8px !important',
                textTransform: 'none',
                fontWeight: 'medium',
                fontSize: '0.875rem',
                '&:first-of-type': {
                  ml: 0
                },
                '&:last-of-type': {
                  mr: 0
                }
              }
            }}
          >
            <ToggleButton value="today">
              <TodayIcon sx={{ mr: 0.5, fontSize: '1.25rem' }} />
              Сегодня
            </ToggleButton>
            <ToggleButton value="tomorrow">
              <NextWeekIcon sx={{ mr: 0.5, fontSize: '1.25rem' }} />
              Завтра
            </ToggleButton>
            <ToggleButton value="week">
              <TimerIcon sx={{ mr: 0.5, fontSize: '1.25rem' }} />
              Неделя
            </ToggleButton>
          </ToggleButtonGroup>
        </Paper>

        {/* Список напоминаний */}
        <AnimatePresence mode="wait">
          {filteredReminders.length === 0 ? (
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
                {timeFilter === 'today' 
                  ? 'На сегодня нет запланированных событий'
                  : timeFilter === 'tomorrow'
                    ? 'На завтра нет запланированных событий'
                    : 'На ближайшую неделю нет запланированных событий'}
              </Typography>
            </Paper>
          ) : (
            filteredReminders.map((reminder) => {
              const eventColor = getEventColor(reminder);
              const eventIcon = getIconForReminder(reminder);
              const isActive = activeTimer === reminder._id;
              
              return (
                <motion.div
                  key={reminder._id}
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  layout
                >
                  <Paper
                    sx={{ 
                      p: 2.5,
                      mb: 2,
                      borderRadius: 2,
                      borderLeft: `4px solid ${eventColor}`,
                      transition: 'all 0.2s',
                      transform: isActive ? 'scale(1.02)' : 'none',
                      boxShadow: isActive 
                        ? `0 8px 24px ${alpha(eventColor, 0.25)}`
                        : undefined
                    }}
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
                            {formatDatePretty(new Date(
                              reminder.date.year || new Date().getFullYear(),
                              reminder.date.month - 1,
                              reminder.date.day
                            ), true)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {!isActive ? (
                          <IconButton
                            size="medium"
                            sx={{
                              bgcolor: alpha(eventColor, 0.1),
                              color: eventColor,
                              '&:hover': {
                                bgcolor: alpha(eventColor, 0.2)
                              }
                            }}
                            onClick={() => startTimer(reminder._id)}
                          >
                            <TimerIcon />
                          </IconButton>
                        ) : (
                          <>
                            <IconButton
                              size="medium"
                              sx={{
                                bgcolor: alpha(eventColor, 0.1),
                                color: eventColor,
                                '&:hover': {
                                  bgcolor: alpha(eventColor, 0.2)
                                }
                              }}
                              onClick={() => timerRunning ? pauseTimer() : startTimer(reminder._id)}
                            >
                              {timerRunning ? <PauseIcon /> : <PlayIcon />}
                            </IconButton>
                            <IconButton
                              size="medium"
                              sx={{
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                color: theme.palette.error.main,
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.error.main, 0.2)
                                }
                              }}
                              onClick={stopTimer}
                            >
                              <StopIcon />
                            </IconButton>
                          </>
                        )}
                        
                        <IconButton 
                          size="medium"
                          color="primary"
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.15)
                            }
                          }}
                          onClick={() => navigate(`/edit/${reminder._id}`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Box>
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
                    
                    {isActive && (
                      <Box sx={{ mt: 2, pl: 8 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                            {isBreak ? 'Перерыв:' : 'Фокус:'}
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {formatTimer(timeLeft)}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={(timeLeft / (isBreak ? BREAK_DURATION : POMODORO_DURATION) / 60) * 100}
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: alpha(eventColor, 0.1),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: eventColor
                            }
                          }} 
                        />
                      </Box>
                    )}
                  </Paper>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </Box>
    </motion.div>
  );
};

export default FocusView; 
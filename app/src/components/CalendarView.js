import React, { useState, useEffect, useContext, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  IconButton, 
  Badge, 
  Paper, 
  useTheme, 
  alpha, 
  Chip, 
  Tabs, 
  Tab,
  Divider,
  Button,
  Fade,
  Avatar,
  TableHead,
  TableCell,
  TableRow
} from '@mui/material';
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  CalendarToday as CalendarIcon,
  Timer as TimerIcon,
  Timeline as TimelineIcon,
  Add as AddIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { UserContext, AppSettingsContext } from '../App';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { getDaysUntil, getMonthName, isToday, isTomorrow, getDayOfWeek, WEEKDAYS_SHORT } from '../utils/dateUtils';
import Loading from './Loading';
import TimelineView from './TimelineView';
import FocusView from './FocusView';
import { getEventIcon, getEventIconByGroup } from '../utils/eventUtils';
import Toast from './Toast';

// Названия дней недели
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// Названия месяцев в именительном падеже
const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

// Категории и их цвета
const CATEGORY_COLORS = {
  'birthday': '#e91e63', // розовый/красный для дней рождения
  'семья': '#4caf50',    // зеленый для семейных событий
  'работа': '#2196f3',   // синий для рабочих событий
  'друзья': '#9c27b0',   // фиолетовый для друзей
  'другое': '#ff9800'    // оранжевый для других событий
};

// Анимация календаря
const calendarVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.4 } },
  exit: { opacity: 0, y: -10 }
};

// Добавляю функцию generateCalendarDates
const generateCalendarDates = (date) => {
  const year = date.year();
  const month = date.month();
  
  // Начало месяца
  const startOfMonth = dayjs(new Date(year, month, 1));
  // День недели начала месяца (0 - воскресенье, поэтому корректируем для нашего календаря)
  const startDayOfWeek = startOfMonth.day() === 0 ? 7 : startOfMonth.day();
  
  // Количество дней в месяце
  const daysInMonth = startOfMonth.daysInMonth();
  
  // Генерируем массив с датами
  const calendarDays = [];
  let currentWeek = [];
  
  // Добавляем дни предыдущего месяца
  for (let i = 1; i < startDayOfWeek; i++) {
    const prevMonthDay = startOfMonth.subtract(startDayOfWeek - i, 'day');
    currentWeek.push(prevMonthDay.toDate());
  }
  
  // Добавляем дни текущего месяца
  for (let i = 1; i <= daysInMonth; i++) {
    const currentDay = dayjs(new Date(year, month, i));
    currentWeek.push(currentDay.toDate());
    
    // Если достигли конца недели или конца месяца
    if (currentWeek.length === 7 || i === daysInMonth) {
      // Если не конец месяца и неделя не полная, добавляем дни следующего месяца
      if (currentWeek.length < 7) {
        const daysToAdd = 7 - currentWeek.length;
        for (let j = 1; j <= daysToAdd; j++) {
          const nextMonthDay = dayjs(new Date(year, month, i + j));
          currentWeek.push(nextMonthDay.toDate());
        }
      }
      
      calendarDays.push([...currentWeek]);
      currentWeek = [];
    }
  }
  
  return calendarDays;
};

const CalendarView = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { settings } = useContext(AppSettingsContext);
  const isMobile = window.innerWidth <= 600;
  
  // Состояние
  const [currentDate, setCurrentDate] = useState(dayjs()); // текущая отображаемая дата
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(settings.defaultScreen || 'calendar'); // Используем настройку из контекста
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  
  // Загрузка напоминаний
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/reminders?telegramId=${user.telegramId}`)
          .catch(error => {
            console.error('Ошибка при загрузке напоминаний:', error);
            // В случае ошибки API, используем пустой массив
            throw error;
          });
        
        setReminders(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Не удалось загрузить напоминания:', error);
        // В случае ошибки используем пустой массив
        setReminders([]);
        setToast({
          open: true,
          message: 'Не удалось загрузить напоминания. Проверьте подключение к сети.',
          severity: 'error'
        });
        setLoading(false);
      }
    };

    fetchReminders();
  }, [user]);

  // Вычисление дней текущего месяца
  const calendarDays = useMemo(() => {
    // Первый день месяца
    const firstDay = currentDate.startOf('month');
    // День недели (0 - понедельник, ... 6 - воскресенье)
    const startingDayOfWeek = firstDay.day() || 7; // В dayjs 0 - это воскресенье
    const startDay = startingDayOfWeek === 1 ? firstDay : firstDay.subtract(startingDayOfWeek - 1, 'day');
    
    // Создаем массив с датами
    const days = [];
    for (let i = 0; i < 42; i++) { // 6 недель по 7 дней
      const day = startDay.add(i, 'day');
      days.push(day);
    }
    
    return days;
  }, [currentDate]);

  // Группировка напоминаний по датам
  const remindersByDate = useMemo(() => {
    const result = {};
    
    reminders.forEach(reminder => {
      const { day, month, year } = reminder.date;
      
      // Создаем ключ для даты (формат: день-месяц)
      const dateKey = `${day}-${month}`;
      
      if (!result[dateKey]) {
        result[dateKey] = [];
      }
      
      result[dateKey].push(reminder);
    });
    
    return result;
  }, [reminders]);

  // Обработка выбора даты
  const handleDateClick = (day) => {
    const dateKey = `${day.date()}-${day.month() + 1}`;
    const dateEvents = remindersByDate[dateKey] || [];
    
    setSelectedDate(day);
    setSelectedDateEvents(dateEvents);
  };

  // Долгое нажатие для создания события
  const handleLongPress = (day) => {
    // Редирект на страницу добавления с предзаполненной датой
    navigate('/add', { 
      state: { 
        presetDate: {
          day: day.date(),
          month: day.month() + 1,
          year: day.year()
        }
      }
    });
  };

  // Навигация по месяцам
  const nextMonth = () => {
    setCurrentDate(currentDate.add(1, 'month'));
  };

  const prevMonth = () => {
    setCurrentDate(currentDate.subtract(1, 'month'));
  };

  // Получение цвета для даты на основе категорий событий
  const getDateColor = (day) => {
    const dateKey = `${day.date()}-${day.month() + 1}`;
    const dateEvents = remindersByDate[dateKey] || [];
    
    if (dateEvents.length === 0) return null;
    
    // Если есть только одно событие, используем его цвет
    if (dateEvents.length === 1) {
      const event = dateEvents[0];
      return event.type === 'birthday' 
        ? CATEGORY_COLORS.birthday 
        : CATEGORY_COLORS[event.group];
    }
    
    // Если есть несколько событий, определяем цвета по приоритету
    const hasBirthday = dateEvents.some(event => event.type === 'birthday');
    if (hasBirthday) return CATEGORY_COLORS.birthday;
    
    // Проверяем наличие каждой категории
    for (const category of ['семья', 'работа', 'друзья', 'другое']) {
      if (dateEvents.some(event => event.group === category)) {
        return CATEGORY_COLORS[category];
      }
    }
    
    return CATEGORY_COLORS.другое; // Запасной вариант
  };

  // Получение количества событий для даты
  const getEventCount = (day) => {
    const dateKey = `${day.date()}-${day.month() + 1}`;
    return (remindersByDate[dateKey] || []).length;
  };

  const renderDate = (day, row, col) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const isToday = day && day.toDateString() === today.toDateString();
    const isCurrentMonth = day && day.getMonth() === currentDate.getMonth();
    
    const hasReminders = day && remindersByDate[day.toISOString().split('T')[0]];
    const remindersCount = hasReminders ? hasReminders.length : 0;
    
    return (
      <Box 
        component={motion.div}
        key={`${row}-${col}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
          cursor: day ? 'pointer' : 'default',
          borderRadius: '14px',
          border: theme => isToday 
            ? `2px solid ${theme.palette.primary.main}` 
            : `1px solid ${alpha(theme.palette.divider, isCurrentMonth ? 0.08 : 0.02)}`,
          backgroundColor: theme => isToday
            ? alpha(theme.palette.primary.main, 0.08)
            : isCurrentMonth
              ? alpha(theme.palette.background.paper, 0.5)
              : alpha(theme.palette.background.default, 0.3),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 2px',
          opacity: isCurrentMonth ? 1 : 0.4,
          boxShadow: theme => isToday 
            ? `0 0 10px ${alpha(theme.palette.primary.main, 0.2)}` 
            : 'none',
          overflow: 'hidden',
          transition: theme => theme.transitions.create(['background-color', 'transform', 'box-shadow'], {
            duration: theme.transitions.duration.shorter,
          }),
        }}
        onClick={() => day && handleDateClick(day)}
      >
        {day && (
          <>
            <Typography
              variant="body2"
              sx={{
                fontWeight: isToday ? 'bold' : isCurrentMonth ? 'medium' : 'normal',
                color: theme => isToday 
                  ? theme.palette.primary.main 
                  : isCurrentMonth 
                    ? theme.palette.text.primary 
                    : theme.palette.text.secondary,
                position: 'relative',
                zIndex: 1,
              }}
            >
              {day.getDate()}
            </Typography>
            
            {remindersCount > 0 && (
              <Box 
                component={motion.div}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                sx={{ 
                  mt: 'auto', 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                {remindersCount > 0 && (
                  <Chip
                    size="small"
                    label={remindersCount}
                    color="primary"
                    sx={{
                      height: '20px',
                      minWidth: '20px',
                      borderRadius: '10px',
                      '& .MuiChip-label': {
                        px: 1,
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                      }
                    }}
                  />
                )}
              </Box>
            )}
          </>
        )}
      </Box>
    );
  };

  const renderCalendar = () => {
    const days = [];
    const dates = generateCalendarDates(currentDate);
    
    // Дни недели
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%' }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          mb: 2
        }}>
          {/* Навигация по месяцам */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            px: isMobile ? 1 : 2
          }}>
            <IconButton 
              onClick={prevMonth}
              component={motion.button}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              sx={{
                bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: theme => alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              <PrevIcon />
            </IconButton>
            
            <Typography 
              variant="h6" 
              component={motion.h6}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={`${currentDate.getMonth()}-${currentDate.getFullYear()}`}
              transition={{ duration: 0.3 }}
              fontWeight="medium"
              sx={{
                textAlign: 'center',
                letterSpacing: 0.5,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 30,
                  height: 2,
                  background: theme => theme.palette.primary.main,
                  borderRadius: 4
                }
              }}
            >
              {new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(currentDate)}
            </Typography>
            
            <IconButton 
              onClick={nextMonth}
              component={motion.button}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              sx={{
                bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: theme => alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              <NextIcon />
            </IconButton>
          </Box>
          
          {/* Дни недели */}
          <Grid container spacing={1} columns={7} sx={{ mb: 1 }}>
            {weekDays.map((day, index) => (
              <Grid item xs={1} key={index}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    textAlign: 'center', 
                    display: 'block',
                    fontWeight: 'medium',
                    color: theme => index >= 5 ? theme.palette.primary.main : theme.palette.text.secondary,
                  }}
                >
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>
          
          {/* Календарная сетка */}
          <Grid 
            container 
            spacing={1} 
            columns={7}
            sx={{
              p: 1,
              borderRadius: '12px',
              bgcolor: theme => alpha(theme.palette.background.paper, 0.5),
              boxShadow: theme => `inset 0 0 8px ${alpha(theme.palette.primary.main, 0.05)}`,
            }}
          >
            {dates.map((week, row) =>
              week.map((day, col) => (
                <Grid item xs={1} key={`${row}-${col}`} sx={{ 
                  aspectRatio: '1/1',
                  p: 0.5,
                }}>
                  {renderDate(day, row, col)}
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      </motion.div>
    );
  };

  if (loading) {
    return <Loading />;
  }
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Заголовок и переключатель режимов */}
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mb: isMobile ? 2 : 3,
        mt: isMobile ? 1 : 1.5 
      }}>
        <Typography 
          variant="h5" 
          fontWeight="bold" 
          sx={{ 
            mb: 2, 
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 50,
              height: 3,
              background: theme => `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              borderRadius: 4
            },
            // Добавляем текстовый градиент
            background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textFillColor: 'transparent',
          }}
        >
          Мои напоминания
        </Typography>
        
        <Paper 
          elevation={2}
          sx={{
            width: '100%', 
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: theme => `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Tabs 
            value={viewMode} 
            onChange={(_, newValue) => setViewMode(newValue)}
            variant="fullWidth"
            sx={{ 
              minHeight: isMobile ? '42px' : '46px',
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: theme => `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              }
            }}
          >
            <Tab 
              value="calendar" 
              icon={
                <Box 
                  component={motion.div}
                  animate={{ 
                    scale: viewMode === 'calendar' ? [1, 1.2, 1] : 1, 
                    transition: { duration: 0.4 } 
                  }}
                >
                  <CalendarIcon fontSize="small" />
                </Box>
              } 
              label="Календарь"
              sx={{ 
                minHeight: isMobile ? '42px' : '46px',
                fontWeight: viewMode === 'calendar' ? 'medium' : 'normal',
                textTransform: 'none',
                fontSize: isMobile ? 14 : 15,
                transition: theme => theme.transitions.micro,
              }}
            />
            <Tab 
              value="focus" 
              icon={
                <Box 
                  component={motion.div}
                  animate={{ 
                    scale: viewMode === 'focus' ? [1, 1.2, 1] : 1, 
                    transition: { duration: 0.4 } 
                  }}
                >
                  <TimerIcon fontSize="small" />
                </Box>
              }
              label="Фокус" 
              sx={{ 
                minHeight: isMobile ? '42px' : '46px',
                fontWeight: viewMode === 'focus' ? 'medium' : 'normal',
                textTransform: 'none',
                fontSize: isMobile ? 14 : 15,
                transition: theme => theme.transitions.micro,
              }} 
            />
            <Tab 
              value="timeline" 
              icon={
                <Box 
                  component={motion.div}
                  animate={{ 
                    scale: viewMode === 'timeline' ? [1, 1.2, 1] : 1, 
                    transition: { duration: 0.4 } 
                  }}
                >
                  <TimelineIcon fontSize="small" />
                </Box>
              }
              label="Лента" 
              sx={{ 
                minHeight: isMobile ? '42px' : '46px',
                fontWeight: viewMode === 'timeline' ? 'medium' : 'normal',
                textTransform: 'none',
                fontSize: isMobile ? 14 : 15,
                transition: theme => theme.transitions.micro,
              }}
            />
          </Tabs>
        </Paper>
      </Box>

      {/* Режим Календарь */}
      {viewMode === 'calendar' && (
        <motion.div
          variants={calendarVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {renderCalendar()}

          {/* Список событий на выбранную дату */}
          <Fade in={selectedDate !== null}>
            <Box sx={{ mt: 2 }}>
              {selectedDate && (
                <>
                  <Paper
                    sx={{
                      p: isMobile ? 1.5 : 2,
                      mb: isMobile ? 1.5 : 2,
                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                      borderRadius: '4px',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="medium">
                      {selectedDate.format('D MMMM YYYY')}
                      {isToday(selectedDate.toDate()) && (
                        <Chip 
                          label="Сегодня" 
                          size="small" 
                          color="primary" 
                          sx={{ ml: 1, height: '20px' }} 
                        />
                      )}
                      {isTomorrow(selectedDate.toDate()) && (
                        <Chip 
                          label="Завтра" 
                          size="small" 
                          color="secondary" 
                          sx={{ ml: 1, height: '20px' }} 
                        />
                      )}
                    </Typography>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    {selectedDateEvents.length === 0 ? (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexDirection: 'column',
                        py: isMobile ? 2 : 3
                      }}>
                        <Typography variant="body2" color="text.secondary" mb={1.5}>
                          На эту дату нет событий
                        </Typography>
                        <Button 
                          variant="contained" 
                          startIcon={<AddIcon />}
                          size="medium"
                          sx={{
                            borderRadius: '12px',
                            py: 0.8,
                            px: 2.5,
                            textTransform: 'none',
                            fontWeight: 'medium'
                          }}
                          onClick={() => handleLongPress(selectedDate)}
                        >
                          Добавить событие
                        </Button>
                      </Box>
                    ) : (
                      selectedDateEvents.map((event) => {
                        const eventIcon = event.type === 'birthday' 
                          ? getEventIcon('birthday') 
                          : getEventIconByGroup(event.group);
                        
                        const eventColor = event.type === 'birthday'
                          ? CATEGORY_COLORS.birthday
                          : CATEGORY_COLORS[event.group];
                            
                        return (
                          <Box 
                            key={event._id}
                            sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              mb: isMobile ? 1 : 1.5,
                              p: isMobile ? 1 : 1.5,
                              borderRadius: '10px',
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.action.hover, 0.15),
                                transform: 'translateY(-2px)'
                              }
                            }}
                            onClick={() => navigate(`/edit/${event._id}`)}
                          >
                            <Avatar 
                              sx={{ 
                                width: isMobile ? 36 : 42, 
                                height: isMobile ? 36 : 42, 
                                bgcolor: alpha(eventColor, 0.15),
                                color: eventColor,
                                mr: isMobile ? 1.5 : 2
                              }}
                            >
                              {eventIcon}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body1" fontWeight="medium" fontSize={isMobile ? '0.95rem' : '1rem'}>
                                {event.title}
                              </Typography>
                              {event.description && (
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ 
                                    mt: 0.3,
                                    fontSize: isMobile ? '0.8rem' : '0.875rem'
                                  }}
                                >
                                  {event.description.length > (isMobile ? 40 : 50)
                                    ? `${event.description.substring(0, isMobile ? 40 : 50)}...` 
                                    : event.description}
                                </Typography>
                              )}
                            </Box>
                            <IconButton 
                              size={isMobile ? "small" : "medium"}
                              color="primary"
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.15)
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/edit/${event._id}`);
                              }}
                            >
                              <EditIcon fontSize={isMobile ? "small" : "small"} />
                            </IconButton>
                          </Box>
                        );
                      })
                    )}
                  </Paper>
                </>
              )}
            </Box>
          </Fade>
        </motion.div>
      )}

      {/* Режим Фокус */}
      {viewMode === 'focus' && (
        <FocusView reminders={reminders} />
      )}

      {/* Режим Timeline */}
      {viewMode === 'timeline' && (
        <TimelineView reminders={reminders} />
      )}

      {/* Тост для уведомлений */}
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Box>
  );
};

export default CalendarView; 
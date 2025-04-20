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
import { UserContext } from '../App';
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

const CalendarView = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  
  // Состояние
  const [currentDate, setCurrentDate] = useState(dayjs()); // текущая отображаемая дата
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('calendar'); // calendar, focus, timeline
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
        mb: 3,
        mt: 1.5 
      }}>
        <Typography 
          variant="h5" 
          fontWeight="bold" 
          sx={{ 
            mb: 2.5, 
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 40,
              height: 3,
              backgroundColor: theme.palette.primary.main,
              borderRadius: 4
            }
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
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`
          }}
        >
          <Tabs 
            value={viewMode} 
            onChange={(_, newValue) => setViewMode(newValue)}
            variant="fullWidth"
            sx={{ 
              minHeight: '46px',
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Tab 
              value="calendar" 
              icon={<CalendarIcon fontSize="small" />} 
              label="Календарь"
              sx={{ 
                minHeight: '46px',
                fontWeight: viewMode === 'calendar' ? 'medium' : 'normal',
                textTransform: 'none',
                fontSize: 15
              }} 
            />
            <Tab 
              value="focus" 
              icon={<TimerIcon fontSize="small" />}
              label="Фокус" 
              sx={{ 
                minHeight: '46px',
                fontWeight: viewMode === 'focus' ? 'medium' : 'normal',
                textTransform: 'none',
                fontSize: 15
              }} 
            />
            <Tab 
              value="timeline" 
              icon={<TimelineIcon fontSize="small" />}
              label="Лента" 
              sx={{ 
                minHeight: '46px',
                fontWeight: viewMode === 'timeline' ? 'medium' : 'normal',
                textTransform: 'none',
                fontSize: 15
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
          {/* Заголовок месяца и навигация */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2
          }}>
            <IconButton onClick={prevMonth}>
              <PrevIcon />
            </IconButton>
            
            <Typography variant="h6" fontWeight="medium">
              {MONTHS[currentDate.month()]} {currentDate.year()}
            </Typography>
            
            <IconButton onClick={nextMonth}>
              <NextIcon />
            </IconButton>
          </Box>

          {/* Дни недели */}
          <TableHead>
            <TableRow>
              {WEEKDAYS_SHORT.map((day) => (
                <TableCell key={day} align="center">
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Календарная сетка */}
          <Grid container spacing={0.5}>
            {calendarDays.map((day, index) => {
              const isCurrentMonth = day.month() === currentDate.month();
              const isCurrent = isToday(day.toDate());
              const isSelected = selectedDate && day.isSame(selectedDate, 'day');
              const eventColor = getDateColor(day);
              const eventCount = getEventCount(day);
              
              return (
                <Grid item xs={12/7} key={index}>
                  <Paper
                    elevation={isCurrent || isSelected ? 3 : 0}
                    sx={{
                      position: 'relative',
                      height: '50px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      bgcolor: isSelected 
                        ? alpha(theme.palette.primary.main, 0.1) 
                        : isCurrent 
                          ? alpha(theme.palette.primary.main, 0.05) 
                          : isCurrentMonth 
                            ? 'background.paper' 
                            : alpha(theme.palette.action.disabledBackground, 0.3),
                      color: !isCurrentMonth 
                        ? theme.palette.text.disabled
                        : theme.palette.text.primary,
                      border: isSelected
                        ? `2px solid ${theme.palette.primary.main}`
                        : isCurrent
                          ? `1px solid ${theme.palette.primary.main}`
                          : 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        transform: 'scale(1.02)'
                      },
                      '&:active': {
                        transform: 'scale(0.98)'
                      }
                    }}
                    onClick={() => handleDateClick(day)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      handleLongPress(day);
                    }}
                  >
                    <Typography variant="body2" fontWeight={isCurrent ? 'bold' : 'normal'}>
                      {day.date()}
                    </Typography>
                    
                    {/* Индикаторы событий */}
                    {eventCount > 0 && (
                      <Box sx={{ 
                        display: 'flex', 
                        position: 'absolute',
                        bottom: '2px',
                        gap: '2px'
                      }}>
                        {eventCount <= 3 ? (
                          // Для небольшого количества событий показываем точки
                          Array(eventCount).fill(0).map((_, i) => (
                            <Box
                              key={i}
                              sx={{
                                width: '5px',
                                height: '5px',
                                borderRadius: '50%',
                                backgroundColor: eventColor,
                                opacity: 0.8 + (i * 0.1), // увеличение яркости для каждой последующей точки
                              }}
                            />
                          ))
                        ) : (
                          // Для большого количества показываем счетчик
                          <Badge
                            badgeContent={eventCount}
                            color="primary"
                            sx={{ 
                              '& .MuiBadge-badge': { 
                                fontSize: '9px', 
                                height: '14px', 
                                minWidth: '14px',
                                background: eventColor 
                              } 
                            }}
                          />
                        )}
                      </Box>
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          {/* Список событий на выбранную дату */}
          <Fade in={selectedDate !== null}>
            <Box sx={{ mt: 2 }}>
              {selectedDate && (
                <>
                  <Paper
                    sx={{
                      p: 2,
                      mb: 2,
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
                        py: 3 
                      }}>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          На эту дату нет событий
                        </Typography>
                        <Button 
                          variant="contained" 
                          startIcon={<AddIcon />}
                          size="medium"
                          sx={{
                            borderRadius: '12px',
                            py: 1,
                            px: 3,
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
                              mb: 1.5,
                              p: 1.5,
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
                                width: 42, 
                                height: 42, 
                                bgcolor: alpha(eventColor, 0.15),
                                color: eventColor,
                                mr: 2
                              }}
                            >
                              {eventIcon}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body1" fontWeight="medium">
                                {event.title}
                              </Typography>
                              {event.description && (
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ mt: 0.5 }}
                                >
                                  {event.description.length > 50 
                                    ? `${event.description.substring(0, 50)}...` 
                                    : event.description}
                                </Typography>
                              )}
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
                                navigate(`/edit/${event._id}`);
                              }}
                            >
                              <EditIcon fontSize="small" />
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
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Divider, 
  useTheme, 
  alpha, 
  IconButton,
  Collapse,
  Button
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getMonthName, getFormattedDateFromReminder, getDayOfWeek } from '../utils/dateUtils';
import { getEventIcon, getEventIconByGroup } from '../utils/eventUtils';

// Анимации
const listVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.4 } },
  exit: { opacity: 0, y: -10 }
};

// Категории и их цвета
const CATEGORY_COLORS = {
  'birthday': '#e91e63', // розовый/красный для дней рождения
  'семья': '#4caf50',    // зеленый для семейных событий
  'работа': '#2196f3',   // синий для рабочих событий
  'друзья': '#9c27b0',   // фиолетовый для друзей
  'другое': '#ff9800'    // оранжевый для других событий
};

const ListView = ({ reminders }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [expandedMonths, setExpandedMonths] = useState({});
  
  // Сортировка и группировка напоминаний по месяцам
  const remindersByMonth = useMemo(() => {
    // Сначала сортируем по дате (месяц, день)
    const sorted = [...reminders].sort((a, b) => {
      if (a.date.month !== b.date.month) {
        return a.date.month - b.date.month;
      }
      return a.date.day - b.date.day;
    });
    
    // Группируем по месяцам
    const grouped = {};
    
    sorted.forEach(reminder => {
      const month = reminder.date.month;
      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(reminder);
    });
    
    return grouped;
  }, [reminders]);
  
  // Сортировка месяцев для отображения (начиная с текущего)
  const sortedMonths = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    
    return Object.keys(remindersByMonth)
      .map(month => parseInt(month, 10))
      .sort((a, b) => {
        // Вычисляем "расстояние" от текущего месяца
        const distA = (a >= currentMonth) ? a - currentMonth : a + 12 - currentMonth;
        const distB = (b >= currentMonth) ? b - currentMonth : b + 12 - currentMonth;
        return distA - distB;
      });
  }, [remindersByMonth]);
  
  // Инициализация состояния развернутости месяцев
  useEffect(() => {
    const initialExpandedState = {};
    sortedMonths.forEach((month, index) => {
      // Разворачиваем только первые два месяца
      initialExpandedState[month] = index < 2;
    });
    setExpandedMonths(initialExpandedState);
  }, [sortedMonths]);
  
  // Обработчик переключения состояния месяца
  const toggleMonth = (month) => {
    setExpandedMonths(prev => ({
      ...prev,
      [month]: !prev[month]
    }));
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
      variants={listVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Box sx={{ width: '100%' }}>
        {sortedMonths.length === 0 ? (
          <Paper 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Нет напоминаний
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Добавьте напоминание, чтобы оно появилось в списке
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/add')}
            >
              Добавить напоминание
            </Button>
          </Paper>
        ) : (
          sortedMonths.map(month => {
            const monthReminders = remindersByMonth[month];
            
            return (
              <Paper 
                key={month} 
                elevation={1}
                sx={{ 
                  mb: 2, 
                  overflow: 'hidden',
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
              >
                {/* Заголовок месяца */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderBottom: expandedMonths[month] ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleMonth(month)}
                >
                  <Typography variant="subtitle1" fontWeight="medium">
                    {getMonthName(new Date(2023, month - 1, 1))}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ mr: 1 }}
                    >
                      {monthReminders.length} напоминаний
                    </Typography>
                    {expandedMonths[month] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>
                </Box>
                
                {/* Список напоминаний */}
                <Collapse in={expandedMonths[month]} timeout="auto">
                  <List disablePadding>
                    {monthReminders.map((reminder, index) => {
                      const eventColor = getEventColor(reminder);
                      const eventIcon = getIconForReminder(reminder);
                      const formattedDate = getFormattedDateFromReminder(reminder);
                      
                      return (
                        <React.Fragment key={reminder._id}>
                          <ListItem 
                            alignItems="flex-start"
                            sx={{ 
                              py: 1.5, 
                              '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.1) },
                              cursor: 'pointer'
                            }}
                            onClick={() => navigate(`/edit/${reminder._id}`)}
                          >
                            <ListItemAvatar>
                              <Avatar 
                                sx={{ 
                                  bgcolor: alpha(eventColor, 0.15), 
                                  color: eventColor
                                }}
                              >
                                {eventIcon}
                              </Avatar>
                            </ListItemAvatar>
                            
                            <ListItemText
                              primary={
                                <Typography variant="body1" fontWeight="medium">
                                  {reminder.title}
                                </Typography>
                              }
                              secondary={
                                <Box sx={{ mt: 0.5 }}>
                                  <Typography 
                                    variant="body2" 
                                    color="text.secondary" 
                                    component="span"
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      mb: reminder.description ? 0.5 : 0
                                    }}
                                  >
                                    <Box 
                                      component="span" 
                                      sx={{ 
                                        width: 8, 
                                        height: 8, 
                                        borderRadius: '50%', 
                                        bgcolor: eventColor,
                                        display: 'inline-block',
                                        mr: 1
                                      }} 
                                    />
                                    {formattedDate} 
                                    <Box component="span" sx={{ mx: 0.5, color: alpha(theme.palette.text.secondary, 0.5) }}>•</Box> 
                                    {getDayOfWeek(new Date(
                                      reminder.date.year || new Date().getFullYear(), 
                                      reminder.date.month - 1, 
                                      reminder.date.day
                                    ))}
                                  </Typography>
                                  
                                  {reminder.description && (
                                    <Typography variant="body2" color="text.secondary">
                                      {reminder.description.length > 100 
                                        ? `${reminder.description.substring(0, 100)}...` 
                                        : reminder.description}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                            
                            <IconButton 
                              edge="end" 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/edit/${reminder._id}`);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </ListItem>
                          
                          {index < monthReminders.length - 1 && (
                            <Divider component="li" variant="inset" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </List>
                </Collapse>
              </Paper>
            );
          })
        )}
      </Box>
    </motion.div>
  );
};

export default ListView; 
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  IconButton, 
  Chip, 
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Snackbar,
  Alert,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Cake as CakeIcon, 
  Event as EventIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  SortByAlpha as SortIcon,
  AccessTime as TimeIcon,
  Sort as SortNameIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import axios from 'axios';
import { UserContext } from '../App';
import Loading from './Loading';
import { motion } from 'framer-motion';
import { getDaysUntil } from '../utils/dateUtils';

// Анимация списка
const listVariants = {
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  hidden: {
    opacity: 0,
    transition: {
      when: "afterChildren"
    }
  }
};

// Анимация элемента списка
const itemVariants = {
  visible: i => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: "easeOut"
    }
  }),
  hidden: { opacity: 0, y: 20 }
};

const ReminderList = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [sortType, setSortType] = useState('date'); // 'date' или 'name'

  // Загрузка напоминаний
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/reminders?telegramId=${user.telegramId}`);
        setReminders(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке напоминаний:', error);
        setSnackbar({
          open: true,
          message: 'Ошибка при загрузке напоминаний',
          severity: 'error'
        });
        setLoading(false);
      }
    };

    fetchReminders();
  }, [user]);

  // Обработчик удаления напоминания
  const handleDelete = async () => {
    if (!reminderToDelete) return;
    
    try {
      await axios.delete(`/api/reminders/${reminderToDelete._id}`);
      setReminders(reminders.filter(r => r._id !== reminderToDelete._id));
      setSnackbar({
        open: true,
        message: 'Напоминание удалено',
        severity: 'success'
      });
    } catch (error) {
      console.error('Ошибка при удалении напоминания:', error);
      setSnackbar({
        open: true,
        message: 'Ошибка при удалении напоминания',
        severity: 'error'
      });
    }
    
    setDeleteDialogOpen(false);
    setReminderToDelete(null);
  };

  // Функция для форматирования даты
  const formatDate = (date) => {
    const day = date.day;
    const month = date.month;
    const year = date.year;
    
    const monthNames = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    
    return `${day} ${monthNames[month - 1]}${year ? ` ${year} г.` : ''}`;
  };

  // Сортировка ремайндеров
  const sortedReminders = [...reminders].sort((a, b) => {
    if (sortType === 'date') {
      const daysA = getDaysUntil(a.date);
      const daysB = getDaysUntil(b.date);
      return daysA - daysB;
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  // Изменение типа сортировки
  const toggleSortType = () => {
    setSortType(sortType === 'date' ? 'name' : 'date');
  };

  // Закрытие snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Функция для получения цвета карточки на основе типа и дней до события
  const getCardStyle = (reminder) => {
    const daysUntil = getDaysUntil(reminder.date);
    const isUrgent = daysUntil <= 3;
    const isSoon = daysUntil <= 7;
    
    if (reminder.type === 'birthday') {
      return {
        background: isUrgent 
          ? 'linear-gradient(135deg, #ff6b6b 0%, #d32f2f 100%)' 
          : isSoon 
            ? 'linear-gradient(135deg, #4dabf5 0%, #2196f3 100%)' 
            : 'linear-gradient(135deg, #2AABEE 0%, #0088cc 100%)',
        boxShadow: isUrgent 
          ? '0 8px 20px rgba(211, 47, 47, 0.3)' 
          : '0 8px 20px rgba(0, 136, 204, 0.2)'
      };
    } else {
      return {
        background: isUrgent 
          ? 'linear-gradient(135deg, #ff9800 0%, #ed6c02 100%)' 
          : isSoon 
            ? 'linear-gradient(135deg, #f57c00 0%, #e65100 100%)' 
            : 'linear-gradient(135deg, #F57C00 0%, #FF6F00 100%)',
        boxShadow: isUrgent 
          ? '0 8px 20px rgba(237, 108, 2, 0.3)' 
          : '0 8px 20px rgba(245, 124, 0, 0.2)'
      };
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Box>
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h5" component="h1" fontWeight="600">
          Мои напоминания
        </Typography>
        <Button
          onClick={toggleSortType}
          color="primary"
          variant="outlined"
          size="small"
          startIcon={sortType === 'date' ? <CalendarIcon /> : <SortNameIcon />}
          sx={{ borderRadius: 20 }}
        >
          {sortType === 'date' ? 'По дате' : 'По имени'}
        </Button>
      </Box>

      {sortedReminders.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          mt: 8,
          p: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderRadius: 4,
          border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`
        }}>
          <CalendarIcon sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.4), mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            У вас пока нет напоминаний
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Нажмите кнопку "Добавить", чтобы создать новое напоминание
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/add')}
            size="large"
            sx={{ borderRadius: 8 }}
          >
            Добавить напоминание
          </Button>
        </Box>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={listVariants}
        >
          {sortedReminders.map((reminder, index) => {
            const daysUntil = getDaysUntil(reminder.date);
            const cardStyle = getCardStyle(reminder);
            
            return (
              <motion.div 
                key={reminder._id} 
                custom={index} 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <Card 
                  sx={{ 
                    mb: 2.5, 
                    position: 'relative',
                    overflow: 'visible',
                    ...cardStyle
                  }}
                >
                  <CardContent sx={{ color: '#fff', pb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          color: '#fff',
                          mr: 1.5 
                        }}
                      >
                        {reminder.type === 'birthday' ? <CakeIcon /> : <EventIcon />}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="div" fontWeight={600} noWrap>
                          {reminder.title}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {formatDate(reminder.date)}
                        </Typography>
                      </Box>
                      <Box sx={{ ml: 1 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/edit/${reminder._id}`)}
                          aria-label="Редактировать"
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.8)',
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(4px)',
                            mr: 1,
                            '&:hover': { 
                              bgcolor: 'rgba(255, 255, 255, 0.2)',
                              color: '#fff'
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => {
                            setReminderToDelete(reminder);
                            setDeleteDialogOpen(true);
                          }}
                          aria-label="Удалить"
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.8)',
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(4px)',
                            '&:hover': { 
                              bgcolor: 'rgba(255, 255, 255, 0.2)',
                              color: '#fff'
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    {reminder.description && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mt: 1, 
                          mb: 2,
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(4px)',
                          p: 1.5,
                          borderRadius: 2
                        }}
                      >
                        {reminder.description}
                      </Typography>
                    )}
                    
                    <Box sx={{ 
                      mt: 1, 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center' 
                    }}>
                      <Chip
                        icon={reminder.type === 'birthday' ? <CakeIcon /> : <EventIcon />}
                        label={reminder.type === 'birthday' ? 'День рождения' : 'Событие'}
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(4px)',
                          color: '#fff',
                          fontWeight: 600
                        }}
                      />
                      <Chip
                        icon={<TimeIcon />}
                        label={`${daysUntil} ${plural(daysUntil, 'день', 'дня', 'дней')}`}
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(4px)',
                          color: '#fff',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle>Удаление напоминания</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите удалить напоминание "{reminderToDelete?.title}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 8 }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            sx={{ borderRadius: 8 }}
            autoFocus
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомление */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          elevation={6}
          variant="filled"
          sx={{ width: '100%', borderRadius: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Вспомогательная функция для правильного склонения слов
const plural = (number, one, two, five) => {
  let n = Math.abs(number);
  n %= 100;
  if (n >= 5 && n <= 20) {
    return five;
  }
  n %= 10;
  if (n === 1) {
    return one;
  }
  if (n >= 2 && n <= 4) {
    return two;
  }
  return five;
};

export default ReminderList; 
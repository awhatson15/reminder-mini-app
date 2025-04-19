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
  Alert
} from '@mui/material';
import { 
  Cake as CakeIcon, 
  Event as EventIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  SortByAlpha as SortIcon
} from '@mui/icons-material';
import axios from 'axios';
import { UserContext } from '../App';
import Loading from './Loading';

const ReminderList = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
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

  // Вычисление дней до события
  const getDaysUntil = (date) => {
    const now = new Date();
    const eventDate = new Date();
    
    eventDate.setDate(date.day);
    eventDate.setMonth(date.month - 1);
    
    // Если есть год, используем его
    if (date.year) {
      eventDate.setFullYear(date.year);
    } else {
      // Для дней рождения без года
      // Если дата уже прошла в этом году, берем следующий год
      if (
        eventDate.getMonth() < now.getMonth() ||
        (eventDate.getMonth() === now.getMonth() && eventDate.getDate() < now.getDate())
      ) {
        eventDate.setFullYear(now.getFullYear() + 1);
      } else {
        eventDate.setFullYear(now.getFullYear());
      }
    }
    
    // Разница в днях
    const diffTime = eventDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
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

  if (loading) {
    return <Loading />;
  }

  return (
    <Box>
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h5" component="h1">
          Мои напоминания
        </Typography>
        <IconButton onClick={toggleSortType} color="primary" title={`Сортировка: ${sortType === 'date' ? 'по дате' : 'по имени'}`}>
          <SortIcon />
        </IconButton>
      </Box>

      {sortedReminders.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body1">
            У вас пока нет напоминаний. Нажмите "Добавить", чтобы создать новое.
          </Typography>
        </Box>
      ) : (
        sortedReminders.map((reminder) => {
          const daysUntil = getDaysUntil(reminder.date);
          
          return (
            <Card key={reminder._id} sx={{ mb: 2, position: 'relative' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {reminder.type === 'birthday' ? (
                    <CakeIcon color="primary" sx={{ mr: 1 }} />
                  ) : (
                    <EventIcon color="secondary" sx={{ mr: 1 }} />
                  )}
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {reminder.title}
                  </Typography>
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={() => navigate(`/edit/${reminder._id}`)}
                      aria-label="Редактировать"
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
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="body2" color="text.secondary">
                  {formatDate(reminder.date)}
                </Typography>
                
                {reminder.description && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {reminder.description}
                  </Typography>
                )}
                
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Chip
                    label={reminder.type === 'birthday' ? 'День рождения' : 'Событие'}
                    color={reminder.type === 'birthday' ? 'primary' : 'secondary'}
                    size="small"
                  />
                  <Chip
                    label={`Осталось: ${daysUntil} ${plural(daysUntil, 'день', 'дня', 'дней')}`}
                    color={daysUntil <= 3 ? 'error' : daysUntil <= 7 ? 'warning' : 'success'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Удаление напоминания</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите удалить напоминание "{reminderToDelete?.title}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
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
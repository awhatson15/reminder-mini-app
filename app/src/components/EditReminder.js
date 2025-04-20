import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Snackbar,
  Alert,
  Stack,
  CircularProgress,
  Paper,
  Divider,
  Chip,
  useTheme,
  alpha,
  Grow,
  InputAdornment,
  Tooltip,
  Switch,
  IconButton,
  Card,
  CardContent,
  Skeleton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormLabel
} from '@mui/material';
import {
  Cake as CakeIcon,
  Event as EventIcon,
  CalendarMonth as CalendarIcon,
  Description as DescriptionIcon,
  Notifications as NotificationsIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Title as TitleIcon,
  Repeat as RepeatIcon,
  WorkOutline as WorkIcon,
  FamilyRestroom as FamilyIcon,
  Person as PersonIcon,
  MoreHoriz as OtherIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  InfoOutlined as InfoIcon,
  EventRepeat as RecurringIcon
} from '@mui/icons-material';
import axios from 'axios';
import { UserContext } from '../App';
import { useHotkeys } from 'react-hotkeys-hook';
import { motion } from 'framer-motion';
import Toast from './Toast';
import Loading from './Loading';
import { format, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import ConfirmDialog from './ConfirmDialog';

const EditReminder = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const { id } = useParams();
  
  // Состояния для формы
  const [title, setTitle] = useState('');
  const [type, setType] = useState('birthday');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [includeYear, setIncludeYear] = useState(false);
  const [description, setDescription] = useState('');
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(1);
  
  // Новые состояния для групп и повторяющихся напоминаний
  const [group, setGroup] = useState('другое');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState('weekly');
  const [recurringDayOfWeek, setRecurringDayOfWeek] = useState('1'); // Понедельник по умолчанию
  const [endDate, setEndDate] = useState('');
  const [originalIsRecurring, setOriginalIsRecurring] = useState(false); // Для сравнения с исходным значением
  
  // Состояния для валидации и загрузки
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingReminder, setFetchingReminder] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  
  // Горячие клавиши для сохранения
  useHotkeys('ctrl+s, cmd+s', (e) => {
    e.preventDefault();
    document.getElementById('save-btn')?.click();
  });
  
  // Получение данных напоминания
  useEffect(() => {
    const fetchReminder = async () => {
      try {
        setFetchingReminder(true);
        const response = await axios.get(`/api/reminders/${id}`);
        const reminder = response.data;
        
        setTitle(reminder.title || '');
        setType(reminder.type || 'birthday');
        setDay(reminder.date.day?.toString() || '');
        setMonth(reminder.date.month?.toString() || '');
        
        // Обработка года в зависимости от типа
        if (reminder.type === 'birthday') {
          if (reminder.date.year) {
            setYear(reminder.date.year.toString());
            setIncludeYear(true);
          } else {
            setYear(new Date().getFullYear().toString());
            setIncludeYear(false);
          }
        } else {
          setYear(reminder.date.year?.toString() || new Date().getFullYear().toString());
        }
        
        setDescription(reminder.description || '');
        setNotifyDaysBefore(reminder.notifyDaysBefore || 1);
        
        // Загрузка данных для группы и повторяющихся напоминаний
        setGroup(reminder.group || 'другое');
        
        // Установка данных о повторяющихся напоминаниях
        setIsRecurring(!!reminder.isRecurring);
        setOriginalIsRecurring(!!reminder.isRecurring);
        
        if (reminder.isRecurring) {
          setRecurringType(reminder.recurringType || 'weekly');
          
          if (reminder.recurringType === 'weekly' && reminder.recurringDayOfWeek !== undefined) {
            setRecurringDayOfWeek(reminder.recurringDayOfWeek.toString());
          }
          
          if (reminder.endDate) {
            // Форматируем дату в формат YYYY-MM-DD для поля типа date
            const endDateObj = new Date(reminder.endDate);
            const formattedDate = endDateObj.toISOString().split('T')[0];
            setEndDate(formattedDate);
          }
        }
      } catch (error) {
        console.error('Ошибка при получении напоминания:', error);
        if (error.response && error.response.status === 404) {
          setNotFound(true);
        }
        setSnackbar({
          open: true,
          message: 'Ошибка при получении напоминания',
          severity: 'error'
        });
      } finally {
        setFetchingReminder(false);
      }
    };
    
    fetchReminder();
  }, [id]);
  
  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация формы
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Введите название';
    }
    
    if (!day || day < 1 || day > 31) {
      newErrors.day = 'Введите корректный день (1-31)';
    }
    
    if (!month || month < 1 || month > 12) {
      newErrors.month = 'Введите корректный месяц (1-12)';
    }
    
    if (type === 'event' && !year) {
      newErrors.year = 'Для события необходимо указать год';
    }
    
    // Валидация полей для повторяющихся напоминаний
    if (isRecurring) {
      if (recurringType === 'weekly' && (!recurringDayOfWeek || recurringDayOfWeek < 0 || recurringDayOfWeek > 6)) {
        newErrors.recurringDayOfWeek = 'Выберите день недели (0-6)';
      }
      
      if (!endDate) {
        newErrors.endDate = 'Укажите дату окончания';
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      setLoading(true);
      
      // Подготовка данных о дате
      const dateData = {
        day: parseInt(day, 10),
        month: parseInt(month, 10)
      };
      
      // Год добавляем только для обычных событий или если выбрано для дня рождения
      if (type === 'event' || (type === 'birthday' && includeYear)) {
        dateData.year = parseInt(year, 10);
      }
      
      // Базовые данные для запроса
      const reminderData = {
        title: title.trim(),
        type,
        date: dateData,
        description: description.trim(),
        notifyDaysBefore,
        group // Добавляем группу
      };
      
      // Добавляем поля для повторяющихся напоминаний
      if (isRecurring) {
        reminderData.isRecurring = true;
        reminderData.recurringType = recurringType;
        
        if (recurringType === 'weekly') {
          reminderData.recurringDayOfWeek = parseInt(recurringDayOfWeek, 10);
        }
        
        reminderData.endDate = endDate;
      } else if (originalIsRecurring) {
        // Если напоминание было повторяющимся, но пользователь отключил повторение,
        // явно указываем, что это больше не повторяющееся напоминание
        reminderData.isRecurring = false;
      }
      
      // Отправка запроса
      await axios.put(`/api/reminders/${id}`, reminderData);
      
      setSnackbar({
        open: true,
        message: 'Напоминание успешно обновлено',
        severity: 'success'
      });
      
      // Переход на главную страницу после небольшой задержки
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Ошибка при обновлении напоминания:', error);
      let errorMessage = 'Ошибка при обновлении напоминания';
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      setLoading(false);
    }
  };
  
  // Получение соответствующей иконки для группы
  const getGroupIcon = (groupName) => {
    switch (groupName) {
      case 'семья':
        return <FamilyIcon />;
      case 'работа':
        return <WorkIcon />;
      case 'друзья':
        return <PersonIcon />;
      default:
        return <OtherIcon />;
    }
  };
  
  // Обработчик закрытия snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Обработчик изменения типа
  const handleTypeChange = (e) => {
    setType(e.target.value);
    // Сбрасываем ошибки при изменении типа
    setErrors({...errors, year: undefined});
    // Сбрасываем включение года для дня рождения при изменении типа
    if (e.target.value === 'birthday') {
      setIncludeYear(false);
    }
  };
  
  // Обработчик изменения статуса повторения
  const handleRecurringChange = (e) => {
    setIsRecurring(e.target.checked);
    if (!e.target.checked) {
      setErrors({...errors, recurringDayOfWeek: undefined, endDate: undefined});
    }
  };
  
  // Получение дней недели
  const getDayOfWeekName = (dayNumber) => {
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    return days[dayNumber];
  };
  
  // Обработчик удаления напоминания
  const handleDelete = async () => {
    setLoading(true);
    
    try {
      await axios.delete(`/api/reminders/${id}`);
      setSnackbar({
        open: true,
        message: 'Напоминание успешно удалено',
        severity: 'success'
      });
      
      // Перенаправление на список после успешного удаления
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error('Ошибка при удалении напоминания:', error);
      setSnackbar({
        open: true,
        message: 'Ошибка при удалении напоминания',
        severity: 'error'
      });
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };
  
  if (notFound) {
    return (
      <Box textAlign="center" py={5}>
        <Typography variant="h5" mb={3}>
          Напоминание не найдено
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
        >
          Вернуться на главную
        </Button>
      </Box>
    );
  }
  
  if (fetchingReminder) {
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="50vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={50} />
        <Typography>Загрузка напоминания...</Typography>
      </Box>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        sx={{ maxWidth: 800, margin: '0 auto' }}
      >
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          mb: 4
        }}>
          <IconButton 
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
            aria-label="Назад"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" fontWeight="600">
            Редактирование напоминания
          </Typography>
        </Box>
        
        {/* Тип напоминания */}
        <Card sx={{ 
          mb: 3,
          borderRadius: 3,
          boxShadow: theme.shadows[2]
        }}>
          <CardContent>
            <Typography 
              variant="subtitle1" 
              component="h2" 
              fontWeight="600" 
              gutterBottom
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                mb: 2
              }}
            >
              <EventIcon sx={{ mr: 1 }} />
              Тип напоминания
            </Typography>
            
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel id="type-label">Тип напоминания</InputLabel>
              <Select
                labelId="type-label"
                value={type}
                onChange={handleTypeChange}
                label="Тип напоминания"
                disabled={loading}
              >
                <MenuItem value="event">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    Событие
                  </Box>
                </MenuItem>
                <MenuItem value="birthday">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CakeIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                    День рождения
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth variant="outlined">
              <InputLabel id="group-label">Группа</InputLabel>
              <Select
                labelId="group-label"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                label="Группа"
                disabled={loading}
              >
                <MenuItem value="семья">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FamilyIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                    Семья
                  </Box>
                </MenuItem>
                <MenuItem value="работа">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WorkIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
                    Работа
                  </Box>
                </MenuItem>
                <MenuItem value="друзья">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                    Друзья
                  </Box>
                </MenuItem>
                <MenuItem value="другое">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <OtherIcon sx={{ mr: 1, color: theme.palette.grey[600] }} />
                    Другое
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>
        
        {/* Детали напоминания */}
        <Card sx={{ 
          mb: 3,
          borderRadius: 3,
          boxShadow: theme.shadows[2]
        }}>
          <CardContent>
            <Typography 
              variant="subtitle1" 
              component="h2" 
              fontWeight="600" 
              gutterBottom
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                mb: 2
              }}
            >
              <InfoIcon sx={{ mr: 1 }} />
              Детали напоминания
            </Typography>
            
            <TextField
              label="Название"
              variant="outlined"
              fullWidth
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
              disabled={loading}
              sx={{ mb: 3 }}
            />
            
            <TextField
              label="Описание (необязательно)"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={!!errors.description}
              helperText={errors.description || 'Добавьте дополнительные сведения о напоминании'}
              disabled={loading}
              sx={{ mb: 3 }}
            />
            
            <TextField
              label="Дата"
              type="date"
              fullWidth
              required
              value={format(new Date(year, month - 1, day), 'yyyy-MM-dd')}
              onChange={(e) => {
                const [year, month, day] = e.target.value.split('-');
                setYear(year);
                setMonth(month);
                setDay(day);
              }}
              error={!!errors.date}
              helperText={errors.date}
              InputLabelProps={{ shrink: true }}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <CalendarIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                ),
              }}
            />
          </CardContent>
        </Card>
        
        {/* Настройки повторения */}
        <Card sx={{ 
          mb: 4,
          borderRadius: 3,
          boxShadow: theme.shadows[2]
        }}>
          <CardContent>
            <Typography 
              variant="subtitle1" 
              component="h2" 
              fontWeight="600" 
              gutterBottom
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                mb: 2
              }}
            >
              <RepeatIcon sx={{ mr: 1 }} />
              Настройки повторения
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={isRecurring}
                  onChange={handleRecurringChange}
                  disabled={loading}
                  color="primary"
                />
              }
              label="Повторяющееся напоминание"
              sx={{ mb: 2 }}
            />
            
            {isRecurring && (
              <FormControl component="fieldset" sx={{ ml: 3 }}>
                <FormLabel component="legend">Частота повторения</FormLabel>
                <RadioGroup
                  value={recurringType}
                  onChange={(e) => setRecurringType(e.target.value)}
                >
                  <FormControlLabel
                    value="weekly"
                    control={<Radio disabled={loading} />}
                    label="Еженедельно"
                  />
                  <FormControlLabel
                    value="monthly"
                    control={<Radio disabled={loading} />}
                    label="Ежемесячно"
                  />
                  <FormControlLabel
                    value="yearly"
                    control={<Radio disabled={loading} />}
                    label="Ежегодно"
                  />
                </RadioGroup>
              </FormControl>
            )}
            
            {isRecurring && (
              <Box sx={{ 
                bgcolor: alpha(theme.palette.info.light, 0.1),
                borderLeft: `4px solid ${theme.palette.info.main}`,
                p: 2,
                mt: 2,
                borderRadius: 1
              }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <InfoIcon sx={{ mr: 1, fontSize: 16, mt: 0.5, color: theme.palette.info.main }} />
                  При изменении даты повторяющегося напоминания будут изменены все будущие напоминания этой серии.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
        
        {/* Кнопки управления */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          mb: 4
        }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setConfirmOpen(true)}
            disabled={loading}
            startIcon={<DeleteIcon />}
            sx={{ borderRadius: 2 }}
          >
            Удалить
          </Button>
          
          <Box>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              disabled={loading}
              startIcon={<CancelIcon />}
              sx={{ mr: 2, borderRadius: 2 }}
            >
              Отмена
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={<SaveIcon />}
              sx={{ borderRadius: 2 }}
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </Box>
        </Box>
        
        {/* Диалог подтверждения удаления */}
        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
        >
          <DialogTitle>
            Подтверждение удаления
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Вы уверены, что хотите удалить это напоминание? Это действие невозможно отменить.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setConfirmOpen(false)} 
              disabled={loading}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleDelete} 
              color="error"
              disabled={loading}
              variant="contained"
            >
              {loading ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Уведомление */}
        <Toast 
          open={snackbar.open} 
          onClose={handleCloseSnackbar}
          message={snackbar.message}
          severity={snackbar.severity}
        />
      </Box>
    </motion.div>
  );
};

export default EditReminder; 
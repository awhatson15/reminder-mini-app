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
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import axios from 'axios';
import { UserContext } from '../App';
import Loading from './Loading';

const EditReminder = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Состояния для формы
  const [title, setTitle] = useState('');
  const [type, setType] = useState('birthday');
  const [date, setDate] = useState(dayjs());
  const [description, setDescription] = useState('');
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(1);
  
  // Состояния для валидации и загрузки
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Загрузка данных напоминания
  useEffect(() => {
    const fetchReminder = async () => {
      try {
        const response = await axios.get(`/api/reminders/${id}`);
        const reminder = response.data;
        
        setTitle(reminder.title);
        setType(reminder.type);
        setDescription(reminder.description || '');
        setNotifyDaysBefore(reminder.notifyDaysBefore);
        
        // Преобразование даты для DatePicker
        const reminderDate = dayjs();
        reminderDate.set('date', reminder.date.day);
        reminderDate.set('month', reminder.date.month - 1);
        if (reminder.date.year) {
          reminderDate.set('year', reminder.date.year);
        }
        setDate(reminderDate);
        
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке напоминания:', error);
        setSnackbar({
          open: true,
          message: 'Ошибка при загрузке напоминания',
          severity: 'error'
        });
        setLoading(false);
      }
    };
    
    fetchReminder();
  }, [id]);
  
  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Введите название';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Подготовка данных
    const reminderData = {
      title,
      type,
      date: {
        day: date.date(),
        month: date.month() + 1,
        year: type === 'birthday' ? null : date.year()
      },
      description,
      notifyDaysBefore
    };
    
    // Отправка запроса
    try {
      setSaving(true);
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
      setSnackbar({
        open: true,
        message: 'Ошибка при обновлении напоминания',
        severity: 'error'
      });
      setSaving(false);
    }
  };
  
  // Обработчик закрытия snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  if (loading) {
    return <Loading />;
  }
  
  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
        Редактировать напоминание
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            label="Название события или имя человека"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            disabled={saving}
            required
          />
          
          <FormControl component="fieldset">
            <Typography variant="subtitle2" gutterBottom>
              Тип напоминания
            </Typography>
            <RadioGroup
              row
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <FormControlLabel 
                value="birthday" 
                control={<Radio />} 
                label="День рождения" 
                disabled={saving}
              />
              <FormControlLabel 
                value="event" 
                control={<Radio />} 
                label="Событие/мероприятие" 
                disabled={saving}
              />
            </RadioGroup>
          </FormControl>
          
          <DatePicker
            label="Дата"
            value={date}
            onChange={(newDate) => setDate(newDate)}
            disabled={saving}
            slotProps={{
              textField: {
                fullWidth: true,
                helperText: type === 'birthday' ? 'Для дня рождения год не обязателен' : ''
              }
            }}
          />
          
          <TextField
            label="Описание (необязательно)"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={saving}
          />
          
          <FormControl fullWidth>
            <InputLabel>Напомнить за</InputLabel>
            <Select
              value={notifyDaysBefore}
              onChange={(e) => setNotifyDaysBefore(e.target.value)}
              label="Напомнить за"
              disabled={saving}
            >
              <MenuItem value={0}>В день события</MenuItem>
              <MenuItem value={1}>За 1 день</MenuItem>
              <MenuItem value={2}>За 2 дня</MenuItem>
              <MenuItem value={3}>За 3 дня</MenuItem>
              <MenuItem value={7}>За неделю</MenuItem>
              <MenuItem value={14}>За 2 недели</MenuItem>
              <MenuItem value={30}>За месяц</MenuItem>
            </Select>
            <FormHelperText>
              За сколько дней напомнить о событии
            </FormHelperText>
          </FormControl>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              disabled={saving}
              fullWidth
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saving}
              fullWidth
            >
              {saving ? (
                <CircularProgress size={24} />
              ) : (
                'Сохранить'
              )}
            </Button>
          </Box>
        </Stack>
      </form>
      
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

export default EditReminder; 
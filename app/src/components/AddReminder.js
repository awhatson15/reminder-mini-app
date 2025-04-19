import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import axios from 'axios';
import { UserContext } from '../App';

const AddReminder = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  // Состояния для формы
  const [title, setTitle] = useState('');
  const [type, setType] = useState('birthday');
  const [date, setDate] = useState(dayjs());
  const [description, setDescription] = useState('');
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(1);
  
  // Состояния для валидации
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
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
    
    try {
      setLoading(true);
      
      // Подготовка данных о дате
      const dateData = {
        day: date.date(),
        month: date.month() + 1
      };
      
      // Год добавляем только для обычных событий
      if (type !== 'birthday') {
        dateData.year = date.year();
      }
      
      // Подготовка полного объекта данных
      const reminderData = {
        telegramId: user.telegramId,
        title: title.trim(),
        type,
        date: dateData,
        description: description.trim(),
        notifyDaysBefore
      };
      
      // Отправка запроса
      await axios.post('/api/reminders', reminderData);
      
      setSnackbar({
        open: true,
        message: 'Напоминание успешно создано',
        severity: 'success'
      });
      
      // Переход на главную страницу после небольшой задержки
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Ошибка при создании напоминания:', error);
      let errorMessage = 'Ошибка при создании напоминания';
      
      // Если есть ответ от сервера, показываем его сообщение
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
  
  // Обработчик закрытия snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
        Добавить напоминание
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
            disabled={loading}
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
                disabled={loading}
              />
              <FormControlLabel 
                value="event" 
                control={<Radio />} 
                label="Событие/мероприятие" 
                disabled={loading}
              />
            </RadioGroup>
          </FormControl>
          
          <DatePicker
            label="Дата"
            value={date}
            onChange={(newDate) => setDate(newDate)}
            disabled={loading}
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
            disabled={loading}
          />
          
          <FormControl fullWidth>
            <InputLabel>Напомнить за</InputLabel>
            <Select
              value={notifyDaysBefore}
              onChange={(e) => setNotifyDaysBefore(e.target.value)}
              label="Напомнить за"
              disabled={loading}
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
              disabled={loading}
              fullWidth
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              fullWidth
            >
              Сохранить
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

export default AddReminder;
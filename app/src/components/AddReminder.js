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
  Stack,
  CircularProgress,
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
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(dayjs().year().toString());
  const [includeYear, setIncludeYear] = useState(false);
  const [description, setDescription] = useState('');
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(1);
  
  // Состояния для валидации и загрузки
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
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
      
      // Отправка запроса
      await axios.post('/api/reminders', {
        telegramId: user.telegramId,
        title: title.trim(),
        type,
        date: dateData,
        description: description.trim(),
        notifyDaysBefore
      });
      
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
              onChange={handleTypeChange}
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
          
          {/* Заменяем DatePicker на отдельные поля для дня, месяца и года */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="День"
              type="number"
              fullWidth
              value={day}
              onChange={(e) => setDay(e.target.value)}
              inputProps={{ min: 1, max: 31 }}
              error={!!errors.day}
              helperText={errors.day}
              disabled={loading}
              required
            />
            
            <TextField
              label="Месяц"
              type="number"
              fullWidth
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              inputProps={{ min: 1, max: 12 }}
              error={!!errors.month}
              helperText={errors.month}
              disabled={loading}
              required
            />
          </Box>
          
          {/* Показываем поле для года для обычных событий обязательно */}
          {type === 'event' ? (
            <TextField
              label="Год"
              type="number"
              fullWidth
              value={year}
              onChange={(e) => setYear(e.target.value)}
              error={!!errors.year}
              helperText={errors.year}
              disabled={loading}
              required
            />
          ) : (
            /* Для дней рождения показываем опцию добавить год */
            <Box>
              <FormControlLabel
                control={
                  <Radio 
                    checked={!includeYear}
                    onChange={() => setIncludeYear(false)}
                    disabled={loading}
                  />
                }
                label="Без указания года" 
              />
              <FormControlLabel
                control={
                  <Radio 
                    checked={includeYear}
                    onChange={() => setIncludeYear(true)}
                    disabled={loading}
                  />
                }
                label="С указанием года" 
              />
              {includeYear && (
                <TextField
                  label="Год"
                  type="number"
                  fullWidth
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  error={!!errors.year}
                  helperText={errors.year}
                  disabled={loading}
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
          )}
          
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
              {loading ? (
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

export default AddReminder;
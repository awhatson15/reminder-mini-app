import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Skeleton
} from '@mui/material';
import {
  Cake as CakeIcon,
  Event as EventIcon,
  CalendarMonth as CalendarIcon,
  Description as DescriptionIcon,
  Notifications as NotificationsIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Title as TitleIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import axios from 'axios';
import { UserContext } from '../App';
import { getFormattedDateFromReminder } from '../utils/dateUtils';
import { motion } from 'framer-motion';
import Toast from './Toast';

const EditReminder = () => {
  const { user } = useContext(UserContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
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
  const [initialLoading, setInitialLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Загрузка данных напоминания
  useEffect(() => {
    const fetchReminder = async () => {
      try {
        const response = await axios.get(`/api/reminders/${id}`);
        const reminder = response.data;
        
        setTitle(reminder.title);
        setType(reminder.type);
        setDay(reminder.date.day.toString());
        setMonth(reminder.date.month.toString());
        
        // Устанавливаем год и флаг включения года
        if (reminder.date.year) {
          setYear(reminder.date.year.toString());
          setIncludeYear(reminder.type === 'birthday');
        } else {
          setYear(dayjs().year().toString());
          setIncludeYear(false);
        }
        
        setDescription(reminder.description || '');
        setNotifyDaysBefore(reminder.notifyDaysBefore);
        setInitialLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке напоминания:', error);
        setSnackbar({
          open: true,
          message: 'Не удалось загрузить напоминание',
          severity: 'error'
        });
        setInitialLoading(false);
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
      await axios.put(`/api/reminders/${id}`, {
        telegramId: user.telegramId,
        title: title.trim(),
        type,
        date: dateData,
        description: description.trim(),
        notifyDaysBefore
      });
      
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
  
  // Показываем скелетоны при начальной загрузке
  if (initialLoading) {
    return (
      <Box>
        <Typography variant="h5" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
          <Skeleton width={300} />
        </Typography>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: 4,
            background: alpha(theme.palette.primary.main, 0.04),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            mb: 3
          }}
        >
          <Stack spacing={3}>
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={100} />
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={100} />
            <Skeleton variant="rounded" height={56} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Skeleton variant="rounded" height={56} width="50%" />
              <Skeleton variant="rounded" height={56} width="50%" />
            </Box>
          </Stack>
        </Paper>
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography 
        variant="h5" 
        component="h1" 
        sx={{ 
          mb: 3, 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <EditIcon fontSize="large" color="primary" />
        Изменить напоминание
      </Typography>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 4,
          background: alpha(theme.palette.primary.main, 0.04),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          mb: 3
        }}
      >
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TitleIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            
            <Box sx={{ 
              p: 2, 
              borderRadius: 3,
              bgcolor: alpha(
                type === 'birthday' 
                  ? theme.palette.primary.main 
                  : theme.palette.secondary.main, 
                0.08
              ),
              border: `1px solid ${alpha(
                type === 'birthday' 
                  ? theme.palette.primary.main 
                  : theme.palette.secondary.main,
                0.15
              )}`,
            }}>
              <Typography 
                variant="subtitle1" 
                gutterBottom 
                fontWeight={600}
                sx={{ mb: 2 }}
              >
                Тип напоминания
              </Typography>
              
              <RadioGroup
                row
                value={type}
                onChange={handleTypeChange}
              >
                <FormControlLabel 
                  value="birthday" 
                  control={
                    <Radio 
                      sx={{
                        '&.Mui-checked': {
                          color: theme.palette.primary.main
                        }
                      }}
                    />
                  } 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CakeIcon color={type === 'birthday' ? 'primary' : 'inherit'} />
                      <Typography>День рождения</Typography>
                    </Box>
                  }
                  disabled={loading}
                  sx={{ mr: 3 }}
                />
                <FormControlLabel 
                  value="event" 
                  control={
                    <Radio 
                      sx={{
                        '&.Mui-checked': {
                          color: theme.palette.secondary.main
                        }
                      }}
                    />
                  } 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EventIcon color={type === 'event' ? 'secondary' : 'inherit'} />
                      <Typography>Событие/мероприятие</Typography>
                    </Box>
                  }
                  disabled={loading}
                />
              </RadioGroup>
            </Box>
            
            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>
              Дата
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="День"
                type="number"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                inputProps={{ min: 1, max: 31 }}
                error={!!errors.day}
                helperText={errors.day}
                disabled={loading}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon fontSize="small" color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 120, flex: 1 }}
              />
              
              <TextField
                label="Месяц"
                type="number"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                inputProps={{ min: 1, max: 12 }}
                error={!!errors.month}
                helperText={errors.month}
                disabled={loading}
                required
                sx={{ minWidth: 120, flex: 1 }}
              />
            </Box>
            
            {/* Показываем поле для года для обычных событий обязательно */}
            {type === 'event' ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            ) : (
              /* Для дней рождения показываем опцию добавить год */
              <Box sx={{ 
                p: 2, 
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}>
                <Typography variant="subtitle2" mb={1} fontWeight={500}>
                  Укажите год рождения (не обязательно)
                </Typography>
                <RadioGroup
                  row
                  value={includeYear ? "yes" : "no"}
                  onChange={(e) => setIncludeYear(e.target.value === "yes")}
                >
                  <FormControlLabel
                    value="no"
                    control={<Radio size="small" />}
                    label="Без указания года" 
                  />
                  <FormControlLabel
                    value="yes"
                    control={<Radio size="small" />}
                    label="С указанием года" 
                  />
                </RadioGroup>
                <Grow in={includeYear}>
                  <Box sx={{ mt: 2, display: includeYear ? 'block' : 'none' }}>
                    <TextField
                      label="Год рождения"
                      type="number"
                      fullWidth
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      size="small"
                    />
                  </Box>
                </Grow>
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mt: 1 }}>
                    <DescriptionIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControl fullWidth>
              <InputLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <NotificationsIcon fontSize="small" />
                  Напомнить за
                </Box>
              </InputLabel>
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
            
            <Divider />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
                disabled={loading}
                fullWidth
                startIcon={<CancelIcon />}
                size="large"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
                startIcon={loading ? null : <SaveIcon />}
                size="large"
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
      </Paper>
      
      <Toast 
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
};

export default EditReminder; 
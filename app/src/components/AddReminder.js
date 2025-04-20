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
  Paper,
  Divider,
  Chip,
  useTheme,
  alpha,
  Grow,
  InputAdornment,
  Tooltip,
  Checkbox,
  Switch,
  IconButton,
  Card,
  CardContent,
  Grid,
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
  Add as AddIcon,
  Title as TitleIcon,
  Repeat as RepeatIcon,
  WorkOutline as WorkIcon,
  FamilyRestroom as FamilyIcon,
  Person as PersonIcon,
  MoreHoriz as OtherIcon,
  ArrowBack as ArrowBackIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import axios from 'axios';
import { UserContext } from '../App';
import { motion } from 'framer-motion';
import Toast from './Toast';
import { format } from 'date-fns';

const AddReminder = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Состояния для формы
  const [title, setTitle] = useState('');
  const [type, setType] = useState('event');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [includeYear, setIncludeYear] = useState(false);
  const [description, setDescription] = useState('');
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(1);
  
  // Новые состояния для групп и повторяющихся напоминаний
  const [group, setGroup] = useState('другое');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState('yearly');
  const [recurringDayOfWeek, setRecurringDayOfWeek] = useState('1'); // Понедельник по умолчанию
  const [endDate, setEndDate] = useState('');
  
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
        telegramId: user.telegramId,
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
      }
      
      // Отправка запроса
      await axios.post('/api/reminders', reminderData);
      
      setSnackbar({
        open: true,
        message: 'Напоминание успешно добавлено',
        severity: 'success'
      });
      
      // Переход на главную страницу после небольшой задержки
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Ошибка при добавлении напоминания:', error);
      let errorMessage = 'Ошибка при добавлении напоминания';
      
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
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
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
          <AddIcon fontSize="large" color="primary" />
          Добавить напоминание
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
              
              {/* Поле выбора группы */}
              <FormControl fullWidth>
                <InputLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {getGroupIcon(group)}
                    Группа
                  </Box>
                </InputLabel>
                <Select
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  label="Группа"
                  disabled={loading}
                >
                  <MenuItem value="семья">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FamilyIcon />
                      <Typography>Семья</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="работа">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WorkIcon />
                      <Typography>Работа</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="друзья">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon />
                      <Typography>Друзья</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="другое">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <OtherIcon />
                      <Typography>Другое</Typography>
                    </Box>
                  </MenuItem>
                </Select>
                <FormHelperText>
                  Категория для группировки напоминаний
                </FormHelperText>
              </FormControl>
              
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
              
              {/* Блок для повторяющихся напоминаний */}
              <Box sx={{ 
                p: 2, 
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <RepeatIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Повторяющееся напоминание
                  </Typography>
                  <Switch 
                    checked={isRecurring}
                    onChange={handleRecurringChange}
                    color="primary"
                    sx={{ ml: 'auto' }}
                  />
                </Box>
                
                <Grow in={isRecurring}>
                  <Box sx={{ display: isRecurring ? 'block' : 'none' }}>
                    <Stack spacing={2}>
                      <FormControl fullWidth>
                        <InputLabel>Тип повторения</InputLabel>
                        <Select
                          value={recurringType}
                          onChange={(e) => setRecurringType(e.target.value)}
                          label="Тип повторения"
                        >
                          <MenuItem value="weekly">Еженедельно</MenuItem>
                          <MenuItem value="monthly">Ежемесячно</MenuItem>
                          <MenuItem value="yearly">Ежегодно</MenuItem>
                        </Select>
                      </FormControl>
                      
                      {recurringType === 'weekly' && (
                        <FormControl fullWidth>
                          <InputLabel>День недели</InputLabel>
                          <Select
                            value={recurringDayOfWeek}
                            onChange={(e) => setRecurringDayOfWeek(e.target.value)}
                            label="День недели"
                            error={!!errors.recurringDayOfWeek}
                          >
                            {[0, 1, 2, 3, 4, 5, 6].map(day => (
                              <MenuItem key={day} value={day.toString()}>
                                {getDayOfWeekName(day)}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.recurringDayOfWeek && (
                            <FormHelperText error>{errors.recurringDayOfWeek}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                      
                      <TextField
                        label="Дата окончания"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        error={!!errors.endDate}
                        helperText={errors.endDate || 'Дата, когда напоминания должны прекратиться'}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Stack>
                  </Box>
                </Grow>
              </Box>
              
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
    </motion.div>
  );
};

export default AddReminder;
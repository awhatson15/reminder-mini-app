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
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import { UserContext } from '../App';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [date, setDate] = useState(dayjs());
  
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
  const [focusedField, setFocusedField] = useState(null);
  const [validFields, setValidFields] = useState({});
  
  // Обработчик изменения даты из DatePicker
  const handleDateChange = (newDate) => {
    if (newDate) {
      setDate(newDate);
      setDay(newDate.date().toString());
      setMonth((newDate.month() + 1).toString());
      setYear(newDate.year().toString());
      
      // Очистка ошибок связанных с датой
      const newErrors = { ...errors };
      delete newErrors.day;
      delete newErrors.month;
      delete newErrors.year;
      setErrors(newErrors);
      
      // Добавление в валидированные поля
      setValidFields({
        ...validFields,
        day: true,
        month: true,
        year: true
      });
    }
  };
  
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
  
  // Обработчик ввода в поля с валидацией
  const handleInputChange = (field, value, validator) => {
    // Обновление значения поля
    if (field === 'title') setTitle(value);
    else if (field === 'description') setDescription(value);
    else if (field === 'day') setDay(value);
    else if (field === 'month') setMonth(value);
    else if (field === 'year') setYear(value);
    
    // Валидация поля
    if (validator) {
      const isValid = validator(value);
      
      // Обновление ошибок
      const newErrors = { ...errors };
      if (!isValid) {
        newErrors[field] = `Поле заполнено некорректно`;
      } else {
        delete newErrors[field];
      }
      setErrors(newErrors);
      
      // Обновление списка валидных полей
      setValidFields({
        ...validFields,
        [field]: isValid
      });
    }
  };
  
  // Получение соответствующей иконки для группы
  const getGroupIcon = (groupName) => {
    switch (groupName) {
      case 'семья':
        return <FamilyIcon />;
      case 'работа':
        return <WorkIcon />;
      case 'личное':
        return <PersonIcon />;
      default:
        return <OtherIcon />;
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
    
    // Если тип событие, нужно обязательно указать год
    if (newType === 'event') {
      setIncludeYear(true);
    } else {
      // Для дней рождения год можно не указывать
      setIncludeYear(false);
    }
  };
  
  const handleRecurringChange = (e) => {
    setIsRecurring(e.target.checked);
  };
  
  const getDayOfWeekName = (dayNumber) => {
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    return days[parseInt(dayNumber, 10)];
  };
  
  // Эффекты анимации для Framer Motion
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    }
  };
  
  const inputVariants = {
    focus: { scale: 1.02, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)" },
    blur: { scale: 1, boxShadow: "none" },
    valid: { backgroundColor: alpha(theme.palette.success.light, 0.05) },
    invalid: { backgroundColor: alpha(theme.palette.error.light, 0.05) }
  };
  
  const calendarVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 30 
      }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: { 
        duration: 0.2 
      }
    }
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { delayChildren: 0.1, staggerChildren: 0.1 } }
      }}
    >
      <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
        <motion.div variants={cardVariants}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <IconButton 
              onClick={() => navigate('/')}
              sx={{ mr: 1 }}
              color="primary"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
              Добавить напоминание
            </Typography>
          </Box>
        </motion.div>
        
        <form onSubmit={handleSubmit}>
          <motion.div variants={cardVariants}>
            <Card sx={{ mb: 3, overflow: 'visible' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <TitleIcon sx={{ mr: 1 }} /> 
                  Основная информация
                </Typography>
                
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={
                    errors.title 
                      ? "invalid" 
                      : validFields.title 
                        ? "valid" 
                        : focusedField === 'title' 
                          ? "focus" 
                          : "blur"
                  }
                  variants={inputVariants}
                >
                  <TextField
                    label="Название"
                    fullWidth
                    required
                    value={title}
                    onChange={(e) => handleInputChange('title', e.target.value, (val) => val.trim().length > 0)}
                    error={!!errors.title}
                    helperText={errors.title}
                    disabled={loading}
                    margin="normal"
                    onFocus={() => setFocusedField('title')}
                    onBlur={() => setFocusedField(null)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TitleIcon fontSize="small" color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </motion.div>
                
                <Box sx={{ mt: 2 }}>
                  <FormControl component="fieldset" disabled={loading} sx={{ mb: 2 }}>
                    <FormLabel component="legend" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', color: 'text.primary' }}>
                      Тип напоминания
                    </FormLabel>
                    <RadioGroup row value={type} onChange={handleTypeChange}>
                      <FormControlLabel 
                        value="birthday" 
                        control={
                          <Radio 
                            icon={<CakeIcon color="action" />} 
                            checkedIcon={<CakeIcon color="primary" />} 
                          />
                        } 
                        label={
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              color: type === 'birthday' ? 'primary.main' : 'text.primary'
                            }}
                          >
                            День рождения
                          </Typography>
                        } 
                      />
                      <FormControlLabel 
                        value="event" 
                        control={
                          <Radio 
                            icon={<EventIcon color="action" />} 
                            checkedIcon={<EventIcon color="primary" />} 
                          />
                        } 
                        label={
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              color: type === 'event' ? 'primary.main' : 'text.primary'
                            }}
                          >
                            Событие
                          </Typography>
                        } 
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <WorkIcon fontSize="small" />
                      Группа
                    </Box>
                  </InputLabel>
                  <Select
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    label="Группа"
                    disabled={loading}
                    startAdornment={
                      <InputAdornment position="start">
                        {getGroupIcon(group)}
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="семья">Семья</MenuItem>
                    <MenuItem value="работа">Работа</MenuItem>
                    <MenuItem value="личное">Личное</MenuItem>
                    <MenuItem value="другое">Другое</MenuItem>
                  </Select>
                  <FormHelperText>
                    Выберите группу для организации напоминаний
                  </FormHelperText>
                </FormControl>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={cardVariants}>
            <Card sx={{ mb: 3, overflow: 'visible' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon sx={{ mr: 1 }} /> 
                  Дата
                </Typography>
                
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={
                      errors.day || errors.month || errors.year 
                        ? "invalid" 
                        : validFields.day && validFields.month
                          ? "valid" 
                          : focusedField === 'date' 
                            ? "focus" 
                            : "blur"
                    }
                    variants={inputVariants}
                  >
                    <DatePicker
                      label="Выберите дату"
                      value={date}
                      onChange={handleDateChange}
                      sx={{ width: '100%', mb: 2 }}
                      slotProps={{ 
                        textField: { 
                          error: !!(errors.day || errors.month || errors.year),
                          helperText: errors.day || errors.month || errors.year || 'Выберите дату напоминания',
                          onFocus: () => setFocusedField('date'),
                          onBlur: () => setFocusedField(null)
                        },
                        popper: {
                          sx: { 
                            '& .MuiPickersDay-root': {
                              transition: 'transform 0.2s, background-color 0.2s',
                              '&:hover': {
                                transform: 'scale(1.1)',
                                backgroundColor: alpha(theme.palette.primary.main, 0.15)
                              },
                              '&.Mui-selected': {
                                transform: 'scale(1.1)',
                                backgroundColor: theme.palette.primary.main,
                                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)'
                              }
                            }
                          }
                        }
                      }}
                      componentsProps={{
                        actionBar: {
                          actions: ['clear', 'today', 'cancel', 'accept'],
                        }
                      }}
                    />
                  </motion.div>
                </LocalizationProvider>
                
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Или введите дату вручную:
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={
                      errors.day 
                        ? "invalid" 
                        : validFields.day 
                          ? "valid" 
                          : focusedField === 'day' 
                            ? "focus" 
                            : "blur"
                    }
                    variants={inputVariants}
                    style={{ flex: 1, minWidth: '120px' }}
                  >
                    <TextField
                      label="День"
                      type="number"
                      value={day}
                      onChange={(e) => handleInputChange('day', e.target.value, 
                        (val) => val >= 1 && val <= 31)}
                      inputProps={{ min: 1, max: 31 }}
                      error={!!errors.day}
                      helperText={errors.day}
                      disabled={loading}
                      required
                      onFocus={() => setFocusedField('day')}
                      onBlur={() => setFocusedField(null)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon fontSize="small" color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ minWidth: 120, flex: 1 }}
                    />
                  </motion.div>
                  
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={
                      errors.month 
                        ? "invalid" 
                        : validFields.month 
                          ? "valid" 
                          : focusedField === 'month' 
                            ? "focus" 
                            : "blur"
                    }
                    variants={inputVariants}
                    style={{ flex: 1, minWidth: '120px' }}
                  >
                    <TextField
                      label="Месяц"
                      type="number"
                      value={month}
                      onChange={(e) => handleInputChange('month', e.target.value, 
                        (val) => val >= 1 && val <= 12)}
                      inputProps={{ min: 1, max: 12 }}
                      error={!!errors.month}
                      helperText={errors.month}
                      disabled={loading}
                      required
                      onFocus={() => setFocusedField('month')}
                      onBlur={() => setFocusedField(null)}
                      sx={{ minWidth: 120, flex: 1 }}
                    />
                  </motion.div>
                </Box>
                
                {/* Показываем поле для года для обычных событий обязательно */}
                {(type === 'event' || includeYear) && (
                  <Box sx={{ mt: 2 }}>
                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      animate={
                        errors.year 
                          ? "invalid" 
                          : validFields.year 
                            ? "valid" 
                            : focusedField === 'year' 
                              ? "focus" 
                              : "blur"
                      }
                      variants={inputVariants}
                    >
                      <TextField
                        label="Год"
                        type="number"
                        value={year}
                        onChange={(e) => handleInputChange('year', e.target.value, 
                          (val) => val >= 1900 && val <= 2100)}
                        error={!!errors.year}
                        helperText={errors.year}
                        disabled={loading}
                        required={type === 'event'}
                        fullWidth
                        onFocus={() => setFocusedField('year')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </motion.div>
                  </Box>
                )}
                
                {/* Показываем переключатель "Указать год" только для дней рождения */}
                {type === 'birthday' && (
                  <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={includeYear}
                          onChange={(e) => setIncludeYear(e.target.checked)}
                          disabled={loading}
                          color="primary"
                        />
                      }
                      label="Указать год рождения"
                    />
                    <Tooltip title="Год рождения не обязателен для дней рождения">
                      <InfoIcon fontSize="small" color="action" sx={{ ml: 1, verticalAlign: 'middle' }} />
                    </Tooltip>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={cardVariants}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <DescriptionIcon sx={{ mr: 1 }} /> 
                  Дополнительная информация
                </Typography>
                
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={focusedField === 'description' ? "focus" : "blur"}
                  variants={inputVariants}
                >
                  <TextField
                    label="Описание"
                    fullWidth
                    multiline
                    rows={3}
                    value={description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={loading}
                    margin="normal"
                    onFocus={() => setFocusedField('description')}
                    onBlur={() => setFocusedField(null)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                          <DescriptionIcon fontSize="small" color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </motion.div>
                
                <Box sx={{ mt: 3 }}>
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
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                {/* Настройки повторения */}
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isRecurring}
                        onChange={handleRecurringChange}
                        disabled={loading}
                        icon={<RepeatIcon color="action" />}
                        checkedIcon={<RepeatIcon color="primary" />}
                      />
                    }
                    label={
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          fontWeight: isRecurring ? 'bold' : 'normal',
                          color: isRecurring ? 'primary.main' : 'text.primary'
                        }}
                      >
                        Повторяющееся напоминание
                      </Typography>
                    }
                  />
                  
                  <AnimatePresence>
                    {isRecurring && (
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={calendarVariants}
                      >
                        <Paper sx={{ mt: 2, p: 2, backgroundColor: alpha(theme.palette.background.paper, 0.7) }}>
                          <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Тип повторения</InputLabel>
                            <Select
                              value={recurringType}
                              onChange={(e) => setRecurringType(e.target.value)}
                              label="Тип повторения"
                              disabled={loading}
                            >
                              <MenuItem value="daily">Ежедневно</MenuItem>
                              <MenuItem value="weekly">Еженедельно</MenuItem>
                              <MenuItem value="monthly">Ежемесячно</MenuItem>
                              <MenuItem value="yearly">Ежегодно</MenuItem>
                            </Select>
                          </FormControl>
                          
                          {recurringType === 'weekly' && (
                            <FormControl fullWidth sx={{ mb: 2 }}>
                              <InputLabel>День недели</InputLabel>
                              <Select
                                value={recurringDayOfWeek}
                                onChange={(e) => setRecurringDayOfWeek(e.target.value)}
                                label="День недели"
                                disabled={loading}
                                error={!!errors.recurringDayOfWeek}
                              >
                                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
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
                            fullWidth
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            error={!!errors.endDate}
                            helperText={errors.endDate || 'Когда прекратить повторение напоминаний'}
                            InputLabelProps={{ shrink: true }}
                            disabled={loading}
                            sx={{ mt: 2 }}
                          />
                        </Paper>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={cardVariants}>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
                disabled={loading}
                startIcon={<CancelIcon />}
              >
                Отмена
              </Button>
              
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </form>
      </Box>
      
      <Toast
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </motion.div>
  );
};

export default AddReminder;
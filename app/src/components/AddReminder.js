import React, { useState, useContext, useRef } from 'react';
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
  FormLabel,
  Autocomplete,
  Stepper,
  Step,
  StepLabel
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
  InfoOutlined as InfoIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import axios from 'axios';
import { UserContext } from '../App';
import { motion } from 'framer-motion';
import Toast from './Toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import ContactSearch from './ContactSearch';

const AddReminder = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const formRef = useRef(null);
  
  // Шаги формы
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Основная информация', 'Детали', 'Уведомления'];
  
  // Состояния для формы
  const [title, setTitle] = useState('');
  const [type, setType] = useState('event');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [includeYear, setIncludeYear] = useState(false);
  const [description, setDescription] = useState('');
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(1);
  
  // Состояния для групп и повторяющихся напоминаний
  const [group, setGroup] = useState('другое');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState('yearly');
  const [recurringDayOfWeek, setRecurringDayOfWeek] = useState('1'); // Понедельник по умолчанию
  const [endDate, setEndDate] = useState('');
  
  // Состояния для валидации и загрузки
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Список месяцев для выбора
  const months = [
    { value: '1', label: 'Январь' },
    { value: '2', label: 'Февраль' },
    { value: '3', label: 'Март' },
    { value: '4', label: 'Апрель' },
    { value: '5', label: 'Май' },
    { value: '6', label: 'Июнь' },
    { value: '7', label: 'Июль' },
    { value: '8', label: 'Август' },
    { value: '9', label: 'Сентябрь' },
    { value: '10', label: 'Октябрь' },
    { value: '11', label: 'Ноябрь' },
    { value: '12', label: 'Декабрь' }
  ];
  
  // Варианты групп для выбора
  const groupOptions = [
    { value: 'семья', label: 'Семья', icon: <FamilyIcon /> },
    { value: 'работа', label: 'Работа', icon: <WorkIcon /> },
    { value: 'друзья', label: 'Друзья', icon: <PersonIcon /> },
    { value: 'другое', label: 'Другое', icon: <OtherIcon /> }
  ];
  
  // Дни недели для повторяющихся напоминаний
  const daysOfWeek = [
    { value: '0', label: 'Воскресенье' },
    { value: '1', label: 'Понедельник' },
    { value: '2', label: 'Вторник' },
    { value: '3', label: 'Среда' },
    { value: '4', label: 'Четверг' },
    { value: '5', label: 'Пятница' },
    { value: '6', label: 'Суббота' }
  ];
  
  // Варианты повторения
  const recurringOptions = [
    { value: 'weekly', label: 'Еженедельно' },
    { value: 'monthly', label: 'Ежемесячно' },
    { value: 'yearly', label: 'Ежегодно' }
  ];
  
  // Добавляем состояние для выбранного контакта
  const [selectedContact, setSelectedContact] = useState(null);
  
  // Обработчик выбора контакта
  const handleContactSelect = (contact) => {
    if (!contact) {
      setSelectedContact(null);
      return;
    }
    
    setSelectedContact(contact);
    
    // Если у контакта есть день рождения, заполняем поля
    if (contact.birthday) {
      const birthday = new Date(contact.birthday);
      setType('birthday');
      setDay(birthday.getDate().toString());
      setMonth((birthday.getMonth() + 1).toString());
      
      if (birthday.getFullYear() !== 1) {
        setYear(birthday.getFullYear().toString());
        setIncludeYear(true);
      }
      
      // Устанавливаем заголовок, если он пустой
      if (!title) {
        setTitle(`День рождения ${contact.name}`);
      }
    }
  };
  
  // Валидация формы
  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        return value.trim() ? '' : 'Введите название';
      case 'day':
        return !value || value < 1 || value > 31 ? 'Введите корректный день (1-31)' : '';
      case 'month':
        return !value || value < 1 || value > 12 ? 'Введите корректный месяц (1-12)' : '';
      case 'year':
        return type === 'event' && !value ? 'Для события необходимо указать год' : '';
      case 'recurringDayOfWeek':
        return isRecurring && recurringType === 'weekly' && (!value || value < 0 || value > 6)
          ? 'Выберите день недели' : '';
      case 'endDate':
        return isRecurring && !endDate ? 'Укажите дату окончания' : '';
      default:
        return '';
    }
  };
  
  // Обновление touched состояния при взаимодействии с полем
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, eval(field));
    setErrors({ ...errors, [field]: error });
  };
  
  // Проверка всех полей формы
  const validateForm = () => {
    const newErrors = {};
    const fieldsToValidate = [
      'title', 'day', 'month', 'year', 
      ...(isRecurring ? ['recurringDayOfWeek', 'endDate'] : [])
    ];
    
    fieldsToValidate.forEach(field => {
      const error = validateField(field, eval(field));
      if (error) {
        newErrors[field] = error;
        setTouched(prev => ({ ...prev, [field]: true }));
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Пожалуйста, исправьте ошибки в форме',
        severity: 'error'
      });
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
    const found = groupOptions.find(g => g.value === groupName);
    return found ? found.icon : <OtherIcon />;
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
  
  // Переход к следующему шагу
  const handleNext = (e) => {
    e.preventDefault(); // Предотвращаем сабмит формы
    
    const fieldsToValidate = {
      0: ['title', 'type'],
      1: ['day', 'month', ...(type === 'event' ? ['year'] : [])],
      2: [...(isRecurring ? ['recurringDayOfWeek', 'endDate'] : [])]
    };
    
    const currentFields = fieldsToValidate[activeStep] || [];
    const newErrors = {};
    let hasErrors = false;
    
    currentFields.forEach(field => {
      const error = validateField(field, eval(field));
      if (error) {
        newErrors[field] = error;
        setTouched(prev => ({ ...prev, [field]: true }));
        hasErrors = true;
      }
    });
    
    if (hasErrors) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      setSnackbar({
        open: true,
        message: 'Пожалуйста, заполните все обязательные поля',
        severity: 'warning'
      });
      return;
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  // Возврат к предыдущему шагу
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Рендеринг шага формы
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            {type === 'birthday' && (
              <Box mb={2}>
                <ContactSearch
                  onSelect={handleContactSelect}
                  label="Поиск контакта для дня рождения"
                />
              </Box>
            )}
            
            <TextField
              fullWidth
              label="Название"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleBlur('title')}
              error={touched.title && Boolean(errors.title)}
              helperText={touched.title && errors.title}
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TitleIcon color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder={type === 'birthday' ? "Например: День рождения Анны" : "Название события"}
              autoFocus
            />
            
            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Тип напоминания</FormLabel>
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
                          color: theme.palette.primary.main,
                        }
                      }}
                    />
                  } 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CakeIcon fontSize="small" />
                      <Typography>День рождения</Typography>
                    </Box>
                  }
                />
                <FormControlLabel 
                  value="event" 
                  control={
                    <Radio 
                      sx={{
                        '&.Mui-checked': {
                          color: theme.palette.primary.main,
                        }
                      }}
                    />
                  } 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <EventIcon fontSize="small" />
                      <Typography>Событие</Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="group-label">Группа</InputLabel>
              <Select
                labelId="group-label"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    {getGroupIcon(group)}
                  </InputAdornment>
                }
                label="Группа"
              >
                {groupOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {option.icon}
                      <Typography>{option.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        );
        
      case 1:
        return (
          <>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <FormControl fullWidth error={touched.day && Boolean(errors.day)}>
                  <Autocomplete
                    value={day ? { value: day, label: day } : null}
                    onChange={(e, newValue) => setDay(newValue ? newValue.value : '')}
                    onBlur={() => handleBlur('day')}
                    options={Array.from({ length: 31 }, (_, i) => ({ 
                      value: String(i + 1), 
                      label: String(i + 1) 
                    }))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="День"
                        error={touched.day && Boolean(errors.day)}
                        helperText={touched.day && errors.day}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth error={touched.month && Boolean(errors.month)}>
                  <Autocomplete
                    value={month ? months.find(m => m.value === month) : null}
                    onChange={(e, newValue) => setMonth(newValue ? newValue.value : '')}
                    onBlur={() => handleBlur('month')}
                    options={months}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Месяц"
                        error={touched.month && Boolean(errors.month)}
                        helperText={touched.month && errors.month}
                      />
                    )}
                  />
                </FormControl>
              </Grid>
            </Grid>
            
            {(type === 'event' || (type === 'birthday' && includeYear)) && (
              <TextField
                fullWidth
                label="Год"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                onBlur={() => handleBlur('year')}
                error={touched.year && Boolean(errors.year)}
                helperText={touched.year && errors.year}
                margin="normal"
                variant="outlined"
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            
            {type === 'birthday' && (
              <FormControlLabel
                control={
                  <Switch
                    checked={includeYear}
                    onChange={(e) => setIncludeYear(e.target.checked)}
                    color="primary"
                  />
                }
                label="Указать год рождения"
                sx={{ mt: 1, mb: 1 }}
              />
            )}
            
            <TextField
              fullWidth
              label="Описание (необязательно)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              variant="outlined"
              multiline
              rows={3}
              placeholder="Добавьте любые заметки или подробности..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                    <DescriptionIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </>
        );
        
      case 2:
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel id="notify-days-label">За сколько дней уведомить</InputLabel>
              <Select
                labelId="notify-days-label"
                value={notifyDaysBefore}
                onChange={(e) => setNotifyDaysBefore(e.target.value)}
                label="За сколько дней уведомить"
                startAdornment={
                  <InputAdornment position="start">
                    <NotificationsIcon color="action" />
                  </InputAdornment>
                }
              >
                {[0, 1, 2, 3, 5, 7, 14, 30].map((days) => (
                  <MenuItem key={days} value={days}>
                    {days === 0 ? 'В день события' : `За ${days} ${days === 1 ? 'день' : days >= 2 && days <= 4 ? 'дня' : 'дней'}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          
            <FormControlLabel
              control={
                <Switch
                  checked={isRecurring}
                  onChange={handleRecurringChange}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <RepeatIcon fontSize="small" />
                  <Typography>Повторяющееся напоминание</Typography>
                </Box>
              }
              sx={{ mt: 2, mb: 1 }}
            />
          
            {isRecurring && (
              <Grow in={isRecurring}>
                <Box sx={{ ml: 2, mt: 2 }}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="recurring-type-label">Частота повторения</InputLabel>
                    <Select
                      labelId="recurring-type-label"
                      value={recurringType}
                      onChange={(e) => setRecurringType(e.target.value)}
                      label="Частота повторения"
                    >
                      {recurringOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                
                  {recurringType === 'weekly' && (
                    <FormControl 
                      fullWidth 
                      margin="normal" 
                      error={touched.recurringDayOfWeek && Boolean(errors.recurringDayOfWeek)}
                    >
                      <InputLabel id="dow-label">День недели</InputLabel>
                      <Select
                        labelId="dow-label"
                        value={recurringDayOfWeek}
                        onChange={(e) => setRecurringDayOfWeek(e.target.value)}
                        onBlur={() => handleBlur('recurringDayOfWeek')}
                        label="День недели"
                      >
                        {daysOfWeek.map((day) => (
                          <MenuItem key={day.value} value={day.value}>
                            {day.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.recurringDayOfWeek && errors.recurringDayOfWeek && (
                        <FormHelperText>{errors.recurringDayOfWeek}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                
                  <TextField
                    fullWidth
                    label="Дата окончания"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    onBlur={() => handleBlur('endDate')}
                    error={touched.endDate && Boolean(errors.endDate)}
                    helperText={touched.endDate && errors.endDate}
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Box>
              </Grow>
            )}
          </>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Box>
        <Card 
          sx={{ 
            borderRadius: 3, 
            boxShadow: theme.shadows[3],
            overflow: 'visible'
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <IconButton 
                edge="start" 
                aria-label="back"
                onClick={() => navigate('/')}
                sx={{ mr: 1 }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography 
                variant="h5" 
                component="h1" 
                sx={{ 
                  fontWeight: 600,
                  flexGrow: 1
                }}
              >
                Новое напоминание
              </Typography>
              {loading && <CircularProgress size={24} sx={{ ml: 1 }} />}
            </Box>
            
            <Stepper 
              activeStep={activeStep} 
              alternativeLabel
              sx={{ mb: 4 }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            <form 
              ref={formRef} 
              onSubmit={(e) => {
                // Предотвращаем случайный сабмит формы
                if (activeStep !== steps.length - 1) {
                  e.preventDefault();
                  return;
                }
                handleSubmit(e);
              }}
              noValidate
            >
              <Box sx={{ minHeight: '320px' }}>
                {renderStepContent(activeStep)}
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  startIcon={<PrevIcon />}
                  sx={{ borderRadius: 8 }}
                >
                  Назад
                </Button>
                
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                    disabled={loading}
                    type="submit"
                    sx={{ 
                      borderRadius: 8,
                      background: 'linear-gradient(45deg, #4CAF50, #2E7D32)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #2E7D32, #1B5E20)'
                      }
                    }}
                  >
                    Сохранить
                  </Button>
                ) : (
                  <Button 
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<NextIcon />}
                    type="button"
                    sx={{ borderRadius: 8 }}
                  >
                    Далее
                  </Button>
                )}
              </Box>
            </form>
          </CardContent>
        </Card>
        
        <Toast
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={handleCloseSnackbar}
        />
      </Box>
    </motion.div>
  );
};

export default AddReminder;
import React, { useState, useEffect, useContext, useMemo, useCallback, useRef } from 'react';
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
  alpha,
  ToggleButtonGroup,
  ToggleButton,
  Badge,
  Paper,
  CircularProgress
} from '@mui/material';
import { 
  Cake as CakeIcon, 
  Event as EventIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  SortByAlpha as SortIcon,
  AccessTime as TimeIcon,
  Sort as SortNameIcon,
  CalendarMonth as CalendarIcon,
  WorkOutline as WorkIcon,
  FamilyRestroom as FamilyIcon,
  Person as PersonIcon,
  MoreHoriz as OtherIcon,
  FilterList as FilterIcon,
  Repeat as RepeatIcon,
  ReplayOutlined as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import { UserContext } from '../App';
import Loading from './Loading';
import { motion } from 'framer-motion';
import { getDaysUntil, getFormattedDateFromReminder, clearDaysUntilCache, getRelativeDateString } from '../utils/dateUtils';
import ConfirmDialog from './ConfirmDialog';
import Toast from './Toast';
import { FixedSizeList as VirtualList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import ReminderItem from './ReminderItem';
import { plural } from '../utils/textUtils';
import { formatDateForDisplay, getDayOfWeek, isToday, isTomorrow } from '../utils/dateUtils';

// Константа с названиями месяцев для форматирования даты
const MONTH_NAMES = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

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

/**
 * Группирует напоминания по времени (сегодня, завтра, на неделе, позже)
 * @param {Array} reminders - массив напоминаний
 * @returns {Object} сгруппированные напоминания
 */
const groupRemindersByTime = (reminders) => {
  const groups = {
    today: [],
    tomorrow: [],
    thisWeek: [],
    later: []
  };

  reminders.forEach(reminder => {
    const daysUntil = getDaysUntil(reminder.date);
    
    if (daysUntil === 0) {
      groups.today.push(reminder);
    } else if (daysUntil === 1) {
      groups.tomorrow.push(reminder);
    } else if (daysUntil <= 7) {
      groups.thisWeek.push(reminder);
    } else {
      groups.later.push(reminder);
    }
  });

  return groups;
};

/**
 * Подготавливает группы напоминаний для виртуализированного списка
 * @param {Object} groups - группы напоминаний
 * @returns {Array} подготовленные элементы для списка
 */
const prepareItemsForVirtualList = (groups) => {
  const items = [];
  
  // Для каждой группы добавляем заголовок и элементы
  const addGroupToItems = (reminders, title) => {
    if (reminders.length > 0) {
      items.push({ type: 'header', title, key: `header-${title}` });
      reminders.forEach(reminder => {
        items.push({ type: 'reminder', reminder, key: `reminder-${reminder._id}` });
      });
      items.push({ type: 'divider', key: `divider-${title}` });
    }
  };
  
  addGroupToItems(groups.today, 'Сегодня');
  addGroupToItems(groups.tomorrow, 'Завтра');
  addGroupToItems(groups.thisWeek, 'На этой неделе');
  addGroupToItems(groups.later, 'Позже');
  
  // Удаляем последний разделитель, если он есть
  if (items.length > 0 && items[items.length - 1].type === 'divider') {
    items.pop();
  }
  
  return items;
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
  const [selectedGroup, setSelectedGroup] = useState('all'); // 'all', 'семья', 'работа', 'друзья', 'другое'

  // Загрузка напоминаний
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/reminders?telegramId=${user.telegramId}`);
        setReminders(response.data);
        
        // Очищаем кэш расчета дней при обновлении данных
        clearDaysUntilCache();
        
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

  // Обработчик удаления напоминания (мемоизация для предотвращения перерисовок)
  const handleDelete = useCallback(async () => {
    if (!reminderToDelete) return;
    
    try {
      await axios.delete(`/api/reminders/${reminderToDelete._id}`);
      setReminders(prevReminders => prevReminders.filter(r => r._id !== reminderToDelete._id));
      setSnackbar({
        open: true,
        message: 'Напоминание удалено',
        severity: 'success'
      });
      
      // Очищаем кэш расчета дней при удалении напоминания
      clearDaysUntilCache();
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
  }, [reminderToDelete]);

  // Обработчик изменения группы для фильтрации (мемоизация)
  const handleGroupChange = useCallback((event, newGroup) => {
    if (newGroup !== null) {
      setSelectedGroup(newGroup);
    }
  }, []);

  // Получение иконки группы (мемоизированная функция)
  const getGroupIcon = useCallback((groupName) => {
    switch (groupName) {
      case 'семья':
        return <FamilyIcon />;
      case 'работа':
        return <WorkIcon />;
      case 'друзья':
        return <PersonIcon />;
      case 'другое':
      default:
        return <OtherIcon />;
    }
  }, []);

  // Изменение типа сортировки (мемоизация)
  const toggleSortType = useCallback(() => {
    setSortType(prevType => prevType === 'date' ? 'name' : 'date');
  }, []);

  // Закрытие snackbar (мемоизация)
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Функция для получения цвета карточки на основе типа и дней до события
  const getCardStyle = useCallback((reminder) => {
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
  }, []);

  // Фильтрация по группе и сортировка ремайндеров (мемоизированный расчет)
  const filteredAndSortedReminders = useMemo(() => {
    return [...reminders]
      .filter(reminder => selectedGroup === 'all' || reminder.group === selectedGroup)
      .sort((a, b) => {
        if (sortType === 'date') {
          const daysA = getDaysUntil(a.date);
          const daysB = getDaysUntil(b.date);
          return daysA - daysB;
        } else {
          return a.title.localeCompare(b.title);
        }
      });
  }, [reminders, selectedGroup, sortType]);

  // Группируем напоминания и подготавливаем для виртуализации
  const groupedItems = useMemo(() => {
    if (!filteredAndSortedReminders || filteredAndSortedReminders.length === 0) return [];
    const groups = groupRemindersByTime(filteredAndSortedReminders);
    return prepareItemsForVirtualList(groups);
  }, [filteredAndSortedReminders]);
  
  // Определение пустого состояния (мемоизированный расчет)
  const isEmpty = useMemo(() => {
    return filteredAndSortedReminders.length === 0;
  }, [filteredAndSortedReminders]);

  // Подсчет напоминаний в каждой группе для бейджа (мемоизированный расчет)
  const groupCounts = useMemo(() => {
    return {
      'семья': reminders.filter(r => r.group === 'семья').length,
      'работа': reminders.filter(r => r.group === 'работа').length,
      'друзья': reminders.filter(r => r.group === 'друзья').length,
      'другое': reminders.filter(r => r.group === 'другое').length
    };
  }, [reminders]);
  
  // VirtualList требует функцию-рендерер для элементов
  const ItemRenderer = useMemo(() => {
    return ({ index, style }) => {
      const item = groupedItems[index];
      if (!item) return null;
      
      if (item.type === 'header') {
        return (
          <div style={style}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600, 
                mb: 1, 
                mt: 2,
                color: alpha(theme.palette.text.primary, 0.8)
              }}
            >
              {item.title}
            </Typography>
          </div>
        );
      }
      
      if (item.type === 'divider') {
        return (
          <div style={style}>
            <Divider sx={{ my: 1 }} />
          </div>
        );
      }
      
      if (item.type === 'reminder') {
        const reminder = item.reminder;
        return (
          <div style={style}>
            <ReminderItem 
              reminder={reminder}
              onEdit={(id) => navigate(`/edit/${id}`)}
              onDelete={(id) => {
                setReminderToDelete(reminders.find(r => r._id === id));
                setDeleteDialogOpen(true);
              }}
            />
          </div>
        );
      }
      
      return null;
    };
  }, [groupedItems, navigate, handleDelete, theme]);
  
  // Получаем высоту элемента в зависимости от его типа
  const getItemHeight = useCallback((index) => {
    const item = groupedItems[index];
    if (!item) return 0;
    
    if (item.type === 'header') return 48;
    if (item.type === 'divider') return 32;
    
    // Для напоминаний высота зависит от наличия описания
    // (приблизительная оценка)
    const reminder = item.reminder;
    const baseHeight = 120; // Базовая высота без описания
    const descriptionHeight = reminder.description 
      ? Math.min(80, reminder.description.length / 2) // Приблизительно
      : 0;
    
    return baseHeight + descriptionHeight;
  }, [groupedItems]);

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

      {/* Фильтр по группам */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1,
            color: alpha(theme.palette.text.primary, 0.7)
          }}
        >
          <FilterIcon fontSize="small" sx={{ mr: 0.5 }} />
          Фильтр по группам:
        </Typography>
        <ToggleButtonGroup
          value={selectedGroup}
          exclusive
          onChange={handleGroupChange}
          aria-label="фильтр групп"
          size="small"
          sx={{ 
            flexWrap: 'wrap',
            '& .MuiToggleButtonGroup-grouped': {
              borderRadius: 2,
              mx: 0.5,
              mb: 0.5
            }
          }}
        >
          <ToggleButton value="all" aria-label="все группы">
            Все
          </ToggleButton>
          <ToggleButton value="семья" aria-label="семья">
            <Badge badgeContent={groupCounts['семья']} color="primary" sx={{ mr: 1 }}>
              <FamilyIcon sx={{ mr: 0.5 }} />
            </Badge>
            Семья
          </ToggleButton>
          <ToggleButton value="работа" aria-label="работа">
            <Badge badgeContent={groupCounts['работа']} color="primary" sx={{ mr: 1 }}>
              <WorkIcon sx={{ mr: 0.5 }} />
            </Badge>
            Работа
          </ToggleButton>
          <ToggleButton value="друзья" aria-label="друзья">
            <Badge badgeContent={groupCounts['друзья']} color="primary" sx={{ mr: 1 }}>
              <PersonIcon sx={{ mr: 0.5 }} />
            </Badge>
            Друзья
          </ToggleButton>
          <ToggleButton value="другое" aria-label="другое">
            <Badge badgeContent={groupCounts['другое']} color="primary" sx={{ mr: 1 }}>
              <OtherIcon sx={{ mr: 0.5 }} />
            </Badge>
            Другое
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {isEmpty ? (
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
            {selectedGroup === 'all' 
              ? 'У вас пока нет напоминаний' 
              : 'В этой группе нет напоминаний'}
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
        <AutoSizer>
          {({ height, width }) => (
            <VirtualList
              height={height}
              width={width}
              itemCount={groupedItems.length}
              itemSize={getItemHeight}
            >
              {ItemRenderer}
            </VirtualList>
          )}
        </AutoSizer>
      )}

      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Удаление напоминания"
        message={`Вы действительно хотите удалить напоминание "${reminderToDelete?.title}"?`}
        confirmText="Удалить"
        cancelText="Отмена"
        confirmColor="error"
      />

      {/* Уведомление */}
      <Toast 
        open={snackbar.open} 
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
};

export default ReminderList; 
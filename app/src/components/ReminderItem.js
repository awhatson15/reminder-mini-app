import React, { useContext } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Avatar,
  Chip,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Cake as CakeIcon,
  Event as EventIcon,
  Timer as TimeIcon,
  AccessTime as TimeAltIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  MedicalServices as MedicalIcon,
  ShoppingCart as ShoppingIcon,
  Celebration as CelebrationIcon,
  MoreHoriz as OtherIcon,
  Repeat as RepeatIcon
} from '@mui/icons-material';
import { getDaysUntil, getRelativeDateString } from '../utils/dateUtils';
import { plural } from '../utils/textUtils';
import { ThemeContext } from '../index';

/**
 * Получает иконку для группы напоминания
 * @param {string} group - название группы
 * @returns {React.ReactElement} иконка группы
 */
const getGroupIcon = (group) => {
  switch (group?.toLowerCase()) {
    case 'работа': return <WorkIcon fontSize="small" />;
    case 'личное': return <PersonIcon fontSize="small" />;
    case 'учеба': return <SchoolIcon fontSize="small" />;
    case 'здоровье': return <MedicalIcon fontSize="small" />;
    case 'покупки': return <ShoppingIcon fontSize="small" />;
    case 'праздник': return <CelebrationIcon fontSize="small" />;
    default: return <OtherIcon fontSize="small" />;
  }
};

/**
 * Получает стиль карточки в зависимости от типа и срочности напоминания
 * @param {Object} reminder - объект напоминания
 * @param {boolean} isDarkMode - режим темы
 * @returns {Object} объект стилей
 */
const getCardStyle = (reminder, theme, isDarkMode) => {
  const daysUntil = getDaysUntil(reminder.date);
  
  // Базовые неоморфные тени
  const neuShadows = isDarkMode 
    ? '5px 5px 10px rgba(0, 0, 0, 0.7), -5px -5px 10px rgba(255, 255, 255, 0.05)'
    : '5px 5px 10px rgba(0, 0, 0, 0.15), -5px -5px 10px rgba(255, 255, 255, 0.7)';
  
  // Стиль для дней рождения
  if (reminder.type === 'birthday') {
    return {
      background: theme.palette.typeColors.birthday,
      boxShadow: neuShadows,
      border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.03)' : '1px solid rgba(255, 255, 255, 0.5)'
    };
  }
  
  // Стиль в зависимости от срочности
  if (daysUntil === 0) {
    return {
      background: theme.palette.typeColors.urgent,
      boxShadow: neuShadows,
      border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.03)' : '1px solid rgba(255, 255, 255, 0.5)'
    };
  } else if (daysUntil <= 3) {
    return {
      background: theme.palette.typeColors.soon,
      boxShadow: neuShadows,
      border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.03)' : '1px solid rgba(255, 255, 255, 0.5)'
    };
  } else {
    return {
      background: theme.palette.typeColors.personal,
      boxShadow: neuShadows,
      border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.03)' : '1px solid rgba(255, 255, 255, 0.5)'
    };
  }
};

/**
 * Компонент элемента напоминания
 * 
 * @param {Object} props - свойства компонента
 * @param {Object} props.reminder - объект напоминания
 * @param {Function} props.onEdit - обработчик редактирования
 * @param {Function} props.onDelete - обработчик удаления
 * @returns {JSX.Element} компонент элемента напоминания
 */
const ReminderItem = ({ reminder, onEdit, onDelete }) => {
  if (!reminder) return null;
  
  const theme = useTheme();
  const { isDarkMode } = useContext(ThemeContext);
  const daysUntil = getDaysUntil(reminder.date);
  const cardStyle = getCardStyle(reminder, theme, isDarkMode);

  // Анимация для hover эффекта
  const hoverAnimation = {
    rest: { 
      scale: 1,
      boxShadow: isDarkMode 
        ? '5px 5px 10px rgba(0, 0, 0, 0.7), -5px -5px 10px rgba(255, 255, 255, 0.05)'
        : '5px 5px 10px rgba(0, 0, 0, 0.15), -5px -5px 10px rgba(255, 255, 255, 0.7)',
      y: 0,
      transition: {
        duration: 0.3,
        type: 'spring',
        stiffness: 300
      }
    },
    hover: { 
      scale: 1.03,
      boxShadow: isDarkMode 
        ? '10px 10px 20px rgba(0, 0, 0, 0.8), -10px -10px 20px rgba(255, 255, 255, 0.07)'
        : '10px 10px 20px rgba(0, 0, 0, 0.2), -10px -10px 20px rgba(255, 255, 255, 0.9)',
      y: -5,
      transition: {
        duration: 0.4,
        type: 'spring',
        stiffness: 200
      }
    }
  };

  // Стили для кнопок
  const buttonStyle = {
    color: '#fff',
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(4px)',
    boxShadow: isDarkMode
      ? '2px 2px 5px rgba(0, 0, 0, 0.3), -2px -2px 5px rgba(255, 255, 255, 0.05)'
      : '2px 2px 5px rgba(255, 255, 255, 0.3), -2px -2px 5px rgba(255, 255, 255, 0.8)',
    transition: 'all 0.3s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: isDarkMode
        ? '4px 4px 8px rgba(0, 0, 0, 0.4), -2px -2px 5px rgba(255, 255, 255, 0.07)'
        : '4px 4px 8px rgba(0, 0, 0, 0.15), -2px -2px 5px rgba(255, 255, 255, 1)',
      background: 'rgba(255, 255, 255, 0.25)',
    },
    '&:active': {
      boxShadow: isDarkMode
        ? 'inset 2px 2px 5px rgba(0, 0, 0, 0.4), inset -2px -2px 5px rgba(255, 255, 255, 0.05)'
        : 'inset 2px 2px 5px rgba(0, 0, 0, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.5)',
      transform: 'translateY(0)',
    }
  };

  return (
    <motion.div 
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={hoverAnimation}
    >
      <Card 
        sx={{ 
          mb: 2, 
          position: 'relative',
          overflow: 'visible',
          borderRadius: '20px',
          ...cardStyle
        }}
      >
        <CardContent sx={{ color: '#fff', pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                mr: 1.5,
                boxShadow: isDarkMode
                  ? '3px 3px 7px rgba(0, 0, 0, 0.3), -1px -1px 5px rgba(255, 255, 255, 0.07)'
                  : '3px 3px 7px rgba(0, 0, 0, 0.1), -1px -1px 5px rgba(255, 255, 255, 0.5)',
              }}
            >
              {reminder.type === 'birthday' ? <CakeIcon /> : <EventIcon />}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div" fontWeight={700} noWrap>
                {reminder.title}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                {getRelativeDateString(reminder.date)}
              </Typography>
            </Box>
            <Box sx={{ ml: 1 }}>
              <IconButton 
                size="small" 
                onClick={() => onEdit(reminder._id)}
                aria-label="Редактировать"
                sx={{ 
                  ...buttonStyle,
                  mr: 1
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small"
                onClick={() => onDelete(reminder._id)}
                aria-label="Удалить"
                sx={buttonStyle}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          
          {reminder.description && (
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 1, 
                mb: 2,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(4px)',
                p: 1.5,
                borderRadius: 16,
                boxShadow: isDarkMode
                  ? 'inset 2px 2px 5px rgba(0, 0, 0, 0.3), inset -2px -2px 5px rgba(255, 255, 255, 0.03)'
                  : 'inset 2px 2px 5px rgba(0, 0, 0, 0.05), inset -2px -2px 5px rgba(255, 255, 255, 0.3)',
                fontWeight: 500
              }}
            >
              {reminder.description}
            </Typography>
          )}
          
          <Box sx={{ 
            mt: 1, 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 1
          }}>
            <Chip
              icon={reminder.type === 'birthday' ? <CakeIcon /> : <EventIcon />}
              label={reminder.type === 'birthday' ? 'День рождения' : 'Событие'}
              size="small"
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(4px)',
                color: '#fff',
                fontWeight: 600,
                boxShadow: isDarkMode
                  ? '2px 2px 5px rgba(0, 0, 0, 0.3), -1px -1px 3px rgba(255, 255, 255, 0.05)'
                  : '2px 2px 5px rgba(0, 0, 0, 0.05), -1px -1px 3px rgba(255, 255, 255, 0.5)',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.03)' : '1px solid rgba(255, 255, 255, 0.2)',
              }}
            />
            
            {reminder.group && (
              <Chip
                icon={getGroupIcon(reminder.group)}
                label={reminder.group}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(4px)',
                  color: '#fff', 
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  boxShadow: isDarkMode
                    ? '2px 2px 5px rgba(0, 0, 0, 0.3), -1px -1px 3px rgba(255, 255, 255, 0.05)'
                    : '2px 2px 5px rgba(0, 0, 0, 0.05), -1px -1px 3px rgba(255, 255, 255, 0.5)',
                  border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.03)' : '1px solid rgba(255, 255, 255, 0.2)',
                }}
              />
            )}
            
            {reminder.isRecurring && (
              <Chip
                icon={<RepeatIcon />}
                label={
                  reminder.recurringType === 'weekly' ? 'Еженедельно' :
                  reminder.recurringType === 'monthly' ? 'Ежемесячно' : 'Ежегодно'
                }
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(4px)',
                  color: '#fff',
                  fontWeight: 600,
                  boxShadow: isDarkMode
                    ? '2px 2px 5px rgba(0, 0, 0, 0.3), -1px -1px 3px rgba(255, 255, 255, 0.05)'
                    : '2px 2px 5px rgba(0, 0, 0, 0.05), -1px -1px 3px rgba(255, 255, 255, 0.5)',
                  border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.03)' : '1px solid rgba(255, 255, 255, 0.2)',
                }}
              />
            )}
            
            <Chip
              icon={daysUntil === 0 ? <TimeAltIcon /> : <TimeIcon />}
              label={daysUntil === 0 ? 'Сегодня' : `${daysUntil} ${plural(daysUntil, 'день', 'дня', 'дней')}`}
              size="small"
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(4px)',
                color: '#fff',
                fontWeight: 600,
                boxShadow: isDarkMode
                  ? '2px 2px 5px rgba(0, 0, 0, 0.3), -1px -1px 3px rgba(255, 255, 255, 0.05)'
                  : '2px 2px 5px rgba(0, 0, 0, 0.05), -1px -1px 3px rgba(255, 255, 255, 0.5)',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.03)' : '1px solid rgba(255, 255, 255, 0.2)',
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReminderItem; 
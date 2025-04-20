import React, { useContext } from 'react';
import {
  CardContent,
  Typography,
  Box,
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
import { NeuCard, NeuIcon } from './neumorphic';

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
  
  // Стиль для дней рождения
  if (reminder.type === 'birthday') {
    return {
      background: theme.palette.typeColors.birthday,
      border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.03)' : '1px solid rgba(255, 255, 255, 0.5)'
    };
  }
  
  // Стиль в зависимости от срочности
  if (daysUntil === 0) {
    return {
      background: theme.palette.typeColors.urgent,
      border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.03)' : '1px solid rgba(255, 255, 255, 0.5)'
    };
  } else if (daysUntil <= 3) {
    return {
      background: theme.palette.typeColors.soon,
      border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.03)' : '1px solid rgba(255, 255, 255, 0.5)'
    };
  } else {
    return {
      background: theme.palette.typeColors.personal,
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
      y: 0,
      transition: {
        duration: 0.3,
        type: 'spring',
        stiffness: 300
      }
    },
    hover: { 
      scale: 1.03,
      y: -5,
      transition: {
        duration: 0.4,
        type: 'spring',
        stiffness: 200
      }
    }
  };

  return (
    <motion.div 
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={hoverAnimation}
    >
      <NeuCard 
        variant="raised"
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

            {/* Блок управления */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <NeuIcon
                icon={<EditIcon fontSize="small" />}
                size="small"
                variant="inset"
                clickable
                onClick={() => onEdit(reminder)}
                color="#fff"
                sx={{ background: 'rgba(255, 255, 255, 0.15)' }}
              />
              <NeuIcon
                icon={<DeleteIcon fontSize="small" />}
                size="small"
                variant="inset"
                clickable
                onClick={() => onDelete(reminder)}
                color="#fff"
                sx={{ background: 'rgba(255, 255, 255, 0.15)' }}
              />
            </Box>
          </Box>

          {/* Информация о напоминании */}
          <Box sx={{ mt: 1 }}>
            {reminder.description && (
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 1, 
                  opacity: 0.9,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {reminder.description}
              </Typography>
            )}
            
            {/* Теги */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {reminder.group && (
                <Chip
                  size="small"
                  icon={getGroupIcon(reminder.group)}
                  label={reminder.group}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontWeight: 500,
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              )}
              
              {reminder.isRecurring && (
                <Chip
                  size="small"
                  icon={<RepeatIcon fontSize="small" />}
                  label="Повторяющееся"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontWeight: 500,
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              )}
              
              {/* Индикатор срочности */}
              {daysUntil <= 3 && (
                <Chip
                  size="small"
                  icon={daysUntil === 0 ? <TimeIcon fontSize="small" /> : <TimeAltIcon fontSize="small" />}
                  label={daysUntil === 0 
                    ? 'Сегодня' 
                    : `Через ${daysUntil} ${plural(daysUntil, ['день', 'дня', 'дней'])}`
                  }
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontWeight: 500,
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              )}
            </Box>
          </Box>
        </CardContent>
      </NeuCard>
    </motion.div>
  );
};

export default ReminderItem; 
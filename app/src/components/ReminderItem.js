import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Avatar,
  Chip
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
 * @returns {Object} объект стилей
 */
const getCardStyle = (reminder) => {
  const daysUntil = getDaysUntil(reminder.date);
  
  // Стиль для дней рождения
  if (reminder.type === 'birthday') {
    return {
      background: 'linear-gradient(135deg, #FF6B6B 0%, #FFB88C 100%)',
      boxShadow: '0 4px 20px rgba(255, 107, 107, 0.3)'
    };
  }
  
  // Стиль в зависимости от срочности
  if (daysUntil === 0) {
    return {
      background: 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)',
      boxShadow: '0 4px 20px rgba(221, 36, 118, 0.3)'
    };
  } else if (daysUntil <= 3) {
    return {
      background: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 100%)',
      boxShadow: '0 4px 20px rgba(42, 210, 255, 0.3)'
    };
  } else {
    return {
      background: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
      boxShadow: '0 4px 20px rgba(168, 224, 99, 0.3)'
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
  
  const daysUntil = getDaysUntil(reminder.date);
  const cardStyle = getCardStyle(reminder);

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        sx={{ 
          mb: 2, 
          position: 'relative',
          overflow: 'visible',
          ...cardStyle
        }}
      >
        <CardContent sx={{ color: '#fff', pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                mr: 1.5 
              }}
            >
              {reminder.type === 'birthday' ? <CakeIcon /> : <EventIcon />}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div" fontWeight={600} noWrap>
                {reminder.title}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {getRelativeDateString(reminder.date)}
              </Typography>
            </Box>
            <Box sx={{ ml: 1 }}>
              <IconButton 
                size="small" 
                onClick={() => onEdit(reminder._id)}
                aria-label="Редактировать"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(4px)',
                  mr: 1,
                  '&:hover': { 
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: '#fff'
                  }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small"
                onClick={() => onDelete(reminder._id)}
                aria-label="Удалить"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(4px)',
                  '&:hover': { 
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: '#fff'
                  }
                }}
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
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(4px)',
                p: 1.5,
                borderRadius: 2
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
                fontWeight: 600
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
                  textTransform: 'capitalize'
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
                  fontWeight: 600
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
                fontWeight: 600
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReminderItem; 
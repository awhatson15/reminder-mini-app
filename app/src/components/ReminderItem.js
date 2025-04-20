import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { 
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CompleteIcon
} from '@mui/icons-material';
import { NeuCard } from './neumorphic';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Компонент для отображения напоминания
 * @param {Object} reminder - Объект напоминания
 * @param {string} reminder.id - Уникальный идентификатор напоминания
 * @param {string} reminder.title - Заголовок напоминания
 * @param {boolean} reminder.completed - Статус завершения
 * @param {string} reminder.date - Дата напоминания
 * @param {Function} onToggleComplete - Функция переключения статуса завершения
 * @param {Function} onDelete - Функция удаления напоминания
 * @param {Function} onEdit - Функция редактирования напоминания
 */
const ReminderItem = ({ 
  reminder, 
  onToggleComplete, 
  onDelete, 
  onEdit 
}) => {
  const { id, title, completed, date } = reminder;
  
  // Форматирование даты
  const formattedDate = date ? format(new Date(date), 'PPP', { locale: ru }) : '';

  return (
    <NeuCard 
      variant={completed ? "inset" : "raised"}
      clickable
      sx={{ 
        mb: 2, 
        opacity: completed ? 0.75 : 1,
        transition: 'all 0.3s ease',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1
      }}>
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          flex: 1
        }}>
          <IconButton 
            onClick={() => onToggleComplete(id)}
            color={completed ? "primary" : "default"}
            sx={{ 
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.1)'
              }
            }}
          >
            <CompleteIcon />
          </IconButton>
          
          <Box sx={{ ml: 1 }}>
            <Typography 
              variant="h6"
              sx={{ 
                textDecoration: completed ? 'line-through' : 'none',
                opacity: completed ? 0.7 : 1,
                transition: 'opacity 0.3s ease'
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                fontSize: '0.85rem',
                fontWeight: 'light'
              }}
            >
              {formattedDate}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ 
          display: 'flex',
          gap: 0.5
        }}>
          {!completed && (
            <IconButton 
              onClick={() => onEdit(reminder)}
              size="small"
              sx={{ 
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  color: 'primary.main'
                }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          
          <IconButton 
            onClick={() => onDelete(id)}
            size="small"
            sx={{ 
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                color: 'error.main'
              }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </NeuCard>
  );
};

export default ReminderItem; 
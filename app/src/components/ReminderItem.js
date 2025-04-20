import React, { useState } from 'react';
import { Box, Typography, IconButton, Collapse, Chip, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CompleteIcon,
  ExpandMore as ExpandMoreIcon,
  PriorityHigh as PriorityIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { NeuCard, NeuTooltip } from './neumorphic';
import { format, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Компонент для отображения напоминания с улучшенным UX
 * @param {Object} reminder - Объект напоминания
 * @param {string} reminder.id - Уникальный идентификатор напоминания
 * @param {string} reminder.title - Заголовок напоминания
 * @param {boolean} reminder.completed - Статус завершения
 * @param {string} reminder.date - Дата напоминания
 * @param {string} reminder.description - Описание напоминания
 * @param {string} reminder.priority - Приоритет (high, medium, low, none)
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
  const { id, title, completed, date, description, priority = 'none' } = reminder;
  const [expanded, setExpanded] = useState(false);
  
  // Форматирование даты
  const formattedDate = date ? format(new Date(date), 'PPP', { locale: ru }) : '';
  const formattedTime = date ? format(new Date(date), 'HH:mm', { locale: ru }) : '';
  
  // Вычисление оставшегося времени
  const daysLeft = date ? differenceInDays(new Date(date), new Date()) : 0;
  
  // Получение цвета приоритета
  const getPriorityColor = () => {
    if (priority === 'high') return 'error';
    if (priority === 'medium') return 'warning';
    if (priority === 'low') return 'success';
    return 'default';
  };
  
  // Приоритет текстом
  const getPriorityText = () => {
    if (priority === 'high') return 'Высокий';
    if (priority === 'medium') return 'Средний';
    if (priority === 'low') return 'Низкий';
    return 'Нет';
  };

  // Варианты анимации для расширения/сворачивания описания
  const expandVariants = {
    open: { rotate: 180 },
    closed: { rotate: 0 }
  };

  // Обработчик клика для разворачивания/сворачивания
  const handleExpandClick = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <NeuCard 
      variant={completed ? "inset" : "raised"}
      clickable
      compact={true}
      component={motion.div}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      whileTap={{ y: 0, scale: 0.98, transition: { duration: 0.1 } }}
      sx={{ 
        mb: 1.5,
        opacity: completed ? 0.75 : 1,
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Полоска приоритета слева */}
      {priority !== 'none' && !completed && (
        <Box 
          sx={{ 
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            backgroundColor: theme => theme.palette.priorityColors[priority],
            borderTopLeftRadius: '18px',
            borderBottomLeftRadius: '18px'
          }}
        />
      )}
      
      <Box 
        onClick={() => {
          if (!expanded && description) {
            setExpanded(true);
          }
        }}
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          p: 0.75,
          pl: priority !== 'none' && !completed ? 1.5 : 0.75
        }}
      >
        {/* Верхняя часть - заголовок и действия */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            flex: 1
          }}>
            <NeuTooltip title={completed ? "Отметить как активное" : "Отметить как выполненное"}>
              <IconButton 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete(id);
                }}
                color={completed ? "primary" : "default"}
                size="small"
                sx={{ 
                  transition: 'transform 0.2s ease, background-color 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    backgroundColor: theme => 
                      completed 
                        ? `${theme.palette.primary.main}15` 
                        : `${theme.palette.action.hover}`
                  },
                  padding: '4px'
                }}
              >
                <CompleteIcon fontSize="small" />
              </IconButton>
            </NeuTooltip>
            
            <Box sx={{ ml: 0.5 }}>
              <Typography 
                variant="subtitle1"
                sx={{ 
                  textDecoration: completed ? 'line-through' : 'none',
                  opacity: completed ? 0.7 : 1,
                  transition: 'opacity 0.3s ease',
                  fontSize: '0.95rem',
                  fontWeight: 500
                }}
              >
                {title}
              </Typography>
              
              {/* Дата и чип c оставшимся временем */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                mt: '-2px'
              }}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <ScheduleIcon 
                    sx={{ 
                      fontSize: '0.875rem', 
                      opacity: 0.7, 
                      mr: 0.3
                    }} 
                  />
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: '0.8rem',
                      fontWeight: 'light'
                    }}
                  >
                    {formattedDate} {formattedTime && `в ${formattedTime}`}
                  </Typography>
                </Box>
                
                {!completed && daysLeft >= -1 && daysLeft <= 7 && (
                  <Chip 
                    label={daysLeft === 0 
                      ? "Сегодня" 
                      : daysLeft === 1 
                        ? "Завтра" 
                        : daysLeft > 1 
                          ? `Через ${daysLeft} дн.` 
                          : "Просрочено"
                    }
                    size="small"
                    color={daysLeft < 0 
                      ? "error" 
                      : daysLeft === 0 
                        ? "warning" 
                        : "primary"
                    }
                    sx={{ 
                      height: '18px',
                      fontSize: '0.65rem',
                      ml: 1
                    }}
                  />
                )}
                
                {/* Чип приоритета */}
                {priority !== 'none' && !completed && (
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    ml: 1
                  }}>
                    <NeuTooltip title={`Приоритет: ${getPriorityText()}`}>
                      <Chip
                        icon={<PriorityIcon sx={{ fontSize: '0.75rem !important' }} />}
                        label={getPriorityText()}
                        size="small"
                        color={getPriorityColor()}
                        variant="outlined"
                        sx={{ 
                          height: '18px',
                          fontSize: '0.65rem'
                        }}
                      />
                    </NeuTooltip>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ 
            display: 'flex',
            gap: 0.25
          }}>
            {/* Кнопка расширения для описания */}
            {description && (
              <NeuTooltip title={expanded ? "Свернуть" : "Развернуть"}>
                <IconButton
                  onClick={handleExpandClick}
                  size="small"
                  sx={{
                    transition: 'all 0.2s ease',
                    padding: '4px',
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                >
                  <ExpandMoreIcon fontSize="small" />
                </IconButton>
              </NeuTooltip>
            )}
            
            {/* Кнопка редактирования */}
            {!completed && (
              <NeuTooltip title="Редактировать">
                <IconButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(reminder);
                  }}
                  size="small"
                  sx={{ 
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      color: 'primary.main',
                      backgroundColor: theme => `${theme.palette.primary.main}15`
                    },
                    padding: '4px'
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </NeuTooltip>
            )}
            
            {/* Кнопка удаления */}
            <NeuTooltip title="Удалить">
              <IconButton 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(id);
                }}
                size="small"
                sx={{ 
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    color: 'error.main',
                    backgroundColor: theme => `${theme.palette.error.main}15`
                  },
                  padding: '4px'
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </NeuTooltip>
          </Box>
        </Box>
        
        {/* Раскрывающееся описание */}
        {description && (
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 1 }} />
            <Typography 
              variant="body2" 
              sx={{ 
                px: 1, 
                py: 0.5,
                color: 'text.secondary',
                whiteSpace: 'pre-line' 
              }}
            >
              {description}
            </Typography>
          </Collapse>
        )}
      </Box>
    </NeuCard>
  );
};

export default ReminderItem; 
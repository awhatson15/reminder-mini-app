import React, { useContext } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleOutline as SuccessIcon,
  ErrorOutline as ErrorIcon,
  InfoOutlined as InfoIcon,
  WarningAmber as WarningIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { ThemeContext } from '../index';
import { NeuCard, NeuIcon } from './neumorphic';

/**
 * Компонент всплывающего уведомления
 * 
 * @param {Object} props - свойства компонента
 * @param {boolean} props.open - флаг отображения
 * @param {string} props.message - текст сообщения
 * @param {string} props.type - тип сообщения (success, error, warning, info)
 * @param {Function} props.onClose - функция закрытия
 * @param {number} props.duration - длительность отображения в мс
 * @returns {JSX.Element} компонент уведомления
 */
const Toast = ({ 
  open, 
  message, 
  type = 'info',
  onClose,
  duration = 5000
}) => {
  const theme = useTheme();
  const { isDarkMode } = useContext(ThemeContext);
  
  // Определение иконки и цветов в зависимости от типа уведомления
  const getTypeProps = () => {
    switch (type) {
      case 'success':
        return { 
          icon: <SuccessIcon />, 
          color: theme.palette.success.main,
          bgColor: isDarkMode 
            ? 'rgba(76, 175, 80, 0.15)' 
            : 'rgba(76, 175, 80, 0.1)'
        };
      case 'error':
        return { 
          icon: <ErrorIcon />, 
          color: theme.palette.error.main,
          bgColor: isDarkMode 
            ? 'rgba(244, 67, 54, 0.15)' 
            : 'rgba(244, 67, 54, 0.1)'
        };
      case 'warning':
        return { 
          icon: <WarningIcon />, 
          color: theme.palette.warning.main,
          bgColor: isDarkMode 
            ? 'rgba(255, 152, 0, 0.15)' 
            : 'rgba(255, 152, 0, 0.1)'
        };
      case 'info':
      default:
        return { 
          icon: <InfoIcon />, 
          color: theme.palette.info.main,
          bgColor: isDarkMode 
            ? 'rgba(33, 150, 243, 0.15)' 
            : 'rgba(33, 150, 243, 0.1)'
        };
    }
  };
  
  const { icon, color, bgColor } = getTypeProps();
  
  // Автозакрытие через указанное время
  React.useEffect(() => {
    if (open && duration !== 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);
  
  // Анимация
  const variants = {
    initial: { opacity: 0, y: 20, scale: 0.8 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.8 }
  };
  
  return (
    <AnimatePresence>
      {open && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            maxWidth: 'calc(100% - 32px)',
            width: 'auto'
          }}
        >
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.3 }}
          >
            <NeuCard
              variant="raised"
              sx={{
                backgroundColor: isDarkMode ? 'rgba(38, 42, 51, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                padding: '10px 16px',
                borderLeft: `4px solid ${color}`,
                borderRadius: '10px',
                minWidth: '280px',
                maxWidth: '600px'
              }}
            >
              <Box sx={{ 
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1.5
              }}>
                {icon}
              </Box>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  flexGrow: 1,
                  fontWeight: 500,
                  px: 1
                }}
              >
                {message}
              </Typography>
              
              <NeuIcon
                icon={<CloseIcon fontSize="small" />}
                variant="inset"
                size="small"
                clickable
                onClick={onClose}
                sx={{ ml: 1 }}
              />
            </NeuCard>
          </motion.div>
        </Box>
      )}
    </AnimatePresence>
  );
};

export default Toast; 
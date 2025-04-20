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
  
  // Определение иконки и цвета
  const getTypeProps = () => {
    switch (type) {
      case 'success': return { icon: <SuccessIcon />, color: theme.palette.success.main };
      case 'error': return { icon: <ErrorIcon />, color: theme.palette.error.main };
      case 'warning': return { icon: <WarningIcon />, color: theme.palette.warning.main };
      case 'info': default: return { icon: <InfoIcon />, color: theme.palette.info.main };
    }
  };
  
  const { icon, color } = getTypeProps();
  
  // Автозакрытие через указанное время
  React.useEffect(() => {
    if (open && duration !== 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);
  
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
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
              }}
            >
              <Box sx={{ color: color, mr: 1.5 }}>
                {icon}
              </Box>
              
              <Typography 
                variant="body2" 
                sx={{ flexGrow: 1, fontWeight: 500 }}
              >
                {message}
              </Typography>
              
              <NeuIcon
                icon={<CloseIcon fontSize="small" />}
                size="small"
                variant="inset"
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
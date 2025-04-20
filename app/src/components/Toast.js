import React, { forwardRef } from 'react';
import { Snackbar, Alert, alpha, Box, Typography, IconButton, useTheme } from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Компонент анимированного уведомления (тоста)
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.open - Открыто ли уведомление
 * @param {Function} props.onClose - Функция закрытия уведомления
 * @param {string} props.message - Текст сообщения
 * @param {string} props.severity - Тип уведомления ('success', 'error', 'warning', 'info')
 * @param {number} props.autoHideDuration - Время автоматического скрытия в мс
 */
const Toast = ({ 
  open, 
  onClose, 
  message, 
  severity = 'success', 
  autoHideDuration = 4000 
}) => {
  const theme = useTheme();
  
  // Настройки иконок для разных типов уведомлений
  const iconMap = {
    success: {
      icon: <SuccessIcon fontSize="medium" />,
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.12)
    },
    error: {
      icon: <ErrorIcon fontSize="medium" />,
      color: theme.palette.error.main,
      bgColor: alpha(theme.palette.error.main, 0.12)
    },
    warning: {
      icon: <WarningIcon fontSize="medium" />,
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.12)
    },
    info: {
      icon: <InfoIcon fontSize="medium" />,
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.12)
    }
  };

  // Получение настроек текущего типа уведомления
  const current = iconMap[severity] || iconMap.info;

  // Компонент содержимого уведомления с анимацией
  const AlertContent = forwardRef((props, ref) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5 }}
      transition={{
        type: 'spring',
        stiffness: 250,
        damping: 20
      }}
      {...props}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          borderRadius: 3,
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
          bgcolor: theme.palette.background.paper,
          overflow: 'hidden',
          minWidth: '280px',
          maxWidth: '400px'
        }}
      >
        <Box
          sx={{
            bgcolor: current.bgColor,
            color: current.color,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {current.icon}
        </Box>

        <Box sx={{ p: 2, flexGrow: 1 }}>
          <Typography variant="body1" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
            {message}
          </Typography>
        </Box>

        <IconButton 
          size="small" 
          aria-label="close" 
          color="inherit" 
          onClick={onClose}
          sx={{ m: 1 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </motion.div>
  ));

  AlertContent.displayName = 'AlertContent';

  return (
    <AnimatePresence>
      {open && (
        <Snackbar
          open={open}
          autoHideDuration={autoHideDuration}
          onClose={onClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{ mb: 3 }}
        >
          <AlertContent />
        </Snackbar>
      )}
    </AnimatePresence>
  );
};

export default Toast; 
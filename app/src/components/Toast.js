import React, { forwardRef } from 'react';
import { Snackbar, Alert as MuiAlert } from '@mui/material';

// Стилизованный Alert компонент
const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

/**
 * Компонент для отображения уведомлений
 * 
 * @param {Object} props
 * @param {boolean} props.open - Флаг открытия уведомления
 * @param {function} props.onClose - Обработчик закрытия уведомления
 * @param {string} props.message - Текст сообщения
 * @param {string} props.severity - Тип уведомления (success, error, warning, info)
 * @param {number} props.autoHideDuration - Время автоматического скрытия в мс
 */
const Toast = ({
  open,
  onClose,
  message,
  severity = 'info',
  autoHideDuration = 6000,
  ...props
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ 
        '& .MuiAlert-root': {
          borderRadius: '16px',
          fontSize: '14px',
        }
      }}
      {...props}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast; 
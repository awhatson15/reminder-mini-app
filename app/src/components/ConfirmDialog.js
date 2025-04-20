import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Button, Box } from '@mui/material';

/**
 * Компонент диалога подтверждения действия
 * 
 * @param {Object} props
 * @param {boolean} props.open - Флаг открытия диалога
 * @param {function} props.onClose - Обработчик закрытия диалога
 * @param {function} props.onConfirm - Обработчик подтверждения действия
 * @param {string} props.title - Заголовок диалога
 * @param {string} props.message - Текст сообщения
 * @param {string} props.confirmText - Текст кнопки подтверждения
 * @param {string} props.cancelText - Текст кнопки отмены
 * @param {string} props.confirmColor - Цвет кнопки подтверждения
 */
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Подтверждение',
  message = 'Вы уверены, что хотите выполнить это действие?',
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  confirmColor = 'primary',
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '24px',
          boxShadow: (theme) => theme.palette.neumorphic.boxShadowElevated,
          padding: '12px',
          background: (theme) => theme.palette.background.paper,
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 500, pb: 1 }}>
        {title}
      </DialogTitle>
      
      <DialogContent>
        <DialogContentText sx={{ color: 'text.primary', opacity: 0.8 }}>
          {message}
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'flex-end' }}>
          <Button 
            onClick={onClose} 
            variant="outlined"
            sx={{ borderRadius: '12px' }}
          >
            {cancelText}
          </Button>
          
          <Button 
            onClick={() => {
              onConfirm();
              onClose();
            }} 
            variant="contained" 
            color={confirmColor}
            sx={{ borderRadius: '12px' }}
          >
            {confirmText}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog; 
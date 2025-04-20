import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  useTheme,
  IconButton,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { 
  Close as CloseIcon,
  DeleteForever as DeleteIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Компонент диалогового окна подтверждения с анимацией
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.open - Открыто ли диалоговое окно
 * @param {Function} props.onClose - Функция закрытия окна
 * @param {Function} props.onConfirm - Функция подтверждения действия
 * @param {string} props.title - Заголовок диалога
 * @param {string} props.message - Сообщение диалога
 * @param {string} props.confirmText - Текст кнопки подтверждения
 * @param {string} props.cancelText - Текст кнопки отмены
 * @param {string} props.confirmColor - Цвет кнопки подтверждения ('primary', 'secondary', 'error', etc.)
 */
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Подтверждение',
  message = 'Вы уверены?',
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  confirmColor = 'error'
}) => {
  const theme = useTheme();
  const isDeleteAction = confirmColor === 'error';

  return (
    <AnimatePresence>
      {open && (
        <Dialog
          open={open}
          onClose={onClose}
          PaperComponent={motion.div}
          PaperProps={{
            initial: { opacity: 0, y: -20, scale: 0.95 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: 20, scale: 0.95 },
            transition: { duration: 0.2 },
            style: {
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)'
            }
          }}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ 
            px: 3, 
            pt: 3, 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {isDeleteAction && (
                <WarningIcon color="error" fontSize="medium" />
              )}
              <Typography variant="h6" component="div" fontWeight={600}>
                {title}
              </Typography>
            </Box>
            <IconButton
              edge="end"
              color="inherit"
              onClick={onClose}
              aria-label="Закрыть"
              sx={{
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.08)' 
                  : 'rgba(0, 0, 0, 0.05)',
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
            <DialogContentText>
              {message}
            </DialogContentText>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, py: 2, justifyContent: 'flex-end', gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              startIcon={<CancelIcon />}
              sx={{ borderRadius: 8 }}
            >
              {cancelText}
            </Button>
            <Button
              variant="contained"
              color={confirmColor}
              onClick={onConfirm}
              startIcon={isDeleteAction ? <DeleteIcon /> : null}
              sx={{ 
                borderRadius: 8,
                ...(isDeleteAction ? {
                  background: 'linear-gradient(45deg, #f44336, #d32f2f)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #d32f2f, #b71c1c)'
                  }
                } : {})
              }}
              autoFocus
            >
              {confirmText}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog; 
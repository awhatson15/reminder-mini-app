import React, { useContext } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText,
  DialogActions,
  Typography,
  Box,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { ThemeContext } from '../index';
import { NeuButton, NeuCard } from './neumorphic';

/**
 * Диалог подтверждения действия
 * 
 * @param {Object} props
 * @param {boolean} props.open - открыт ли диалог
 * @param {string} props.title - заголовок диалога
 * @param {string} props.message - сообщение диалога
 * @param {string} props.confirmText - текст на кнопке подтверждения
 * @param {string} props.cancelText - текст на кнопке отмены
 * @param {function} props.onConfirm - колбэк для подтверждения
 * @param {function} props.onCancel - колбэк для отмены
 * @param {string} props.confirmColor - цвет кнопки подтверждения
 * @param {boolean} props.dangerous - флаг опасного действия (красная кнопка)
 * @returns {JSX.Element}
 */
const ConfirmDialog = ({
  open,
  title = 'Подтверждение',
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  onConfirm,
  onCancel,
  confirmColor = 'primary',
  dangerous = false
}) => {
  const theme = useTheme();
  const { isDarkMode } = useContext(ThemeContext);

  // Если опасное действие, переопределяем цвет
  const finalConfirmColor = dangerous ? 'error' : confirmColor;

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      PaperComponent={({ children, ...props }) => (
        <NeuCard
          variant="raised"
          {...props}
          sx={{
            backgroundColor: isDarkMode ? 'rgba(38, 42, 51, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            overflow: 'hidden',
          }}
        >
          {children}
        </NeuCard>
      )}
      TransitionComponent={motion.div}
      TransitionProps={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.2 }
      }}
    >
      <DialogTitle id="confirm-dialog-title">
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <NeuButton
          variant="flat"
          onClick={onCancel}
        >
          {cancelText}
        </NeuButton>
        <NeuButton
          color={finalConfirmColor}
          onClick={onConfirm}
          autoFocus
        >
          {confirmText}
        </NeuButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog; 
import React, { useContext } from 'react';
import { Box, Typography, Backdrop, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../index';
import { NeuButton, NeuCard } from './neumorphic';

/**
 * Компонент диалога подтверждения действия
 */
const ConfirmDialog = ({
  open,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  onConfirm,
  onCancel,
  confirmColor = 'primary',
  cancelColor = 'default'
}) => {
  const theme = useTheme();
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: theme.zIndex.modal,
        backgroundColor: isDarkMode ? 'rgba(18, 18, 22, 0.8)' : 'rgba(245, 245, 245, 0.8)',
        backdropFilter: 'blur(5px)'
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <NeuCard
              variant="raised"
              sx={{
                width: '90%',
                maxWidth: '320px',
                padding: '20px',
                textAlign: 'center'
              }}
            >
              <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                {title}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 3 }}>
                {message}
              </Typography>
              
              <Box sx={{ 
                display: 'flex',
                gap: 2,
                justifyContent: 'center'
              }}>
                <NeuButton 
                  variant="inset"
                  color={cancelColor}
                  onClick={onCancel}
                >
                  {cancelText}
                </NeuButton>
                
                <NeuButton 
                  variant="raised"
                  color={confirmColor}
                  onClick={onConfirm}
                >
                  {confirmText}
                </NeuButton>
              </Box>
            </NeuCard>
          </motion.div>
        )}
      </AnimatePresence>
    </Backdrop>
  );
};

export default ConfirmDialog; 
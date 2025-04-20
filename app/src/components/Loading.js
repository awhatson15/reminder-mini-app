import React, { useContext } from 'react';
import { Box, Typography, useTheme, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { ThemeContext } from '../index';
import { NeuCard } from './neumorphic';

/**
 * Компонент загрузки с неоморфным дизайном
 * 
 * @param {Object} props - свойства компонента
 * @param {string} props.message - текст сообщения загрузки
 * @returns {JSX.Element} компонент загрузки
 */
const Loading = ({ message = 'Загрузка приложения...' }) => {
  const theme = useTheme();
  const { isDarkMode } = useContext(ThemeContext);
  
  // Анимация для вращения логотипа/индикатора
  const spinAnimation = {
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        ease: "linear",
        repeat: Infinity
      }
    }
  };
  
  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDarkMode ? '#1A1D23' : '#E6EEF8',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <NeuCard
          variant="raised"
          sx={{
            p: 4,
            width: 280,
            textAlign: 'center',
            backgroundColor: isDarkMode ? 'rgba(38, 42, 51, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ mb: 3 }}>
            <motion.div
              animate="animate"
              variants={spinAnimation}
            >
              <CircularProgress 
                size={60} 
                thickness={4} 
                color="primary" 
              />
            </motion.div>
          </Box>
          
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {message}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Пожалуйста, подождите...
          </Typography>
        </NeuCard>
      </motion.div>
    </Box>
  );
};

export default Loading;
 
import React from 'react';
import { Box, CircularProgress, Typography, styled } from '@mui/material';
import { motion } from 'framer-motion';
import { NeuCard } from './neumorphic';

// Стилизованный компонент загрузки в неоморфном стиле
const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: theme.palette.background.default,
}));

// Анимация логотипа
const logoVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

// Анимация текста
const textVariants = {
  initial: { y: 10, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: { delay: 0.3, duration: 0.5, ease: "easeOut" }
  }
};

// Анимация прогресса
const progressVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { delay: 0.5, duration: 0.5 }
  }
};

/**
 * Компонент отображения загрузки приложения
 */
const Loading = () => {
  return (
    <LoadingContainer>
      <NeuCard
        component={motion.div}
        initial="initial"
        animate="animate"
        variants={logoVariants}
        sx={{ p: 4, mb: 3 }}
      >
        <Typography 
          variant="h4" 
          component="div" 
          sx={{ 
            fontWeight: 600, 
            color: 'primary.main',
            textAlign: 'center'
          }}
        >
          Reminder
        </Typography>
      </NeuCard>
      
      <Box 
        component={motion.div}
        initial="initial"
        animate="animate"
        variants={progressVariants}
        sx={{ mb: 3 }}
      >
        <CircularProgress color="primary" size={40} thickness={4} />
      </Box>
      
      <Typography 
        component={motion.p}
        initial="initial"
        animate="animate"
        variants={textVariants}
        variant="body1" 
        color="text.secondary"
      >
        Загрузка приложения...
      </Typography>
    </LoadingContainer>
  );
};

export default Loading;
 
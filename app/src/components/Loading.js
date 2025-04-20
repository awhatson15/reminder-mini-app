import React from 'react';
import { Box, CircularProgress, Typography, styled, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';

// Стилизованный контейнер загрузки
const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  width: '100%',
  background: theme.palette.background?.default || '#f5f5f5',
  padding: '16px',
}));

// Стилизованная карточка для загрузки
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: 16,
  borderRadius: 24,
  boxShadow: theme.palette.neumorphic?.boxShadow || '5px 5px 10px rgba(0, 0, 0, 0.1), -5px -5px 10px rgba(255, 255, 255, 0.8)',
  backgroundColor: theme.palette.background?.paper || '#ededed',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

// Анимации
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
      <Box 
        component={motion.div}
        initial="initial"
        animate="animate"
        variants={logoVariants}
        sx={{ mb: 4, width: '100%', maxWidth: '320px' }}
      >
        <StyledPaper>
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              fontWeight: 600, 
              color: 'primary.main',
              textAlign: 'center',
              py: 1
            }}
          >
            Напоминатель
          </Typography>
        </StyledPaper>
      </Box>
      
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
 
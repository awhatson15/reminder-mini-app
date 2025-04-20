import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const LoadingContainer = {
  width: "2rem",
  height: "2rem",
  display: "flex",
  justifyContent: "space-around"
};

const LoadingCircle = {
  display: "block",
  width: "0.5rem",
  height: "0.5rem",
  backgroundColor: "currentColor",
  borderRadius: "0.25rem"
};

const LoadingContainerVariants = {
  initial: {
    transition: {
      staggerChildren: 0.2
    }
  },
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const LoadingCircleVariants = {
  initial: {
    y: "0%"
  },
  animate: {
    y: "100%",
    transition: {
      duration: 0.5,
      yoyo: Infinity,
      ease: "easeInOut"
    }
  }
};

const Loading = () => {
  const theme = useTheme();

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        color: theme.palette.primary.main,
      }}
    >
      <motion.div
        style={LoadingContainer}
        variants={LoadingContainerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.span style={LoadingCircle} variants={LoadingCircleVariants} />
        <motion.span style={LoadingCircle} variants={LoadingCircleVariants} />
        <motion.span style={LoadingCircle} variants={LoadingCircleVariants} />
      </motion.div>
      <Typography 
        variant="body1" 
        sx={{ 
          mt: 3,
          fontSize: "1rem",
          fontWeight: 500,
          opacity: 0.8
        }}
      >
        Загрузка...
      </Typography>
    </Box>
  );
};

export default Loading;
 
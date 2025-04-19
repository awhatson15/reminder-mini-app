import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const Loading = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <CircularProgress size={60} />
      <Typography variant="body1" sx={{ mt: 2 }}>
        Загрузка...
      </Typography>
    </Box>
  );
};

export default Loading;
 
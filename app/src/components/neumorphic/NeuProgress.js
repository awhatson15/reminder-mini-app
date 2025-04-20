import React from 'react';
import { Box, LinearProgress, styled } from '@mui/material';

/**
 * Стилизованный неоморфный индикатор прогресса
 */
const StyledProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.palette.neumorphic.boxShadowInset,
  overflow: 'hidden',

  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    backgroundImage: 'linear-gradient(90deg, #3D9DF6, #45C4B0)',
  },
}));

/**
 * Неоморфный компонент индикатора прогресса
 * 
 * @param {Object} props
 * @param {number} props.value - Значение прогресса (от 0 до 100)
 * @param {string} props.variant - Вариант: 'determinate' или 'indeterminate'
 * @param {string} props.color - Цвет прогресса
 * @param {Object} props.sx - Дополнительные стили
 */
const NeuProgress = ({
  value = 0,
  variant = 'determinate',
  color = 'primary',
  sx = {},
  ...props
}) => {
  return (
    <Box sx={{ width: '100%', ...sx }}>
      <StyledProgress
        variant={variant}
        value={value}
        color={color}
        {...props}
      />
    </Box>
  );
};

export default NeuProgress; 
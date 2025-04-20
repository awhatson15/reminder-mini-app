import React from 'react';
import { Badge } from '@mui/material';
import { styled } from '@mui/material/styles';

// Стилизованный Badge с неоморфным дизайном
const StyledBadge = styled(Badge)(({ theme, color = 'primary' }) => {
  const getColor = () => {
    if (color === 'primary') return theme.palette.primary.main;
    if (color === 'secondary') return theme.palette.secondary.main;
    if (color === 'error') return theme.palette.error.main;
    if (color === 'warning') return theme.palette.warning.main;
    if (color === 'info') return theme.palette.info.main;
    if (color === 'success') return theme.palette.success.main;
    return color; // Используем цвет напрямую, если передано строковое значение цвета
  };

  return {
    '& .MuiBadge-badge': {
      backgroundColor: getColor(),
      color: theme.palette.getContrastText(getColor()),
      fontWeight: 600,
      minWidth: '20px',
      height: '20px',
      padding: '0 6px',
      borderRadius: '10px',
      border: `2px solid ${theme.palette.background.default}`,
      boxShadow: `0 2px 4px rgba(0,0,0,0.2)`,
      transition: theme.transitions.micro,
    },
  };
});

/**
 * Неоморфный компонент бейджа
 * 
 * @param {Object} props - Свойства компонента
 * @param {ReactNode} props.children - Дочерние элементы
 * @param {string} props.color - Цвет бейджа
 * @param {number|string} props.badgeContent - Содержимое бейджа
 * @param {string} props.variant - Вариант отображения ('standard', 'dot')
 * @param {Object} props.sx - Дополнительные стили
 */
const NeuBadge = ({ 
  children, 
  color = 'primary',
  badgeContent,
  variant = 'standard',
  sx = {},
  ...props 
}) => {
  return (
    <StyledBadge
      color={color}
      badgeContent={badgeContent}
      variant={variant}
      sx={sx}
      {...props}
    >
      {children}
    </StyledBadge>
  );
};

export default NeuBadge; 
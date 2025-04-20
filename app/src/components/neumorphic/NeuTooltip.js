import React from 'react';
import { Tooltip, Zoom } from '@mui/material';
import { styled } from '@mui/material/styles';

// Стилизованный Tooltip с неоморфным дизайном
const StyledTooltip = styled((props) => (
  <Tooltip
    arrow
    TransitionComponent={Zoom}
    TransitionProps={{ timeout: 300 }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    background: theme.palette.neumorphic.surface,
    borderRadius: 12,
    padding: '8px 12px',
    maxWidth: 240,
    boxShadow: theme.palette.neumorphic.boxShadow,
    border: `1px solid ${theme.palette.divider}`,
  },
  '& .MuiTooltip-arrow': {
    color: theme.palette.neumorphic.surface,
    '&:before': {
      border: `1px solid ${theme.palette.divider}`,
    },
  },
}));

/**
 * Компонент неоморфного тултипа
 * 
 * @param {Object} props - Свойства компонента
 * @param {ReactNode} props.children - Дочерние элементы
 * @param {ReactNode} props.title - Содержимое тултипа
 * @param {string} props.placement - Расположение тултипа
 * @param {number} props.enterDelay - Задержка перед показом (мс)
 * @param {boolean} props.interactive - Можно ли взаимодействовать с содержимым тултипа
 */
const NeuTooltip = ({ 
  children, 
  title,
  placement = 'top',
  enterDelay = 500,
  interactive = false,
  ...props 
}) => {
  return (
    <StyledTooltip 
      title={title}
      placement={placement}
      enterDelay={enterDelay}
      interactive={interactive}
      {...props}
    >
      {children}
    </StyledTooltip>
  );
};

export default NeuTooltip; 
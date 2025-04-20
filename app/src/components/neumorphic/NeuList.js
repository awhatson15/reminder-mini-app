import React from 'react';
import { List, ListItem, styled } from '@mui/material';

/**
 * Стилизованный неоморфный список
 */
const StyledList = styled(List)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: '16px',
  boxShadow: theme.palette.neumorphic.boxShadow,
  padding: '8px',
  overflow: 'hidden',
}));

/**
 * Стилизованный элемент неоморфного списка
 */
const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: '12px',
  margin: '4px 0',
  transition: 'all 0.3s ease',
  position: 'relative',
  
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  
  '&:active': {
    boxShadow: theme.palette.neumorphic.boxShadowInset,
    transform: 'translateY(1px)',
  },
}));

/**
 * Неоморфный список
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Дочерние элементы списка
 * @param {Object} props.sx - Дополнительные стили для списка
 */
const NeuList = ({ children, sx = {}, ...props }) => {
  return (
    <StyledList sx={sx} {...props}>
      {children}
    </StyledList>
  );
};

/**
 * Элемент неоморфного списка
 */
NeuList.Item = StyledListItem;

export default NeuList; 
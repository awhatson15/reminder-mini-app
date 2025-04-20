import React, { useContext } from 'react';
import { List, ListItem, ListItemText, ListItemIcon, Divider, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../index';
import NeuCard from './NeuCard';

/**
 * Компонент неоморфного списка
 * 
 * @param {Object} props - Свойства компонента
 * @param {Array} props.items - Массив элементов списка
 * @param {function} props.renderItem - Функция рендера элемента списка (необязательно)
 * @param {boolean} props.dividers - Показывать разделители между элементами
 * @param {boolean} props.hoverable - Эффект при наведении на элементы
 * @param {string} props.variant - Вариант оформления (elevated, flat, inset)
 * @param {function} props.onItemClick - Обработчик клика по элементу
 * @param {Object} props.sx - Дополнительные стили для списка
 * @param {Object} props.itemSx - Дополнительные стили для элементов списка
 * @returns {JSX.Element}
 */
const NeuList = ({
  items = [],
  renderItem,
  dividers = true,
  hoverable = true,
  variant = 'elevated',
  onItemClick,
  sx = {},
  itemSx = {},
  ...props
}) => {
  const theme = useTheme();
  const { isDarkMode } = useContext(ThemeContext);

  // Определяем стили для элементов списка
  const getItemStyles = () => {
    const baseStyles = {
      borderRadius: '8px',
      margin: '4px 0',
      padding: '10px 16px',
      transition: 'all 0.3s ease',
      ...itemSx,
    };

    if (hoverable) {
      return {
        ...baseStyles,
        '&:hover': {
          backgroundColor: isDarkMode 
            ? 'rgba(255, 255, 255, 0.03)' 
            : 'rgba(0, 0, 0, 0.02)',
        }
      };
    }

    return baseStyles;
  };

  // Анимации для списка и элементов
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
    hover: {
      y: -2,
      boxShadow: isDarkMode
        ? '3px 3px 6px rgba(0, 0, 0, 0.3), -3px -3px 6px rgba(255, 255, 255, 0.03)'
        : '3px 3px 6px rgba(0, 0, 0, 0.04), -3px -3px 6px rgba(255, 255, 255, 0.5)',
    },
  };

  return (
    <NeuCard variant={variant} sx={{ padding: 0, ...sx }} {...props}>
      <List
        component={motion.ul}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{ padding: '8px' }}
      >
        {items.map((item, index) => {
          // Если предоставлена кастомная функция рендера, используем её
          if (renderItem) {
            return React.cloneElement(renderItem(item, index), {
              key: item.id || index,
              component: motion.li,
              variants: itemVariants,
              whileHover: hoverable ? 'hover' : undefined,
              onClick: onItemClick ? () => onItemClick(item, index) : undefined,
            });
          }

          return (
            <React.Fragment key={item.id || index}>
              <ListItem
                component={motion.li}
                variants={itemVariants}
                whileHover={hoverable ? 'hover' : undefined}
                onClick={onItemClick ? () => onItemClick(item, index) : undefined}
                sx={getItemStyles()}
                button={!!onItemClick}
              >
                {item.icon && (
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    {item.icon}
                  </ListItemIcon>
                )}
                <ListItemText
                  primary={item.primary || item.text || item.title || item.name}
                  secondary={item.secondary || item.description || item.subtitle}
                  primaryTypographyProps={{ 
                    fontWeight: theme.typography.fontWeightMedium 
                  }}
                  secondaryTypographyProps={{ 
                    fontSize: '0.85rem' 
                  }}
                />
              </ListItem>
              {dividers && index < items.length - 1 && (
                <Divider variant="middle" component="li" />
              )}
            </React.Fragment>
          );
        })}
      </List>
    </NeuCard>
  );
};

export default NeuList; 
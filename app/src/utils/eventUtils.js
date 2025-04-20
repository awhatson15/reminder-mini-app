import React from 'react';
import {
  Cake as CakeIcon,
  Event as EventIcon,
  WorkOutline as WorkIcon,
  FamilyRestroom as FamilyIcon,
  Person as PersonIcon,
  MoreHoriz as OtherIcon
} from '@mui/icons-material';

/**
 * Возвращает иконку для типа события
 * @param {string} type - тип события ('birthday', 'event')
 * @returns {React.ReactElement} Иконка события
 */
export const getEventIcon = (type) => {
  switch (type) {
    case 'birthday':
      return <CakeIcon />;
    case 'event':
    default:
      return <EventIcon />;
  }
};

/**
 * Возвращает иконку по группе события
 * @param {string} group - группа события ('семья', 'работа', 'друзья', 'другое')
 * @returns {React.ReactElement} Иконка группы
 */
export const getEventIconByGroup = (group) => {
  switch (group) {
    case 'семья':
      return <FamilyIcon />;
    case 'работа':
      return <WorkIcon />;
    case 'друзья':
      return <PersonIcon />;
    case 'другое':
    default:
      return <OtherIcon />;
  }
};

/**
 * Возвращает цвет для типа события
 * @param {string} type - тип события ('birthday', 'event')
 * @param {string} group - группа события (для типа 'event')
 * @returns {string} Цветовой код
 */
export const getEventColor = (type, group) => {
  if (type === 'birthday') {
    return '#e91e63'; // розовый/красный для дней рождения
  }
  
  switch (group) {
    case 'семья':
      return '#4caf50'; // зеленый для семейных событий
    case 'работа':
      return '#2196f3'; // синий для рабочих событий
    case 'друзья':
      return '#9c27b0'; // фиолетовый для друзей
    case 'другое':
    default:
      return '#ff9800'; // оранжевый для других событий
  }
}; 
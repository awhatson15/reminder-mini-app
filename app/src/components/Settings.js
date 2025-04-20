import React, { useContext } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Notifications as NotificationsIcon,
  VolumeUp as VolumeIcon,
  Vibration as VibrationIcon,
  Info as InfoIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';
import { ThemeContext, UserContext } from '../App';
import { NeuCard, NeuSwitch } from './neumorphic';

/**
 * Компонент страницы настроек
 */
const Settings = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { user } = useContext(UserContext);
  
  // Настройки пользователя с значениями по умолчанию
  const settings = user?.settings || {
    notifications: {
      enabled: true,
      sound: true,
      vibration: true
    },
    theme: 'system'
  };
  
  return (
    <Box sx={{ pb: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Настройки
      </Typography>
      
      <NeuCard variant="raised" sx={{ mb: 3 }}>
        <List disablePadding>
          <ListItem>
            <ListItemIcon>
              {isDarkMode ? <DarkModeIcon /> : <LightModeIcon />}
            </ListItemIcon>
            <ListItemText 
              primary="Тёмная тема" 
              secondary={isDarkMode ? "Включена" : "Выключена"} 
            />
            <ListItemSecondaryAction>
              <NeuSwitch 
                edge="end"
                checked={isDarkMode}
                onChange={toggleTheme}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider variant="inset" component="li" />
          <ListItem>
            <ListItemIcon>
              <NotificationsIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Уведомления" 
              secondary="Push-уведомления о предстоящих событиях" 
            />
            <ListItemSecondaryAction>
              <NeuSwitch 
                edge="end"
                checked={settings.notifications.enabled}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider variant="inset" component="li" />
          <ListItem>
            <ListItemIcon>
              <VolumeIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Звук" 
              secondary="Звуковые уведомления" 
            />
            <ListItemSecondaryAction>
              <NeuSwitch 
                edge="end"
                checked={settings.notifications.sound}
                disabled={!settings.notifications.enabled}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider variant="inset" component="li" />
          <ListItem>
            <ListItemIcon>
              <VibrationIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Вибрация" 
              secondary="Вибрация при уведомлениях" 
            />
            <ListItemSecondaryAction>
              <NeuSwitch 
                edge="end"
                checked={settings.notifications.vibration}
                disabled={!settings.notifications.enabled}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </NeuCard>
      
      <NeuCard variant="raised">
        <List disablePadding>
          <ListItem button>
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText 
              primary="О приложении" 
              secondary="Версия 1.0.0" 
            />
          </ListItem>
          <Divider variant="inset" component="li" />
          <ListItem button>
            <ListItemIcon>
              <BugReportIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Сообщить о проблеме" 
              secondary="Отправить отзыв разработчику" 
            />
          </ListItem>
        </List>
      </NeuCard>
    </Box>
  );
};

export default Settings; 
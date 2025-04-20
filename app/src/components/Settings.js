import React, { useContext, useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  ListItemSecondaryAction,
  Divider,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Notifications as NotificationsIcon,
  VolumeUp as VolumeIcon,
  Vibration as VibrationIcon,
  Info as InfoIcon,
  BugReport as BugReportIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  Timer as TimerIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { ThemeContext, UserContext, AppSettingsContext } from '../App';
import { NeuCard, NeuSwitch } from './neumorphic';

// Возможные начальные экраны
const DEFAULT_SCREENS = [
  { value: 'calendar', label: 'Календарь', icon: <CalendarIcon /> },
  { value: 'focus', label: 'Фокус', icon: <TimerIcon /> },
  { value: 'timeline', label: 'Лента', icon: <TimelineIcon /> }
];

/**
 * Компонент страницы настроек
 */
const Settings = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { user } = useContext(UserContext);
  const { settings, updateSettings } = useContext(AppSettingsContext);
  
  // Получаем текущий начальный экран из контекста настроек
  const [defaultScreen, setDefaultScreen] = useState(settings.defaultScreen || 'calendar');
  
  // Настройки пользователя с значениями по умолчанию
  const userSettings = user?.settings || {
    notifications: {
      enabled: true,
      sound: true,
      vibration: true
    },
    theme: 'system'
  };

  // Обработчик изменения начального экрана
  const handleDefaultScreenChange = (event) => {
    const newDefaultScreen = event.target.value;
    setDefaultScreen(newDefaultScreen);
    updateSettings({ defaultScreen: newDefaultScreen });
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
          
          {/* Новая опция для выбора начального экрана */}
          <ListItem sx={{ alignItems: 'flex-start', paddingTop: 1, paddingBottom: 1 }}>
            <ListItemIcon sx={{ mt: 1 }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Начальный экран" 
              secondary="Экран, который будет открываться при запуске приложения" 
            />
            <ListItemSecondaryAction sx={{ top: '50%', transform: 'translateY(-50%)' }}>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 130 }}>
                <Select
                  value={defaultScreen}
                  onChange={handleDefaultScreenChange}
                  sx={{ 
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent'
                    },
                    boxShadow: theme => theme.palette.neumorphic.boxShadowInset,
                    backgroundColor: theme => theme.palette.background.paper
                  }}
                >
                  {DEFAULT_SCREENS.map((screen) => (
                    <MenuItem key={screen.value} value={screen.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                          {screen.icon}
                        </Box>
                        {screen.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                checked={userSettings.notifications.enabled}
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
                checked={userSettings.notifications.sound}
                disabled={!userSettings.notifications.enabled}
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
                checked={userSettings.notifications.vibration}
                disabled={!userSettings.notifications.enabled}
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
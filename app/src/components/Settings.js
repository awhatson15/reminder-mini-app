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
          {/* Темная тема */}
          <ListItem>
            <ListItemIcon>
              {isDarkMode ? <DarkModeIcon /> : <LightModeIcon />}
            </ListItemIcon>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
              <ListItemText 
                primary="Тёмная тема" 
                secondary={isDarkMode ? "Включена" : "Выключена"} 
                sx={{ mr: 2 }}
              />
              <NeuSwitch 
                checked={isDarkMode}
                onChange={toggleTheme}
              />
            </Box>
          </ListItem>
          <Divider variant="inset" component="li" />
          
          {/* Начальный экран */}
          <ListItem sx={{ py: 1.5 }}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
              <ListItemText 
                primary="Начальный экран" 
                secondary="Экран при запуске" 
                sx={{ mr: 2 }}
              />
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
            </Box>
          </ListItem>
          
          <Divider variant="inset" component="li" />
          
          {/* Уведомления */}
          <ListItem>
            <ListItemIcon>
              <NotificationsIcon />
            </ListItemIcon>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
              <ListItemText 
                primary="Уведомления" 
                secondary="Push-уведомления о событиях" 
                sx={{ mr: 2 }}
              />
              <NeuSwitch 
                checked={userSettings.notifications.enabled}
              />
            </Box>
          </ListItem>
          <Divider variant="inset" component="li" />
          
          {/* Звук */}
          <ListItem>
            <ListItemIcon>
              <VolumeIcon />
            </ListItemIcon>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
              <ListItemText 
                primary="Звук" 
                secondary="Звуковые уведомления" 
                sx={{ mr: 2 }}
              />
              <NeuSwitch 
                checked={userSettings.notifications.sound}
                disabled={!userSettings.notifications.enabled}
              />
            </Box>
          </ListItem>
          <Divider variant="inset" component="li" />
          
          {/* Вибрация */}
          <ListItem>
            <ListItemIcon>
              <VibrationIcon />
            </ListItemIcon>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
              <ListItemText 
                primary="Вибрация" 
                secondary="Вибрация при уведомлениях" 
                sx={{ mr: 2 }}
              />
              <NeuSwitch 
                checked={userSettings.notifications.vibration}
                disabled={!userSettings.notifications.enabled}
              />
            </Box>
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
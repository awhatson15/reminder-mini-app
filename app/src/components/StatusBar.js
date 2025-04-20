import React, { useContext, useState, useEffect } from 'react';
import { Box, Typography, IconButton, Paper, Chip, useTheme, Skeleton } from '@mui/material';
import { UserContext } from '../App';
import { ThemeContext } from '../index';
import { getDaysUntil } from '../utils/dateUtils';
import { getEventIcon, getEventColor } from '../utils/eventUtils';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { fetchReminders } from '../services/reminderService';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { NeuCard, NeuIcon } from './neumorphic';
import { 
  NotificationsActive as NotificationIcon,
  WbSunny as SunnyIcon,
  Cloud as CloudyIcon,
  Opacity as RainIcon,
  AcUnit as SnowIcon,
  Thunderstorm as StormIcon,
  Help as UnknownIcon,
  DarkMode as NightIcon
} from '@mui/icons-material';

// Компонент отображения времени и даты
const Clock = () => {
  const [time, setTime] = useState(new Date());
  const { isDarkMode } = useContext(ThemeContext);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Форматирование даты на русском языке
  const formattedDate = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(time);
  
  // Форматирование времени (HH:MM)
  const formattedTime = time.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <NeuCard
      variant="inset"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        mb: 2,
        backgroundColor: isDarkMode ? 'rgba(38, 42, 51, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Box>
        <Typography variant="h4" fontWeight={700}>
          {formattedTime}
        </Typography>
        <Typography variant="body2" sx={{ textTransform: 'capitalize', opacity: 0.8 }}>
          {formattedDate}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <WeatherIcon />
      </Box>
    </NeuCard>
  );
};

// Компонент значка погоды (упрощенный)
const WeatherIcon = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  
  useEffect(() => {
    // Имитация загрузки данных о погоде
    const fakeWeatherData = {
      temp: Math.floor(Math.random() * 30) - 5, // От -5 до 25
      condition: ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy'][Math.floor(Math.random() * 5)]
    };
    
    const timer = setTimeout(() => {
      setWeather(fakeWeatherData);
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const getWeatherIcon = () => {
    if (!weather) return <UnknownIcon />;
    
    const isNight = new Date().getHours() >= 20 || new Date().getHours() <= 6;
    if (isNight && weather.condition === 'sunny') return <NightIcon />;
    
    switch (weather.condition) {
      case 'sunny': return <SunnyIcon />;
      case 'cloudy': return <CloudyIcon />;
      case 'rainy': return <RainIcon />;
      case 'snowy': return <SnowIcon />;
      case 'stormy': return <StormIcon />;
      default: return <UnknownIcon />;
    }
  };
  
  // Цвет для погоды
  const getWeatherColor = () => {
    if (!weather) return theme.palette.text.primary;
    
    const isNight = new Date().getHours() >= 20 || new Date().getHours() <= 6;
    if (isNight && weather.condition === 'sunny') return '#6A77BB';
    
    switch (weather.condition) {
      case 'sunny': return '#FFB300';
      case 'cloudy': return '#78909C';
      case 'rainy': return '#42A5F5';
      case 'snowy': return '#90CAF9';
      case 'stormy': return '#5C6BC0';
      default: return theme.palette.text.primary;
    }
  };
  
  if (loading) {
    return (
      <Skeleton 
        variant="circular" 
        width={40} 
        height={40} 
        animation="wave" 
      />
    );
  }
  
  return (
    <NeuIcon
      icon={getWeatherIcon()}
      variant="inset"
      size="small"
      color={getWeatherColor()}
      sx={{
        position: 'relative',
      }}
    >
      <Box sx={{ 
        position: 'absolute', 
        bottom: -5, 
        right: -5, 
        backgroundColor: isDarkMode ? 'rgba(26, 29, 35, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderRadius: '50%',
        width: 24,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '0.75rem',
        boxShadow: theme.palette.neumorphic.boxShadow,
      }}>
        {`${weather.temp}°`}
      </Box>
    </NeuIcon>
  );
};

// Основной компонент статус-бара
const StatusBar = () => {
  const { user } = useContext(UserContext);
  const { isDarkMode } = useContext(ThemeContext);
  const theme = useTheme();
  
  return (
    <Box sx={{ mb: 3 }}>
      <Clock />
      
      <NeuCard
        variant="flat"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          mb: 3,
          backgroundColor: isDarkMode ? 'rgba(38, 42, 51, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {user?.firstName ? `Привет, ${user.firstName}!` : 'Привет!'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            У вас 3 активных напоминания
          </Typography>
        </Box>
        
        <NeuIcon
          icon={<NotificationIcon />}
          variant="raised"
          color={theme.palette.primary.main}
          clickable
        />
      </NeuCard>
    </Box>
  );
};

export default StatusBar; 
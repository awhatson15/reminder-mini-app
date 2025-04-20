import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Box, Container, Paper, IconButton, useTheme } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { DarkMode, LightMode } from '@mui/icons-material';
import 'dayjs/locale/ru';

// Импорт контекста темы
import { ThemeContext } from './index';

// Компоненты
import CalendarView from './components/CalendarView';
import AddReminder from './components/AddReminder';
import EditReminder from './components/EditReminder';
import Navigation from './components/Navigation';
import Loading from './components/Loading';
import StatusBar from './components/StatusBar';

// Контекст для пользовательских данных
export const UserContext = React.createContext(null);

// Анимации для переходов страниц
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

// Компонент анимированной страницы
const AnimatedPage = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  // Получаем контекст темы
  const { toggleTheme, isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    const initApp = async () => {
      try {
        setLoading(true);
        
        // Получаем данные пользователя из Telegram WebApp
        const initData = window.Telegram?.WebApp?.initData || '';
        
        if (!initData) {
          console.warn('Не удалось получить initData, используем тестовые данные');
          
          // Для разработки или прямого доступа - используем тестовые данные
          setUser({
            _id: 'dev_user_id',
            telegramId: 12345678,
            username: 'test_user',
            firstName: 'Test',
            lastName: 'User'
          });
          setLoading(false);
          return;
        }
        
        // Извлекаем информацию о пользователе
        const userStr = new URLSearchParams(initData).get('user');
        const userData = userStr ? JSON.parse(userStr) : null;
        
        if (!userData) {
          console.error('Не удалось получить данные пользователя');
          // Для прямого доступа через браузер - также используем тестовые данные  
          setUser({
            _id: 'dev_user_id',
            telegramId: 12345678,
            username: 'test_user',
            firstName: 'Test',
            lastName: 'User'
          });
          setLoading(false);
          return;
        }
        
        // Сохраняем или обновляем пользователя в базе данных
        const response = await axios.post('/api/users', {
          telegramId: userData.id,
          username: userData.username,
          firstName: userData.first_name,
          lastName: userData.last_name
        });
        
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
        setLoading(false);
        
        // Для разработки - временный пользователь
        setUser({
          _id: 'dev_user_id',
          telegramId: 12345678,
          username: 'test_user',
          firstName: 'Test',
          lastName: 'User'
        });
      }
    };
    
    initApp();
  }, []);
  
  if (loading) {
    return <Loading />;
  }

  // Стили неоморфизма для контейнера
  const containerStyles = {
    background: theme.palette.background.default,
    minHeight: '100vh',
    position: 'relative',
    paddingBottom: '70px', // Место под навигацию
    paddingTop: '10px',
    transition: 'background 0.5s ease',
  };
  
  // Кнопка переключения темы
  const ThemeToggleButton = () => (
    <IconButton 
      onClick={toggleTheme}
      sx={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 100,
        background: theme.palette.background.paper,
        boxShadow: theme.palette.neumorphic.boxShadow,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.palette.neumorphic.boxShadowElevated,
        },
        '&:active': {
          transform: 'translateY(0px)',
          boxShadow: theme.palette.neumorphic.active,
        },
      }}
    >
      {isDarkMode ? <LightMode /> : <DarkMode />}
    </IconButton>
  );
  
  // Пользователь всегда должен быть определен (либо реальный, либо тестовый)
  return (
    <UserContext.Provider value={{ user }}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
        <Box sx={containerStyles}>
          <ThemeToggleButton />
          <Container 
            maxWidth="sm" 
            disableGutters
            sx={{ 
              position: 'relative',
              pb: 2,
            }}
          >
            <Box sx={{ 
              padding: '16px', 
              display: 'flex',
              flexDirection: 'column'
            }}>
              <StatusBar />
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={
                    <AnimatedPage>
                      <CalendarView />
                    </AnimatedPage>
                  } />
                  <Route path="/add" element={
                    <AnimatedPage>
                      <AddReminder />
                    </AnimatedPage>
                  } />
                  <Route path="/edit/:id" element={
                    <AnimatedPage>
                      <EditReminder />
                    </AnimatedPage>
                  } />
                </Routes>
              </AnimatePresence>
            </Box>
          </Container>
          <Navigation />
        </Box>
      </LocalizationProvider>
    </UserContext.Provider>
  );
};

export default App; 
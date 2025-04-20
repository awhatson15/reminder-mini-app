import React, { useState, useEffect, createContext } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Box, Container, ThemeProvider, Alert, Button } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import 'dayjs/locale/ru';

// Импорт темы и контекста
import createNeumorphicTheme from './theme';
import { connectionMonitor } from './utils/api';

// Компоненты
import CalendarView from './components/CalendarView';
import AddReminder from './components/AddReminder';
import EditReminder from './components/EditReminder';
import Navigation from './components/Navigation';
import Loading from './components/Loading';
import StatusBar from './components/StatusBar';

// Контекст для пользовательских данных
export const UserContext = createContext(null);

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

const App = ({ telegramInitialized = false, isOnline = true }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [networkStatus, setNetworkStatus] = useState(isOnline);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Создаем неоморфную тему
  const theme = createNeumorphicTheme(false); // Светлая тема по умолчанию
  
  useEffect(() => {
    const initApp = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Получаем данные пользователя из Telegram WebApp
        const initData = window.Telegram?.WebApp?.initData || '';
        
        if (!initData && !telegramInitialized) {
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
        
        if (!userData && !telegramInitialized) {
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
        
        try {
          // Сохраняем или обновляем пользователя в базе данных
          const response = await axios.post('/api/users', {
            telegramId: userData?.id || 12345678,
            username: userData?.username || 'test_user',
            firstName: userData?.first_name || 'Test',
            lastName: userData?.last_name || 'User'
          });
          
          setUser(response.data);
        } catch (apiError) {
          console.error('Ошибка при запросе к API:', apiError);
          setError('Ошибка подключения к серверу. Пожалуйста, проверьте соединение.');
          
          // Используем заглушку пользователя даже при ошибке API
          setUser({
            _id: 'dev_user_id',
            telegramId: userData?.id || 12345678,
            username: userData?.username || 'test_user',
            firstName: userData?.first_name || 'Test',
            lastName: userData?.last_name || 'User'
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
        setError('Произошла ошибка при запуске приложения');
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
  }, [telegramInitialized]);
  
  useEffect(() => {
    let monitor = null;
    
    // Если есть ошибка, запускаем мониторинг соединения
    if (error) {
      monitor = connectionMonitor(() => {
        // При восстановлении соединения перезагружаем страницу
        window.location.reload();
      }, 5000);
    }
    
    // Очищаем при размонтировании
    return () => {
      if (monitor) {
        monitor.stop();
      }
    };
  }, [error]);
  
  // Обновляем объявление компонента App для принятия isOnline
  useEffect(() => {
    setNetworkStatus(isOnline);
    
    // Обработчики изменения сетевого соединения
    window.appState.onOnline = () => {
      setNetworkStatus(true);
      setError(null);
    };
    
    window.appState.onOffline = () => {
      setNetworkStatus(false);
      setError('Отсутствует подключение к интернету. Работаем в автономном режиме.');
    };
    
    return () => {
      window.appState.onOnline = null;
      window.appState.onOffline = null;
    };
  }, [isOnline]);
  
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
  
  // Обработчик повторного соединения
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };
  
  // Пользователь всегда должен быть определен (либо реальный, либо тестовый)
  return (
    <ThemeProvider theme={theme}>
      <UserContext.Provider value={{ user }}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
          <Box sx={containerStyles}>
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
                
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ mb: 2 }}
                    action={
                      <Button color="inherit" size="small" onClick={handleRetry}>
                        Повторить
                      </Button>
                    }
                  >
                    {error}
                  </Alert>
                )}
                
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
    </ThemeProvider>
  );
};

export default App; 
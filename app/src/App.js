import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Box, Container, Paper } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import 'dayjs/locale/ru';

// Компоненты
import CalendarView from './components/CalendarView';
import AddReminder from './components/AddReminder';
import EditReminder from './components/EditReminder';
import Navigation from './components/Navigation';
import Loading from './components/Loading';

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
  
  // Пользователь всегда должен быть определен (либо реальный, либо тестовый)
  return (
    <UserContext.Provider value={{ user }}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
        <Container maxWidth="sm" disableGutters>
          <Box sx={{ 
            padding: '16px', 
            paddingBottom: '76px',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
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
          <Navigation />
        </Container>
      </LocalizationProvider>
    </UserContext.Provider>
  );
};

export default App; 
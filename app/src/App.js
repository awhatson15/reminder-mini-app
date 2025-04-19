import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ru';

// Компоненты
import ReminderList from './components/ReminderList';
import AddReminder from './components/AddReminder';
import EditReminder from './components/EditReminder';
import Navigation from './components/Navigation';
import Loading from './components/Loading';

// Контекст для пользовательских данных
export const UserContext = React.createContext(null);

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initApp = async () => {
      try {
        setLoading(true);
        
        // Получаем данные пользователя из Telegram WebApp
        const initData = window.Telegram?.WebApp?.initData || '';
        
        if (!initData) {
          console.warn('Не удалось получить initData, используем режим разработки');
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
        if (process.env.NODE_ENV === 'development') {
          setUser({
            _id: 'dev_user_id',
            telegramId: 12345678,
            username: 'test_user',
            firstName: 'Test',
            lastName: 'User'
          });
        }
      }
    };
    
    initApp();
  }, []);
  
  if (loading) {
    return <Loading />;
  }
  
  if (!user) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        Ошибка авторизации. Пожалуйста, перезапустите приложение.
      </div>
    );
  }
  
  return (
    <UserContext.Provider value={{ user }}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
        <div style={{ padding: '10px', paddingBottom: '70px' }}>
          <Routes>
            <Route path="/" element={<ReminderList />} />
            <Route path="/add" element={<AddReminder />} />
            <Route path="/edit/:id" element={<EditReminder />} />
          </Routes>
          <Navigation />
        </div>
      </LocalizationProvider>
    </UserContext.Provider>
  );
};

export default App; 
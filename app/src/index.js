import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';

// Инициализация приложения
const root = ReactDOM.createRoot(document.getElementById('root'));

// Слушатели состояния сети
window.addEventListener('online', () => {
  console.log('Сеть доступна, обновляем приложение');
  // Обновляем состояние приложения
  if (window.appState) {
    window.appState.isOnline = true;
    if (window.appState.onOnline) window.appState.onOnline();
  }
});

window.addEventListener('offline', () => {
  console.log('Сеть недоступна, переходим в автономный режим');
  // Обновляем состояние приложения
  if (window.appState) {
    window.appState.isOnline = false;
    if (window.appState.onOffline) window.appState.onOffline();
  }
});

// Глобальное состояние приложения
window.appState = {
  isOnline: navigator.onLine,
  onOnline: null,
  onOffline: null
};

// Функция для отслеживания состояния инициализации Telegram WebApp
const initializeTelegramWebApp = () => {
  if (window.Telegram && window.Telegram.WebApp) {
    try {
      console.log('Telegram WebApp API обнаружен, инициализация...');
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      console.log('Telegram WebApp API инициализирован успешно');
      return true;
    } catch (error) {
      console.error('Ошибка при инициализации Telegram WebApp:', error);
      return false;
    }
  } else {
    console.warn('Telegram WebApp API не обнаружен. Работаем в режиме отладки.');
    // Для отладки установим объект Telegram
    window.Telegram = window.Telegram || {};
    window.Telegram.WebApp = window.Telegram.WebApp || {
      initData: '', // Пустая строка для тестового режима
      ready: () => console.log('Mock Telegram.WebApp.ready called'),
      expand: () => console.log('Mock Telegram.WebApp.expand called')
    };
    return false;
  }
};

// Инициализируем Telegram WebApp
const telegramInitialized = initializeTelegramWebApp();

// Рендерим приложение
root.render(
  <React.StrictMode>
    <CssBaseline />
    <BrowserRouter>
      <App 
        telegramInitialized={telegramInitialized} 
        isOnline={window.appState.isOnline}
      />
    </BrowserRouter>
  </React.StrictMode>
); 
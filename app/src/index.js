import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';

// Инициализация приложения
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <CssBaseline />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Безопасная инициализация Telegram WebApp
if (window.Telegram && window.Telegram.WebApp) {
  try {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
    console.log('Telegram WebApp API инициализирован успешно');
  } catch (error) {
    console.warn('Ошибка при инициализации Telegram WebApp:', error);
  }
} else {
  console.warn('Telegram WebApp API не обнаружен. Работаем в режиме отладки.');
} 
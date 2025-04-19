require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const { logger } = require('./utils/logger');
const { startScheduler } = require('./scheduler');

// Инициализация Express приложения
const app = express();
const PORT = process.env.PORT || 3000;

// Настройка безопасности и логирования
app.use(helmet({
  contentSecurityPolicy: false, // Отключаем для исправления проблем с SPA
  crossOriginEmbedderPolicy: false
}));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Настройка CORS для работы со всеми источниками (включая Telegram)
app.use(cors({
  origin: '*',  // Разрешаем все источники для тестирования
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Обслуживание статических файлов
app.use(express.static(path.join(__dirname, '../app/build')));

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    
    // Запускаем планировщик после подключения к базе данных
    startScheduler();
  })
  .catch(err => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Настройка Telegram бота
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Обработка ошибок бота
bot.on('polling_error', (error) => {
  logger.error(`Ошибка соединения с Telegram API: ${error.message}`);
});

// Обработка команды /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    logger.info(`Получена команда /start от пользователя ${chatId}`);
    // Создаем кнопку для открытия Mini App
    await bot.sendMessage(chatId, 'Добро пожаловать! Нажмите кнопку ниже, чтобы открыть приложение напоминаний:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Открыть приложение', web_app: { url: process.env.WEBHOOK_URL } }]
        ]
      }
    });
    logger.info(`User ${chatId} started bot`);
  } catch (error) {
    logger.error(`Error sending message to user ${chatId}:`, error);
    bot.sendMessage(chatId, 'Произошла ошибка.');
  }
});

// API маршруты
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/users', require('./routes/users'));

// Перенаправление всех остальных запросов на React-приложение
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../app/build', 'index.html'));
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {  // Изменено на '0.0.0.0' для приема соединений извне
  logger.info(`Server is running on port ${PORT}`);
}); 
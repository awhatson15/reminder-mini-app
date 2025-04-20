require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const compression = require('compression');
require('express-async-errors'); // Автоматически перехватывает ошибки в async маршрутах
const { logger } = require('./utils/logger');
const { startScheduler } = require('./scheduler');
const errorHandler = require('./middlewares/errorHandler');
const { verifyTelegramWebAppData } = require('./middlewares/telegramAuth');

// Добавляем обработчики непойманных исключений и отказов
process.on('uncaughtException', (error) => {
  logger.error('Необработанное исключение:', error);
  
  // В production режиме останавливаем сервер при критических ошибках
  if (process.env.NODE_ENV === 'production') {
    logger.error('Критическая ошибка. Завершение работы приложения.');
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Необработанный Promise rejection:', reason);
  logger.error('Стек вызовов:', reason?.stack);
});

// Инициализация Express приложения
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const DEFAULT_PAGE_LIMIT = parseInt(process.env.DEFAULT_PAGE_LIMIT || '20', 10);

// Добавляем глобальные настройки в app.locals
app.locals = {
  appName: 'Reminder Mini App',
  version: '1.0.0',
  defaultPageLimit: DEFAULT_PAGE_LIMIT,
  isProduction: NODE_ENV === 'production',
  isDevelopment: NODE_ENV === 'development',
  isTest: NODE_ENV === 'test'
};

// Настройка безопасности и логирования
app.use(helmet({
  contentSecurityPolicy: false, // Отключаем для исправления проблем с SPA
  crossOriginEmbedderPolicy: false
}));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Включаем сжатие ответов
app.use(compression());

// Настройка CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : (NODE_ENV === 'production' 
    ? [process.env.WEBHOOK_URL, 'https://telegram.org', 'https://web.telegram.org'] 
    : '*');

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Обслуживание статических файлов
app.use(express.static(path.join(__dirname, '../app/build'), {
  maxAge: NODE_ENV === 'production' ? '1d' : 0 // Кешируем статические файлы только в production
}));

// Подключение к MongoDB
try {
  logger.info(`Попытка подключения к MongoDB: ${process.env.MONGO_URI}`);
  
  mongoose.connect(process.env.MONGO_URI, {
    autoIndex: NODE_ENV !== 'production' // Отключаем автоиндексацию в production
  })
    .then(() => {
      logger.info(`Connected to MongoDB (${process.env.MONGO_URI.split('@').pop()})`);
      
      try {
        // Запускаем планировщик после подключения к базе данных
        startScheduler();
      } catch (schedulerError) {
        logger.error('Ошибка при запуске планировщика:', schedulerError);
      }
    })
    .catch(err => {
      logger.error('MongoDB connection error:', err);
      process.exit(1);
    });
} catch (mongoConnectionError) {
  logger.error('Критическая ошибка при настройке подключения к MongoDB:', mongoConnectionError);
  process.exit(1);
}

// Настройка Telegram бота
let bot;
try {
  if (!process.env.BOT_TOKEN) {
    logger.warn('BOT_TOKEN не установлен. Бот Telegram не будет запущен.');
  } else {
    bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
    
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
        try {
          await bot.sendMessage(chatId, 'Произошла ошибка.');
        } catch (sendError) {
          logger.error(`Не удалось отправить сообщение об ошибке пользователю ${chatId}:`, sendError);
        }
      }
    });
  }
} catch (botError) {
  logger.error('Ошибка при инициализации бота Telegram:', botError);
}

// Защита API маршрутов (отключено в режиме разработки)
if (NODE_ENV === 'production') {
  app.use('/api', verifyTelegramWebAppData);
}

// API маршруты
try {
  app.use('/api/reminders', require('./routes/reminders'));
  app.use('/api/users', require('./routes/users'));
} catch (routesError) {
  logger.error('Ошибка при инициализации маршрутов API:', routesError);
  process.exit(1);
}

// Health check эндпоинт для проверки работоспособности API
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Перенаправление всех остальных запросов на React-приложение
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../app/build', 'index.html'));
});

// Глобальная обработка ошибок
app.use(errorHandler);

// Запуск сервера
try {
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server is running on port ${PORT} in ${NODE_ENV} mode`);
    logger.info(`API documentation available at /api/docs`);
  });
} catch (serverError) {
  logger.error('Ошибка при запуске сервера:', serverError);
  process.exit(1);
} 
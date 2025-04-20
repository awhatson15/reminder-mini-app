// Устанавливаем переменные окружения для тестов
process.env.NODE_ENV = 'test';
process.env.PORT = 3001;
process.env.MONGO_URI = 'mongodb://localhost:27017/reminder-app-test';
process.env.JWT_SECRET = 'test_secret_key';
process.env.BOT_TOKEN = 'test_bot_token';
process.env.WEBHOOK_URL = 'https://example.com/test-webhook';
process.env.LOG_LEVEL = 'error';
process.env.ALLOWED_ORIGINS = 'http://localhost:3000,https://example.com';
process.env.DEFAULT_PAGE_LIMIT = '10';

// Импорт mongoose
const mongoose = require('mongoose');

// Отключаем предупреждение от Mongoose
mongoose.set('strictQuery', false);

// Отключаем логирование при выполнении тестов
jest.mock('../server/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    http: jest.fn()
  }
}));

// Моки для других зависимостей, если необходимо
jest.mock('telegraf', () => {
  return jest.fn().mockImplementation(() => {
    return {
      telegram: {
        sendMessage: jest.fn().mockResolvedValue({}),
        setWebhook: jest.fn().mockResolvedValue({}),
        setMyCommands: jest.fn().mockResolvedValue({})
      },
      launch: jest.fn(),
      use: jest.fn(),
      command: jest.fn(),
      on: jest.fn(),
      hears: jest.fn(),
      action: jest.fn(),
      catch: jest.fn()
    };
  });
});

// Глобальные настройки тестов
global.console = {
  ...console,
  // Отключаем вывод в консоль при тестах
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
}; 
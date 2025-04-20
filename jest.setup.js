// Загрузка переменных окружения из файла .env.test
require('dotenv').config({ path: '.env.test' });

// Импорт модулей для соединения с базой данных
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Настройка глобальных матчеров для Jest
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    }
    return {
      message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
      pass: false,
    };
  },
});

// Запуск перед всеми тестами
beforeAll(async () => {
  // Создание экземпляра MongoDB в памяти
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Заменяем URI для MongoDB на URI для тестовой базы в памяти
  process.env.MONGO_URI = mongoUri;
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Очистка коллекций после каждого теста
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Закрытие соединения после всех тестов
afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Отключение логирования во время тестов
jest.mock('./server/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    http: jest.fn(),
  },
}));

// Глобальный тайм-аут для каждого теста
jest.setTimeout(30000);

// Настраиваем глобальный процесс
process.env.NODE_ENV = 'test';

// Глобальное подавление консольных сообщений, чтобы не засорять вывод тестов
// Раскомментируйте, если нужно подавить вывод в консоль во время тестов
/*
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  // Оставляем предупреждения и ошибки для отладки
  // warn: jest.fn(),
  // error: jest.fn(),
};
*/ 
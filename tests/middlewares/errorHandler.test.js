const { errorHandler } = require('../../server/middlewares/errorHandler');
const { logger } = require('../../server/utils/logger');

// Мокаем logger
jest.mock('../../server/utils/logger', () => ({
  logger: {
    error: jest.fn()
  }
}));

describe('Error Handler Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    // Создаем моки для req, res и next
    req = {
      path: '/api/reminders',
      method: 'GET'
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
    
    // Очищаем все моки перед каждым тестом
    jest.clearAllMocks();
  });

  test('должен обрабатывать ValidationError с кодом 400', () => {
    // Подготовка ошибки валидации
    const error = new Error('Ошибка валидации');
    error.name = 'ValidationError';
    
    // Вызываем middleware
    errorHandler(error, req, res, next);
    
    // Проверяем результат
    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Ошибка валидации',
      status: 400,
      path: '/api/reminders',
      method: 'GET'
    });
  });

  test('должен обрабатывать CastError с кодом 400', () => {
    // Подготовка ошибки приведения типов
    const error = new Error('Неверный формат ID');
    error.name = 'CastError';
    
    // Вызываем middleware
    errorHandler(error, req, res, next);
    
    // Проверяем результат
    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Неверный формат ID',
      status: 400,
      path: '/api/reminders',
      method: 'GET'
    });
  });

  test('должен обрабатывать ошибку в коде JWT с кодом 401', () => {
    // Подготовка ошибки JWT
    const error = new Error('JWT истек');
    error.name = 'TokenExpiredError';
    
    // Вызываем middleware
    errorHandler(error, req, res, next);
    
    // Проверяем результат
    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'JWT истек',
      status: 401,
      path: '/api/reminders',
      method: 'GET'
    });
  });

  test('должен обрабатывать ошибку доступа с кодом 403', () => {
    // Подготовка ошибки доступа
    const error = new Error('Доступ запрещен');
    error.statusCode = 403;
    
    // Вызываем middleware
    errorHandler(error, req, res, next);
    
    // Проверяем результат
    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Доступ запрещен',
      status: 403,
      path: '/api/reminders',
      method: 'GET'
    });
  });

  test('должен обрабатывать ошибку отсутствия ресурса с кодом 404', () => {
    // Подготовка ошибки отсутствия ресурса
    const error = new Error('Ресурс не найден');
    error.statusCode = 404;
    
    // Вызываем middleware
    errorHandler(error, req, res, next);
    
    // Проверяем результат
    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Ресурс не найден',
      status: 404,
      path: '/api/reminders',
      method: 'GET'
    });
  });

  test('должен обрабатывать дублирование ключа с кодом 409', () => {
    // Подготовка ошибки дублирования
    const error = new Error('Дублирование ключа');
    error.name = 'MongoError';
    error.code = 11000;
    
    // Вызываем middleware
    errorHandler(error, req, res, next);
    
    // Проверяем результат
    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Дублирование ключа',
      status: 409,
      path: '/api/reminders',
      method: 'GET'
    });
  });

  test('должен обрабатывать непредвиденные ошибки с кодом 500', () => {
    // Подготовка непредвиденной ошибки
    const error = new Error('Внутренняя ошибка сервера');
    
    // Вызываем middleware
    errorHandler(error, req, res, next);
    
    // Проверяем результат
    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Внутренняя ошибка сервера',
      status: 500,
      path: '/api/reminders',
      method: 'GET'
    });
  });

  test('должен указывать стек ошибки в режиме разработки', () => {
    // Сохраняем текущее окружение
    const originalNodeEnv = process.env.NODE_ENV;
    
    // Устанавливаем режим разработки
    process.env.NODE_ENV = 'development';
    
    // Подготовка ошибки
    const error = new Error('Тестовая ошибка');
    error.stack = 'Error: Тестовая ошибка\n    at Test.fn (/path/to/file.js:123:45)';
    
    // Вызываем middleware
    errorHandler(error, req, res, next);
    
    // Проверяем результат
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      stack: error.stack
    }));
    
    // Восстанавливаем окружение
    process.env.NODE_ENV = originalNodeEnv;
  });
}); 
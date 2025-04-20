const { logger } = require('../utils/logger');

/**
 * Middleware для обработки ошибок
 * @param {Error} err - Объект ошибки
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 * @param {Function} next - Следующий middleware
 */
const errorHandler = (err, req, res, next) => {
  // Логируем ошибку
  logger.error(`Ошибка: ${err.message}`, { stack: err.stack });
  
  // Определяем статус-код ответа
  let statusCode = err.statusCode || 500;
  
  // Обрабатываем ошибки MongoDB
  if (err.name === 'ValidationError') {
    statusCode = 400;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    err.message = 'Неверный формат ID';
  } else if (err.code === 11000) {
    statusCode = 409;
    err.message = 'Запись с такими данными уже существует';
  }
  
  // Формируем объект ответа
  const errorResponse = {
    error: {
      message: err.message || 'Внутренняя ошибка сервера',
      status: statusCode
    }
  };
  
  // В режиме разработки добавляем стек ошибки
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.error.stack = err.stack;
  }
  
  // Отправляем ответ клиенту
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler; 
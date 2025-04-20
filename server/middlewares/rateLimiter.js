/**
 * Middleware для ограничения скорости запросов
 * 
 * Принцип работы:
 * - Хранит счетчики запросов в памяти по IP-адресу
 * - Ограничивает количество запросов в заданный промежуток времени
 * - При превышении лимита возвращает ошибку 429 Too Many Requests
 */

const { logger } = require('../utils/logger');

// Хранилище счетчиков запросов
const requestCounts = {};

// Настройки по умолчанию
const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 минут
const DEFAULT_MAX_REQUESTS = 100; // 100 запросов за период

/**
 * Создает middleware для ограничения скорости запросов
 * @param {Object} options - Настройки лимитера
 * @param {number} options.windowMs - Размер окна в миллисекундах
 * @param {number} options.max - Максимальное количество запросов
 * @returns {Function} Middleware для ограничения запросов
 */
const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || DEFAULT_WINDOW_MS;
  const maxRequests = options.max || DEFAULT_MAX_REQUESTS;
  
  // Очистка устаревших данных
  setInterval(() => {
    const now = Date.now();
    Object.keys(requestCounts).forEach(key => {
      if (now - requestCounts[key].timestamp > windowMs) {
        delete requestCounts[key];
      }
    });
  }, windowMs);
  
  // Middleware для обработки запросов
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();
    
    // Инициализируем счетчик для IP, если его нет
    if (!requestCounts[ip]) {
      requestCounts[ip] = {
        count: 1,
        timestamp: now
      };
      return next();
    }
    
    // Сбрасываем счетчик, если прошло достаточно времени
    if (now - requestCounts[ip].timestamp > windowMs) {
      requestCounts[ip] = {
        count: 1,
        timestamp: now
      };
      return next();
    }
    
    // Увеличиваем счетчик запросов
    requestCounts[ip].count += 1;
    
    // Проверяем, не превышен ли лимит
    if (requestCounts[ip].count > maxRequests) {
      logger.warn(`Rate limit exceeded for IP ${ip}`);
      
      // Добавляем заголовки с информацией о лимите
      res.set('X-RateLimit-Limit', maxRequests);
      res.set('X-RateLimit-Remaining', 0);
      res.set('X-RateLimit-Reset', Math.ceil((requestCounts[ip].timestamp + windowMs) / 1000));
      
      return res.status(429).json({
        error: {
          message: 'Превышен лимит запросов. Пожалуйста, повторите позже.',
          status: 429
        }
      });
    }
    
    // Добавляем заголовки с информацией о лимите
    res.set('X-RateLimit-Limit', maxRequests);
    res.set('X-RateLimit-Remaining', maxRequests - requestCounts[ip].count);
    res.set('X-RateLimit-Reset', Math.ceil((requestCounts[ip].timestamp + windowMs) / 1000));
    
    next();
  };
};

module.exports = rateLimiter; 
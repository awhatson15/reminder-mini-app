const crypto = require('crypto');
const { logger } = require('../utils/logger');

/**
 * Проверка подписи Telegram WebApp
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 * @param {Function} next - Следующий middleware
 */
const verifyTelegramWebAppData = (req, res, next) => {
  // Пропускаем проверку в режиме разработки
  if (process.env.NODE_ENV === 'development') {
    logger.warn('Проверка подлинности Telegram данных пропущена в режиме разработки');
    return next();
  }
  
  try {
    const initData = req.headers['x-telegram-init-data'] || req.query.initData;
    
    if (!initData) {
      logger.warn('Отсутствуют данные инициализации Telegram WebApp');
      return res.status(401).json({
        error: {
          message: 'Отсутствуют данные инициализации Telegram WebApp',
          status: 401
        }
      });
    }
    
    // Проверка подписи
    const isValid = validateTelegramWebAppInitData(initData);
    
    if (!isValid) {
      logger.warn('Невалидная подпись Telegram WebApp данных');
      return res.status(401).json({
        error: {
          message: 'Невалидная подпись Telegram WebApp данных',
          status: 401
        }
      });
    }
    
    // Парсим данные пользователя и добавляем их в req
    const parsedInitData = parseInitData(initData);
    if (parsedInitData.user) {
      req.telegramUser = parsedInitData.user;
    }
    
    next();
  } catch (error) {
    logger.error('Ошибка при проверке подлинности Telegram данных:', error);
    res.status(401).json({
      error: {
        message: 'Ошибка при проверке подлинности Telegram данных',
        status: 401
      }
    });
  }
};

/**
 * Валидация данных инициализации Telegram WebApp
 * @param {string} initDataString - Строка с данными инициализации
 * @returns {boolean} - Результат проверки
 */
const validateTelegramWebAppInitData = (initDataString) => {
  const initData = new URLSearchParams(initDataString);
  
  // Получаем значения параметров
  const hash = initData.get('hash');
  const botToken = process.env.BOT_TOKEN;
  
  if (!hash || !botToken) {
    return false;
  }
  
  // Удаляем hash из проверяемых данных
  initData.delete('hash');
  
  // Сортируем параметры
  const dataCheckArray = [];
  for (const [key, value] of initData.entries()) {
    dataCheckArray.push(`${key}=${value}`);
  }
  
  // Сортируем и объединяем в строку
  const dataCheckString = dataCheckArray.sort().join('\n');
  
  // Создаем HMAC-SHA-256 подпись
  const secretKey = crypto.createHash('sha256')
    .update(botToken)
    .digest();
    
  const calculatedHash = crypto.createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  // Сравниваем хеши
  return calculatedHash === hash;
};

/**
 * Парсинг данных инициализации Telegram WebApp
 * @param {string} initDataString - Строка с данными инициализации
 * @returns {Object} - Объект с данными
 */
const parseInitData = (initDataString) => {
  const initData = new URLSearchParams(initDataString);
  const result = {};
  
  // Преобразуем параметры в объект
  for (const [key, value] of initData.entries()) {
    // Проверяем, может ли значение быть JSON
    if (key === 'user' || key === 'chat' || key === 'start_param') {
      try {
        result[key] = JSON.parse(value);
      } catch (e) {
        result[key] = value;
      }
    } else {
      result[key] = value;
    }
  }
  
  return result;
};

module.exports = {
  verifyTelegramWebAppData
}; 
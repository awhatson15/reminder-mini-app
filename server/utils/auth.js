const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { logger } = require('./logger');

/**
 * Генерирует JWT токен для пользователя
 * @param {Object} user - Объект пользователя
 * @returns {string} - JWT токен
 */
const generateToken = (user) => {
  try {
    const payload = {
      userId: user._id,
      telegramId: user.telegramId
    };
    
    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '30d' }
    );
  } catch (error) {
    logger.error('Ошибка при генерации токена:', error);
    throw new Error('Ошибка аутентификации');
  }
};

/**
 * Верифицирует JWT токен
 * @param {string} token - JWT токен
 * @returns {Object} - Расшифрованные данные из токена
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
  } catch (error) {
    logger.error('Ошибка при верификации токена:', error);
    throw error;
  }
};

/**
 * Подтверждает подлинность данных, полученных от Telegram WebApp
 * @param {Object} initData - Данные инициализации Telegram WebApp
 * @returns {boolean} - Результат проверки
 */
const verifyTelegramWebAppData = (initData) => {
  try {
    if (!initData) {
      return false;
    }
    
    // Разделяем данные и хеш
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash');
    
    // Сортируем параметры
    const dataCheckString = Array.from(params.entries())
      .sort()
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Проверяем хеш
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(process.env.BOT_TOKEN)
      .digest();
    
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    return calculatedHash === hash;
  } catch (error) {
    logger.error('Ошибка при проверке Telegram WebApp данных:', error);
    return false;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  verifyTelegramWebAppData
}; 
const userService = require('../services/userService');
const { logger } = require('../utils/logger');

/**
 * Получить пользователя по Telegram ID
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 * @param {Function} next - Следующий middleware
 */
const getUserByTelegramId = async (req, res, next) => {
  try {
    const { telegramId } = req.params;
    
    const user = await userService.getUserByTelegramId(parseInt(telegramId));
    
    res.json(user);
  } catch (error) {
    logger.error(`Ошибка при получении пользователя ${req.params.telegramId}:`, error);
    next(error);
  }
};

/**
 * Создать или обновить пользователя
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 * @param {Function} next - Следующий middleware
 */
const createOrUpdateUser = async (req, res, next) => {
  try {
    const userData = req.body;
    
    // Обеспечиваем, что telegramId преобразован в число
    if (userData.telegramId && typeof userData.telegramId === 'string') {
      userData.telegramId = parseInt(userData.telegramId);
    }
    
    const user = await userService.createOrUpdateUser(userData);
    
    // Определяем статус ответа на основе того, был ли создан новый пользователь
    const statusCode = user.isNew ? 201 : 200;
    
    res.status(statusCode).json(user);
  } catch (error) {
    logger.error('Ошибка при создании/обновлении пользователя:', error);
    next(error);
  }
};

/**
 * Получить список всех пользователей
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 * @param {Function} next - Следующий middleware
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    
    res.json(users);
  } catch (error) {
    logger.error('Ошибка при получении списка пользователей:', error);
    next(error);
  }
};

module.exports = {
  getUserByTelegramId,
  createOrUpdateUser,
  getAllUsers
}; 
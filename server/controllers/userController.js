const userService = require('../services/userService');
const { logger } = require('../utils/logger');
const userRepository = require('../repositories/userRepository');

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

// Создание или обновление пользователя
const createOrUpdate = async (req, res) => {
  try {
    const { telegramId, username, firstName, lastName } = req.body;
    
    if (!telegramId || !username || !firstName) {
      return res.status(400).json({ 
        error: 'Необходимы telegramId, username и firstName' 
      });
    }
    
    const user = await userRepository.createOrUpdate({
      telegramId,
      username,
      firstName,
      lastName: lastName || '',
    });
    
    res.json(user);
  } catch (error) {
    logger.error('Ошибка при создании/обновлении пользователя:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Получение пользователя по telegramId
const getByTelegramId = async (req, res) => {
  try {
    const { telegramId } = req.params;
    
    if (!telegramId) {
      return res.status(400).json({ error: 'Необходим telegramId' });
    }
    
    const user = await userRepository.findByTelegramId(telegramId);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json(user);
  } catch (error) {
    logger.error('Ошибка при получении пользователя:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Обновление push-токена
const updatePushToken = async (req, res) => {
  try {
    const { telegramId } = req.params;
    const { pushToken } = req.body;
    
    if (!telegramId || !pushToken) {
      return res.status(400).json({ 
        error: 'Необходимы telegramId и pushToken' 
      });
    }
    
    const user = await userRepository.updatePushToken(telegramId, pushToken);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json(user);
  } catch (error) {
    logger.error('Ошибка при обновлении push-токена:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

// Обновление настроек пользователя
const updateSettings = async (req, res) => {
  try {
    const { telegramId } = req.params;
    const { settings } = req.body;
    
    if (!telegramId || !settings) {
      return res.status(400).json({ 
        error: 'Необходимы telegramId и settings' 
      });
    }
    
    const user = await userRepository.updateSettings(telegramId, settings);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json(user);
  } catch (error) {
    logger.error('Ошибка при обновлении настроек пользователя:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

module.exports = {
  getUserByTelegramId,
  createOrUpdateUser,
  getAllUsers,
  createOrUpdate,
  getByTelegramId,
  updatePushToken,
  updateSettings,
}; 
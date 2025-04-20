const userRepository = require('../repositories/userRepository');
const { logger } = require('../utils/logger');

/**
 * Сервис для работы с пользователями
 */
class UserService {
  /**
   * Найти пользователя по Telegram ID
   * @param {number} telegramId - Telegram ID пользователя
   * @returns {Promise<Object>} Пользователь
   */
  async getUserByTelegramId(telegramId) {
    try {
      const user = await userRepository.findByTelegramId(telegramId);
      
      if (!user) {
        throw new Error(`Пользователь с Telegram ID ${telegramId} не найден`);
      }
      
      return user;
    } catch (error) {
      logger.error(`Ошибка при поиске пользователя ${telegramId}:`, error);
      throw error;
    }
  }
  
  /**
   * Создать или обновить пользователя
   * @param {Object} userData - Данные пользователя
   * @returns {Promise<Object>} Пользователь
   */
  async createOrUpdateUser(userData) {
    try {
      const { telegramId, username, firstName, lastName } = userData;
      
      this._validateUserData(userData);
      
      const user = await userRepository.findOrCreate({
        telegramId,
        username,
        firstName,
        lastName,
        lastActivity: new Date()
      });
      
      logger.info(`Пользователь ${telegramId} ${user.isNew ? 'создан' : 'обновлен'}`);
      return user;
    } catch (error) {
      logger.error('Ошибка при создании/обновлении пользователя:', error);
      throw error;
    }
  }
  
  /**
   * Получить всех пользователей
   * @returns {Promise<Array>} Список пользователей
   */
  async getAllUsers() {
    try {
      return await userRepository.findAll();
    } catch (error) {
      logger.error('Ошибка при получении списка пользователей:', error);
      throw error;
    }
  }
  
  /**
   * Валидация данных пользователя
   * @param {Object} userData - Данные для валидации
   * @private
   */
  _validateUserData(userData) {
    const { telegramId } = userData;
    
    if (!telegramId) {
      throw new Error('Telegram ID обязателен');
    }
    
    if (typeof telegramId !== 'number') {
      throw new Error('Telegram ID должен быть числом');
    }
  }
}

module.exports = new UserService(); 
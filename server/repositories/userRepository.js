const User = require('../models/User');
const { logger } = require('../utils/logger');

/**
 * Репозиторий для работы с моделью User
 */
class UserRepository {
  /**
   * Найти пользователя по Telegram ID
   * @param {number} telegramId - Telegram ID пользователя
   * @returns {Promise<Object>} Пользователь
   */
  async findByTelegramId(telegramId) {
    try {
      return await User.findOne({ telegramId });
    } catch (error) {
      logger.error(`Ошибка при поиске пользователя по Telegram ID ${telegramId}:`, error);
      throw error;
    }
  }
  
  /**
   * Найти пользователя по ID
   * @param {string} id - ID пользователя
   * @returns {Promise<Object>} Пользователь
   */
  async findById(id) {
    try {
      return await User.findById(id);
    } catch (error) {
      logger.error(`Ошибка при поиске пользователя по ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Создать нового пользователя
   * @param {Object} userData - Данные пользователя
   * @returns {Promise<Object>} Созданный пользователь
   */
  async create(userData) {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      logger.error('Ошибка при создании пользователя:', error);
      throw error;
    }
  }
  
  /**
   * Обновить пользователя
   * @param {number} telegramId - Telegram ID пользователя
   * @param {Object} updateData - Данные для обновления
   * @returns {Promise<Object>} Обновленный пользователь
   */
  async updateByTelegramId(telegramId, updateData) {
    try {
      const user = await User.findOne({ telegramId });
      if (!user) {
        return null;
      }
      
      Object.keys(updateData).forEach(key => {
        user[key] = updateData[key];
      });
      
      user.lastActivity = new Date();
      return await user.save();
    } catch (error) {
      logger.error(`Ошибка при обновлении пользователя ${telegramId}:`, error);
      throw error;
    }
  }
  
  /**
   * Получить или создать пользователя по Telegram ID
   * @param {Object} userData - Данные пользователя
   * @returns {Promise<Object>} Пользователь
   */
  async findOrCreate(userData) {
    try {
      const { telegramId } = userData;
      
      let user = await this.findByTelegramId(telegramId);
      
      if (user) {
        // Обновляем существующего пользователя
        return await this.updateByTelegramId(telegramId, userData);
      } else {
        // Создаем нового пользователя
        return await this.create(userData);
      }
    } catch (error) {
      logger.error('Ошибка при поиске или создании пользователя:', error);
      throw error;
    }
  }
  
  /**
   * Получить всех пользователей
   * @returns {Promise<Array>} Список пользователей
   */
  async findAll() {
    try {
      return await User.find();
    } catch (error) {
      logger.error('Ошибка при получении всех пользователей:', error);
      throw error;
    }
  }
}

module.exports = new UserRepository(); 
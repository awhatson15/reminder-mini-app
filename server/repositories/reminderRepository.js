const Reminder = require('../models/Reminder');
const { logger } = require('../utils/logger');

/**
 * Репозиторий для работы с моделью Reminder
 */
class ReminderRepository {
  /**
   * Найти все напоминания пользователя
   * @param {string} userId - ID пользователя
   * @param {Object} options - Опции запроса (сортировка, пагинация)
   * @returns {Promise<Array>} Список напоминаний
   */
  async findByUserId(userId, options = {}) {
    try {
      const { sort = { 'date.month': 1, 'date.day': 1 }, skip = 0, limit = 0 } = options;
      
      const query = Reminder.find({ user: userId });
      
      if (sort) {
        query.sort(sort);
      }
      
      if (skip > 0) {
        query.skip(skip);
      }
      
      if (limit > 0) {
        query.limit(limit);
      }
      
      return await query.exec();
    } catch (error) {
      logger.error('Ошибка при получении напоминаний пользователя:', error);
      throw error;
    }
  }
  
  /**
   * Найти напоминания по произвольному запросу
   * @param {Object} queryParams - Параметры запроса
   * @param {Object} options - Опции запроса (сортировка, пагинация)
   * @returns {Promise<Array>} Список напоминаний
   */
  async findByQuery(queryParams, options = {}) {
    try {
      const { sort = { 'date.month': 1, 'date.day': 1 }, skip = 0, limit = 0 } = options;
      
      const query = Reminder.find(queryParams);
      
      if (sort) {
        query.sort(sort);
      }
      
      if (skip > 0) {
        query.skip(skip);
      }
      
      if (limit > 0) {
        query.limit(limit);
      }
      
      return await query.exec();
    } catch (error) {
      logger.error('Ошибка при выполнении произвольного запроса напоминаний:', error);
      throw error;
    }
  }
  
  /**
   * Получить список уникальных групп пользователя
   * @param {string} userId - ID пользователя
   * @returns {Promise<Array>} Список групп
   */
  async getDistinctGroups(userId) {
    try {
      return await Reminder.distinct('group', { user: userId });
    } catch (error) {
      logger.error('Ошибка при получении списка групп пользователя:', error);
      throw error;
    }
  }
  
  /**
   * Найти напоминание по ID
   * @param {string} id - ID напоминания
   * @returns {Promise<Object>} Напоминание
   */
  async findById(id) {
    try {
      return await Reminder.findById(id);
    } catch (error) {
      logger.error(`Ошибка при получении напоминания ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Создать новое напоминание
   * @param {Object} reminderData - Данные напоминания
   * @returns {Promise<Object>} Созданное напоминание
   */
  async create(reminderData) {
    try {
      const reminder = new Reminder(reminderData);
      return await reminder.save();
    } catch (error) {
      logger.error('Ошибка при создании напоминания:', error);
      throw error;
    }
  }
  
  /**
   * Обновить напоминание
   * @param {string} id - ID напоминания
   * @param {Object} updateData - Данные для обновления
   * @returns {Promise<Object>} Обновленное напоминание
   */
  async update(id, updateData) {
    try {
      const reminder = await Reminder.findById(id);
      if (!reminder) {
        return null;
      }
      
      Object.keys(updateData).forEach(key => {
        if (key === 'date') {
          Object.keys(updateData.date).forEach(dateKey => {
            reminder.date[dateKey] = updateData.date[dateKey];
          });
        } else {
          reminder[key] = updateData[key];
        }
      });
      
      reminder.updatedAt = new Date();
      return await reminder.save();
    } catch (error) {
      logger.error(`Ошибка при обновлении напоминания ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Удалить напоминание
   * @param {string} id - ID напоминания
   * @returns {Promise<Object>} Удаленное напоминание
   */
  async delete(id) {
    try {
      return await Reminder.findByIdAndDelete(id);
    } catch (error) {
      logger.error(`Ошибка при удалении напоминания ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Получить приближающиеся напоминания
   * @returns {Promise<Array>} Список напоминаний
   */
  async getUpcomingReminders() {
    try {
      // Здесь мы получаем все напоминания, но в идеале нужно 
      // оптимизировать запрос, чтобы получать только нужные записи
      return await Reminder.find().populate('user');
    } catch (error) {
      logger.error('Ошибка при получении предстоящих напоминаний:', error);
      throw error;
    }
  }
  
  /**
   * Получить рекуррентные напоминания
   * @returns {Promise<Array>} Список напоминаний
   */
  async getRecurringReminders() {
    try {
      return await Reminder.find({ isRecurring: true }).populate('user');
    } catch (error) {
      logger.error('Ошибка при получении рекуррентных напоминаний:', error);
      throw error;
    }
  }
}

module.exports = new ReminderRepository(); 
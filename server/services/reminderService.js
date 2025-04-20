const reminderRepository = require('../repositories/reminderRepository');
const userRepository = require('../repositories/userRepository');
const { logger } = require('../utils/logger');

/**
 * Сервис для работы с напоминаниями
 */
class ReminderService {
  /**
   * Получить все напоминания пользователя
   * @param {number} telegramId - Telegram ID пользователя
   * @param {Object} options - Опции запроса (сортировка, пагинация)
   * @returns {Promise<Array>} Список напоминаний
   */
  async getUserReminders(telegramId, options = {}) {
    try {
      const user = await userRepository.findByTelegramId(telegramId);
      
      if (!user) {
        throw new Error(`Пользователь с Telegram ID ${telegramId} не найден`);
      }
      
      return await reminderRepository.findByUserId(user._id, options);
    } catch (error) {
      logger.error(`Ошибка при получении напоминаний пользователя ${telegramId}:`, error);
      throw error;
    }
  }
  
  /**
   * Получить напоминание по ID
   * @param {string} id - ID напоминания
   * @returns {Promise<Object>} Напоминание
   */
  async getReminderById(id) {
    try {
      const reminder = await reminderRepository.findById(id);
      
      if (!reminder) {
        throw new Error(`Напоминание с ID ${id} не найдено`);
      }
      
      return reminder;
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
  async createReminder(reminderData) {
    try {
      const { telegramId, ...reminderDetails } = reminderData;
      
      // Находим пользователя по Telegram ID
      const user = await userRepository.findByTelegramId(telegramId);
      
      if (!user) {
        throw new Error(`Пользователь с Telegram ID ${telegramId} не найден`);
      }
      
      // Валидация данных
      this._validateReminderData(reminderDetails);
      
      // Формируем данные для сохранения
      const dataToSave = {
        ...reminderDetails,
        user: user._id
      };
      
      // Сохраняем напоминание
      const reminder = await reminderRepository.create(dataToSave);
      
      logger.info(`Создано напоминание для пользователя ${telegramId}: ${reminder.title}`);
      return reminder;
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
  async updateReminder(id, updateData) {
    try {
      // Проверяем существование напоминания
      const existingReminder = await reminderRepository.findById(id);
      
      if (!existingReminder) {
        throw new Error(`Напоминание с ID ${id} не найдено`);
      }
      
      // Валидация данных
      if (Object.keys(updateData).length > 0) {
        this._validateReminderData(updateData, false);
      }
      
      // Обновляем напоминание
      const updatedReminder = await reminderRepository.update(id, updateData);
      
      logger.info(`Обновлено напоминание ${id}`);
      return updatedReminder;
    } catch (error) {
      logger.error(`Ошибка при обновлении напоминания ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Удалить напоминание
   * @param {string} id - ID напоминания
   * @returns {Promise<Object>} Результат операции
   */
  async deleteReminder(id) {
    try {
      const reminder = await reminderRepository.delete(id);
      
      if (!reminder) {
        throw new Error(`Напоминание с ID ${id} не найдено`);
      }
      
      logger.info(`Удалено напоминание ${id}`);
      return { success: true, message: 'Напоминание удалено' };
    } catch (error) {
      logger.error(`Ошибка при удалении напоминания ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Валидация данных напоминания
   * @param {Object} data - Данные для валидации
   * @param {boolean} isCreation - Флаг создания нового напоминания
   * @private
   */
  _validateReminderData(data, isCreation = true) {
    // Проверка обязательных полей при создании
    if (isCreation) {
      if (!data.title) {
        throw new Error('Необходимо указать заголовок');
      }
      
      if (!data.type || (data.type !== 'birthday' && data.type !== 'event')) {
        throw new Error('Необходимо указать корректный тип');
      }
      
      if (!data.date) {
        throw new Error('Необходимо указать дату');
      }
    }
    
    // Проверка даты, если она указана
    if (data.date) {
      if (typeof data.date.day !== 'number' || data.date.day < 1 || data.date.day > 31) {
        throw new Error('Необходимо указать корректный день месяца (1-31)');
      }
      
      if (typeof data.date.month !== 'number' || data.date.month < 1 || data.date.month > 12) {
        throw new Error('Необходимо указать корректный месяц (1-12)');
      }
      
      // Проверка года для событий (не дней рождения)
      if (data.type === 'event' && !data.date.year) {
        throw new Error('Для событий необходимо указать год');
      }
    }
  }
}

module.exports = new ReminderService(); 
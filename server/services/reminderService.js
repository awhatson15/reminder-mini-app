const reminderRepository = require('../repositories/reminderRepository');
const userRepository = require('../repositories/userRepository');
const { logger } = require('../utils/logger');

/**
 * Проверка обязательных полей в объекте
 * @param {Object} obj - Проверяемый объект
 * @param {Array} requiredFields - Список обязательных полей
 * @returns {Array} - Массив ошибок (пустой, если ошибок нет)
 */
const validateRequiredFields = (obj, requiredFields) => {
  const errors = [];
  
  for (const field of requiredFields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      errors.push(`Поле '${field}' обязательно`);
    }
  }
  
  return errors;
};

/**
 * Проверка типа полей в объекте
 * @param {Object} obj - Проверяемый объект
 * @param {Object} fieldTypes - Объект с ожидаемыми типами полей
 * @returns {Array} - Массив ошибок (пустой, если ошибок нет)
 */
const validateFieldTypes = (obj, fieldTypes) => {
  const errors = [];
  
  for (const [field, expectedType] of Object.entries(fieldTypes)) {
    // Пропускаем необязательные поля, которых нет в объекте
    if (obj[field] === undefined) continue;
    
    // Проверка на null
    if (obj[field] === null) {
      if (expectedType !== 'null') {
        errors.push(`Поле '${field}' не может быть null`);
      }
      continue;
    }
    
    // Проверка числового типа
    if (expectedType === 'number') {
      if (typeof obj[field] !== 'number' || isNaN(obj[field])) {
        errors.push(`Поле '${field}' должно быть числом`);
      }
      continue;
    }
    
    // Проверка строкового типа
    if (expectedType === 'string') {
      if (typeof obj[field] !== 'string') {
        errors.push(`Поле '${field}' должно быть строкой`);
      }
      continue;
    }
    
    // Проверка логического типа
    if (expectedType === 'boolean') {
      if (typeof obj[field] !== 'boolean') {
        errors.push(`Поле '${field}' должно быть логическим значением`);
      }
      continue;
    }
    
    // Проверка типа "объект"
    if (expectedType === 'object') {
      if (typeof obj[field] !== 'object' || obj[field] === null || Array.isArray(obj[field])) {
        errors.push(`Поле '${field}' должно быть объектом`);
      }
      continue;
    }
    
    // Проверка типа "массив"
    if (expectedType === 'array') {
      if (!Array.isArray(obj[field])) {
        errors.push(`Поле '${field}' должно быть массивом`);
      }
      continue;
    }
    
    // Проверка на соответствие перечислению
    if (Array.isArray(expectedType)) {
      if (!expectedType.includes(obj[field])) {
        errors.push(`Поле '${field}' должно быть одним из: ${expectedType.join(', ')}`);
      }
      continue;
    }
    
    // Общая проверка типа
    if (typeof obj[field] !== expectedType) {
      errors.push(`Поле '${field}' имеет неверный тип. Ожидается: ${expectedType}`);
    }
  }
  
  return errors;
};

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
   * Получить напоминания пользователя по группе
   * @param {number} telegramId - Telegram ID пользователя
   * @param {string} group - Название группы
   * @param {Object} options - Опции запроса (сортировка, пагинация)
   * @returns {Promise<Array>} Список напоминаний
   */
  async getRemindersByGroup(telegramId, group, options = {}) {
    try {
      const user = await userRepository.findByTelegramId(telegramId);
      
      if (!user) {
        throw new Error(`Пользователь с Telegram ID ${telegramId} не найден`);
      }
      
      const query = { user: user._id, group };
      return await reminderRepository.findByQuery(query, options);
    } catch (error) {
      logger.error(`Ошибка при получении напоминаний по группе ${group} для пользователя ${telegramId}:`, error);
      throw error;
    }
  }
  
  /**
   * Получить список доступных групп для пользователя
   * @param {number} telegramId - Telegram ID пользователя
   * @returns {Promise<Array>} Список групп
   */
  async getUserGroups(telegramId) {
    try {
      const user = await userRepository.findByTelegramId(telegramId);
      
      if (!user) {
        throw new Error(`Пользователь с Telegram ID ${telegramId} не найден`);
      }
      
      const result = await reminderRepository.getDistinctGroups(user._id);
      return result;
    } catch (error) {
      logger.error(`Ошибка при получении групп пользователя ${telegramId}:`, error);
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
    const errors = [];
    
    // Проверка обязательных полей при создании
    if (isCreation) {
      errors.push(...validateRequiredFields(data, ['title', 'type', 'date']));
      
      // Проверка типа напоминания
      if (data.type && !['birthday', 'event'].includes(data.type)) {
        errors.push('Поле type должно быть "birthday" или "event"');
      }
    }
    
    // Проверка типов полей
    const fieldTypes = {
      title: 'string',
      type: ['birthday', 'event'],
      group: ['семья', 'работа', 'друзья', 'другое'],
      description: 'string',
      notifyDaysBefore: 'number',
      isRecurring: 'boolean',
      recurringType: ['weekly', 'monthly', 'yearly'],
      recurringDayOfWeek: 'number',
      endDate: 'string' // Дата в формате строки
    };
    
    errors.push(...validateFieldTypes(data, fieldTypes));
    
    // Проверка полей даты
    if (data.date) {
      // Проверка обязательных полей даты
      errors.push(...validateRequiredFields(data.date, ['day', 'month']));
      
      // Проверка типов полей даты
      const dateFieldTypes = {
        day: 'number',
        month: 'number',
        year: 'number'
      };
      
      errors.push(...validateFieldTypes(data.date, dateFieldTypes));
      
      // Проверка значений полей даты
      if (data.date.day !== undefined) {
        if (data.date.day < 1 || data.date.day > 31) {
          errors.push('Поле date.day должно быть от 1 до 31');
        }
      }
      
      if (data.date.month !== undefined) {
        if (data.date.month < 1 || data.date.month > 12) {
          errors.push('Поле date.month должно быть от 1 до 12');
        }
      }
      
      // Проверка года для событий
      if (data.type === 'event' && !data.date.year) {
        errors.push('Для событий необходимо указать год (date.year)');
      }
    }
    
    // Проверка полей рекуррентных напоминаний
    if (data.isRecurring) {
      if (!data.recurringType) {
        errors.push('Для рекуррентного напоминания необходимо указать тип повторения (recurringType)');
      } else if (data.recurringType === 'weekly' && data.recurringDayOfWeek === undefined) {
        errors.push('Для еженедельного напоминания необходимо указать день недели (recurringDayOfWeek)');
      }
      
      // Проверка корректности дня недели
      if (data.recurringDayOfWeek !== undefined) {
        if (data.recurringDayOfWeek < 0 || data.recurringDayOfWeek > 6) {
          errors.push('День недели (recurringDayOfWeek) должен быть от 0 до 6');
        }
      }
      
      // Проверка даты окончания, если она указана
      if (data.endDate) {
        const endDate = new Date(data.endDate);
        if (isNaN(endDate.getTime())) {
          errors.push('Указана некорректная дата окончания (endDate)');
        }
      }
    }
    
    // Если есть ошибки, выбрасываем исключение
    if (errors.length > 0) {
      throw new Error(`Ошибка валидации данных: ${errors.join('; ')}`);
    }
  }
}

module.exports = new ReminderService(); 
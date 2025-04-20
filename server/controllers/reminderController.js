const reminderService = require('../services/reminderService');
const { logger } = require('../utils/logger');

/**
 * Получить все напоминания пользователя
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 * @param {Function} next - Следующий middleware
 */
const getUserReminders = async (req, res, next) => {
  try {
    const { telegramId, page, limit, sortBy, sortDir } = req.query;
    
    if (!telegramId) {
      return res.status(400).json({ message: 'Telegram ID обязателен' });
    }
    
    // Настройка пагинации и сортировки
    const options = {};
    
    if (page && limit) {
      options.skip = (parseInt(page) - 1) * parseInt(limit);
      options.limit = parseInt(limit);
    }
    
    // Настройка сортировки
    if (sortBy) {
      const sortField = sortBy === 'name' ? 'title' : 'date.month';
      options.sort = { [sortField]: sortDir === 'desc' ? -1 : 1 };
      
      // Добавляем вторичную сортировку по дню, если сортируем по дате
      if (sortBy === 'date') {
        options.sort['date.day'] = sortDir === 'desc' ? -1 : 1;
      }
    }
    
    const reminders = await reminderService.getUserReminders(parseInt(telegramId), options);
    
    logger.info(`Получены напоминания для пользователя ${telegramId}`);
    res.json(reminders);
  } catch (error) {
    logger.error('Ошибка при получении напоминаний:', error);
    next(error);
  }
};

/**
 * Получить напоминание по ID
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 * @param {Function} next - Следующий middleware
 */
const getReminderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const reminder = await reminderService.getReminderById(id);
    res.json(reminder);
  } catch (error) {
    logger.error(`Ошибка при получении напоминания ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Создать новое напоминание
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 * @param {Function} next - Следующий middleware
 */
const createReminder = async (req, res, next) => {
  try {
    const reminderData = req.body;
    
    // Логирование для отладки
    logger.info(`POST /api/reminders - Входящие данные: ${JSON.stringify(reminderData)}`);
    
    const reminder = await reminderService.createReminder(reminderData);
    
    res.status(201).json(reminder);
  } catch (error) {
    logger.error('Ошибка при создании напоминания:', error);
    next(error);
  }
};

/**
 * Обновить напоминание
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 * @param {Function} next - Следующий middleware
 */
const updateReminder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Логирование для отладки
    logger.info(`PUT /api/reminders/${id} - Входящие данные: ${JSON.stringify(updateData)}`);
    
    const updatedReminder = await reminderService.updateReminder(id, updateData);
    
    res.json(updatedReminder);
  } catch (error) {
    logger.error(`Ошибка при обновлении напоминания ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Удалить напоминание
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 * @param {Function} next - Следующий middleware
 */
const deleteReminder = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await reminderService.deleteReminder(id);
    
    res.json(result);
  } catch (error) {
    logger.error(`Ошибка при удалении напоминания ${req.params.id}:`, error);
    next(error);
  }
};

module.exports = {
  getUserReminders,
  getReminderById,
  createReminder,
  updateReminder,
  deleteReminder
}; 
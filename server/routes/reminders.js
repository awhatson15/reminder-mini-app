const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const { logger } = require('../utils/logger');

// Получить все напоминания пользователя
router.get('/', async (req, res) => {
  try {
    const { telegramId } = req.query;
    
    if (!telegramId) {
      return res.status(400).json({ message: 'Telegram ID обязателен' });
    }
    
    const user = await User.findOne({ telegramId });
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    const reminders = await Reminder.find({ user: user._id }).sort({ 'date.month': 1, 'date.day': 1 });
    
    logger.info(`Получены напоминания для пользователя ${telegramId}`);
    res.json(reminders);
  } catch (error) {
    logger.error('Ошибка при получении напоминаний:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создать новое напоминание
router.post('/', async (req, res) => {
  try {
    let { 
      telegramId, 
      title, 
      type, 
      date, 
      description, 
      notifyDaysBefore 
    } = req.body;
    
    // Логирование для отладки
    logger.info(`POST /api/reminders - Входящие данные: ${JSON.stringify({
      telegramId, 
      title, 
      type, 
      date,
      description,
      notifyDaysBefore
    })}`);
    
    // Базовая проверка обязательных полей
    if (!telegramId) {
      return res.status(400).json({ message: 'Необходим telegramId' });
    }
    
    if (!title) {
      return res.status(400).json({ message: 'Необходимо указать заголовок' });
    }
    
    if (!type || (type !== 'birthday' && type !== 'event')) {
      return res.status(400).json({ message: 'Необходимо указать корректный тип' });
    }
    
    // Проверка даты
    if (!date) {
      return res.status(400).json({ message: 'Необходимо указать дату' });
    }
    
    // Проверка полей даты
    if (typeof date.day !== 'number' || date.day < 1 || date.day > 31) {
      return res.status(400).json({ message: 'Необходимо указать корректный день месяца (1-31)' });
    }
    
    if (typeof date.month !== 'number' || date.month < 1 || date.month > 12) {
      return res.status(400).json({ message: 'Необходимо указать корректный месяц (1-12)' });
    }
    
    // Проверка года для событий (не дней рождения)
    if (type === 'event' && !date.year) {
      return res.status(400).json({ message: 'Для событий необходимо указать год' });
    }
    
    const user = await User.findOne({ telegramId });
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Подготовка данных с явной обработкой года для дней рождения
    const reminderData = {
      user: user._id,
      title,
      type,
      date: {
        day: date.day,
        month: date.month,
        // Для дней рождения год может быть null
        year: type === 'birthday' ? (date.year || null) : date.year
      },
      description,
      notifyDaysBefore: notifyDaysBefore || 1
    };
    
    const reminder = new Reminder(reminderData);
    
    await reminder.save();
    logger.info(`Создано новое напоминание для пользователя ${telegramId}: ${title}`);
    res.status(201).json(reminder);
  } catch (error) {
    logger.error('Ошибка при создании напоминания:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить одно напоминание по ID
router.get('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    
    if (!reminder) {
      return res.status(404).json({ message: 'Напоминание не найдено' });
    }
    
    res.json(reminder);
  } catch (error) {
    logger.error(`Ошибка при получении напоминания ${req.params.id}:`, error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновить напоминание
router.put('/:id', async (req, res) => {
  try {
    let { 
      title, 
      type, 
      date, 
      description, 
      notifyDaysBefore 
    } = req.body;
    
    // Логирование для отладки
    logger.info(`PUT /api/reminders/${req.params.id} - Входящие данные: ${JSON.stringify({
      title, 
      type, 
      date,
      description,
      notifyDaysBefore
    })}`);
    
    // Проверка данных о дате, если они предоставлены
    if (date) {
      // Проверка полей даты
      if (typeof date.day !== 'number' || date.day < 1 || date.day > 31) {
        return res.status(400).json({ message: 'Необходимо указать корректный день месяца (1-31)' });
      }
      
      if (typeof date.month !== 'number' || date.month < 1 || date.month > 12) {
        return res.status(400).json({ message: 'Необходимо указать корректный месяц (1-12)' });
      }
      
      // Проверка года для событий (не дней рождения)
      if (type === 'event' && !date.year) {
        return res.status(400).json({ message: 'Для событий необходимо указать год' });
      }
    }
    
    const updateData = {};
    if (title) updateData.title = title;
    if (type) updateData.type = type;
    
    if (date) {
      updateData.date = {
        day: date.day,
        month: date.month,
        // Для дней рождения год может быть null
        year: type === 'birthday' ? (date.year || null) : date.year
      };
    }
    
    if (description !== undefined) updateData.description = description;
    if (notifyDaysBefore !== undefined) updateData.notifyDaysBefore = notifyDaysBefore;
    
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!reminder) {
      return res.status(404).json({ message: 'Напоминание не найдено' });
    }
    
    logger.info(`Обновлено напоминание ${req.params.id}`);
    res.json(reminder);
  } catch (error) {
    logger.error(`Ошибка при обновлении напоминания ${req.params.id}:`, error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удалить напоминание
router.delete('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndDelete(req.params.id);
    
    if (!reminder) {
      return res.status(404).json({ message: 'Напоминание не найдено' });
    }
    
    logger.info(`Удалено напоминание ${req.params.id}`);
    res.json({ message: 'Напоминание удалено' });
  } catch (error) {
    logger.error(`Ошибка при удалении напоминания ${req.params.id}:`, error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router; 
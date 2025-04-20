const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const { validateReminder } = require('../middlewares/validation');
const rateLimiter = require('../middlewares/rateLimiter');

// Применяем ограничитель скорости запросов к API напоминаний
router.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100 // 100 запросов за 15 минут
}));

// Получить все напоминания пользователя
router.get('/', reminderController.getUserReminders);

// Получить группы пользователя
router.get('/groups/:telegramId', reminderController.getUserGroups);

// Создать новое напоминание
router.post('/', validateReminder(true), reminderController.createReminder);

// Получить одно напоминание по ID
router.get('/:id', reminderController.getReminderById);

// Обновить напоминание
router.put('/:id', validateReminder(false), reminderController.updateReminder);

// Удалить напоминание
router.delete('/:id', reminderController.deleteReminder);

module.exports = router; 
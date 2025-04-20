const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateUser } = require('../middlewares/validation');
const rateLimiter = require('../middlewares/rateLimiter');

// Применяем ограничитель скорости запросов к API пользователей
router.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 50 // 50 запросов за 15 минут
}));

// Получить или создать пользователя
router.post('/', validateUser(), userController.createOrUpdateUser);

// Получить информацию о пользователе
router.get('/:telegramId', userController.getUserByTelegramId);

// Получить список всех пользователей
router.get('/', userController.getAllUsers);

module.exports = router; 
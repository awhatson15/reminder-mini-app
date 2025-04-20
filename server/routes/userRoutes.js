const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Получение всех пользователей
router.get('/', userController.getAllUsers);

// Получение пользователя по telegramId
router.get('/:telegramId', userController.getByTelegramId);

// Создание или обновление пользователя
router.post('/', userController.createOrUpdate);

// Обновление push-токена
router.put('/:telegramId/push-token', userController.updatePushToken);

// Обновление настроек пользователя
router.put('/:telegramId/settings', userController.updateSettings);

module.exports = router; 
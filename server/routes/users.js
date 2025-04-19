const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { logger } = require('../utils/logger');

// Получить или создать пользователя
router.post('/', async (req, res) => {
  try {
    const { telegramId, username, firstName, lastName } = req.body;
    
    if (!telegramId) {
      return res.status(400).json({ message: 'Telegram ID обязателен' });
    }
    
    // Проверяем, существует ли пользователь
    let user = await User.findOne({ telegramId });
    
    if (user) {
      // Обновляем время последней активности
      user.lastActivity = new Date();
      
      // Обновляем информацию о пользователе, если она изменилась
      if (username) user.username = username;
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      
      await user.save();
      logger.info(`Пользователь с ID ${telegramId} вошел в систему`);
      return res.json(user);
    }
    
    // Создаем нового пользователя
    user = new User({
      telegramId,
      username,
      firstName,
      lastName
    });
    
    await user.save();
    logger.info(`Создан новый пользователь с ID ${telegramId}`);
    res.status(201).json(user);
  } catch (error) {
    logger.error('Ошибка при работе с пользователем:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить информацию о пользователе
router.get('/:telegramId', async (req, res) => {
  try {
    const { telegramId } = req.params;
    const user = await User.findOne({ telegramId });
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    res.json(user);
  } catch (error) {
    logger.error(`Ошибка при получении пользователя ${req.params.telegramId}:`, error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router; 
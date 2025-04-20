const express = require('express');
const router = express.Router();
const { Telegram } = require('telegraf');
const Contact = require('../models/Contact');

// Инициализация Telegram бота
const telegram = new Telegram(process.env.BOT_TOKEN);

// Получение контактов из Telegram
router.get('/telegram', async (req, res) => {
  try {
    const { telegramId } = req.user;
    
    // Получаем контакты пользователя из Telegram
    const contacts = await telegram.getUserContacts(telegramId);
    
    // Сохраняем контакты в базу, если их там еще нет
    for (const contact of contacts) {
      await Contact.findOneAndUpdate(
        { telegramId: contact.id },
        {
          telegramId: contact.id,
          name: `${contact.first_name} ${contact.last_name || ''}`.trim(),
          photo: contact.photo?.small_file_id,
          birthday: contact.birthday,
          userId: req.user._id
        },
        { upsert: true, new: true }
      );
    }
    
    res.json(contacts);
  } catch (error) {
    console.error('Ошибка при получении контактов:', error);
    res.status(500).json({ message: 'Ошибка при получении контактов' });
  }
});

// Поиск контактов
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const { _id: userId } = req.user;
    
    if (!q) {
      return res.json([]);
    }
    
    // Ищем контакты по имени
    const contacts = await Contact.find({
      userId,
      name: { $regex: q, $options: 'i' }
    }).limit(10);
    
    res.json(contacts);
  } catch (error) {
    console.error('Ошибка при поиске контактов:', error);
    res.status(500).json({ message: 'Ошибка при поиске контактов' });
  }
});

// Импорт дней рождения
router.post('/import-birthdays', async (req, res) => {
  try {
    const { contacts } = req.body;
    const { _id: userId } = req.user;
    
    const importedBirthdays = [];
    
    for (const contact of contacts) {
      if (contact.birthday) {
        // Создаем напоминание о дне рождения
        const birthday = new Date(contact.birthday);
        const reminder = await Reminder.create({
          userId,
          title: `День рождения ${contact.name}`,
          type: 'birthday',
          date: {
            day: birthday.getDate(),
            month: birthday.getMonth() + 1,
            year: birthday.getFullYear()
          },
          notifyDaysBefore: 1,
          isRecurring: true,
          recurringType: 'yearly'
        });
        
        importedBirthdays.push(reminder);
      }
    }
    
    res.json(importedBirthdays);
  } catch (error) {
    console.error('Ошибка при импорте дней рождения:', error);
    res.status(500).json({ message: 'Ошибка при импорте дней рождения' });
  }
});

module.exports = router; 
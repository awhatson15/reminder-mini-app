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

// Синхронизация контактов
router.post('/sync', async (req, res) => {
  try {
    const { contacts } = req.body;
    const { _id: userId } = req.user;
    
    const syncedContacts = [];
    
    for (const contact of contacts) {
      // Ищем контакт по телефону или email
      const query = {
        userId,
        $or: [
          { phones: { $in: contact.tel } },
          { emails: { $in: contact.email } }
        ]
      };
      
      const existingContact = await Contact.findOne(query);
      
      if (existingContact) {
        // Обновляем существующий контакт
        existingContact.name = contact.name[0];
        existingContact.phones = contact.tel;
        existingContact.emails = contact.email;
        existingContact.address = contact.address?.[0];
        existingContact.source = 'phone';
        await existingContact.save();
        syncedContacts.push(existingContact);
      } else {
        // Создаем новый контакт
        const newContact = await Contact.create({
          userId,
          name: contact.name[0],
          phones: contact.tel,
          emails: contact.email,
          address: contact.address?.[0],
          source: 'phone'
        });
        syncedContacts.push(newContact);
      }
    }
    
    res.json(syncedContacts);
  } catch (error) {
    console.error('Ошибка при синхронизации контактов:', error);
    res.status(500).json({ message: 'Ошибка при синхронизации контактов' });
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
    
    // Ищем контакты по имени или телефону
    const contacts = await Contact.find({
      userId,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { phones: { $regex: q, $options: 'i' } },
        { emails: { $regex: q, $options: 'i' } }
      ]
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

// Импорт контактов
router.post('/import', async (req, res) => {
  try {
    const { contacts } = req.body;
    const { _id: userId } = req.user;
    
    const importedContacts = [];
    
    for (const contact of contacts) {
      const newContact = await Contact.create({
        userId,
        name: contact.name[0],
        phones: contact.tel,
        emails: contact.email,
        address: contact.address?.[0],
        source: 'phone'
      });
      
      importedContacts.push(newContact);
    }
    
    res.json(importedContacts);
  } catch (error) {
    console.error('Ошибка при импорте контактов:', error);
    res.status(500).json({ message: 'Ошибка при импорте контактов' });
  }
});

module.exports = router; 
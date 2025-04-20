const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Синхронизация контактов
router.post('/sync', async (req, res) => {
  try {
    const { contacts } = req.body;
    const { _id: userId } = req.user;
    
    console.log('Получены контакты для синхронизации:', contacts);
    
    const syncedContacts = [];
    
    for (const contact of contacts) {
      // Пропускаем контакты без имени или телефона
      if (!contact.name?.[0] || !contact.tel?.length) {
        continue;
      }
      
      // Ищем контакт по телефону
      const query = {
        userId,
        phones: { $in: contact.tel }
      };
      
      const existingContact = await Contact.findOne(query);
      
      if (existingContact) {
        // Обновляем существующий контакт
        existingContact.name = contact.name[0];
        existingContact.phones = contact.tel;
        existingContact.emails = contact.email || [];
        await existingContact.save();
        syncedContacts.push(existingContact);
      } else {
        // Создаем новый контакт
        const newContact = await Contact.create({
          userId,
          name: contact.name[0],
          phones: contact.tel,
          emails: contact.email || [],
          source: 'phone'
        });
        syncedContacts.push(newContact);
      }
    }
    
    console.log('Синхронизировано контактов:', syncedContacts.length);
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
        { phones: { $regex: q, $options: 'i' } }
      ]
    })
    .select('name phones emails')
    .limit(10);
    
    res.json(contacts);
  } catch (error) {
    console.error('Ошибка при поиске контактов:', error);
    res.status(500).json({ message: 'Ошибка при поиске контактов' });
  }
});

module.exports = router; 
import axios from 'axios';

// Запрос разрешения на доступ к контактам
export const requestContactsPermission = async () => {
  try {
    // Проверяем поддержку API
    if (!('contacts' in navigator && 'select' in navigator.contacts)) {
      throw new Error('Ваш браузер не поддерживает работу с контактами');
    }

    const props = ['name', 'tel', 'email'];
    const opts = { multiple: true };

    const contacts = await navigator.contacts.select(props, opts);
    console.log('Получены контакты:', contacts);

    if (contacts.length > 0) {
      // Сохраняем контакты на сервере
      await axios.post('/api/contacts/sync', { contacts });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Ошибка при запросе доступа к контактам:', error);
    throw error;
  }
};

// Поиск контактов по имени
export const searchContacts = async (query) => {
  try {
    // Проверяем поддержку API
    if ('contacts' in navigator && 'select' in navigator.contacts) {
      try {
        const props = ['name', 'tel', 'email'];
        const opts = { multiple: true };
        const contacts = await navigator.contacts.select(props, opts);
        
        // Фильтруем контакты локально
        return contacts
          .filter(contact => 
            contact.name.some(name => 
              name.toLowerCase().includes(query.toLowerCase())
            ) ||
            contact.tel.some(phone =>
              phone.includes(query)
            )
          )
          .map(contact => ({
            id: contact.tel[0] || Math.random().toString(), // Используем телефон как ID или генерируем случайный
            name: contact.name[0],
            phones: contact.tel,
            emails: contact.email
          }));
      } catch (error) {
        console.error('Ошибка при работе с контактами:', error);
      }
    }
    
    // Если API не поддерживается или произошла ошибка, ищем в сохраненных контактах
    const response = await axios.get(`/api/contacts/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при поиске контактов:', error);
    throw error;
  }
};

// Импорт контактов
export const importContacts = async () => {
  try {
    const contacts = await navigator.contacts.select([
      'name',
      'tel',
      'email',
      'address'
    ], { multiple: true });
    
    // Отправляем контакты на сервер для сохранения
    const response = await axios.post('/api/contacts/import', { contacts });
    return response.data;
  } catch (error) {
    console.error('Ошибка при импорте контактов:', error);
    throw error;
  }
};

// Получение контактов из Telegram
export const fetchTelegramContacts = async () => {
  try {
    const response = await axios.get('/api/contacts/telegram');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении контактов:', error);
    throw error;
  }
};

// Импорт дней рождения из контактов
export const importBirthdays = async (contacts) => {
  try {
    const response = await axios.post('/api/contacts/import-birthdays', { contacts });
    return response.data;
  } catch (error) {
    console.error('Ошибка при импорте дней рождения:', error);
    throw error;
  }
}; 
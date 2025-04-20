import axios from 'axios';

// Запрос разрешения на доступ к контактам
export const requestContactsPermission = async () => {
  try {
    const permission = await navigator.permissions.query({ name: 'contacts' });
    if (permission.state === 'granted') {
      return true;
    }
    
    const contacts = await navigator.contacts.select([
      'name',
      'tel',
      'email',
      'address'
    ], { multiple: true });
    
    // Сохраняем контакты на сервере
    await axios.post('/api/contacts/sync', { contacts });
    
    return true;
  } catch (error) {
    console.error('Ошибка при запросе доступа к контактам:', error);
    throw error;
  }
};

// Поиск контактов по имени
export const searchContacts = async (query) => {
  try {
    // Сначала пытаемся искать в локальных контактах
    const permission = await navigator.permissions.query({ name: 'contacts' });
    
    if (permission.state === 'granted') {
      const contacts = await navigator.contacts.select([
        'name',
        'tel',
        'email',
        'address'
      ], { multiple: true });
      
      // Фильтруем контакты локально
      return contacts.filter(contact => 
        contact.name.some(name => 
          name.toLowerCase().includes(query.toLowerCase())
        )
      ).map(contact => ({
        id: contact.tel[0], // Используем первый телефон как ID
        name: contact.name[0],
        phones: contact.tel,
        emails: contact.email,
        address: contact.address?.[0]
      }));
    }
    
    // Если нет разрешения, ищем в сохраненных на сервере контактах
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
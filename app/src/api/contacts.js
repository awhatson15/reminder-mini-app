import axios from 'axios';

let cachedContacts = null;

// Проверка поддержки API
const checkContactsSupport = () => {
  // Проверяем наличие API
  if (!('contacts' in navigator)) {
    throw new Error('Ваш браузер не поддерживает работу с контактами');
  }
  
  // Проверяем HTTPS
  if (window.location.protocol !== 'https:') {
    throw new Error('Для работы с контактами требуется защищенное соединение (HTTPS)');
  }
  
  // Проверяем поддержку метода select
  if (!('select' in navigator.contacts)) {
    throw new Error('Ваш браузер не поддерживает выбор контактов');
  }
};

// Запрос разрешения и импорт контактов
export const requestContactsPermission = async () => {
  try {
    // Проверяем поддержку API
    checkContactsSupport();

    const props = ['name', 'tel', 'email'];
    const opts = { multiple: true };

    console.log('Запрашиваем контакты...');
    
    try {
      // Запрашиваем контакты у пользователя
      const contacts = await navigator.contacts.select(props, opts);
      console.log('Получены контакты:', contacts);

      if (!contacts || contacts.length === 0) {
        console.log('Контакты не выбраны');
        return false;
      }

      // Проверяем, что у контактов есть нужные поля
      const validContacts = contacts.filter(contact => 
        contact.name?.length > 0 && contact.tel?.length > 0
      );

      if (validContacts.length === 0) {
        throw new Error('Не найдено контактов с именем и телефоном');
      }

      // Сохраняем в кэш
      cachedContacts = validContacts;
      
      // Сохраняем контакты на сервере
      await axios.post('/api/contacts/sync', { contacts: validContacts });
      console.log('Контакты успешно сохранены');
      
      return true;
    } catch (error) {
      if (error.name === 'SecurityError') {
        throw new Error('Доступ к контактам запрещен. Пожалуйста, разрешите доступ в настройках браузера.');
      }
      if (error.name === 'InvalidStateError') {
        throw new Error('Не удалось открыть выбор контактов. Возможно, окно уже открыто.');
      }
      throw error;
    }
  } catch (error) {
    console.error('Ошибка при запросе доступа к контактам:', error);
    throw error;
  }
};

// Поиск контактов по имени
export const searchContacts = async (query) => {
  try {
    // Если есть кэшированные контакты, ищем в них
    if (cachedContacts) {
      return cachedContacts
        .filter(contact => 
          contact.name.some(name => 
            name.toLowerCase().includes(query.toLowerCase())
          ) ||
          contact.tel.some(phone =>
            phone.includes(query)
          )
        )
        .map(contact => ({
          id: contact.tel[0] || Math.random().toString(),
          name: contact.name[0],
          phones: contact.tel,
          emails: contact.email
        }));
    }
    
    // Если нет кэшированных контактов, ищем на сервере
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
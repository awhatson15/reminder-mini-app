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

// Запрос контактов через Telegram Web App
export const requestContactsPermission = async () => {
  try {
    // Проверяем доступность Telegram Web App
    if (!window.Telegram?.WebApp) {
      throw new Error('Telegram Web App не доступен');
    }

    console.log('Запрашиваем контакты через Telegram...');
    
    try {
      // Запрашиваем контакты через Telegram
      const result = await window.Telegram.WebApp.requestContact();
      console.log('Получен контакт:', result);

      if (!result) {
        console.log('Контакт не выбран');
        return false;
      }

      // Формируем контакт
      const contact = {
        name: [result.first_name + (result.last_name ? ' ' + result.last_name : '')],
        tel: [result.phone_number],
        id: result.phone_number
      };

      // Сохраняем в кэш
      cachedContacts = [contact];
      
      // Сохраняем контакт на сервере
      await axios.post('/api/contacts/sync', { contacts: [contact] });
      console.log('Контакт успешно сохранен');
      
      return true;
    } catch (error) {
      console.error('Ошибка при запросе контакта:', error);
      throw new Error('Не удалось получить контакт. Пожалуйста, разрешите доступ.');
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
          id: contact.id,
          name: contact.name[0],
          phones: contact.tel
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
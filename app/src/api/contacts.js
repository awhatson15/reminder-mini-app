import axios from 'axios';

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

// Поиск контактов по имени
export const searchContacts = async (query) => {
  try {
    const response = await axios.get(`/api/contacts/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при поиске контактов:', error);
    throw error;
  }
}; 
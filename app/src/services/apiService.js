import axios from 'axios';

// Создание экземпляра axios с базовыми настройками
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Перехватчик для обработки ошибок
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Логирование ошибок
    console.error('API Error:', error.response || error.message);
    
    // Можно добавить глобальную обработку ошибок здесь
    // Например, показать уведомление пользователю
    
    return Promise.reject(error);
  }
);

// Методы для работы с напоминаниями
export const reminderService = {
  // Получить все напоминания пользователя
  getAll: async (telegramId) => {
    const response = await apiClient.get(`/api/reminders?telegramId=${telegramId}`);
    return response.data;
  },
  
  // Получить одно напоминание по ID
  getById: async (id) => {
    const response = await apiClient.get(`/api/reminders/${id}`);
    return response.data;
  },
  
  // Создать новое напоминание
  create: async (reminderData) => {
    const response = await apiClient.post('/api/reminders', reminderData);
    return response.data;
  },
  
  // Обновить существующее напоминание
  update: async (id, reminderData) => {
    const response = await apiClient.put(`/api/reminders/${id}`, reminderData);
    return response.data;
  },
  
  // Удалить напоминание
  delete: async (id) => {
    const response = await apiClient.delete(`/api/reminders/${id}`);
    return response.data;
  }
};

// Методы для работы с пользователями
export const userService = {
  // Регистрация или обновление пользователя
  register: async (userData) => {
    const response = await apiClient.post('/api/users', userData);
    return response.data;
  },
  
  // Получить пользователя по ID
  getById: async (id) => {
    const response = await apiClient.get(`/api/users/${id}`);
    return response.data;
  }
};

export default {
  reminderService,
  userService
}; 
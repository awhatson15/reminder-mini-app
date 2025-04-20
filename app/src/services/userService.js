import axios from 'axios';

// Создание экземпляра axios с базовыми настройками
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Перехватчик для обработки ошибок
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('User API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Ключи для хранения данных
const STORAGE_KEYS = {
  user: 'user_data',
  session: 'user_session',
  preferences: 'user_preferences'
};

// Инициализация данных пользователя из локального хранилища
const initUserFromStorage = () => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.user);
    return userData ? JSON.parse(userData) : null;
  } catch (e) {
    console.error('Ошибка при чтении данных пользователя из хранилища:', e);
    return null;
  }
};

// Инициализация данных сессии из локального хранилища
const initSessionFromStorage = () => {
  try {
    const sessionData = localStorage.getItem(STORAGE_KEYS.session);
    return sessionData ? JSON.parse(sessionData) : null;
  } catch (e) {
    console.error('Ошибка при чтении данных сессии из хранилища:', e);
    return null;
  }
};

// Кэш для хранения данных пользователя
const userCache = {
  currentUser: initUserFromStorage(),
  preferences: null,
  session: initSessionFromStorage(),
  lastActivity: Date.now()
};

// Обновить метку последней активности
const updateLastActivity = () => {
  userCache.lastActivity = Date.now();
  if (userCache.session) {
    userCache.session.lastActivity = Date.now();
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(userCache.session));
  }
};

// Обновляем активность при взаимодействии пользователя со страницей
window.addEventListener('click', updateLastActivity);
window.addEventListener('keypress', updateLastActivity);
window.addEventListener('scroll', updateLastActivity);
window.addEventListener('touchstart', updateLastActivity);

// Проверить, истекла ли сессия (например, 30 минут неактивности)
const isSessionExpired = () => {
  if (!userCache.session || !userCache.session.lastActivity) return true;
  
  const expirationTime = 30 * 60 * 1000; // 30 минут в миллисекундах
  const now = Date.now();
  return (now - userCache.session.lastActivity) > expirationTime;
};

// Автоматическая проверка активности сессии каждые 5 минут
setInterval(() => {
  if (userCache.currentUser && isSessionExpired()) {
    // Сессия истекла, выполняем выход
    userService.logout()
      .then(() => {
        // Перенаправление на страницу входа или вывод уведомления
        if (window.location.pathname !== '/login') {
          alert('Сессия истекла. Пожалуйста, войдите снова.');
          window.location.href = '/login';
        }
      })
      .catch(error => {
        console.error('Ошибка при автоматическом выходе:', error);
      });
  }
}, 5 * 60 * 1000); // Проверка каждые 5 минут

// Очистка данных пользователя при выходе
const clearUserData = () => {
  userCache.currentUser = null;
  userCache.preferences = null;
  userCache.session = null;
  
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem(STORAGE_KEYS.session);
  localStorage.removeItem(STORAGE_KEYS.preferences);
};

// Сервис для работы с пользователями
export const userService = {
  // Получить текущего пользователя
  getCurrentUser: () => {
    return userCache.currentUser;
  },
  
  // Аутентификация пользователя по данным Telegram WebApp
  authenticateWithTelegram: async (telegramData) => {
    try {
      const response = await apiClient.post('/api/users/auth/telegram', telegramData);
      
      // Сохраняем данные пользователя и сессии
      userCache.currentUser = response.data.user;
      userCache.session = {
        token: response.data.token,
        lastActivity: Date.now()
      };
      
      // Сохраняем в локальное хранилище
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userCache.currentUser));
      localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(userCache.session));
      
      // Устанавливаем токен в заголовки по умолчанию
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      return response.data;
    } catch (error) {
      clearUserData();
      throw error;
    }
  },
  
  // Запрос данных текущего пользователя с сервера
  fetchCurrentUser: async () => {
    // Если токен отсутствует, возвращаем null
    if (!userCache.session || !userCache.session.token) {
      return null;
    }
    
    try {
      // Устанавливаем токен в заголовки
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${userCache.session.token}`;
      
      const response = await apiClient.get('/api/users/me');
      
      // Обновляем данные пользователя
      userCache.currentUser = response.data;
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userCache.currentUser));
      
      return response.data;
    } catch (error) {
      // Если получили 401 или 403, очищаем данные пользователя
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        clearUserData();
      }
      
      throw error;
    }
  },
  
  // Обновление данных пользователя
  updateUserProfile: async (userData) => {
    if (!userCache.currentUser) {
      throw new Error('Пользователь не аутентифицирован');
    }
    
    try {
      const response = await apiClient.put(`/api/users/${userCache.currentUser._id}`, userData);
      
      // Обновляем данные пользователя
      userCache.currentUser = response.data;
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userCache.currentUser));
      
      return response.data;
    } catch (error) {
      // Если получили 401 или 403, очищаем данные пользователя
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        clearUserData();
      }
      
      throw error;
    }
  },
  
  // Получение настроек пользователя
  getUserPreferences: async () => {
    // Проверяем кэш настроек
    if (userCache.preferences) {
      return userCache.preferences;
    }
    
    if (!userCache.currentUser) {
      return null;
    }
    
    try {
      const response = await apiClient.get(`/api/users/${userCache.currentUser._id}/preferences`);
      
      // Сохраняем настройки в кэш
      userCache.preferences = response.data;
      localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(userCache.preferences));
      
      return response.data;
    } catch (error) {
      // Если получили 401 или 403, очищаем данные пользователя
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        clearUserData();
      }
      
      throw error;
    }
  },
  
  // Обновление настроек пользователя
  updateUserPreferences: async (preferencesData) => {
    if (!userCache.currentUser) {
      throw new Error('Пользователь не аутентифицирован');
    }
    
    try {
      const response = await apiClient.put(
        `/api/users/${userCache.currentUser._id}/preferences`,
        preferencesData
      );
      
      // Обновляем настройки в кэше
      userCache.preferences = response.data;
      localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(userCache.preferences));
      
      return response.data;
    } catch (error) {
      // Если получили 401 или 403, очищаем данные пользователя
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        clearUserData();
      }
      
      throw error;
    }
  },
  
  // Выход пользователя
  logout: async () => {
    // Отправляем запрос на выход только если есть токен
    if (userCache.session && userCache.session.token) {
      try {
        await apiClient.post('/api/users/logout');
      } catch (error) {
        console.error('Ошибка при выходе:', error);
      }
    }
    
    // Очищаем данные независимо от результата
    clearUserData();
    
    // Удаляем токен из заголовков
    delete apiClient.defaults.headers.common['Authorization'];
    
    return { success: true };
  },
  
  // Проверка валидности сессии
  checkSession: () => {
    // Проверяем наличие пользователя и сессии
    if (!userCache.currentUser || !userCache.session) {
      return false;
    }
    
    // Проверяем срок действия сессии
    return !isSessionExpired();
  },
  
  // Обновление токена сессии
  refreshToken: async () => {
    if (!userCache.session || !userCache.session.token) {
      throw new Error('Нет доступного токена для обновления');
    }
    
    try {
      const response = await apiClient.post('/api/users/refresh-token');
      
      // Обновляем данные сессии
      userCache.session = {
        token: response.data.token,
        lastActivity: Date.now()
      };
      
      // Сохраняем в локальное хранилище
      localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(userCache.session));
      
      // Обновляем токен в заголовках
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      return response.data;
    } catch (error) {
      // Если получили 401 или 403, очищаем данные пользователя
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        clearUserData();
      }
      
      throw error;
    }
  },
  
  // Получение статистики пользователя
  getUserStats: async () => {
    if (!userCache.currentUser) {
      throw new Error('Пользователь не аутентифицирован');
    }
    
    try {
      const response = await apiClient.get(`/api/users/${userCache.currentUser._id}/stats`);
      return response.data;
    } catch (error) {
      // Если получили 401 или 403, очищаем данные пользователя
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        clearUserData();
      }
      
      throw error;
    }
  }
};

// Добавляем перехватчик для автоматического обновления токена при ошибке 401
apiClient.interceptors.response.use(
  response => response,
  async error => {
    // Проверяем, что ошибка связана с истекшим токеном и у нас есть токен для обновления
    if (error.response && error.response.status === 401 && userCache.session && userCache.session.token) {
      // Проверяем, что запрос не является запросом на обновление токена
      const originalRequest = error.config;
      if (!originalRequest._retry && !originalRequest.url.includes('/refresh-token')) {
        originalRequest._retry = true;
        
        try {
          // Пытаемся обновить токен
          const refreshResponse = await userService.refreshToken();
          
          // Если успешно, повторяем исходный запрос с новым токеном
          originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Если не удалось обновить токен, выходим из системы
          await userService.logout();
          
          // Перенаправляем на страницу входа
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default userService; 
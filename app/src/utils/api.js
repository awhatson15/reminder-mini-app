/**
 * Модуль для работы с API
 * Обеспечивает унифицированный интерфейс для выполнения HTTP-запросов
 */

import { showError } from './notification';

// Базовый URL для API
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Таймаут запроса в миллисекундах
const REQUEST_TIMEOUT = 15000;

// Настройки по умолчанию для fetch
const DEFAULT_OPTIONS = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Для отправки cookies с запросами
};

/**
 * Проверяет ответ и преобразует его в JSON или выбрасывает ошибку
 * 
 * @param {Response} response - Ответ fetch
 * @returns {Promise<any>} Данные ответа в формате JSON
 * @throws {Error} Если ответ не успешен
 */
const handleResponse = async (response) => {
  // Получаем тело ответа (JSON или текст)
  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  // Если ответ успешен, возвращаем данные
  if (response.ok) {
    return data;
  }

  // Если ответ неуспешен, формируем ошибку
  const error = new Error(
    typeof data === 'object' && data.message ? data.message : 'Ошибка при выполнении запроса'
  );
  
  // Добавляем дополнительную информацию к ошибке
  error.status = response.status;
  error.statusText = response.statusText;
  error.data = data;
  
  throw error;
};

/**
 * Обрабатывает ошибки запросов
 * 
 * @param {Error} error - Объект ошибки
 * @param {boolean} showNotification - Показывать ли уведомление об ошибке
 * @returns {Error} Обработанная ошибка
 */
const handleError = (error, showNotification = true) => {
  // Определяем сообщение об ошибке
  let errorMessage = 'Произошла ошибка при выполнении запроса';
  
  if (error.name === 'AbortError') {
    errorMessage = 'Запрос был отменен из-за превышения времени ожидания';
  } else if (error.message) {
    errorMessage = error.message;
  }

  // Добавляем информацию о статусе, если доступна
  if (error.status) {
    const statusMessages = {
      400: 'Неверный запрос',
      401: 'Требуется авторизация',
      403: 'Доступ запрещен',
      404: 'Ресурс не найден',
      429: 'Слишком много запросов',
      500: 'Внутренняя ошибка сервера',
      502: 'Ошибка шлюза',
      503: 'Сервис недоступен',
      504: 'Шлюз не отвечает'
    };

    const statusMessage = statusMessages[error.status] || `Ошибка (${error.status})`;
    
    // Если у нас есть более конкретное сообщение об ошибке, используем его
    if (error.data && error.data.message && error.data.message !== errorMessage) {
      errorMessage = `${statusMessage}: ${error.data.message}`;
    } else {
      errorMessage = statusMessage;
    }
  }

  // Показываем уведомление, если это требуется
  if (showNotification) {
    showError(errorMessage);
  }

  // Устанавливаем сообщение об ошибке и возвращаем ошибку
  error.displayMessage = errorMessage;
  
  // Логируем ошибку в консоль для отладки
  console.error('API Error:', error);
  
  return error;
};

/**
 * Выполняет HTTP-запрос
 * 
 * @param {string} url - URL-адрес запроса
 * @param {Object} options - Опции запроса
 * @param {boolean} showErrorNotification - Показывать ли уведомление об ошибке
 * @returns {Promise<any>} Результат запроса
 * @throws {Error} Если запрос завершается ошибкой
 */
const fetchWithTimeout = async (url, options = {}, showErrorNotification = true) => {
  // Создаем контроллер для возможности отмены запроса по таймауту
  const controller = new AbortController();
  const { signal } = controller;
  
  // Устанавливаем таймер для отмены запроса
  const timeout = setTimeout(() => {
    controller.abort();
  }, options.timeout || REQUEST_TIMEOUT);
  
  try {
    // Выполняем запрос с сигналом отмены
    const response = await fetch(url, { ...options, signal });
    // Обрабатываем ответ
    return await handleResponse(response);
  } catch (error) {
    // Обрабатываем ошибку
    throw handleError(error, showErrorNotification);
  } finally {
    // Очищаем таймер отмены запроса
    clearTimeout(timeout);
  }
};

/**
 * Объединяет базовый URL и путь запроса
 * 
 * @param {string} path - Путь запроса
 * @returns {string} Полный URL запроса
 */
const getFullUrl = (path) => {
  // Удаляем лишние слеши
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const normalizedBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  
  return `${normalizedBase}/${normalizedPath}`;
};

/**
 * Выполняет GET-запрос
 * 
 * @param {string} path - Путь запроса
 * @param {Object} [params={}] - Параметры запроса
 * @param {Object} [options={}] - Дополнительные опции запроса
 * @param {boolean} [showErrorNotification=true] - Показывать ли уведомление об ошибке
 * @returns {Promise<any>} Результат запроса
 */
export const get = async (path, params = {}, options = {}, showErrorNotification = true) => {
  // Формируем URL с параметрами запроса
  const queryString = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const url = queryString ? `${getFullUrl(path)}?${queryString}` : getFullUrl(path);
  
  // Выполняем запрос
  return fetchWithTimeout(
    url,
    {
      ...DEFAULT_OPTIONS,
      ...options,
      method: 'GET',
    },
    showErrorNotification
  );
};

/**
 * Выполняет POST-запрос
 * 
 * @param {string} path - Путь запроса
 * @param {Object} [data={}] - Тело запроса
 * @param {Object} [options={}] - Дополнительные опции запроса
 * @param {boolean} [showErrorNotification=true] - Показывать ли уведомление об ошибке
 * @returns {Promise<any>} Результат запроса
 */
export const post = async (path, data = {}, options = {}, showErrorNotification = true) => {
  return fetchWithTimeout(
    getFullUrl(path),
    {
      ...DEFAULT_OPTIONS,
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    },
    showErrorNotification
  );
};

/**
 * Выполняет PUT-запрос
 * 
 * @param {string} path - Путь запроса
 * @param {Object} [data={}] - Тело запроса
 * @param {Object} [options={}] - Дополнительные опции запроса
 * @param {boolean} [showErrorNotification=true] - Показывать ли уведомление об ошибке
 * @returns {Promise<any>} Результат запроса
 */
export const put = async (path, data = {}, options = {}, showErrorNotification = true) => {
  return fetchWithTimeout(
    getFullUrl(path),
    {
      ...DEFAULT_OPTIONS,
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    },
    showErrorNotification
  );
};

/**
 * Выполняет PATCH-запрос
 * 
 * @param {string} path - Путь запроса
 * @param {Object} [data={}] - Тело запроса
 * @param {Object} [options={}] - Дополнительные опции запроса
 * @param {boolean} [showErrorNotification=true] - Показывать ли уведомление об ошибке
 * @returns {Promise<any>} Результат запроса
 */
export const patch = async (path, data = {}, options = {}, showErrorNotification = true) => {
  return fetchWithTimeout(
    getFullUrl(path),
    {
      ...DEFAULT_OPTIONS,
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    },
    showErrorNotification
  );
};

/**
 * Выполняет DELETE-запрос
 * 
 * @param {string} path - Путь запроса
 * @param {Object} [options={}] - Дополнительные опции запроса
 * @param {boolean} [showErrorNotification=true] - Показывать ли уведомление об ошибке
 * @returns {Promise<any>} Результат запроса
 */
export const del = async (path, options = {}, showErrorNotification = true) => {
  return fetchWithTimeout(
    getFullUrl(path),
    {
      ...DEFAULT_OPTIONS,
      ...options,
      method: 'DELETE',
    },
    showErrorNotification
  );
};

/**
 * Выполняет запрос с отправкой файлов
 * 
 * @param {string} path - Путь запроса
 * @param {FormData} formData - Данные формы с файлами
 * @param {Object} [options={}] - Дополнительные опции запроса
 * @param {boolean} [showErrorNotification=true] - Показывать ли уведомление об ошибке
 * @returns {Promise<any>} Результат запроса
 */
export const uploadFile = async (path, formData, options = {}, showErrorNotification = true) => {
  // При отправке FormData, Content-Type устанавливается автоматически
  const { headers, ...restOptions } = DEFAULT_OPTIONS;
  const { 'Content-Type': contentType, ...restHeaders } = headers;
  
  return fetchWithTimeout(
    getFullUrl(path),
    {
      ...restOptions,
      headers: restHeaders,
      ...options,
      method: 'POST',
      body: formData,
    },
    showErrorNotification
  );
};

/**
 * Очищает кэш API
 * @param {string} [endpoint] - Конечная точка API (если не указана, очищается весь кэш)
 * @param {string} [method] - HTTP-метод (если не указан, очищается кэш для всех методов)
 * @returns {void}
 */
export const clearApiCache = (endpoint, method) => {
  const keyPrefix = endpoint
    ? (method ? `api_cache_${method.toUpperCase()}_${getFullUrl(endpoint)}` : `api_cache_`)
    : 'api_cache_';
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(keyPrefix)) {
      localStorage.removeItem(key);
    }
  }
};

/**
 * Проверяет состояние соединения с сервером
 * @returns {Promise<boolean>} - true, если соединение установлено
 */
export const checkServerConnection = async () => {
  try {
    const response = await fetch(getFullUrl('/health'), {
      method: 'GET',
      headers: DEFAULT_OPTIONS.headers,
      signal: AbortSignal.timeout(3000) // Короткий таймаут для проверки
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Интерфейс API для работы с напоминаниями
 */
export const remindersApi = {
  /**
   * Получает список напоминаний
   * @param {object} [params] - Параметры запроса
   * @param {object} [options] - Настройки запроса
   * @returns {Promise<any>} - Результат запроса
   */
  getReminders: (params, options) => get('/reminders', params, { cache: true, ...options }),
  
  /**
   * Получает напоминание по ID
   * @param {string} id - ID напоминания
   * @param {object} [options] - Настройки запроса
   * @returns {Promise<any>} - Результат запроса
   */
  getReminder: (id, options) => get(`/reminders/${id}`, null, { cache: true, ...options }),
  
  /**
   * Создает новое напоминание
   * @param {object} data - Данные напоминания
   * @param {object} [options] - Настройки запроса
   * @returns {Promise<any>} - Результат запроса
   */
  createReminder: (data, options) => post('/reminders', data, options),
  
  /**
   * Обновляет напоминание
   * @param {string} id - ID напоминания
   * @param {object} data - Данные для обновления
   * @param {object} [options] - Настройки запроса
   * @returns {Promise<any>} - Результат запроса
   */
  updateReminder: (id, data, options) => put(`/reminders/${id}`, data, options),
  
  /**
   * Удаляет напоминание
   * @param {string} id - ID напоминания
   * @param {object} [options] - Настройки запроса
   * @returns {Promise<any>} - Результат запроса
   */
  deleteReminder: (id, options) => del(`/reminders/${id}`, null, options),
  
  /**
   * Отмечает напоминание как выполненное
   * @param {string} id - ID напоминания
   * @param {object} [options] - Настройки запроса
   * @returns {Promise<any>} - Результат запроса
   */
  completeReminder: (id, options) => patch(`/reminders/${id}/complete`, null, options),
  
  /**
   * Восстанавливает напоминание
   * @param {string} id - ID напоминания
   * @param {object} [options] - Настройки запроса
   * @returns {Promise<any>} - Результат запроса
   */
  restoreReminder: (id, options) => patch(`/reminders/${id}/restore`, null, options),
  
  /**
   * Получает статистику по напоминаниям
   * @param {object} [params] - Параметры запроса
   * @param {object} [options] - Настройки запроса
   * @returns {Promise<any>} - Результат запроса
   */
  getStatistics: (params, options) => get('/reminders/statistics', params, { cache: true, ...options })
};

/**
 * Интерфейс API для работы с пользователем
 */
export const userApi = {
  /**
   * Получает данные текущего пользователя
   * @param {object} [options] - Настройки запроса
   * @returns {Promise<any>} - Результат запроса
   */
  getProfile: (options) => get('/users/profile', null, { cache: true, ...options }),
  
  /**
   * Обновляет данные пользователя
   * @param {object} data - Данные для обновления
   * @param {object} [options] - Настройки запроса
   * @returns {Promise<any>} - Результат запроса
   */
  updateProfile: (data, options) => put('/users/profile', data, options),
  
  /**
   * Обновляет настройки пользователя
   * @param {object} data - Настройки
   * @param {object} [options] - Настройки запроса
   * @returns {Promise<any>} - Результат запроса
   */
  updateSettings: (data, options) => put('/users/settings', data, options),
  
  /**
   * Получает настройки пользователя
   * @param {object} [options] - Настройки запроса
   * @returns {Promise<any>} - Результат запроса
   */
  getSettings: (options) => get('/users/settings', null, { cache: true, ...options })
};

/**
 * Интерфейс API для работы с уведомлениями
 */
export const notificationsApi = {
  /**
   * Получает список уведомлений
   * @param {object} [params] - Параметры запроса
   * @param {object} [options] - Настройки запроса
   * @returns {Promise<any>} - Результат запроса
   */
  getNotifications: (params, options) => get('/notifications', params, { cache: true, ...options }),
  
  /**
   * Отмечает уведомление как прочитанное
   * @param {string} id - ID уведомления
   * @param {object} [options] - Настройки запроса
   * @returns {Promise<any>} - Результат запроса
   */
  markAsRead: (id, options) => patch(`/notifications/${id}/read`, null, options),
  
  /**
   * Отмечает все уведомления как прочитанные
   * @param {object} [options] - Настройки запроса
   * @returns {Promise<any>} - Результат запроса
   */
  markAllAsRead: (options) => patch('/notifications/read-all', null, options)
}; 
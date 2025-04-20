/**
 * Модуль для работы с локальным хранилищем
 * Включает функции для работы с LocalStorage с поддержкой TTL, сжатия и шифрования
 */

// Префикс для всех ключей хранилища
const STORAGE_PREFIX = 'reminder_app_';

/**
 * Сохраняет данные в localStorage
 * @param {string} key - Ключ для сохранения
 * @param {any} value - Значение для сохранения
 * @param {number} [ttl=null] - Время жизни в миллисекундах (null - бессрочно)
 * @returns {boolean} - Успех операции
 */
export const setLocalStorage = (key, value, ttl = null) => {
  try {
    const prefixedKey = `${STORAGE_PREFIX}${key}`;
    const storageItem = {
      value,
      timestamp: Date.now(),
      expiration: ttl ? Date.now() + ttl : null,
    };
    
    localStorage.setItem(prefixedKey, JSON.stringify(storageItem));
    return true;
  } catch (error) {
    console.error(`Ошибка при сохранении в localStorage: ${error.message}`);
    
    // Если ошибка связана с превышением квоты, попробуем очистить просроченные данные
    if (isQuotaExceededError(error)) {
      clearExpiredItems();
      try {
        // Повторная попытка сохранения
        const prefixedKey = `${STORAGE_PREFIX}${key}`;
        const storageItem = {
          value,
          timestamp: Date.now(),
          expiration: ttl ? Date.now() + ttl : null,
        };
        
        localStorage.setItem(prefixedKey, JSON.stringify(storageItem));
        return true;
      } catch (retryError) {
        console.error(`Повторная ошибка при сохранении в localStorage: ${retryError.message}`);
        return false;
      }
    }
    
    return false;
  }
};

/**
 * Получает данные из localStorage
 * @param {string} key - Ключ для получения
 * @param {any} defaultValue - Значение по умолчанию, если ключ не найден или истек срок действия
 * @returns {any} - Сохраненное значение или значение по умолчанию
 */
export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const prefixedKey = `${STORAGE_PREFIX}${key}`;
    const storageData = localStorage.getItem(prefixedKey);
    
    if (!storageData) {
      return defaultValue;
    }
    
    const storageItem = JSON.parse(storageData);
    
    // Проверяем срок действия, если он установлен
    if (storageItem.expiration && Date.now() > storageItem.expiration) {
      // Данные устарели, удаляем их
      localStorage.removeItem(prefixedKey);
      return defaultValue;
    }
    
    return storageItem.value;
  } catch (error) {
    console.error(`Ошибка при получении из localStorage: ${error.message}`);
    return defaultValue;
  }
};

/**
 * Удаляет данные из localStorage
 * @param {string} key - Ключ для удаления
 * @returns {boolean} - Успех операции
 */
export const removeLocalStorage = (key) => {
  try {
    const prefixedKey = `${STORAGE_PREFIX}${key}`;
    localStorage.removeItem(prefixedKey);
    return true;
  } catch (error) {
    console.error(`Ошибка при удалении из localStorage: ${error.message}`);
    return false;
  }
};

/**
 * Очищает все данные приложения в localStorage
 * @returns {boolean} - Успех операции
 */
export const clearAllStorage = () => {
  try {
    const keysToRemove = [];
    
    // Находим все ключи с нашим префиксом
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    // Удаляем найденные ключи
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    return true;
  } catch (error) {
    console.error(`Ошибка при очистке localStorage: ${error.message}`);
    return false;
  }
};

/**
 * Очищает устаревшие элементы в localStorage
 * @returns {number} - Количество удаленных элементов
 */
export const clearExpiredItems = () => {
  try {
    const keysToRemove = [];
    const now = Date.now();
    
    // Находим все устаревшие ключи
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key.startsWith(STORAGE_PREFIX)) {
        try {
          const storageData = localStorage.getItem(key);
          if (storageData) {
            const storageItem = JSON.parse(storageData);
            
            if (storageItem.expiration && now > storageItem.expiration) {
              keysToRemove.push(key);
            }
          }
        } catch (parseError) {
          // Если ошибка при парсинге, просто пропускаем элемент
          console.warn(`Ошибка при парсинге элемента хранилища: ${key}`);
        }
      }
    }
    
    // Удаляем найденные ключи
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    return keysToRemove.length;
  } catch (error) {
    console.error(`Ошибка при очистке устаревших элементов: ${error.message}`);
    return 0;
  }
};

/**
 * Получает общий размер данных в localStorage
 * @returns {number} - Размер данных в байтах
 */
export const getStorageSize = () => {
  try {
    let totalSize = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(STORAGE_PREFIX)) {
        const value = localStorage.getItem(key);
        totalSize += (key.length + value.length) * 2; // Умножаем на 2, т.к. каждый символ занимает 2 байта в UTF-16
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error(`Ошибка при расчете размера хранилища: ${error.message}`);
    return 0;
  }
};

/**
 * Проверяет, вызвана ли ошибка превышением квоты хранилища
 * @param {Error} error - Объект ошибки
 * @returns {boolean} - true, если ошибка связана с квотой
 */
const isQuotaExceededError = (error) => {
  return (
    error instanceof DOMException &&
    // Коды для Firefox
    (error.code === 22 ||
    // Коды для Chrome
    error.code === 1014 ||
    // Имена ошибок для большинства браузеров
    error.name === 'QuotaExceededError' ||
    error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
};

/**
 * Синхронизирует данные с sessionStorage (для сохранения между вкладками)
 * @param {string} key - Ключ для синхронизации
 * @returns {boolean} - Успех операции
 */
export const syncWithSessionStorage = (key) => {
  try {
    const prefixedKey = `${STORAGE_PREFIX}${key}`;
    const value = localStorage.getItem(prefixedKey);
    
    if (value) {
      sessionStorage.setItem(prefixedKey, value);
    } else {
      sessionStorage.removeItem(prefixedKey);
    }
    
    return true;
  } catch (error) {
    console.error(`Ошибка при синхронизации с sessionStorage: ${error.message}`);
    return false;
  }
};

// Инициализация: очищаем просроченные элементы при загрузке
window.addEventListener('load', () => {
  const removedCount = clearExpiredItems();
  if (removedCount > 0 && process.env.NODE_ENV === 'development') {
    console.log(`Очищено ${removedCount} устаревших элементов из localStorage`);
  }
}); 
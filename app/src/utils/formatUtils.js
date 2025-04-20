/**
 * Утилиты для форматирования данных в приложении
 */

/**
 * Форматирует дату в локализованную строку
 * @param {Date|string|number} date - дата для форматирования
 * @param {Object} options - параметры форматирования
 * @returns {string} отформатированная дата
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    return dateObj.toLocaleDateString('ru-RU', mergedOptions);
  } catch (error) {
    console.error('Ошибка форматирования даты:', error);
    return dateObj.toLocaleDateString('ru-RU');
  }
};

/**
 * Форматирует время в локализованную строку
 * @param {Date|string|number} date - дата для форматирования времени
 * @param {Object} options - параметры форматирования
 * @returns {string} отформатированное время
 */
export const formatTime = (date, options = {}) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    return dateObj.toLocaleTimeString('ru-RU', mergedOptions);
  } catch (error) {
    console.error('Ошибка форматирования времени:', error);
    return dateObj.toLocaleTimeString('ru-RU');
  }
};

/**
 * Форматирует дату и время в локализованную строку
 * @param {Date|string|number} date - дата для форматирования
 * @param {Object} options - параметры форматирования
 * @returns {string} отформатированная дата и время
 */
export const formatDateTime = (date, options = {}) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    return dateObj.toLocaleString('ru-RU', mergedOptions);
  } catch (error) {
    console.error('Ошибка форматирования даты и времени:', error);
    return dateObj.toLocaleString('ru-RU');
  }
};

/**
 * Форматирует дату в относительный формат (сегодня, вчера, завтра и т.д.)
 * @param {Date|string|number} date - дата для форматирования
 * @returns {string} отформатированная относительная дата
 */
export const formatRelativeDate = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  
  const diffDays = Math.round((dateDay - today) / (1000 * 60 * 60 * 24));
  
  switch (diffDays) {
    case -1:
      return 'Вчера';
    case 0:
      return 'Сегодня';
    case 1:
      return 'Завтра';
    default:
      if (diffDays > 0 && diffDays < 7) {
        const options = { weekday: 'long' };
        return dateObj.toLocaleDateString('ru-RU', options);
      }
      return formatDate(date, { day: 'numeric', month: 'long' });
  }
};

/**
 * Форматирует число с разделителями групп разрядов
 * @param {number} num - число для форматирования
 * @param {Object} options - параметры форматирования
 * @returns {string} отформатированное число
 */
export const formatNumber = (num, options = {}) => {
  if (num === null || num === undefined) return '';
  
  const defaultOptions = {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    return new Intl.NumberFormat('ru-RU', mergedOptions).format(num);
  } catch (error) {
    console.error('Ошибка форматирования числа:', error);
    return num.toString();
  }
};

/**
 * Форматирует число в денежный формат
 * @param {number} num - число для форматирования
 * @param {string} currency - код валюты (RUB, USD, EUR и т.д.)
 * @param {Object} options - параметры форматирования
 * @returns {string} отформатированная денежная сумма
 */
export const formatCurrency = (num, currency = 'RUB', options = {}) => {
  if (num === null || num === undefined) return '';
  
  const defaultOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    return new Intl.NumberFormat('ru-RU', mergedOptions).format(num);
  } catch (error) {
    console.error('Ошибка форматирования валюты:', error);
    return num.toString();
  }
};

/**
 * Форматирует число в процентный формат
 * @param {number} num - число для форматирования (0.01 = 1%)
 * @param {Object} options - параметры форматирования
 * @returns {string} отформатированный процент
 */
export const formatPercent = (num, options = {}) => {
  if (num === null || num === undefined) return '';
  
  const defaultOptions = {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    return new Intl.NumberFormat('ru-RU', mergedOptions).format(num);
  } catch (error) {
    console.error('Ошибка форматирования процента:', error);
    return `${num * 100}%`;
  }
};

/**
 * Форматирует строку в формат с первой заглавной буквой
 * @param {string} str - строка для форматирования
 * @returns {string} отформатированная строка
 */
export const capitalizeFirstLetter = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Форматирует строку в camelCase
 * @param {string} str - строка для форматирования
 * @returns {string} отформатированная строка
 */
export const toCamelCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
};

/**
 * Форматирует строку в snake_case
 * @param {string} str - строка для форматирования
 * @returns {string} отформатированная строка
 */
export const toSnakeCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .replace(/\s+/g, '_')
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
};

/**
 * Форматирует строку в kebab-case
 * @param {string} str - строка для форматирования
 * @returns {string} отформатированная строка
 */
export const toKebabCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .replace(/\s+/g, '-')
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
};

/**
 * Обрезает строку до указанной длины и добавляет многоточие, если необходимо
 * @param {string} str - строка для форматирования
 * @param {number} maxLength - максимальная длина
 * @param {string} suffix - суффикс для обрезанных строк
 * @returns {string} отформатированная строка
 */
export const truncateString = (str, maxLength, suffix = '...') => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= maxLength) return str;
  
  return str.substring(0, maxLength) + suffix;
};

/**
 * Форматирует размер файла в человекочитаемый формат
 * @param {number} bytes - размер в байтах
 * @param {number} decimals - количество десятичных знаков
 * @returns {string} отформатированный размер
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Байт';
  if (!bytes || isNaN(bytes)) return '';
  
  const k = 1024;
  const sizes = ['Байт', 'КБ', 'МБ', 'ГБ', 'ТБ', 'ПБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * Форматирует длительность в человекочитаемый формат
 * @param {number} seconds - длительность в секундах
 * @returns {string} отформатированная длительность
 */
export const formatDuration = (seconds) => {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return '';
  
  seconds = Math.floor(seconds);
  
  if (seconds < 60) {
    return `${seconds} сек.`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    const remainingSeconds = seconds % 60;
    return `${minutes} мин.${remainingSeconds > 0 ? ` ${remainingSeconds} сек.` : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return `${hours} ч.${remainingMinutes > 0 ? ` ${remainingMinutes} мин.` : ''}`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return `${days} д.${remainingHours > 0 ? ` ${remainingHours} ч.` : ''}`;
};

/**
 * Форматирует телефонный номер в красивый формат
 * @param {string} phone - телефонный номер
 * @returns {string} отформатированный телефонный номер
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Очищаем номер от всего, кроме цифр
  const cleaned = phone.replace(/\D/g, '');
  
  // Проверяем, что это российский номер
  if (cleaned.length === 11 && (cleaned.startsWith('7') || cleaned.startsWith('8'))) {
    const countryCode = '+7';
    const areaCode = cleaned.substring(1, 4);
    const firstPart = cleaned.substring(4, 7);
    const secondPart = cleaned.substring(7, 9);
    const thirdPart = cleaned.substring(9, 11);
    
    return `${countryCode} (${areaCode}) ${firstPart}-${secondPart}-${thirdPart}`;
  }
  
  // Если формат не распознан, возвращаем как есть
  return phone;
};

/**
 * Форматирует имя пользователя с заменой пустых значений
 * @param {Object} user - объект пользователя
 * @param {string} fallback - значение по умолчанию
 * @returns {string} отформатированное имя пользователя
 */
export const formatUserName = (user, fallback = 'Пользователь') => {
  if (!user) return fallback;
  
  const { firstName, lastName, username } = user;
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  
  if (firstName) {
    return firstName;
  }
  
  if (username) {
    return username;
  }
  
  return fallback;
};

/**
 * Форматирует оставшееся время до указанной даты
 * @param {Date|string|number} targetDate - целевая дата
 * @returns {string} отформатированное оставшееся время
 */
export const formatTimeRemaining = (targetDate) => {
  if (!targetDate) return '';
  
  const target = new Date(targetDate);
  if (isNaN(target.getTime())) return '';
  
  const now = new Date();
  
  // Если дата уже прошла
  if (target < now) {
    return 'Время истекло';
  }
  
  const diffMs = target - now;
  const diffSeconds = Math.floor(diffMs / 1000);
  
  // Меньше минуты
  if (diffSeconds < 60) {
    return 'Меньше минуты';
  }
  
  const diffMinutes = Math.floor(diffSeconds / 60);
  
  // Меньше часа
  if (diffMinutes < 60) {
    return `${diffMinutes} мин.`;
  }
  
  const diffHours = Math.floor(diffMinutes / 60);
  
  // Меньше суток
  if (diffHours < 24) {
    const remainingMinutes = diffMinutes % 60;
    return `${diffHours} ч. ${remainingMinutes} мин.`;
  }
  
  const diffDays = Math.floor(diffHours / 24);
  
  // Меньше недели
  if (diffDays < 7) {
    const remainingHours = diffHours % 24;
    return `${diffDays} д. ${remainingHours} ч.`;
  }
  
  // Для более длительных периодов используем относительное форматирование
  return formatRelativeDate(target);
};

/**
 * Форматирует дату напоминания для отображения пользователю
 * @param {Date|string|number} reminderDate - дата напоминания
 * @returns {string} отформатированная дата напоминания
 */
export const formatReminderDate = (reminderDate) => {
  const date = new Date(reminderDate);
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const reminderDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // Получаем время
  const time = formatTime(date);
  
  // Разница в днях
  const diffDays = Math.round((reminderDay - today) / (1000 * 60 * 60 * 24));
  
  // Сегодня
  if (diffDays === 0) {
    return `Сегодня в ${time}`;
  }
  
  // Завтра
  if (diffDays === 1) {
    return `Завтра в ${time}`;
  }
  
  // На этой неделе (до 6 дней вперед)
  if (diffDays > 0 && diffDays < 7) {
    const options = { weekday: 'long' };
    const dayName = date.toLocaleDateString('ru-RU', options);
    return `${capitalizeFirstLetter(dayName)} в ${time}`;
  }
  
  // Более далёкие даты
  return `${formatDate(date)} в ${time}`;
}; 
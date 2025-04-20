import { plural } from './textUtils';

/**
 * Массив названий месяцев в родительном падеже для форматирования дат
 */
const MONTH_NAMES = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

/**
 * Кэш для мемоизации результатов вычисления дней до даты
 */
const daysUntilCache = new Map();

/**
 * Форматирует дату из объекта напоминания
 * @param {Object} reminder - объект напоминания
 * @returns {string} форматированная дата
 */
export const getFormattedDateFromReminder = (reminder) => {
  if (!reminder || !reminder.date) return '';
  
  const { day, month, year } = reminder.date;
  
  return `${day} ${MONTH_NAMES[month - 1]}${year ? ` ${year} г.` : ''}`;
};

/**
 * Форматирует дату с относительным представлением (сегодня, завтра)
 * @param {Object} date - объект даты из напоминания (с полями day, month, year)
 * @returns {string} форматированная дата с относительным представлением
 */
export const getRelativeDateString = (date) => {
  if (!date) return '';
  
  const daysUntil = getDaysUntil(date);
  const { day, month, year } = date;
  
  // Форматированная дата
  const formattedDate = `${day} ${MONTH_NAMES[month - 1]}${year ? ` ${year} г.` : ''}`;
  
  // Добавляем относительное значение
  if (daysUntil === 0) {
    return `Сегодня (${formattedDate})`;
  } else if (daysUntil === 1) {
    return `Завтра (${formattedDate})`;
  } else if (daysUntil === 2) {
    return `Послезавтра (${formattedDate})`;
  } else if (daysUntil <= 7) {
    return `Через ${daysUntil} ${plural(daysUntil, 'день', 'дня', 'дней')} (${formattedDate})`;
  }
  
  return formattedDate;
};

/**
 * Генерирует ключ для кэша на основе даты
 * @param {Object} date - объект даты
 * @returns {string} ключ для кэша
 */
const getCacheKey = (date) => {
  if (!date) return '';
  const now = new Date();
  return `${date.day}-${date.month}-${date.year || ''}-${now.getDate()}-${now.getMonth()}-${now.getFullYear()}`;
};

/**
 * Вычисляет количество дней до даты напоминания с мемоизацией результатов
 * @param {Object} date - объект даты из напоминания (с полями day, month, year)
 * @returns {number} количество дней до даты
 */
export const getDaysUntil = (date) => {
  if (!date) return 0;
  
  // Проверяем кэш
  const cacheKey = getCacheKey(date);
  if (daysUntilCache.has(cacheKey)) {
    return daysUntilCache.get(cacheKey);
  }
  
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Нормализуем время для точного расчета
  
  const eventDate = new Date();
  eventDate.setHours(0, 0, 0, 0); // Нормализуем время
  
  eventDate.setDate(date.day);
  eventDate.setMonth(date.month - 1);
  
  // Если есть год, используем его
  if (date.year) {
    eventDate.setFullYear(date.year);
  } else {
    // Для дней рождения без года
    // Если дата уже прошла в этом году, берем следующий год
    if (
      eventDate.getMonth() < now.getMonth() ||
      (eventDate.getMonth() === now.getMonth() && eventDate.getDate() < now.getDate())
    ) {
      eventDate.setFullYear(now.getFullYear() + 1);
    } else {
      eventDate.setFullYear(now.getFullYear());
    }
  }
  
  // Разница в днях (используем Math.max чтобы не было отрицательных значений)
  const diffTime = Math.max(0, eventDate - now);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Сохраняем в кэш (ограничиваем размер кэша)
  if (daysUntilCache.size > 100) {
    // Если кэш слишком большой, очищаем его
    daysUntilCache.clear();
  }
  daysUntilCache.set(cacheKey, diffDays);
  
  return diffDays;
};

/**
 * Очищает кэш дней до даты
 * Может использоваться при изменении напоминаний или смене дня
 */
export const clearDaysUntilCache = () => {
  daysUntilCache.clear();
};

/**
 * Форматирует дату в соответствии с российским форматом
 * @param {Date|string|number} date - дата для форматирования
 * @param {boolean} includeTime - включать ли время
 * @returns {string} отформатированная дата
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  let result = `${day}.${month}.${year}`;
  
  if (includeTime) {
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    result += ` ${hours}:${minutes}`;
  }
  
  return result;
};

/**
 * Проверяет, является ли дата сегодняшней
 * @param {Date|string|number} date - проверяемая дата
 * @returns {boolean} - true, если дата - сегодня
 */
export const isToday = (date) => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return false;
  
  const today = new Date();
  
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Проверяет, является ли дата завтрашней
 * @param {Date|string|number} date - проверяемая дата
 * @returns {boolean} - true, если дата - завтра
 */
export const isTomorrow = (date) => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return false;
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return (
    dateObj.getDate() === tomorrow.getDate() &&
    dateObj.getMonth() === tomorrow.getMonth() &&
    dateObj.getFullYear() === tomorrow.getFullYear()
  );
};

/**
 * Форматирует относительную дату (сегодня, завтра, через N дней)
 * @param {Date|string|number} date - дата для форматирования
 * @param {Object} options - опции форматирования
 * @returns {string} - отформатированная относительная дата
 */
export const formatRelativeDate = (date, options = {}) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const {
    showTime = true,
    fullFormat = false,
  } = options;
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  
  if (dateOnly.getTime() === today.getTime()) {
    return 'Сегодня';
  } else if (dateOnly.getTime() === yesterday.getTime()) {
    return 'Вчера';
  } else if (dateOnly.getTime() === tomorrow.getTime()) {
    return 'Завтра';
  } else {
    return formatDate(date);
  }
};

/**
 * Форматирует время из даты
 * @param {Date|string|number} date - дата для форматирования
 * @param {boolean} showSeconds - показывать ли секунды
 * @returns {string} - отформатированное время
 */
export const formatTime = (date, showSeconds = false) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const seconds = dateObj.getSeconds();
  
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
  let result = `${hours}:${minutesStr}`;
  
  if (showSeconds) {
    const secondsStr = seconds < 10 ? `0${seconds}` : seconds;
    result += `:${secondsStr}`;
  }
  
  return result;
};

/**
 * Получает timestamp для начала дня
 * @param {Date|string|number} date - исходная дата
 * @returns {number} - timestamp начала дня
 */
export const getDayStart = (date = new Date()) => {
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj.getTime();
};

/**
 * Получает timestamp для конца дня
 * @param {Date|string|number} date - исходная дата
 * @returns {number} - timestamp конца дня
 */
export const getDayEnd = (date = new Date()) => {
  const dateObj = new Date(date);
  dateObj.setHours(23, 59, 59, 999);
  return dateObj.getTime();
};

/**
 * Добавляет дни к дате
 * @param {Date|string|number} date - исходная дата
 * @param {number} days - количество дней для добавления
 * @returns {Date} - новая дата
 */
export const addDays = (date, days) => {
  const dateObj = new Date(date);
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
};

/**
 * Добавляет указанное количество часов к дате
 * @param {Date|string|number} date - исходная дата
 * @param {number} hours - количество часов для добавления
 * @returns {Date} новая дата
 */
export const addHours = (date, hours) => {
  const dateObj = new Date(date);
  dateObj.setHours(dateObj.getHours() + hours);
  return dateObj;
};

/**
 * Добавляет указанное количество минут к дате
 * @param {Date|string|number} date - исходная дата
 * @param {number} minutes - количество минут для добавления
 * @returns {Date} новая дата
 */
export const addMinutes = (date, minutes) => {
  const dateObj = new Date(date);
  dateObj.setMinutes(dateObj.getMinutes() + minutes);
  return dateObj;
};

/**
 * Возвращает разницу между датами в днях
 * @param {Date|string|number} date1 - первая дата
 * @param {Date|string|number} date2 - вторая дата
 * @returns {number} разница в днях
 */
export const getDaysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Проверяет, находится ли дата в прошлом
 * @param {Date|string|number} date - дата для проверки
 * @returns {boolean} true если дата в прошлом
 */
export const isPastDate = (date) => {
  const dateObj = new Date(date);
  const now = new Date();
  return dateObj < now;
};

/**
 * Проверяет, находится ли дата в будущем
 * @param {Date|string|number} date - дата для проверки
 * @returns {boolean} true если дата в будущем
 */
export const isFutureDate = (date) => {
  const dateObj = new Date(date);
  const now = new Date();
  return dateObj > now;
};

/**
 * Получает начало дня для указанной даты
 * @param {Date|string|number} date - исходная дата
 * @returns {Date} дата с временем 00:00:00
 */
export const startOfDay = (date) => {
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
};

/**
 * Получает конец дня для указанной даты
 * @param {Date|string|number} date - исходная дата
 * @returns {Date} дата с временем 23:59:59
 */
export const endOfDay = (date) => {
  const dateObj = new Date(date);
  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
};

/**
 * Проверяет, находится ли дата в указанном диапазоне
 * @param {Date|string|number} date - дата для проверки
 * @param {Date|string|number} startDate - начало диапазона
 * @param {Date|string|number} endDate - конец диапазона
 * @returns {boolean} true если дата в диапазоне
 */
export const isDateInRange = (date, startDate, endDate) => {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return d >= start && d <= end;
};

/**
 * Возвращает локализованное название месяца
 * @param {Date|string|number} date - дата
 * @param {boolean} short - использовать сокращенное название
 * @returns {string} название месяца
 */
export const getMonthName = (date, short = false) => {
  const dateObj = new Date(date);
  const months = short 
    ? ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'] 
    : ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  
  return months[dateObj.getMonth()];
};

/**
 * Возвращает локализованное название дня недели
 * @param {Date|string|number} date - дата
 * @param {boolean} short - использовать сокращенное название
 * @returns {string} название дня недели
 */
export const getWeekdayName = (date, short = false) => {
  const dateObj = new Date(date);
  const weekdays = short 
    ? ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'] 
    : ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  
  return weekdays[dateObj.getDay()];
};

/**
 * Форматирует дату в красивом виде (например, "1 января 2023")
 * @param {Date|string|number} date - дата для форматирования
 * @param {boolean} includeWeekday - включать ли день недели
 * @returns {string} отформатированная дата
 */
export const formatDatePretty = (date, includeWeekday = false) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const day = dateObj.getDate();
  const month = getMonthName(dateObj);
  const year = dateObj.getFullYear();
  
  let result = `${day} ${month} ${year}`;
  
  if (includeWeekday) {
    const weekday = getWeekdayName(dateObj);
    result = `${weekday}, ${result}`;
  }
  
  return result;
};

/**
 * Рассчитывает оставшееся время до даты в удобном для чтения формате
 * @param {Date|string|number} date - целевая дата
 * @returns {string} - оставшееся время
 */
export const getTimeLeft = (date) => {
  if (!date) return '';
  
  const target = new Date(date);
  if (isNaN(target.getTime())) return '';
  
  const now = new Date();
  const diff = target - now;
  
  if (diff <= 0) return 'Время истекло';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days} ${plural(days, 'день', 'дня', 'дней')} ${hours} ${plural(hours, 'час', 'часа', 'часов')}`;
  }
  
  if (hours > 0) {
    return `${hours} ${plural(hours, 'час', 'часа', 'часов')} ${minutes} ${plural(minutes, 'минута', 'минуты', 'минут')}`;
  }
  
  return `${minutes} ${plural(minutes, 'минута', 'минуты', 'минут')}`;
};

/**
 * Проверяет, истек ли срок действия даты
 * 
 * @param {Date|string} date - дата для проверки
 * @returns {boolean} true если срок истек
 */
export const isExpired = (date) => {
  if (!date) return true;
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return true;
  
  return new Date() > d;
};

/**
 * Форматирует дату для отображения в напоминании
 * 
 * @param {Date|string} date - дата для форматирования
 * @returns {string} дата для напоминания
 */
export const formatReminderDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Сегодня
  if (d.setHours(0,0,0,0) === now.setHours(0,0,0,0)) {
    return 'Сегодня';
  }
  
  // Завтра
  if (d.setHours(0,0,0,0) === tomorrow.setHours(0,0,0,0)) {
    return 'Завтра';
  }
  
  // Менее недели
  const diffMs = d - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays > 0 && diffDays < 7) {
    const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    return dayNames[d.getDay()];
  }
  
  // Более недели
  return formatDate(d);
}; 
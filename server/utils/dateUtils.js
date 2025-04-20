const { plural } = require('./textUtils');

/**
 * Массив названий месяцев в родительном падеже для форматирования дат
 */
const MONTH_NAMES = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

/**
 * Массив названий дней недели
 */
const WEEKDAY_NAMES = [
  'Воскресенье', 'Понедельник', 'Вторник', 'Среда', 
  'Четверг', 'Пятница', 'Суббота'
];

/**
 * Получает текущую дату в формате ISO
 * @returns {string} текущая дата в ISO формате
 */
const getCurrentISODate = () => new Date().toISOString();

/**
 * Форматирует дату в строку по шаблону DD.MM.YYYY
 * 
 * @param {Date|string|number} date - дата для форматирования
 * @returns {string} отформатированная дата
 */
const formatDate = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '';
  }
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}.${month}.${year}`;
};

/**
 * Форматирует время в строку по шаблону HH:MM
 * 
 * @param {Date|string|number} date - дата для форматирования
 * @returns {string} отформатированное время
 */
const formatTime = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '';
  }
  
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

/**
 * Форматирует дату и время в строку по шаблону DD.MM.YYYY HH:MM
 * 
 * @param {Date|string|number} date - дата для форматирования
 * @returns {string} отформатированная дата и время
 */
const formatDateTime = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '';
  }
  
  return `${formatDate(d)} ${formatTime(d)}`;
};

/**
 * Возвращает название месяца по его номеру
 * 
 * @param {number} monthIndex - индекс месяца (0-11)
 * @returns {string} название месяца
 */
const getMonthName = (monthIndex) => {
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  
  return months[monthIndex] || '';
};

/**
 * Форматирует дату и время в формате "день месяц год, часы:минуты"
 * 
 * @param {Date|string|number} date - дата для форматирования
 * @returns {string} форматированная дата и время
 */
const formatDateTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const formattedDate = formatDate(d);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return `${formattedDate}, ${hours}:${minutes}`;
};

/**
 * Возвращает относительное время (только что, 5 минут назад, и т.д.)
 * 
 * @param {Date|string|number} date - дата для форматирования
 * @returns {string} относительное время
 */
const getRelativeTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const diff = now - d;
  
  // Меньше минуты
  if (diff < 60 * 1000) {
    return 'только что';
  }
  
  // Меньше часа
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes} ${pluralizeMinutes(minutes)} назад`;
  }
  
  // Меньше суток
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours} ${pluralizeHours(hours)} назад`;
  }
  
  // Меньше недели
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days} ${pluralizeDays(days)} назад`;
  }
  
  // Иначе возвращаем дату
  return formatDate(d);
};

/**
 * Склоняет слово "минута" в зависимости от числа
 * 
 * @param {number} count - количество минут
 * @returns {string} склоненное слово
 */
const pluralizeMinutes = (count) => {
  if (count % 10 === 1 && count % 100 !== 11) {
    return 'минуту';
  }
  
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return 'минуты';
  }
  
  return 'минут';
};

/**
 * Склоняет слово "час" в зависимости от числа
 * 
 * @param {number} count - количество часов
 * @returns {string} склоненное слово
 */
const pluralizeHours = (count) => {
  if (count % 10 === 1 && count % 100 !== 11) {
    return 'час';
  }
  
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return 'часа';
  }
  
  return 'часов';
};

/**
 * Склоняет слово "день" в зависимости от числа
 * 
 * @param {number} count - количество дней
 * @returns {string} склоненное слово
 */
const pluralizeDays = (count) => {
  if (count % 10 === 1 && count % 100 !== 11) {
    return 'день';
  }
  
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return 'дня';
  }
  
  return 'дней';
};

/**
 * Проверяет, является ли дата сегодняшней
 * 
 * @param {Date|string|number} date - проверяемая дата
 * @returns {boolean} true, если дата сегодняшняя
 */
const isToday = (date) => {
  if (!date) return false;
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;
  
  const today = new Date();
  
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
};

/**
 * Проверяет, является ли дата вчерашней
 * 
 * @param {Date|string|number} date - проверяемая дата
 * @returns {boolean} true, если дата вчерашняя
 */
const isYesterday = (date) => {
  if (!date) return false;
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return d.getDate() === yesterday.getDate() &&
         d.getMonth() === yesterday.getMonth() &&
         d.getFullYear() === yesterday.getFullYear();
};

/**
 * Получает начало дня для указанной даты
 * 
 * @param {Date|string|number} date - исходная дата
 * @returns {Date} дата начала дня
 */
const getStartOfDay = (date) => {
  if (!date) return new Date();
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return new Date();
  
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Получает конец дня для указанной даты
 * 
 * @param {Date|string|number} date - исходная дата
 * @returns {Date} дата конца дня
 */
const getEndOfDay = (date) => {
  if (!date) return new Date();
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return new Date();
  
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Форматирует даты относительно текущего момента
 * 
 * @param {Date|string|number} date - дата для форматирования
 * @returns {string} форматированная дата
 */
const formatDateRelative = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  if (isToday(d)) {
    return `сегодня в ${formatTime(d)}`;
  }
  
  if (isYesterday(d)) {
    return `вчера в ${formatTime(d)}`;
  }
  
  return formatDateTime(d);
};

/**
 * Добавляет указанное количество дней к дате
 * 
 * @param {Date|string|number} date - исходная дата
 * @param {number} days - количество дней для добавления
 * @returns {Date} новая дата
 */
const addDays = (date, days) => {
  if (!date) return new Date();
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return new Date();
  
  d.setDate(d.getDate() + days);
  return d;
};

/**
 * Вычисляет разницу между датами в днях
 * 
 * @param {Date|string|number} date1 - первая дата
 * @param {Date|string|number} date2 - вторая дата
 * @returns {number} разница в днях
 */
const getDaysDiff = (date1, date2) => {
  if (!date1 || !date2) return 0;
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
  
  // Нормализация дат (удаление времени)
  const startDate = getStartOfDay(d1);
  const endDate = getStartOfDay(d2);
  
  // Вычисление разницы
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Проверяет, находится ли дата в прошлом
 * 
 * @param {Date|string|number} date - проверяемая дата
 * @returns {boolean} true, если дата в прошлом
 */
const isPast = (date) => {
  if (!date) return false;
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;
  
  return d < new Date();
};

/**
 * Проверяет, находится ли дата в будущем
 * 
 * @param {Date|string|number} date - проверяемая дата
 * @returns {boolean} true, если дата в будущем
 */
const isFuture = (date) => {
  if (!date) return false;
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;
  
  return d > new Date();
};

/**
 * Форматирует длительность в формате HH:MM:SS
 * 
 * @param {number} durationMs - длительность в миллисекундах
 * @returns {string} форматированная длительность
 */
const formatDuration = (durationMs) => {
  if (!durationMs || durationMs < 0) return '00:00:00';
  
  const seconds = Math.floor((durationMs / 1000) % 60);
  const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
  const hours = Math.floor((durationMs / (1000 * 60 * 60)));
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':');
};

/**
 * Преобразует дату в строку ISO 8601
 * 
 * @param {Date|string|number} date - дата для преобразования
 * @returns {string} дата в формате ISO 8601
 */
const toISOString = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  return d.toISOString();
};

/**
 * Возвращает день недели для указанной даты
 * 
 * @param {Date|string|number} date - дата
 * @returns {string} название дня недели
 */
const getDayOfWeek = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  return days[d.getDay()];
};

/**
 * Преобразует строку с датой в объект Date
 * 
 * @param {string} dateString - строка с датой в различных форматах
 * @returns {Date|null} объект Date или null при ошибке
 */
const parseDate = (dateString) => {
  if (!dateString) return null;
  
  // Пробуем стандартный парсер
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // Формат "DD.MM.YYYY"
  const ddmmyyyy = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
  const ddmmyyyyMatch = dateString.match(ddmmyyyy);
  if (ddmmyyyyMatch) {
    const [_, day, month, year] = ddmmyyyyMatch;
    return new Date(year, month - 1, day);
  }
  
  // Формат "DD.MM.YYYY HH:MM"
  const ddmmyyyyhhmm = /^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{1,2})$/;
  const ddmmyyyyhhmmMatch = dateString.match(ddmmyyyyhhmm);
  if (ddmmyyyyhhmmMatch) {
    const [_, day, month, year, hours, minutes] = ddmmyyyyhhmmMatch;
    return new Date(year, month - 1, day, hours, minutes);
  }
  
  return null;
};

/**
 * Преобразует строки даты и времени в объект Date
 * 
 * @param {string} dateString - строка с датой в формате DD.MM.YYYY
 * @param {string} timeString - строка с временем в формате HH:MM
 * @returns {Date|null} объект Date или null, если формат некорректный
 */
const parseDateTime = (dateString, timeString) => {
  const date = parseDate(dateString);
  if (!date) {
    return null;
  }
  
  if (typeof timeString !== 'string') {
    return date;
  }
  
  const parts = timeString.split(':');
  if (parts.length !== 2) {
    return date;
  }
  
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  
  // Проверяем корректность времени
  if (isNaN(hours) || hours < 0 || hours > 23 || isNaN(minutes) || minutes < 0 || minutes > 59) {
    return date;
  }
  
  date.setHours(hours, minutes, 0, 0);
  return date;
};

/**
 * Проверяет, наступила ли дата
 * 
 * @param {Date} date - проверяемая дата
 * @returns {boolean} true, если дата уже наступила
 */
const isDatePassed = (date) => {
  const now = new Date();
  return date < now;
};

/**
 * Проверяет, наступит ли дата в течение указанного количества минут
 * 
 * @param {Date} date - проверяемая дата
 * @param {number} minutes - количество минут
 * @returns {boolean} true, если дата наступит в течение указанного количества минут
 */
const isDateInNextMinutes = (date, minutes) => {
  const now = new Date();
  const future = addMinutes(now, minutes);
  return date >= now && date <= future;
};

/**
 * Вычисляет разницу между двумя датами в днях
 * 
 * @param {Date} dateA - первая дата
 * @param {Date} dateB - вторая дата
 * @returns {number} разница в днях
 */
const getDaysDifference = (dateA, dateB) => {
  const utcDateA = Date.UTC(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
  const utcDateB = Date.UTC(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());
  
  return Math.floor((utcDateB - utcDateA) / (1000 * 60 * 60 * 24));
};

/**
 * Вычисляет разницу между двумя датами в часах
 * 
 * @param {Date} dateA - первая дата
 * @param {Date} dateB - вторая дата
 * @returns {number} разница в часах
 */
const getHoursDifference = (dateA, dateB) => {
  const diffMs = Math.abs(dateB - dateA);
  return Math.floor(diffMs / (1000 * 60 * 60));
};

/**
 * Вычисляет разницу между двумя датами в минутах
 * 
 * @param {Date} dateA - первая дата
 * @param {Date} dateB - вторая дата
 * @returns {number} разница в минутах
 */
const getMinutesDifference = (dateA, dateB) => {
  const diffMs = Math.abs(dateB - dateA);
  return Math.floor(diffMs / (1000 * 60));
};

/**
 * Устанавливает время на начало дня (00:00:00.000)
 * 
 * @param {Date} date - исходная дата
 * @returns {Date} новая дата с временем 00:00:00.000
 */
const setStartOfDay = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Устанавливает время на конец дня (23:59:59.999)
 * 
 * @param {Date} date - исходная дата
 * @returns {Date} новая дата с временем 23:59:59.999
 */
const setEndOfDay = (date) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Проверяет, находится ли дата в пределах указанного диапазона
 * 
 * @param {Date} date - проверяемая дата
 * @param {Date} startDate - начальная дата диапазона
 * @param {Date} endDate - конечная дата диапазона
 * @returns {boolean} true, если дата находится в пределах диапазона
 */
const isDateInRange = (date, startDate, endDate) => {
  return date >= startDate && date <= endDate;
};

/**
 * Возвращает текущую дату с временем 00:00:00.000
 * 
 * @returns {Date} текущая дата с временем 00:00:00.000
 */
const getCurrentDateStart = () => {
  return setStartOfDay(new Date());
};

/**
 * Возвращает текущую дату с временем 23:59:59.999
 * 
 * @returns {Date} текущая дата с временем 23:59:59.999
 */
const getCurrentDateEnd = () => {
  return setEndOfDay(new Date());
};

/**
 * Возвращает название дня недели на русском языке
 * 
 * @param {Date} date - дата
 * @returns {string} название дня недели
 */
const getDayOfWeekName = (date) => {
  const days = [
    'Воскресенье',
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота'
  ];
  
  return days[date.getDay()];
};

/**
 * Возвращает короткое название дня недели на русском языке
 * 
 * @param {Date} date - дата
 * @returns {string} короткое название дня недели
 */
const getShortDayOfWeekName = (date) => {
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  return days[date.getDay()];
};

/**
 * Возвращает название месяца на русском языке
 * 
 * @param {Date} date - дата
 * @returns {string} название месяца
 */
const getMonthName = (date) => {
  const months = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь'
  ];
  
  return months[date.getMonth()];
};

/**
 * Возвращает название месяца в родительном падеже на русском языке
 * 
 * @param {Date} date - дата
 * @returns {string} название месяца в родительном падеже
 */
const getMonthNameGenitive = (date) => {
  const months = [
    'Января',
    'Февраля',
    'Марта',
    'Апреля',
    'Мая',
    'Июня',
    'Июля',
    'Августа',
    'Сентября',
    'Октября',
    'Ноября',
    'Декабря'
  ];
  
  return months[date.getMonth()];
};

/**
 * Форматирует дату как "1 января 2022"
 * 
 * @param {Date} date - дата для форматирования
 * @returns {string} отформатированная дата
 */
const formatDateLong = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '';
  }
  
  const day = d.getDate();
  const month = getMonthNameGenitive(d);
  const year = d.getFullYear();
  
  return `${day} ${month} ${year}`;
};

/**
 * Форматирует относительную дату (сегодня, вчера, завтра или обычный формат)
 * 
 * @param {Date} date - дата для форматирования
 * @returns {string} отформатированная относительная дата
 */
const formatRelativeDate = (date) => {
  const now = new Date();
  const today = setStartOfDay(now);
  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);
  
  const targetDate = setStartOfDay(new Date(date));
  
  if (targetDate.getTime() === today.getTime()) {
    return 'Сегодня';
  } else if (targetDate.getTime() === yesterday.getTime()) {
    return 'Вчера';
  } else if (targetDate.getTime() === tomorrow.getTime()) {
    return 'Завтра';
  } else {
    return formatDate(date);
  }
};

/**
 * Форматирует относительное время (Х минут назад, Х часов назад и т.д.)
 * 
 * @param {Date} date - дата для форматирования
 * @returns {string} отформатированное относительное время
 */
const formatRelativeTime = (date) => {
  const now = new Date();
  const diff = now - date;
  
  // Если разница отрицательная, это будущее время
  if (diff < 0) {
    return formatDateTime(date);
  }
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) {
    return 'только что';
  } else if (minutes < 60) {
    return `${minutes} ${pluralize(minutes, 'минуту', 'минуты', 'минут')} назад`;
  } else if (hours < 24) {
    return `${hours} ${pluralize(hours, 'час', 'часа', 'часов')} назад`;
  } else if (days < 7) {
    return `${days} ${pluralize(days, 'день', 'дня', 'дней')} назад`;
  } else {
    return formatDate(date);
  }
};

/**
 * Вспомогательная функция для склонения слов
 * 
 * @param {number} number - число для склонения
 * @param {string} one - форма для 1, 21, 31, ...
 * @param {string} few - форма для 2-4, 22-24, ...
 * @param {string} many - форма для 5-20, 25-30, ...
 * @returns {string} склонённое слово
 */
const pluralize = (number, one, few, many) => {
  const mod10 = number % 10;
  const mod100 = number % 100;
  
  if (mod100 >= 11 && mod100 <= 19) {
    return many;
  }
  
  if (mod10 === 1) {
    return one;
  }
  
  if (mod10 >= 2 && mod10 <= 4) {
    return few;
  }
  
  return many;
};

/**
 * Возвращает ISO строку без миллисекунд
 * 
 * @param {Date} date - дата
 * @returns {string} ISO строка без миллисекунд
 */
const toISOWithoutMilliseconds = (date) => {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
};

/**
 * Преобразует Unix timestamp в миллисекундах в объект Date
 * 
 * @param {number} timestamp - Unix timestamp в миллисекундах
 * @returns {Date} объект Date
 */
const fromTimestamp = (timestamp) => {
  return new Date(timestamp);
};

/**
 * Преобразует дату в Unix timestamp в миллисекундах
 * 
 * @param {Date} date - дата
 * @returns {number} Unix timestamp в миллисекундах
 */
const toTimestamp = (date) => {
  return date.getTime();
};

module.exports = {
  getCurrentISODate,
  formatDate,
  formatDateTime,
  formatTime,
  getRelativeTime,
  isToday,
  isYesterday,
  getStartOfDay,
  getEndOfDay,
  formatDateRelative,
  addDays,
  getDaysDiff,
  isPast,
  isFuture,
  formatDuration,
  toISOString,
  getDayOfWeek,
  parseDate,
  parseDateTime,
  isDatePassed,
  isDateInNextMinutes,
  getDaysDifference,
  getHoursDifference,
  getMinutesDifference,
  setStartOfDay,
  setEndOfDay,
  isDateInRange,
  getCurrentDateStart,
  getCurrentDateEnd,
  getDayOfWeekName,
  getShortDayOfWeekName,
  getMonthName,
  getMonthNameGenitive,
  formatDateLong,
  formatRelativeDate,
  formatRelativeTime,
  toISOWithoutMilliseconds,
  fromTimestamp,
  toTimestamp
}; 
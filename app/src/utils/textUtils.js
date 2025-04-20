/**
 * Возвращает правильную форму слова в зависимости от числа
 * 
 * @param {number} n - число для которого нужно склонение
 * @param {string} form1 - форма для 1 (день)
 * @param {string} form2 - форма для 2-4 (дня)
 * @param {string} form5 - форма для 5-20 (дней)
 * @returns {string} правильная форма слова
 */
export const plural = (n, form1, form2, form5) => {
  let number = Math.abs(n);
  number %= 100;
  if (number >= 5 && number <= 20) {
    return form5;
  }
  number %= 10;
  if (number === 1) {
    return form1;
  }
  if (number >= 2 && number <= 4) {
    return form2;
  }
  return form5;
};

/**
 * Обрезает текст до указанной длины с добавлением многоточия
 * 
 * @param {string} text - исходный текст
 * @param {number} maxLength - максимальная длина
 * @returns {string} обрезанный текст
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Преобразует первую букву строки в заглавную
 * 
 * @param {string} text - исходный текст
 * @returns {string} текст с заглавной первой буквой
 */
export const capitalizeFirstLetter = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Форматирует строку для отображения в интерфейсе
 * Обрезает до 30 символов и делает первую букву заглавной
 * 
 * @param {string} text - исходный текст
 * @returns {string} отформатированный текст
 */
export const formatDisplayText = (text) => {
  if (!text) return '';
  return capitalizeFirstLetter(truncateText(text, 30));
};

/**
 * Вычисляет, сколько времени осталось прочитать в виде текста
 * 
 * @param {number} minutes - количество минут
 * @returns {string} текст о времени чтения
 */
export const formatReadingTime = (minutes) => {
  if (minutes < 1) return 'Меньше минуты';
  return `${minutes} ${plural(minutes, 'минута', 'минуты', 'минут')} чтения`;
};

/**
 * Форматирует количество в человекочитаемый формат
 * 
 * @param {number} num - число для форматирования
 * @returns {string} отформатированное число
 */
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Извлекает имя пользователя из полного имени
 * 
 * @param {string} fullName - полное имя
 * @returns {string} имя или первая часть полного имени
 */
export const extractFirstName = (fullName) => {
  if (!fullName) return '';
  return fullName.split(' ')[0];
};

/**
 * Удаляет все HTML теги из строки
 * 
 * @param {string} html - строка с HTML
 * @returns {string} текст без HTML тегов
 */
export const stripHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/<\/?[^>]+(>|$)/g, '');
};

/**
 * Возвращает первую букву имени и фамилии для аватара
 * @param {string} name - имя пользователя
 * @returns {string} - инициалы
 */
export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '';
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Форматирует имя пользователя для отображения
 * @param {Object} user - объект пользователя
 * @returns {string} - отформатированное имя
 */
export const formatUserName = (user) => {
  if (!user) return '';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  if (user.firstName) {
    return user.firstName;
  }
  
  if (user.username) {
    return user.username;
  }
  
  return 'Пользователь';
};

/**
 * Преобразует первую букву строки в заглавную
 * @param {string} str - исходная строка
 * @returns {string} - строка с заглавной первой буквой
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Генерирует случайный ID
 * @param {number} length - длина ID
 * @returns {string} - случайный ID
 */
export const generateId = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Функция для склонения слов в зависимости от числа
 * @param {number} number - число для склонения
 * @param {string} one - форма слова для числа 1, 21, 31, ...
 * @param {string} few - форма слова для чисел 2-4, 22-24, ...
 * @param {string} many - форма слова для чисел 5-20, 25-30, ...
 * @returns {string} склоненное слово
 */
export const plural = (number, one, few, many) => {
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
 * Ограничивает длину строки и добавляет многоточие
 * @param {string} text - исходный текст
 * @param {number} maxLength - максимальная длина
 * @param {string} ellipsis - символ многоточия
 * @returns {string} обрезанный текст
 */
export const truncate = (text, maxLength = 100, ellipsis = '...') => {
  if (!text || text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
};

/**
 * Удаляет лишние пробелы из строки
 * @param {string} text - исходный текст
 * @returns {string} текст без лишних пробелов
 */
export const removeExtraSpaces = (text) => {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
};

/**
 * Приводит первую букву строки к верхнему регистру
 * @param {string} text - исходный текст
 * @returns {string} текст с заглавной первой буквой
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Удаляет HTML-теги из строки
 * @param {string} html - исходный HTML-текст
 * @returns {string} чистый текст без тегов
 */
export const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

/**
 * Форматирует число с разделителями групп разрядов
 * @param {number} number - исходное число
 * @param {string} separator - разделитель групп разрядов
 * @returns {string} отформатированное число
 */
export const formatNumber = (number, separator = ' ') => {
  if (number === undefined || number === null) return '';
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

/**
 * Преобразует строку в slug (для URL)
 * @param {string} text - исходный текст
 * @returns {string} slug
 */
export const slugify = (text) => {
  if (!text) return '';
  
  const translitMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
    'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  };

  // Заменяем кириллицу на латиницу и приводим к нижнему регистру
  let result = text.toLowerCase().split('').map(char => 
    translitMap[char] || char
  ).join('');
  
  // Заменяем все неалфавитные и нецифровые символы на дефисы
  result = result.replace(/[^a-z0-9]+/g, '-');
  
  // Удаляем дефисы в начале и конце строки
  return result.replace(/^-+|-+$/g, '');
};

/**
 * Маскирует часть текста (например, для показа личных данных)
 * @param {string} text - исходный текст
 * @param {number} visibleChars - количество видимых символов в начале и конце
 * @param {string} maskChar - символ маски
 * @returns {string} маскированный текст
 */
export const maskText = (text, visibleChars = 2, maskChar = '*') => {
  if (!text || text.length <= visibleChars * 2) return text;
  
  const start = text.slice(0, visibleChars);
  const end = text.slice(-visibleChars);
  const maskLength = text.length - (visibleChars * 2);
  const mask = maskChar.repeat(maskLength);
  
  return `${start}${mask}${end}`;
}; 
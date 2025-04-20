/**
 * Утилиты для работы со строками
 */

/**
 * Проверяет, является ли значение пустой строкой
 * 
 * @param {*} value - проверяемое значение
 * @returns {boolean} true, если строка пустая или null/undefined
 */
const isEmpty = (value) => {
  return value === null || value === undefined || value === '';
};

/**
 * Проверяет, является ли значение непустой строкой
 * 
 * @param {*} value - проверяемое значение
 * @returns {boolean} true, если строка непустая
 */
const isNotEmpty = (value) => {
  return !isEmpty(value);
};

/**
 * Преобразует значение в строку безопасным способом
 * 
 * @param {*} value - значение для преобразования
 * @returns {string} строковое представление
 */
const toString = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  
  return String(value);
};

/**
 * Обрезает строку до указанной длины и добавляет многоточие
 * 
 * @param {string} str - исходная строка
 * @param {number} maxLength - максимальная длина строки
 * @returns {string} обрезанная строка
 */
const truncate = (str, maxLength) => {
  if (!str || str.length <= maxLength) {
    return str;
  }
  
  return str.substring(0, maxLength) + '...';
};

/**
 * Преобразует первый символ строки в верхний регистр
 * 
 * @param {string} str - исходная строка
 * @returns {string} строка с первой заглавной буквой
 */
const capitalize = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Преобразует первый символ строки в нижний регистр
 * 
 * @param {string} str - исходная строка
 * @returns {string} строка с первой строчной буквой
 */
const uncapitalize = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str.charAt(0).toLowerCase() + str.slice(1);
};

/**
 * Преобразует строку в формат camelCase
 * 
 * @param {string} str - исходная строка
 * @returns {string} строка в формате camelCase
 */
const toCamelCase = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
    .replace(/^([A-Z])/, (m) => m.toLowerCase());
};

/**
 * Преобразует строку в формат snake_case
 * 
 * @param {string} str - исходная строка
 * @returns {string} строка в формате snake_case
 */
const toSnakeCase = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
};

/**
 * Преобразует строку в формат kebab-case
 * 
 * @param {string} str - исходная строка
 * @returns {string} строка в формате kebab-case
 */
const toKebabCase = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

/**
 * Преобразует строку в формат PascalCase
 * 
 * @param {string} str - исходная строка
 * @returns {string} строка в формате PascalCase
 */
const toPascalCase = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
    .replace(/^([a-z])/, (m) => m.toUpperCase());
};

/**
 * Заменяет все вхождения подстроки в строке
 * 
 * @param {string} str - исходная строка
 * @param {string} search - искомая подстрока
 * @param {string} replacement - замена
 * @returns {string} строка с произведенными заменами
 */
const replaceAll = (str, search, replacement) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str.split(search).join(replacement);
};

/**
 * Удаляет все HTML-теги из строки
 * 
 * @param {string} str - исходная строка
 * @returns {string} строка без HTML-тегов
 */
const stripTags = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str.replace(/<\/?[^>]+(>|$)/g, '');
};

/**
 * Экранирует специальные символы HTML
 * 
 * @param {string} str - исходная строка
 * @returns {string} строка с экранированными символами
 */
const escapeHtml = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Возвращает дополненную строку заданным символом слева до нужной длины
 * 
 * @param {string} str - исходная строка
 * @param {number} length - требуемая длина
 * @param {string} padChar - символ для заполнения
 * @returns {string} дополненная строка
 */
const padLeft = (str, length, padChar = ' ') => {
  const strValue = toString(str);
  
  if (strValue.length >= length) {
    return strValue;
  }
  
  return padChar.repeat(length - strValue.length) + strValue;
};

/**
 * Возвращает дополненную строку заданным символом справа до нужной длины
 * 
 * @param {string} str - исходная строка
 * @param {number} length - требуемая длина
 * @param {string} padChar - символ для заполнения
 * @returns {string} дополненная строка
 */
const padRight = (str, length, padChar = ' ') => {
  const strValue = toString(str);
  
  if (strValue.length >= length) {
    return strValue;
  }
  
  return strValue + padChar.repeat(length - strValue.length);
};

/**
 * Преобразует строку в массив слов
 * 
 * @param {string} str - исходная строка
 * @param {RegExp|string} separator - разделитель (по умолчанию пробелы)
 * @returns {string[]} массив слов
 */
const toWords = (str, separator = /\s+/) => {
  if (!str || typeof str !== 'string') {
    return [];
  }
  
  return str.trim().split(separator).filter(word => word.length > 0);
};

/**
 * Возвращает количество слов в строке
 * 
 * @param {string} str - исходная строка
 * @returns {number} количество слов
 */
const countWords = (str) => {
  return toWords(str).length;
};

/**
 * Проверяет, содержит ли строка только буквы и цифры
 * 
 * @param {string} str - исходная строка
 * @returns {boolean} true, если строка содержит только буквы и цифры
 */
const isAlphanumeric = (str) => {
  if (!str || typeof str !== 'string') {
    return false;
  }
  
  return /^[a-zA-Z0-9]+$/.test(str);
};

/**
 * Проверяет, содержит ли строка только буквы
 * 
 * @param {string} str - исходная строка
 * @returns {boolean} true, если строка содержит только буквы
 */
const isAlpha = (str) => {
  if (!str || typeof str !== 'string') {
    return false;
  }
  
  return /^[a-zA-Z]+$/.test(str);
};

/**
 * Проверяет, содержит ли строка только цифры
 * 
 * @param {string} str - исходная строка
 * @returns {boolean} true, если строка содержит только цифры
 */
const isNumeric = (str) => {
  if (!str || typeof str !== 'string') {
    return false;
  }
  
  return /^[0-9]+$/.test(str);
};

/**
 * Проверяет, является ли строка валидным адресом электронной почты
 * 
 * @param {string} str - исходная строка
 * @returns {boolean} true, если строка является валидным email
 */
const isEmail = (str) => {
  if (!str || typeof str !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
};

/**
 * Проверяет, является ли строка валидным URL
 * 
 * @param {string} str - исходная строка
 * @returns {boolean} true, если строка является валидным URL
 */
const isUrl = (str) => {
  if (!str || typeof str !== 'string') {
    return false;
  }
  
  try {
    new URL(str);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Преобразует строку в числовое значение безопасным способом
 * 
 * @param {string} str - исходная строка
 * @param {number} defaultValue - значение по умолчанию
 * @returns {number} числовое значение или defaultValue
 */
const toNumber = (str, defaultValue = 0) => {
  if (!str || typeof str !== 'string') {
    return defaultValue;
  }
  
  const num = Number(str);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Преобразует строку в целое число безопасным способом
 * 
 * @param {string} str - исходная строка
 * @param {number} defaultValue - значение по умолчанию
 * @returns {number} целое число или defaultValue
 */
const toInteger = (str, defaultValue = 0) => {
  if (!str || typeof str !== 'string') {
    return defaultValue;
  }
  
  const num = parseInt(str, 10);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Преобразует строку в число с плавающей точкой безопасным способом
 * 
 * @param {string} str - исходная строка
 * @param {number} defaultValue - значение по умолчанию
 * @returns {number} число с плавающей точкой или defaultValue
 */
const toFloat = (str, defaultValue = 0.0) => {
  if (!str || typeof str !== 'string') {
    return defaultValue;
  }
  
  const num = parseFloat(str);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Преобразует строку в булево значение
 * 
 * @param {string} str - исходная строка
 * @returns {boolean} булево значение
 */
const toBoolean = (str) => {
  if (!str || typeof str !== 'string') {
    return false;
  }
  
  const lowercaseStr = str.toLowerCase();
  return lowercaseStr === 'true' || lowercaseStr === '1' || lowercaseStr === 'yes';
};

/**
 * Генерирует случайную строку указанной длины
 * 
 * @param {number} length - длина строки
 * @param {string} charset - набор символов для генерации (по умолчанию буквы и цифры)
 * @returns {string} случайная строка
 */
const generateRandomString = (length, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  if (length <= 0) {
    return '';
  }
  
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset.charAt(randomIndex);
  }
  
  return result;
};

/**
 * Проверяет, начинается ли строка с указанной подстроки
 * 
 * @param {string} str - исходная строка
 * @param {string} prefix - префикс
 * @returns {boolean} true, если строка начинается с указанного префикса
 */
const startsWith = (str, prefix) => {
  if (!str || typeof str !== 'string' || !prefix) {
    return false;
  }
  
  return str.startsWith(prefix);
};

/**
 * Проверяет, заканчивается ли строка указанной подстрокой
 * 
 * @param {string} str - исходная строка
 * @param {string} suffix - суффикс
 * @returns {boolean} true, если строка заканчивается указанным суффиксом
 */
const endsWith = (str, suffix) => {
  if (!str || typeof str !== 'string' || !suffix) {
    return false;
  }
  
  return str.endsWith(suffix);
};

/**
 * Удаляет пробельные символы в начале и конце строки
 * 
 * @param {string} str - исходная строка
 * @returns {string} строка без пробельных символов в начале и конце
 */
const trim = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str.trim();
};

/**
 * Удаляет пробельные символы в начале строки
 * 
 * @param {string} str - исходная строка
 * @returns {string} строка без пробельных символов в начале
 */
const trimLeft = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str.trimStart();
};

/**
 * Удаляет пробельные символы в конце строки
 * 
 * @param {string} str - исходная строка
 * @returns {string} строка без пробельных символов в конце
 */
const trimRight = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str.trimEnd();
};

/**
 * Преобразует все символы строки в верхний регистр
 * 
 * @param {string} str - исходная строка
 * @returns {string} строка в верхнем регистре
 */
const toUpperCase = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str.toUpperCase();
};

/**
 * Преобразует все символы строки в нижний регистр
 * 
 * @param {string} str - исходная строка
 * @returns {string} строка в нижнем регистре
 */
const toLowerCase = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str.toLowerCase();
};

/**
 * Выполняет слияние двух строк с разделителем
 * 
 * @param {string} str1 - первая строка
 * @param {string} str2 - вторая строка
 * @param {string} separator - разделитель
 * @returns {string} объединенная строка
 */
const concat = (str1, str2, separator = '') => {
  return toString(str1) + separator + toString(str2);
};

/**
 * Форматирует строку, заменяя плейсхолдеры значениями из объекта
 * 
 * @param {string} template - шаблон строки с плейсхолдерами в формате ${key}
 * @param {Object} params - объект с параметрами для замены
 * @returns {string} отформатированная строка
 */
const format = (template, params) => {
  if (!template || typeof template !== 'string') {
    return '';
  }
  
  if (!params || typeof params !== 'object') {
    return template;
  }
  
  return template.replace(/\${(\w+)}/g, (match, key) => {
    return params[key] !== undefined ? toString(params[key]) : match;
  });
};

module.exports = {
  isEmpty,
  isNotEmpty,
  toString,
  truncate,
  capitalize,
  uncapitalize,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  toPascalCase,
  replaceAll,
  stripTags,
  escapeHtml,
  padLeft,
  padRight,
  toWords,
  countWords,
  isAlphanumeric,
  isAlpha,
  isNumeric,
  isEmail,
  isUrl,
  toNumber,
  toInteger,
  toFloat,
  toBoolean,
  generateRandomString,
  startsWith,
  endsWith,
  trim,
  trimLeft,
  trimRight,
  toUpperCase,
  toLowerCase,
  concat,
  format
}; 
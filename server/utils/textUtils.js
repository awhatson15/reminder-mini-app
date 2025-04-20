/**
 * Склоняет слово в зависимости от числа
 * 
 * @param {number} count - число для склонения
 * @param {string} one - форма для 1
 * @param {string} few - форма для 2-4
 * @param {string} many - форма для 5-20
 * @returns {string} склоненное слово
 */
const plural = (count, one, few, many) => {
  if (count === undefined || count === null) return many;
  
  if (Math.abs(count) % 100 > 10 && Math.abs(count) % 100 < 20) {
    return many;
  }
  
  const remainder = Math.abs(count) % 10;
  
  if (remainder === 1) {
    return one;
  }
  
  if (remainder >= 2 && remainder <= 4) {
    return few;
  }
  
  return many;
};

/**
 * Обрезает текст до максимальной длины с добавлением многоточия
 * 
 * @param {string} text - текст для обрезки
 * @param {number} maxLength - максимальная длина
 * @returns {string} обрезанный текст
 */
const truncate = (text, maxLength = 100) => {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength - 3) + '...';
};

/**
 * Форматирует число с разделителями тысяч
 * 
 * @param {number} number - число для форматирования
 * @param {string} delimiter - разделитель тысяч
 * @returns {string} форматированное число
 */
const formatNumber = (number, delimiter = ' ') => {
  if (number === undefined || number === null || isNaN(number)) return '0';
  
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
};

/**
 * Форматирует денежную сумму
 * 
 * @param {number} amount - сумма для форматирования
 * @param {string} currency - символ валюты
 * @returns {string} форматированная сумма
 */
const formatCurrency = (amount, currency = '₽') => {
  if (amount === undefined || amount === null || isNaN(amount)) return `0 ${currency}`;
  
  return `${formatNumber(amount)} ${currency}`;
};

/**
 * Преобразует первую букву строки в заглавную
 * 
 * @param {string} text - строка для преобразования
 * @returns {string} строка с заглавной первой буквой
 */
const capitalize = (text) => {
  if (!text) return '';
  
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Проверяет, является ли строка допустимым email
 * 
 * @param {string} email - строка для проверки
 * @returns {boolean} true, если строка является допустимым email
 */
const isValidEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Генерирует случайную строку
 * 
 * @param {number} length - длина строки
 * @returns {string} случайная строка
 */
const generateRandomString = (length = 10) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset.charAt(randomIndex);
  }
  
  return result;
};

/**
 * Экранирует HTML-символы для безопасного отображения
 * 
 * @param {string} text - текст для экранирования
 * @returns {string} экранированный текст
 */
const escapeHtml = (text) => {
  if (!text) return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Преобразует строку snake_case в camelCase
 * 
 * @param {string} text - строка в формате snake_case
 * @returns {string} строка в формате camelCase
 */
const snakeToCamel = (text) => {
  if (!text) return '';
  
  return text.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
};

/**
 * Преобразует строку camelCase в snake_case
 * 
 * @param {string} text - строка в формате camelCase
 * @returns {string} строка в формате snake_case
 */
const camelToSnake = (text) => {
  if (!text) return '';
  
  return text.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * Преобразует строку kebab-case в camelCase
 * 
 * @param {string} text - строка в формате kebab-case
 * @returns {string} строка в формате camelCase
 */
const kebabToCamel = (text) => {
  if (!text) return '';
  
  return text.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
};

/**
 * Удаляет дублирующиеся пробелы из строки
 * 
 * @param {string} text - строка для обработки
 * @returns {string} строка без дублирующихся пробелов
 */
const removeExtraSpaces = (text) => {
  if (!text) return '';
  
  return text.replace(/\s+/g, ' ').trim();
};

module.exports = {
  plural,
  truncate,
  formatNumber,
  formatCurrency,
  capitalize,
  isValidEmail,
  generateRandomString,
  escapeHtml,
  snakeToCamel,
  camelToSnake,
  kebabToCamel,
  removeExtraSpaces
}; 
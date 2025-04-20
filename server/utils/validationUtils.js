/**
 * Утилиты для валидации данных
 */

/**
 * Проверяет, не является ли значение undefined или null
 * 
 * @param {*} value - проверяемое значение
 * @returns {boolean} true, если значение определено
 */
const isDefined = (value) => {
  return value !== undefined && value !== null;
};

/**
 * Проверяет, является ли значение пустым (undefined, null, пустая строка, пустой массив или объект)
 * 
 * @param {*} value - проверяемое значение
 * @returns {boolean} true, если значение пустое
 */
const isEmpty = (value) => {
  if (!isDefined(value)) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Проверяет, является ли значение непустым
 * 
 * @param {*} value - проверяемое значение
 * @returns {boolean} true, если значение не пустое
 */
const isNotEmpty = (value) => {
  return !isEmpty(value);
};

/**
 * Проверяет, является ли значение строкой
 * 
 * @param {*} value - проверяемое значение
 * @returns {boolean} true, если значение является строкой
 */
const isString = (value) => {
  return typeof value === 'string';
};

/**
 * Проверяет, является ли значение числом
 * 
 * @param {*} value - проверяемое значение
 * @returns {boolean} true, если значение является числом и не NaN
 */
const isNumber = (value) => {
  return typeof value === 'number' && !isNaN(value);
};

/**
 * Проверяет, является ли значение целым числом
 * 
 * @param {*} value - проверяемое значение
 * @returns {boolean} true, если значение является целым числом
 */
const isInteger = (value) => {
  return isNumber(value) && Number.isInteger(value);
};

/**
 * Проверяет, является ли значение положительным числом
 * 
 * @param {*} value - проверяемое значение
 * @returns {boolean} true, если значение положительное число
 */
const isPositiveNumber = (value) => {
  return isNumber(value) && value > 0;
};

/**
 * Проверяет, является ли значение неотрицательным числом
 * 
 * @param {*} value - проверяемое значение
 * @returns {boolean} true, если значение неотрицательное число
 */
const isNonNegativeNumber = (value) => {
  return isNumber(value) && value >= 0;
};

/**
 * Проверяет, является ли значение булевым
 * 
 * @param {*} value - проверяемое значение
 * @returns {boolean} true, если значение булево
 */
const isBoolean = (value) => {
  return typeof value === 'boolean';
};

/**
 * Проверяет, является ли значение массивом
 * 
 * @param {*} value - проверяемое значение
 * @returns {boolean} true, если значение массив
 */
const isArray = (value) => {
  return Array.isArray(value);
};

/**
 * Проверяет, является ли значение объектом (не null, не массив)
 * 
 * @param {*} value - проверяемое значение
 * @returns {boolean} true, если значение объект
 */
const isObject = (value) => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

/**
 * Проверяет, является ли значение функцией
 * 
 * @param {*} value - проверяемое значение
 * @returns {boolean} true, если значение функция
 */
const isFunction = (value) => {
  return typeof value === 'function';
};

/**
 * Проверяет, является ли значение действительной датой
 * 
 * @param {*} value - проверяемое значение
 * @returns {boolean} true, если значение валидная дата
 */
const isDate = (value) => {
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return !isNaN(value.getTime());
  }
  
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
  
  return false;
};

/**
 * Проверяет, является ли значение действительным адресом электронной почты
 * 
 * @param {string} value - проверяемый email
 * @returns {boolean} true, если значение валидный email
 */
const isEmail = (value) => {
  if (!isString(value)) return false;
  
  // Базовая проверка email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

/**
 * Проверяет, соответствует ли строка указанной минимальной длине
 * 
 * @param {string} value - проверяемая строка
 * @param {number} minLength - минимальная длина
 * @returns {boolean} true, если строка соответствует минимальной длине
 */
const hasMinLength = (value, minLength) => {
  if (!isString(value) || !isInteger(minLength)) return false;
  return value.length >= minLength;
};

/**
 * Проверяет, соответствует ли строка указанной максимальной длине
 * 
 * @param {string} value - проверяемая строка
 * @param {number} maxLength - максимальная длина
 * @returns {boolean} true, если строка соответствует максимальной длине
 */
const hasMaxLength = (value, maxLength) => {
  if (!isString(value) || !isInteger(maxLength)) return false;
  return value.length <= maxLength;
};

/**
 * Проверяет, находится ли число в указанном диапазоне
 * 
 * @param {number} value - проверяемое число
 * @param {number} min - минимальное значение
 * @param {number} max - максимальное значение
 * @returns {boolean} true, если число в диапазоне
 */
const isInRange = (value, min, max) => {
  if (!isNumber(value) || !isNumber(min) || !isNumber(max)) return false;
  return value >= min && value <= max;
};

/**
 * Проверяет, содержится ли значение в указанном массиве
 * 
 * @param {*} value - проверяемое значение
 * @param {Array} array - массив допустимых значений
 * @returns {boolean} true, если значение содержится в массиве
 */
const isInArray = (value, array) => {
  if (!isArray(array)) return false;
  return array.includes(value);
};

/**
 * Проверяет, соответствует ли строка указанному регулярному выражению
 * 
 * @param {string} value - проверяемая строка
 * @param {RegExp} pattern - регулярное выражение
 * @returns {boolean} true, если строка соответствует регулярному выражению
 */
const matchesPattern = (value, pattern) => {
  if (!isString(value) || !(pattern instanceof RegExp)) return false;
  return pattern.test(value);
};

/**
 * Проверяет, является ли значение допустимым URL
 * 
 * @param {string} value - проверяемый URL
 * @returns {boolean} true, если значение валидный URL
 */
const isUrl = (value) => {
  if (!isString(value)) return false;
  
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * Проверяет, содержит ли объект все указанные поля
 * 
 * @param {object} obj - проверяемый объект
 * @param {Array<string>} fields - массив названий обязательных полей
 * @returns {boolean} true, если объект содержит все указанные поля
 */
const hasRequiredFields = (obj, fields) => {
  if (!isObject(obj) || !isArray(fields)) return false;
  
  return fields.every(field => {
    const value = obj[field];
    return isDefined(value) && !isEmpty(value);
  });
};

/**
 * Проверяет, содержит ли объект хотя бы одно из указанных полей
 * 
 * @param {object} obj - проверяемый объект
 * @param {Array<string>} fields - массив названий полей
 * @returns {boolean} true, если объект содержит хотя бы одно из указанных полей
 */
const hasAnyField = (obj, fields) => {
  if (!isObject(obj) || !isArray(fields)) return false;
  
  return fields.some(field => {
    const value = obj[field];
    return isDefined(value) && !isEmpty(value);
  });
};

/**
 * Проверяет, состоит ли строка только из буквенно-цифровых символов
 * 
 * @param {string} value - проверяемая строка
 * @returns {boolean} true, если строка состоит только из буквенно-цифровых символов
 */
const isAlphanumeric = (value) => {
  if (!isString(value)) return false;
  return /^[a-zA-Z0-9]+$/.test(value);
};

/**
 * Проверяет, является ли значение допустимым телефонным номером
 * 
 * @param {string} value - проверяемый телефонный номер
 * @returns {boolean} true, если значение валидный телефонный номер
 */
const isPhoneNumber = (value) => {
  if (!isString(value)) return false;
  
  // Базовая проверка телефонного номера (только цифры, может включать +)
  return /^[+]?[0-9]{10,15}$/.test(value.replace(/\s/g, ''));
};

/**
 * Проверяет, является ли значение валидным MongoDB ObjectId
 * 
 * @param {string} value - проверяемый ObjectId
 * @returns {boolean} true, если значение валидный ObjectId
 */
const isObjectId = (value) => {
  if (!isString(value)) return false;
  return /^[0-9a-fA-F]{24}$/.test(value);
};

/**
 * Проверяет, является ли дата в будущем
 * 
 * @param {Date|string|number} value - проверяемая дата
 * @returns {boolean} true, если дата в будущем
 */
const isFutureDate = (value) => {
  if (!isDate(value)) return false;
  
  const date = new Date(value);
  const now = new Date();
  
  return date > now;
};

/**
 * Проверяет, является ли дата в прошлом
 * 
 * @param {Date|string|number} value - проверяемая дата
 * @returns {boolean} true, если дата в прошлом
 */
const isPastDate = (value) => {
  if (!isDate(value)) return false;
  
  const date = new Date(value);
  const now = new Date();
  
  return date < now;
};

/**
 * Проверяет, является ли строка действительным JSON
 * 
 * @param {string} value - проверяемая строка
 * @returns {boolean} true, если строка валидный JSON
 */
const isValidJson = (value) => {
  if (!isString(value)) return false;
  
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * Проверяет, соответствует ли строка формату времени HH:MM
 * 
 * @param {string} value - проверяемая строка времени
 * @returns {boolean} true, если строка соответствует формату времени
 */
const isTimeFormat = (value) => {
  if (!isString(value)) return false;
  
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(value);
};

/**
 * Проверяет, соответствует ли строка формату даты DD.MM.YYYY
 * 
 * @param {string} value - проверяемая строка даты
 * @returns {boolean} true, если строка соответствует формату даты
 */
const isDateFormat = (value) => {
  if (!isString(value)) return false;
  
  const dateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
  
  if (!dateRegex.test(value)) return false;
  
  // Дополнительная проверка валидности даты
  const [_, day, month, year] = value.match(dateRegex);
  
  // Создаем дату и проверяем, что месяц и день совпадают
  // (это исключает случаи вроде 31.02.2022)
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  return (
    date.getDate() === parseInt(day) &&
    date.getMonth() === parseInt(month) - 1 &&
    date.getFullYear() === parseInt(year)
  );
};

/**
 * Валидирует объект по схеме, возвращая ошибки валидации
 * 
 * @param {object} obj - валидируемый объект
 * @param {object} schema - схема валидации в формате { поле: [ {validator, message}, ... ] }
 * @returns {object|null} объект с ошибками или null, если ошибок нет
 */
const validateObject = (obj, schema) => {
  if (!isObject(obj) || !isObject(schema)) {
    return { _generic: ['Некорректные данные для валидации'] };
  }
  
  const errors = {};
  
  for (const [field, validators] of Object.entries(schema)) {
    if (!isArray(validators)) continue;
    
    for (const { validator, message } of validators) {
      if (!isFunction(validator)) continue;
      
      const value = obj[field];
      
      if (!validator(value)) {
        if (!errors[field]) {
          errors[field] = [];
        }
        
        errors[field].push(message);
        break; // Останавливаемся на первой ошибке для поля
      }
    }
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

/**
 * Санитизирует строку, удаляя потенциально опасные символы
 * 
 * @param {string} value - строка для санитизации
 * @returns {string} санитизированная строка
 */
const sanitizeString = (value) => {
  if (!isString(value)) return '';
  
  // Удаляем HTML-теги и экранируем специальные символы
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Обрезает строку до указанной длины
 * 
 * @param {string} value - исходная строка
 * @param {number} maxLength - максимальная длина
 * @returns {string} обрезанная строка
 */
const truncateString = (value, maxLength) => {
  if (!isString(value) || !isInteger(maxLength) || maxLength <= 0) {
    return '';
  }
  
  if (value.length <= maxLength) {
    return value;
  }
  
  return value.substring(0, maxLength) + '...';
};

module.exports = {
  isDefined,
  isEmpty,
  isNotEmpty,
  isString,
  isNumber,
  isInteger,
  isPositiveNumber,
  isNonNegativeNumber,
  isBoolean,
  isArray,
  isObject,
  isFunction,
  isDate,
  isEmail,
  hasMinLength,
  hasMaxLength,
  isInRange,
  isInArray,
  matchesPattern,
  isUrl,
  hasRequiredFields,
  hasAnyField,
  isAlphanumeric,
  isPhoneNumber,
  isObjectId,
  isFutureDate,
  isPastDate,
  isValidJson,
  isTimeFormat,
  isDateFormat,
  validateObject,
  sanitizeString,
  truncateString
}; 
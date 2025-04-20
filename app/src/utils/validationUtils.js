/**
 * Утилиты для валидации данных в приложении
 */

/**
 * Проверяет, что строка не пустая
 * @param {string} value - проверяемое значение
 * @returns {boolean} результат проверки
 */
export const isNotEmpty = (value) => {
  if (value === null || value === undefined) return false;
  return value.toString().trim().length > 0;
};

/**
 * Проверяет минимальную длину строки
 * @param {string} value - проверяемое значение
 * @param {number} minLength - минимальная длина
 * @returns {boolean} результат проверки
 */
export const minLength = (value, minLength) => {
  if (!value) return false;
  return value.toString().trim().length >= minLength;
};

/**
 * Проверяет максимальную длину строки
 * @param {string} value - проверяемое значение
 * @param {number} maxLength - максимальная длина
 * @returns {boolean} результат проверки
 */
export const maxLength = (value, maxLength) => {
  if (!value) return true;
  return value.toString().trim().length <= maxLength;
};

/**
 * Проверяет длину строки в заданном диапазоне
 * @param {string} value - проверяемое значение
 * @param {number} min - минимальная длина
 * @param {number} max - максимальная длина
 * @returns {boolean} результат проверки
 */
export const lengthBetween = (value, min, max) => {
  if (!value) return false;
  const length = value.toString().trim().length;
  return length >= min && length <= max;
};

/**
 * Проверяет, что значение является корректным email
 * @param {string} value - проверяемое значение
 * @returns {boolean} результат проверки
 */
export const isValidEmail = (value) => {
  if (!value) return false;
  // Базовая проверка email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

/**
 * Проверяет, что значение является корректным URL
 * @param {string} value - проверяемое значение
 * @returns {boolean} результат проверки
 */
export const isValidUrl = (value) => {
  if (!value) return false;
  try {
    new URL(value);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Проверяет, что значение является корректным номером телефона
 * @param {string} value - проверяемое значение
 * @returns {boolean} результат проверки
 */
export const isValidPhone = (value) => {
  if (!value) return false;
  // Простая проверка для российских номеров (можно настроить под нужный формат)
  const phoneRegex = /^(\+7|8)[- ]?(\(?\d{3}\)?)[- ]?(\d{3})[- ]?(\d{2})[- ]?(\d{2})$/;
  return phoneRegex.test(value);
};

/**
 * Проверяет, что значение является корректной датой
 * @param {any} value - проверяемое значение
 * @returns {boolean} результат проверки
 */
export const isValidDate = (value) => {
  if (!value) return false;
  
  // Проверка на объект Date
  if (value instanceof Date) {
    return !isNaN(value.getTime());
  }
  
  // Проверка строки или числа
  const date = new Date(value);
  return !isNaN(date.getTime());
};

/**
 * Проверяет, что дата находится в будущем
 * @param {any} value - проверяемое значение
 * @returns {boolean} результат проверки
 */
export const isFutureDate = (value) => {
  if (!isValidDate(value)) return false;
  
  const date = new Date(value);
  const now = new Date();
  
  return date > now;
};

/**
 * Проверяет, что дата находится в прошлом
 * @param {any} value - проверяемое значение
 * @returns {boolean} результат проверки
 */
export const isPastDate = (value) => {
  if (!isValidDate(value)) return false;
  
  const date = new Date(value);
  const now = new Date();
  
  return date < now;
};

/**
 * Проверяет, что значение является числом
 * @param {any} value - проверяемое значение
 * @returns {boolean} результат проверки
 */
export const isNumber = (value) => {
  if (value === null || value === undefined || value === '') return false;
  return !isNaN(Number(value));
};

/**
 * Проверяет, что значение является целым числом
 * @param {any} value - проверяемое значение
 * @returns {boolean} результат проверки
 */
export const isInteger = (value) => {
  if (!isNumber(value)) return false;
  const num = Number(value);
  return Number.isInteger(num);
};

/**
 * Проверяет, что число находится в заданном диапазоне
 * @param {number} value - проверяемое значение
 * @param {number} min - минимальное значение
 * @param {number} max - максимальное значение
 * @returns {boolean} результат проверки
 */
export const isNumberInRange = (value, min, max) => {
  if (!isNumber(value)) return false;
  const num = Number(value);
  return num >= min && num <= max;
};

/**
 * Проверяет, что число больше или равно минимальному значению
 * @param {number} value - проверяемое значение
 * @param {number} min - минимальное значение
 * @returns {boolean} результат проверки
 */
export const isNumberMin = (value, min) => {
  if (!isNumber(value)) return false;
  const num = Number(value);
  return num >= min;
};

/**
 * Проверяет, что число меньше или равно максимальному значению
 * @param {number} value - проверяемое значение
 * @param {number} max - максимальное значение
 * @returns {boolean} результат проверки
 */
export const isNumberMax = (value, max) => {
  if (!isNumber(value)) return false;
  const num = Number(value);
  return num <= max;
};

/**
 * Проверяет, что значение является логическим
 * @param {any} value - проверяемое значение
 * @returns {boolean} результат проверки
 */
export const isBoolean = (value) => {
  return typeof value === 'boolean' || value === 'true' || value === 'false';
};

/**
 * Проверяет, что строка соответствует регулярному выражению
 * @param {string} value - проверяемое значение
 * @param {RegExp} regex - регулярное выражение
 * @returns {boolean} результат проверки
 */
export const matchesPattern = (value, regex) => {
  if (!value) return false;
  return regex.test(value.toString());
};

/**
 * Проверяет, что объект содержит все требуемые поля
 * @param {Object} obj - проверяемый объект
 * @param {Array<string>} requiredFields - массив обязательных полей
 * @returns {boolean} результат проверки
 */
export const hasRequiredFields = (obj, requiredFields) => {
  if (!obj || typeof obj !== 'object') return false;
  
  for (const field of requiredFields) {
    if (obj[field] === undefined || obj[field] === null) {
      return false;
    }
  }
  
  return true;
};

/**
 * Проверяет, что значение находится в списке допустимых значений
 * @param {any} value - проверяемое значение
 * @param {Array} allowedValues - массив допустимых значений
 * @returns {boolean} результат проверки
 */
export const isOneOf = (value, allowedValues) => {
  if (!Array.isArray(allowedValues)) return false;
  return allowedValues.includes(value);
};

/**
 * Проверяет, что строка не содержит запрещенных символов
 * @param {string} value - проверяемое значение
 * @param {Array<string>} forbiddenChars - массив запрещенных символов
 * @returns {boolean} результат проверки
 */
export const hasNoForbiddenChars = (value, forbiddenChars) => {
  if (!value || !Array.isArray(forbiddenChars)) return true;
  
  const valueStr = value.toString();
  for (const char of forbiddenChars) {
    if (valueStr.includes(char)) {
      return false;
    }
  }
  
  return true;
};

/**
 * Проверяет, что строка содержит хотя бы одну цифру
 * @param {string} value - проверяемое значение
 * @returns {boolean} результат проверки
 */
export const hasDigit = (value) => {
  if (!value) return false;
  return /\d/.test(value.toString());
};

/**
 * Проверяет, что строка содержит хотя бы одну букву в верхнем регистре
 * @param {string} value - проверяемое значение
 * @returns {boolean} результат проверки
 */
export const hasUpperCase = (value) => {
  if (!value) return false;
  return /[A-ZА-Я]/.test(value.toString());
};

/**
 * Проверяет, что строка содержит хотя бы одну букву в нижнем регистре
 * @param {string} value - проверяемое значение
 * @returns {boolean} результат проверки
 */
export const hasLowerCase = (value) => {
  if (!value) return false;
  return /[a-zа-я]/.test(value.toString());
};

/**
 * Проверяет, что строка содержит хотя бы один специальный символ
 * @param {string} value - проверяемое значение
 * @returns {boolean} результат проверки
 */
export const hasSpecialChar = (value) => {
  if (!value) return false;
  return /[!@#$%^&*(),.?":{}|<>]/.test(value.toString());
};

/**
 * Комплексная проверка сложности пароля
 * @param {string} value - проверяемое значение
 * @returns {boolean} результат проверки
 */
export const isStrongPassword = (value) => {
  if (!value) return false;
  
  return (
    minLength(value, 8) &&
    hasDigit(value) &&
    hasUpperCase(value) &&
    hasLowerCase(value) &&
    hasSpecialChar(value)
  );
};

/**
 * Валидатор для объекта напоминания
 * @param {Object} reminder - объект напоминания
 * @returns {Object} объект с ошибками валидации или пустой объект
 */
export const validateReminder = (reminder) => {
  const errors = {};
  
  if (!isNotEmpty(reminder.text)) {
    errors.text = 'Текст напоминания обязателен';
  } else if (!lengthBetween(reminder.text, 2, 1000)) {
    errors.text = 'Текст должен содержать от 2 до 1000 символов';
  }
  
  if (!isValidDate(reminder.date)) {
    errors.date = 'Требуется указать корректную дату';
  }
  
  return errors;
};

/**
 * Проверяет валидность объекта (отсутствие ошибок валидации)
 * @param {Object} validationErrors - объект с ошибками валидации
 * @returns {boolean} результат проверки
 */
export const isValid = (validationErrors) => {
  return Object.keys(validationErrors).length === 0;
}; 
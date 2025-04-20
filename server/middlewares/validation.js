/**
 * Валидация данных запроса
 * 
 * Простая реализация валидации без использования сторонних библиотек
 */

/**
 * Проверка обязательных полей в объекте
 * @param {Object} obj - Проверяемый объект
 * @param {Array} requiredFields - Список обязательных полей
 * @returns {Array} - Массив ошибок (пустой, если ошибок нет)
 */
const validateRequiredFields = (obj, requiredFields) => {
  const errors = [];
  
  for (const field of requiredFields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      errors.push(`Поле '${field}' обязательно`);
    }
  }
  
  return errors;
};

/**
 * Проверка типа полей в объекте
 * @param {Object} obj - Проверяемый объект
 * @param {Object} fieldTypes - Объект с ожидаемыми типами полей
 * @returns {Array} - Массив ошибок (пустой, если ошибок нет)
 */
const validateFieldTypes = (obj, fieldTypes) => {
  const errors = [];
  
  for (const [field, expectedType] of Object.entries(fieldTypes)) {
    // Пропускаем необязательные поля, которых нет в объекте
    if (obj[field] === undefined) continue;
    
    // Проверка на null
    if (obj[field] === null) {
      if (expectedType !== 'null') {
        errors.push(`Поле '${field}' не может быть null`);
      }
      continue;
    }
    
    // Проверка числового типа
    if (expectedType === 'number') {
      if (typeof obj[field] !== 'number' || isNaN(obj[field])) {
        errors.push(`Поле '${field}' должно быть числом`);
      }
      continue;
    }
    
    // Проверка строкового типа
    if (expectedType === 'string') {
      if (typeof obj[field] !== 'string') {
        errors.push(`Поле '${field}' должно быть строкой`);
      }
      continue;
    }
    
    // Проверка логического типа
    if (expectedType === 'boolean') {
      if (typeof obj[field] !== 'boolean') {
        errors.push(`Поле '${field}' должно быть логическим значением`);
      }
      continue;
    }
    
    // Проверка типа "объект"
    if (expectedType === 'object') {
      if (typeof obj[field] !== 'object' || obj[field] === null || Array.isArray(obj[field])) {
        errors.push(`Поле '${field}' должно быть объектом`);
      }
      continue;
    }
    
    // Проверка типа "массив"
    if (expectedType === 'array') {
      if (!Array.isArray(obj[field])) {
        errors.push(`Поле '${field}' должно быть массивом`);
      }
      continue;
    }
    
    // Проверка на соответствие перечислению
    if (Array.isArray(expectedType)) {
      if (!expectedType.includes(obj[field])) {
        errors.push(`Поле '${field}' должно быть одним из: ${expectedType.join(', ')}`);
      }
      continue;
    }
    
    // Общая проверка типа
    if (typeof obj[field] !== expectedType) {
      errors.push(`Поле '${field}' имеет неверный тип. Ожидается: ${expectedType}`);
    }
  }
  
  return errors;
};

/**
 * Валидатор для напоминаний
 * @param {boolean} isCreation - Флаг создания нового напоминания
 * @returns {Function} - Middleware для валидации напоминаний
 */
const validateReminder = (isCreation = true) => {
  return (req, res, next) => {
    const reminderData = req.body;
    const errors = [];
    
    // Проверка обязательных полей при создании
    if (isCreation) {
      errors.push(...validateRequiredFields(reminderData, [
        'telegramId', 'title', 'type', 'date'
      ]));
      
      // Проверка типа напоминания
      if (reminderData.type && !['birthday', 'event'].includes(reminderData.type)) {
        errors.push('Поле type должно быть "birthday" или "event"');
      }
    }
    
    // Проверка типов полей
    const fieldTypes = {
      telegramId: 'number',
      title: 'string',
      type: ['birthday', 'event'],
      group: ['семья', 'работа', 'друзья', 'другое'],
      description: 'string',
      notifyDaysBefore: 'number',
      isRecurring: 'boolean',
      recurringType: ['weekly', 'monthly', 'yearly'],
      recurringDayOfWeek: 'number',
      endDate: 'string' // Дата в формате строки
    };
    
    if (reminderData.telegramId && typeof reminderData.telegramId === 'string') {
      // Преобразуем строковый telegramId в число
      reminderData.telegramId = parseInt(reminderData.telegramId);
      if (isNaN(reminderData.telegramId)) {
        errors.push('Поле telegramId должно быть числом');
      }
    }
    
    errors.push(...validateFieldTypes(reminderData, fieldTypes));
    
    // Проверка полей даты
    if (reminderData.date) {
      // Проверка обязательных полей даты
      errors.push(...validateRequiredFields(reminderData.date, ['day', 'month']));
      
      // Проверка типов полей даты
      const dateFieldTypes = {
        day: 'number',
        month: 'number',
        year: 'number'
      };
      
      errors.push(...validateFieldTypes(reminderData.date, dateFieldTypes));
      
      // Проверка значений полей даты
      if (reminderData.date.day !== undefined) {
        if (reminderData.date.day < 1 || reminderData.date.day > 31) {
          errors.push('Поле date.day должно быть от 1 до 31');
        }
      }
      
      if (reminderData.date.month !== undefined) {
        if (reminderData.date.month < 1 || reminderData.date.month > 12) {
          errors.push('Поле date.month должно быть от 1 до 12');
        }
      }
      
      // Проверка года для событий
      if (reminderData.type === 'event' && !reminderData.date.year) {
        errors.push('Для событий необходимо указать год (date.year)');
      }
    }
    
    // Проверка полей рекуррентных напоминаний
    if (reminderData.isRecurring) {
      if (!reminderData.recurringType) {
        errors.push('Для рекуррентного напоминания необходимо указать тип повторения (recurringType)');
      } else if (reminderData.recurringType === 'weekly' && reminderData.recurringDayOfWeek === undefined) {
        errors.push('Для еженедельного напоминания необходимо указать день недели (recurringDayOfWeek)');
      }
      
      // Проверка корректности дня недели
      if (reminderData.recurringDayOfWeek !== undefined) {
        if (reminderData.recurringDayOfWeek < 0 || reminderData.recurringDayOfWeek > 6) {
          errors.push('День недели (recurringDayOfWeek) должен быть от 0 до 6');
        }
      }
      
      // Проверка даты окончания, если она указана
      if (reminderData.endDate) {
        const endDate = new Date(reminderData.endDate);
        if (isNaN(endDate.getTime())) {
          errors.push('Указана некорректная дата окончания (endDate)');
        }
      }
    }
    
    // Если есть ошибки, возвращаем их клиенту
    if (errors.length > 0) {
      return res.status(400).json({
        error: {
          message: 'Ошибка валидации данных',
          details: errors,
          status: 400
        }
      });
    }
    
    // Если ошибок нет, продолжаем выполнение запроса
    next();
  };
};

/**
 * Валидатор для пользователей
 * @returns {Function} - Middleware для валидации пользователей
 */
const validateUser = () => {
  return (req, res, next) => {
    const userData = req.body;
    const errors = [];
    
    // Проверка обязательных полей
    errors.push(...validateRequiredFields(userData, ['telegramId']));
    
    // Проверка типов полей
    const fieldTypes = {
      telegramId: 'number',
      username: 'string',
      firstName: 'string',
      lastName: 'string'
    };
    
    if (userData.telegramId && typeof userData.telegramId === 'string') {
      // Преобразуем строковый telegramId в число
      userData.telegramId = parseInt(userData.telegramId);
      if (isNaN(userData.telegramId)) {
        errors.push('Поле telegramId должно быть числом');
      }
    }
    
    errors.push(...validateFieldTypes(userData, fieldTypes));
    
    // Если есть ошибки, возвращаем их клиенту
    if (errors.length > 0) {
      return res.status(400).json({
        error: {
          message: 'Ошибка валидации данных',
          details: errors,
          status: 400
        }
      });
    }
    
    // Если ошибок нет, продолжаем выполнение запроса
    next();
  };
};

module.exports = {
  validateReminder,
  validateUser
}; 
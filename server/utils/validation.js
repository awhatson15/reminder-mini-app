const Joi = require('joi');
const { logger } = require('./logger');

// Схема валидации для создания пользователя
const userSchema = Joi.object({
  telegramId: Joi.number().required(),
  username: Joi.string().allow('', null),
  firstName: Joi.string().allow('', null),
  lastName: Joi.string().allow('', null)
});

// Схема валидации для создания напоминания
const reminderSchema = Joi.object({
  title: Joi.string().required().trim(),
  type: Joi.string().valid('birthday', 'event').required(),
  group: Joi.string().valid('семья', 'работа', 'друзья', 'другое').default('другое'),
  date: Joi.object({
    day: Joi.number().required().min(1).max(31),
    month: Joi.number().required().min(1).max(12),
    year: Joi.number().allow(null)
      .when('..type', {
        is: 'birthday',
        then: Joi.number().allow(null),
        otherwise: Joi.number().required()
      })
  }).required(),
  description: Joi.string().allow('').trim(),
  notifyDaysBefore: Joi.number().min(0).default(1),
  isRecurring: Joi.boolean().default(false),
  recurringType: Joi.string().valid('weekly', 'monthly', 'yearly').default('monthly'),
  recurringDayOfWeek: Joi.number().min(0).max(6)
    .when('recurringType', {
      is: 'weekly',
      then: Joi.number().min(0).max(6).required(),
      otherwise: Joi.number().min(0).max(6).optional()
    }),
  endDate: Joi.date().allow(null)
});

// Схема валидации для обновления напоминания
const reminderUpdateSchema = reminderSchema.fork(
  ['title', 'type', 'date'],
  (schema) => schema.optional()
);

// Схема для валидации параметров запроса пагинации
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(process.env.DEFAULT_PAGE_LIMIT || 20)
});

// Функция валидации
const validate = (data, schema) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    const details = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    logger.warn(`Validation failed: ${JSON.stringify(details)}`);
    
    const validationError = new Error('Validation error');
    validationError.statusCode = 400;
    validationError.details = details;
    throw validationError;
  }

  return value;
};

module.exports = {
  validate,
  userSchema,
  reminderSchema,
  reminderUpdateSchema,
  paginationSchema
}; 
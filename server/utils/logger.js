const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Создаем директорию для логов, если она не существует
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Настройка формата логов в зависимости от окружения
const getLogFormat = () => {
  // Для production используем простой формат
  if (process.env.NODE_ENV === 'production') {
    return winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    );
  }
  
  // Для разработки используем более подробный формат
  return winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(({ level, message, timestamp, stack, ...rest }) => {
      // Форматируем дополнительные метаданные, если они есть
      let meta = '';
      if (Object.keys(rest).length > 0) {
        meta = '\n' + JSON.stringify(rest, null, 2);
      }
      
      return `${timestamp} ${level.toUpperCase()}: ${message} ${stack ? '\n' + stack : ''}${meta}`;
    })
  );
};

// Настройка транспортов логирования
const getTransports = () => {
  const transports = [
    // Запись в консоль
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        getLogFormat()
      )
    })
  ];
  
  // Добавляем файловые транспорты только если не в тестовом режиме
  if (process.env.NODE_ENV !== 'test') {
    transports.push(
      // Запись ошибок в отдельный файл
      new winston.transports.File({ 
        filename: path.join(logDir, 'error.log'), 
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 5
      }),
      // Запись всех логов в общий файл
      new winston.transports.File({ 
        filename: path.join(logDir, 'combined.log'),
        maxsize: 10485760, // 10MB
        maxFiles: 5
      })
    );
  }
  
  return transports;
};

// Определение уровня логирования
const getLogLevel = () => {
  const level = process.env.LOG_LEVEL || 'info';
  
  // Проверяем корректность уровня
  const validLevels = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];
  if (!validLevels.includes(level)) {
    console.warn(`Invalid LOG_LEVEL: ${level}. Using 'info' instead.`);
    return 'info';
  }
  
  return level;
};

// Создание логгера
const logger = winston.createLogger({
  level: getLogLevel(),
  format: getLogFormat(),
  defaultMeta: { service: 'reminder-app' },
  transports: getTransports(),
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'rejections.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
});

// Добавляем метод для трассировки HTTP запросов
logger.http = (message, meta = {}) => {
  if (process.env.NODE_ENV !== 'production' || process.env.LOG_LEVEL === 'debug') {
    logger.info(message, { ...meta, type: 'http' });
  }
};

module.exports = { logger }; 
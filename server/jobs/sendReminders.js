const TelegramBot = require('node-telegram-bot-api');
const reminderRepository = require('../repositories/reminderRepository');
const userRepository = require('../repositories/userRepository');
const { logger } = require('../utils/logger');

// Подключаем бота
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });

// Функция форматирования даты
const formatDate = (date) => {
  const day = date.day;
  const month = date.month;
  const year = date.year;
  
  const monthNames = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  
  return `${day} ${monthNames[month - 1]}${year ? ` ${year} года` : ''}`;
};

// Функция вычисления оставшихся дней
const getDaysUntil = (day, month, year) => {
  const today = new Date();
  const targetDate = new Date();
  
  targetDate.setDate(day);
  targetDate.setMonth(month - 1);
  
  // Если год указан, используем его
  if (year) {
    targetDate.setFullYear(year);
  } else {
    // Если год не указан (для дней рождения), 
    // проверяем, прошла ли дата в этом году
    if (
      targetDate.getMonth() < today.getMonth() ||
      (targetDate.getMonth() === today.getMonth() && targetDate.getDate() < today.getDate())
    ) {
      targetDate.setFullYear(today.getFullYear() + 1);
    } else {
      targetDate.setFullYear(today.getFullYear());
    }
  }
  
  // Разница в миллисекундах
  const diffMs = targetDate - today;
  // Разница в днях (округление до целого числа)
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Главная функция для отправки напоминаний
const sendReminders = async () => {
  try {
    const today = new Date();
    logger.info('Запуск проверки предстоящих событий');
    
    // Получаем всех пользователей
    const users = await userRepository.findAll();
    
    // Для отслеживания отправленных напоминаний
    let sentCount = 0;
    
    for (const user of users) {
      // Получаем все напоминания этого пользователя
      const reminders = await reminderRepository.findByUserId(user._id);
      
      // Проверяем каждое напоминание
      for (const reminder of reminders) {
        const { date, title, type, notifyDaysBefore } = reminder;
        
        const daysUntil = getDaysUntil(date.day, date.month, date.year);
        
        // Отправляем напоминание, если дата наступает через notifyDaysBefore дней
        if (daysUntil === notifyDaysBefore) {
          let message = '';
          
          if (type === 'birthday') {
            message = `🎂 Напоминание: через ${daysUntil} ${plural(daysUntil, 'день', 'дня', 'дней')} день рождения у ${title} (${formatDate(date)})`;
          } else {
            message = `📅 Напоминание: через ${daysUntil} ${plural(daysUntil, 'день', 'дня', 'дней')} событие "${title}" (${formatDate(date)})`;
          }
          
          if (reminder.description) {
            message += `\n\nОписание: ${reminder.description}`;
          }
          
          try {
            await bot.sendMessage(user.telegramId, message);
            logger.info(`Отправлено напоминание пользователю ${user.telegramId}: ${title}`);
            sentCount++;
          } catch (error) {
            logger.error(`Ошибка при отправке напоминания пользователю ${user.telegramId}:`, error);
          }
        }
      }
    }
    
    logger.info(`Завершена проверка предстоящих событий. Отправлено напоминаний: ${sentCount}`);
  } catch (error) {
    logger.error('Ошибка при отправке напоминаний:', error);
  }
};

// Вспомогательная функция для правильного склонения слов
const plural = (number, one, two, five) => {
  let n = Math.abs(number);
  n %= 100;
  if (n >= 5 && n <= 20) {
    return five;
  }
  n %= 10;
  if (n === 1) {
    return one;
  }
  if (n >= 2 && n <= 4) {
    return two;
  }
  return five;
};

module.exports = { sendReminders }; 
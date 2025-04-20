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

// Функция вычисления оставшихся дней для обычных напоминаний
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

// Проверка рекуррентного напоминания
const checkRecurringReminder = (reminder, today) => {
  const { date, recurringType, recurringDayOfWeek, lastTriggered, notifyDaysBefore } = reminder;
  let shouldNotify = false;
  let targetDate = null;
  
  // Если есть дата окончания и она уже прошла
  if (reminder.endDate && new Date(reminder.endDate) < today) {
    return { shouldNotify: false };
  }
  
  // Получаем дату последнего срабатывания или используем текущую дату
  const lastTrigger = lastTriggered ? new Date(lastTriggered) : new Date(today);
  lastTrigger.setHours(0, 0, 0, 0);
  
  switch (recurringType) {
    case 'weekly':
      // Проверяем, наступил ли нужный день недели
      const todayDayOfWeek = today.getDay(); // 0-6 (воскресенье - суббота)
      
      if (recurringDayOfWeek === todayDayOfWeek) {
        // Проверяем, не было ли уже уведомления на этой неделе
        const daysSinceLastTrigger = Math.round((today - lastTrigger) / (1000 * 60 * 60 * 24));
        if (daysSinceLastTrigger >= 7) {
          // Создаем дату для уведомления (с учетом notifyDaysBefore)
          targetDate = new Date(today);
          targetDate.setDate(targetDate.getDate() + notifyDaysBefore);
          shouldNotify = true;
        }
      }
      break;
      
    case 'monthly':
      // Проверяем, наступил ли нужный день месяца
      if (today.getDate() === date.day - notifyDaysBefore) {
        // Проверяем, не было ли уже уведомления в этом месяце
        if (
          lastTrigger.getMonth() !== today.getMonth() || 
          lastTrigger.getFullYear() !== today.getFullYear()
        ) {
          targetDate = new Date(today);
          targetDate.setDate(date.day);
          shouldNotify = true;
        }
      }
      break;
      
    case 'yearly':
      // Проверяем, наступила ли нужная дата (с учетом notifyDaysBefore)
      const targetMonth = date.month - 1; // JavaScript месяцы от 0 до 11
      const targetDay = date.day;
      
      if (
        (today.getMonth() === targetMonth && today.getDate() === targetDay - notifyDaysBefore) ||
        // Специальная обработка для случаев на стыке месяцев
        (today.getMonth() === targetMonth - 1 && 
         today.getDate() === new Date(today.getFullYear(), targetMonth, 0).getDate() - (notifyDaysBefore - targetDay))
      ) {
        // Проверяем, не было ли уже уведомления в этом году
        if (lastTrigger.getFullYear() !== today.getFullYear()) {
          targetDate = new Date(today.getFullYear(), targetMonth, targetDay);
          shouldNotify = true;
        }
      }
      break;
  }
  
  return { shouldNotify, targetDate };
};

// Главная функция для отправки напоминаний
const sendReminders = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Нормализуем время
    
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
        const { date, title, type, notifyDaysBefore, group, isRecurring } = reminder;
        
        let shouldNotify = false;
        let targetDate;
        
        // Проверяем, рекуррентное ли это напоминание
        if (isRecurring) {
          const result = checkRecurringReminder(reminder, today);
          shouldNotify = result.shouldNotify;
          targetDate = result.targetDate;
        } else {
          // Обычное напоминание
          const daysUntil = getDaysUntil(date.day, date.month, date.year);
          
          if (daysUntil === notifyDaysBefore) {
            shouldNotify = true;
            targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + daysUntil);
          }
        }
        
        // Отправляем напоминание, если нужно
        if (shouldNotify) {
          let message = '';
          const groupPrefix = group !== 'другое' ? `[${group}] ` : '';
          
          if (type === 'birthday') {
            message = `🎂 ${groupPrefix}Напоминание: через ${notifyDaysBefore} ${plural(notifyDaysBefore, 'день', 'дня', 'дней')} день рождения у ${title} (${formatDate(date)})`;
          } else if (isRecurring) {
            const recurringText = {
              'weekly': 'еженедельное',
              'monthly': 'ежемесячное',
              'yearly': 'ежегодное'
            }[reminder.recurringType];
            
            message = `🔄 ${groupPrefix}Напоминание: ${recurringText} событие "${title}" (${targetDate.getDate()} ${targetDate.toLocaleString('ru', { month: 'long' })})`;
          } else {
            message = `📅 ${groupPrefix}Напоминание: через ${notifyDaysBefore} ${plural(notifyDaysBefore, 'день', 'дня', 'дней')} событие "${title}" (${formatDate(date)})`;
          }
          
          if (reminder.description) {
            message += `\n\nОписание: ${reminder.description}`;
          }
          
          try {
            await bot.sendMessage(user.telegramId, message);
            logger.info(`Отправлено напоминание пользователю ${user.telegramId}: ${title}`);
            
            // Обновляем дату последнего срабатывания для рекуррентных напоминаний
            if (isRecurring) {
              await reminderRepository.update(reminder._id, { 
                lastTriggered: new Date() 
              });
            }
            
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
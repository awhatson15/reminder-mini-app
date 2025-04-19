const { sendReminders } = require('./jobs/sendReminders');
const { logger } = require('./utils/logger');

// Запускаем проверку каждый день в 9:00 утра
const scheduleReminders = () => {
  const now = new Date();
  const scheduledTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    9, // 9 часов утра
    0, // 0 минут
    0 // 0 секунд
  );
  
  // Если текущее время больше 9 утра, запланировать на следующий день
  if (now > scheduledTime) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  const timeUntilSchedule = scheduledTime - now;
  
  logger.info(`Следующая проверка напоминаний запланирована на ${scheduledTime}`);
  
  // Отложенный запуск в запланированное время
  setTimeout(() => {
    sendReminders();
    
    // После выполнения планируем следующий запуск
    scheduleReminders();
  }, timeUntilSchedule);
};

// Также запускаем проверку при старте приложения
const startScheduler = () => {
  logger.info('Запуск планировщика задач');
  
  // Запускаем проверку сразу при старте приложения
  sendReminders();
  
  // Затем планируем ежедневные проверки
  scheduleReminders();
};

module.exports = { startScheduler }; 
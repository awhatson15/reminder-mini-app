const { sendReminders } = require('./jobs/sendReminders');
const { logger } = require('./utils/logger');

// Запускаем проверку каждый день в 9:00 утра
const scheduleReminders = () => {
  try {
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
      try {
        sendReminders().catch(err => {
          logger.error('Ошибка при отправке напоминаний:', err);
        });
        
        // После выполнения планируем следующий запуск
        scheduleReminders();
      } catch (error) {
        logger.error('Ошибка при выполнении запланированной задачи:', error);
        // Все равно планируем следующий запуск
        scheduleReminders();
      }
    }, timeUntilSchedule);
  } catch (error) {
    logger.error('Ошибка при планировании задачи:', error);
  }
};

// Также запускаем проверку при старте приложения
const startScheduler = () => {
  try {
    logger.info('Запуск планировщика задач');
    
    // Запускаем проверку сразу при старте приложения
    sendReminders().catch(err => {
      logger.error('Ошибка при первоначальной отправке напоминаний:', err);
    });
    
    // Затем планируем ежедневные проверки
    scheduleReminders();
  } catch (error) {
    logger.error('Ошибка при запуске планировщика задач:', error);
  }
};

module.exports = { startScheduler }; 
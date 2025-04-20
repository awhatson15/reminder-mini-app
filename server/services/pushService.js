const admin = require('firebase-admin');
const userRepository = require('../repositories/userRepository');
const { logger } = require('../utils/logger');

// Инициализация Firebase Admin SDK
const serviceAccount = require('../../firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Отправка push-уведомления
const sendPushNotification = async (telegramId, title, body, data = {}) => {
  try {
    const user = await userRepository.findByTelegramId(telegramId);
    
    if (!user || !user.pushToken || !user.settings?.notifications?.enabled) {
      return;
    }

    const message = {
      notification: {
        title,
        body
      },
      data,
      token: user.pushToken
    };

    await admin.messaging().send(message);
    logger.info(`Push-уведомление отправлено пользователю ${telegramId}`);
  } catch (error) {
    logger.error('Ошибка при отправке push-уведомления:', error);
    
    // Если токен недействителен, удаляем его
    if (error.code === 'messaging/invalid-registration-token' || 
        error.code === 'messaging/registration-token-not-registered') {
      await userRepository.updatePushToken(telegramId, null);
      logger.info(`Недействительный push-токен удален для пользователя ${telegramId}`);
    }
  }
};

// Отправка напоминания через push-уведомление
const sendReminderPush = async (telegramId, reminder) => {
  const title = 'Напоминание';
  const body = reminder.text;
  const data = {
    type: 'reminder',
    reminderId: reminder._id.toString(),
    date: reminder.date.toISOString()
  };

  await sendPushNotification(telegramId, title, body, data);
};

module.exports = {
  sendPushNotification,
  sendReminderPush
}; 
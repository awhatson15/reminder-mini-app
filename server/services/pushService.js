const { logger } = require('../utils/logger');
const userRepository = require('../repositories/userRepository');

// Опциональный импорт Firebase Admin SDK
let admin = null;
let firebaseInitialized = false;

// Попытка импорта firebase-admin, если он не установлен, просто отключаем эту функциональность
try {
  admin = require('firebase-admin');
  
  try {
    const serviceAccount = require('../../firebase-service-account.json');
    if (Object.keys(serviceAccount).length === 0) {
      logger.warn('Firebase Admin SDK не инициализирован: пустой файл конфигурации');
    } else {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      firebaseInitialized = true;
      logger.info('Firebase Admin SDK успешно инициализирован');
    }
  } catch (error) {
    logger.warn('Firebase Admin SDK не инициализирован:', error.message);
  }
} catch (error) {
  logger.warn('Модуль firebase-admin не установлен. Push-уведомления отключены.');
}

// Отправка push-уведомления
const sendPushNotification = async (telegramId, title, body, data = {}) => {
  if (!firebaseInitialized) {
    logger.warn(`Push-уведомление не отправлено пользователю ${telegramId} (Firebase не инициализирован)`);
    return;
  }

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
  if (!firebaseInitialized) {
    logger.warn(`Напоминание не отправлено пользователю ${telegramId} (Firebase не инициализирован)`);
    return;
  }
  
  try {
    const title = 'Напоминание';
    const body = reminder.text || reminder.title;
    const data = {
      type: 'reminder',
      reminderId: reminder._id.toString(),
      date: reminder.date instanceof Date ? reminder.date.toISOString() : new Date().toISOString()
    };

    await sendPushNotification(telegramId, title, body, data);
  } catch (error) {
    logger.error('Ошибка при отправке push-напоминания:', error);
    // Не пробрасываем ошибку дальше, чтобы не прерывать основной процесс
  }
};

module.exports = {
  sendPushNotification,
  sendReminderPush
}; 
/**
 * Модуль для отображения уведомлений пользователю
 * Обеспечивает унифицированный интерфейс для показа разных типов уведомлений
 */
import WebApp from '@twa-dev/sdk';

/**
 * Типы уведомлений
 * @enum {string}
 */
export const NotificationType = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

/**
 * Настройки уведомлений по умолчанию
 */
const DEFAULT_SETTINGS = {
  duration: 4000, // продолжительность отображения в миллисекундах
  position: 'top', // позиция уведомления (top, bottom)
  sound: false, // воспроизводить ли звук
  vibrate: false, // вибрировать ли при уведомлении
};

/**
 * Хранилище для активных уведомлений
 * @type {Map<string, {id: string, element: HTMLElement, timer: number}>}
 */
const activeNotifications = new Map();

/**
 * Генерирует уникальный идентификатор для уведомления
 * @returns {string} Уникальный ID
 */
const generateNotificationId = () => {
  return `notification_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Создает контейнер для уведомлений, если он еще не существует
 * @param {string} position - Позиция контейнера (top, bottom)
 * @returns {HTMLElement} Контейнер для уведомлений
 */
const getNotificationContainer = (position) => {
  const containerId = `notification-container-${position}`;
  let container = document.getElementById(containerId);
  
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.className = `notification-container notification-container-${position}`;
    
    // Стили для контейнера
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.right = '0';
    container.style.zIndex = '9999';
    container.style[position] = '0';
    container.style.display = 'flex';
    container.style.flexDirection = position === 'top' ? 'column' : 'column-reverse';
    container.style.alignItems = 'center';
    container.style.padding = '10px';
    container.style.pointerEvents = 'none'; // чтобы не мешать интерфейсу
    
    document.body.appendChild(container);
  }
  
  return container;
};

/**
 * Создает элемент уведомления
 * @param {string} message - Сообщение уведомления
 * @param {string} type - Тип уведомления
 * @returns {HTMLElement} Элемент уведомления
 */
const createNotificationElement = (message, type) => {
  const element = document.createElement('div');
  element.className = `notification notification-${type}`;
  
  // Стили для элемента уведомления
  element.style.padding = '12px 16px';
  element.style.marginBottom = '8px';
  element.style.borderRadius = '8px';
  element.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  element.style.color = '#fff';
  element.style.fontSize = '14px';
  element.style.fontWeight = '500';
  element.style.maxWidth = '90%';
  element.style.textAlign = 'center';
  element.style.opacity = '0';
  element.style.transform = 'translateY(-20px)';
  element.style.transition = 'opacity 0.3s, transform 0.3s';
  element.style.pointerEvents = 'auto'; // чтобы можно было взаимодействовать с уведомлением
  
  // Устанавливаем цвет в зависимости от типа уведомления
  switch (type) {
    case NotificationType.SUCCESS:
      element.style.backgroundColor = '#4CAF50';
      break;
    case NotificationType.ERROR:
      element.style.backgroundColor = '#F44336';
      break;
    case NotificationType.WARNING:
      element.style.backgroundColor = '#FF9800';
      break;
    case NotificationType.INFO:
    default:
      element.style.backgroundColor = '#2196F3';
      break;
  }
  
  // Устанавливаем сообщение
  element.textContent = message;
  
  // Добавляем обработчик клика для закрытия уведомления
  element.addEventListener('click', () => {
    closeNotification(element.dataset.id);
  });
  
  return element;
};

/**
 * Отображает элемент уведомления с анимацией
 * @param {HTMLElement} element - Элемент уведомления
 */
const showNotificationElement = (element) => {
  // Задержка для запуска анимации
  setTimeout(() => {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  }, 10);
};

/**
 * Скрывает уведомление с анимацией и удаляет его
 * @param {string} id - ID уведомления
 */
const closeNotification = (id) => {
  const notification = activeNotifications.get(id);
  
  if (!notification) return;
  
  // Очищаем таймер, если он существует
  if (notification.timer) {
    clearTimeout(notification.timer);
  }
  
  // Запускаем анимацию скрытия
  const { element } = notification;
  element.style.opacity = '0';
  element.style.transform = 'translateY(-20px)';
  
  // Удаляем элемент после завершения анимации
  setTimeout(() => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
    activeNotifications.delete(id);
  }, 300); // продолжительность анимации
};

/**
 * Проверяет доступность нативных уведомлений в Telegram WebApp
 * @returns {boolean} Доступны ли нативные уведомления
 */
const isTelegramNotificationsAvailable = () => {
  return WebApp.isVersionAtLeast('6.2') && 
         typeof WebApp.showPopup === 'function' && 
         typeof WebApp.showAlert === 'function';
};

/**
 * Показывает нативное уведомление Telegram
 * @param {Object} options - Параметры уведомления
 * @param {string} options.message - Сообщение уведомления
 * @param {string} options.type - Тип уведомления
 * @returns {Promise<void>} Промис, который разрешается после закрытия уведомления
 */
const showTelegramNotification = ({ message, type }) => {
  return new Promise((resolve) => {
    if (type === NotificationType.ERROR) {
      WebApp.showAlert(message, () => resolve());
    } else {
      WebApp.showPopup({
        title: type === NotificationType.SUCCESS ? 'Успех' : 
               type === NotificationType.WARNING ? 'Внимание' : 'Информация',
        message,
      }, resolve);
    }
  });
};

/**
 * Отображает уведомление пользователю
 * @param {Object|string} options - Параметры уведомления или сообщение
 * @param {string} [options.message] - Сообщение уведомления
 * @param {string} [options.type=info] - Тип уведомления (success, error, warning, info)
 * @param {number} [options.duration] - Продолжительность отображения в миллисекундах
 * @param {string} [options.position] - Позиция уведомления (top, bottom)
 * @param {boolean} [options.sound] - Воспроизводить ли звук
 * @param {boolean} [options.vibrate] - Вибрировать ли при уведомлении
 * @param {boolean} [options.nativeTelegram] - Использовать ли нативные уведомления Telegram, если доступны
 * @returns {string} ID уведомления (можно использовать для закрытия)
 */
export const showNotification = (options) => {
  // Если options - строка, считаем её сообщением с типом info
  if (typeof options === 'string') {
    options = { message: options, type: NotificationType.INFO };
  }
  
  // Объединяем переданные настройки с настройками по умолчанию
  const settings = { ...DEFAULT_SETTINGS, ...options };
  
  // Используем нативные уведомления Telegram, если они доступны и это указано в настройках
  if (settings.nativeTelegram !== false && isTelegramNotificationsAvailable()) {
    showTelegramNotification(settings);
    return null; // ID не возвращается для нативных уведомлений
  }
  
  // Получаем контейнер для уведомлений
  const container = getNotificationContainer(settings.position);
  
  // Создаем ID уведомления
  const id = generateNotificationId();
  
  // Создаем элемент уведомления
  const element = createNotificationElement(settings.message, settings.type);
  element.dataset.id = id;
  
  // Добавляем в контейнер и отображаем
  container.appendChild(element);
  showNotificationElement(element);
  
  // Вибрация, если включена
  if (settings.vibrate && navigator.vibrate) {
    navigator.vibrate(200);
  }
  
  // Звук, если включен (здесь можно добавить разные звуки для разных типов)
  if (settings.sound) {
    // Можно добавить воспроизведение звука
  }
  
  // Устанавливаем таймер для автоматического закрытия
  const timer = settings.duration 
    ? setTimeout(() => closeNotification(id), settings.duration) 
    : null;
  
  // Сохраняем данные уведомления
  activeNotifications.set(id, { id, element, timer });
  
  return id;
};

/**
 * Закрывает уведомление по ID
 * @param {string} id - ID уведомления
 */
export const closeNotificationById = (id) => {
  closeNotification(id);
};

/**
 * Закрывает все активные уведомления
 */
export const closeAllNotifications = () => {
  activeNotifications.forEach((notification, id) => {
    closeNotification(id);
  });
};

/**
 * Показывает уведомление об успехе
 * @param {string|Object} message - Сообщение или объект с настройками
 * @param {Object} [options] - Дополнительные настройки
 * @returns {string} ID уведомления
 */
export const showSuccess = (message, options = {}) => {
  const settings = typeof message === 'string' 
    ? { message, type: NotificationType.SUCCESS, ...options } 
    : { ...message, type: NotificationType.SUCCESS };
  
  return showNotification(settings);
};

/**
 * Показывает уведомление об ошибке
 * @param {string|Object} message - Сообщение или объект с настройками
 * @param {Object} [options] - Дополнительные настройки
 * @returns {string} ID уведомления
 */
export const showError = (message, options = {}) => {
  const settings = typeof message === 'string' 
    ? { message, type: NotificationType.ERROR, ...options } 
    : { ...message, type: NotificationType.ERROR };
  
  return showNotification(settings);
};

/**
 * Показывает предупреждающее уведомление
 * @param {string|Object} message - Сообщение или объект с настройками
 * @param {Object} [options] - Дополнительные настройки
 * @returns {string} ID уведомления
 */
export const showWarning = (message, options = {}) => {
  const settings = typeof message === 'string' 
    ? { message, type: NotificationType.WARNING, ...options } 
    : { ...message, type: NotificationType.WARNING };
  
  return showNotification(settings);
};

/**
 * Показывает информационное уведомление
 * @param {string|Object} message - Сообщение или объект с настройками
 * @param {Object} [options] - Дополнительные настройки
 * @returns {string} ID уведомления
 */
export const showInfo = (message, options = {}) => {
  const settings = typeof message === 'string' 
    ? { message, type: NotificationType.INFO, ...options } 
    : { ...message, type: NotificationType.INFO };
  
  return showNotification(settings);
}; 
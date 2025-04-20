/**
 * Форматирует дату из объекта напоминания
 * @param {Object} reminder - объект напоминания
 * @returns {string} форматированная дата
 */
export const getFormattedDateFromReminder = (reminder) => {
  if (!reminder || !reminder.date) return '';
  
  const { day, month, year } = reminder.date;
  
  const monthNames = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  
  return `${day} ${monthNames[month - 1]}${year ? ` ${year} г.` : ''}`;
};

/**
 * Вычисляет количество дней до даты напоминания
 * @param {Object} date - объект даты из напоминания (с полями day, month, year)
 * @returns {number} количество дней до даты
 */
export const getDaysUntil = (date) => {
  if (!date) return 0;
  
  const now = new Date();
  const eventDate = new Date();
  
  eventDate.setDate(date.day);
  eventDate.setMonth(date.month - 1);
  
  // Если есть год, используем его
  if (date.year) {
    eventDate.setFullYear(date.year);
  } else {
    // Для дней рождения без года
    // Если дата уже прошла в этом году, берем следующий год
    if (
      eventDate.getMonth() < now.getMonth() ||
      (eventDate.getMonth() === now.getMonth() && eventDate.getDate() < now.getDate())
    ) {
      eventDate.setFullYear(now.getFullYear() + 1);
    } else {
      eventDate.setFullYear(now.getFullYear());
    }
  }
  
  // Разница в днях
  const diffTime = eventDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}; 
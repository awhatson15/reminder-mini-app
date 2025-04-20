const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['birthday', 'event'],
    required: true
  },
  group: {
    type: String,
    enum: ['семья', 'работа', 'друзья', 'другое'],
    default: 'другое'
  },
  date: {
    day: {
      type: Number,
      required: true,
      min: 1,
      max: 31
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      // Год не обязателен для дней рождения
      required: function() {
        return this.type !== 'birthday';
      },
      // Явное указание, что null разрешен
      default: function() {
        return this.type === 'birthday' ? null : undefined;
      }
    }
  },
  description: {
    type: String,
    trim: true
  },
  notifyDaysBefore: {
    type: Number,
    default: 1,
    min: 0
  },
  // Поля для рекуррентных напоминаний
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringType: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  // Для еженедельных напоминаний - день недели (0-6, где 0 - воскресенье)
  recurringDayOfWeek: {
    type: Number,
    min: 0,
    max: 6
  },
  // Дата последнего срабатывания напоминания
  lastTriggered: {
    type: Date
  },
  // Дата окончания рекуррентного напоминания (необязательно)
  endDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Обновление поля updatedAt при обновлении документа
reminderSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() });
});

// Создаем индексы для оптимизации запросов
reminderSchema.index({ user: 1 });
reminderSchema.index({ user: 1, 'date.month': 1, 'date.day': 1 });
reminderSchema.index({ user: 1, title: 1 });
reminderSchema.index({ user: 1, type: 1 });
reminderSchema.index({ user: 1, group: 1 });
reminderSchema.index({ isRecurring: 1, lastTriggered: 1 });

module.exports = mongoose.model('Reminder', reminderSchema); 
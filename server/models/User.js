const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: Number,
    required: true,
    unique: true
  },
  username: {
    type: String
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
});

// Создаем индексы для оптимизации запросов
userSchema.index({ telegramId: 1 }, { unique: true });
userSchema.index({ username: 1 });
userSchema.index({ lastActivity: -1 });

module.exports = mongoose.model('User', userSchema); 
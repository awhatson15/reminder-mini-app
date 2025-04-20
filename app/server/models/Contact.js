const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phones: [{
    type: String,
    index: true
  }],
  emails: [{
    type: String
  }],
  address: {
    type: String
  },
  birthday: Date,
  source: {
    type: String,
    enum: ['phone', 'telegram', 'manual'],
    default: 'manual'
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

// Индекс для поиска по имени
contactSchema.index({ name: 'text' });

// Обновляем updatedAt при изменении документа
contactSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact; 
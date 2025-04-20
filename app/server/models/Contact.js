const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  phones: [{
    type: String,
    required: true,
    index: true
  }],
  emails: [{
    type: String
  }],
  source: {
    type: String,
    enum: ['phone', 'manual'],
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

// Составной индекс для поиска
contactSchema.index({ userId: 1, name: 1 });
contactSchema.index({ userId: 1, phones: 1 });

// Обновляем updatedAt при изменении документа
contactSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact; 
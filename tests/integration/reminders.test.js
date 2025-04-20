const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../server/models/User');
const Reminder = require('../../server/models/Reminder');
const { generateToken } = require('../../server/utils/auth');

describe('Reminders API', () => {
  let user, token, reminderId;

  beforeAll(async () => {
    // Подключаемся к тестовой базе данных
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/reminder-app-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Очищаем коллекции перед началом тестов
    await User.deleteMany();
    await Reminder.deleteMany();
    
    // Создаем тестового пользователя
    user = await User.create({
      telegramId: 12345678,
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser'
    });
    
    // Генерируем токен для тестового пользователя
    token = generateToken(user);
  });

  afterAll(async () => {
    // Очищаем коллекции после тестов
    await User.deleteMany();
    await Reminder.deleteMany();
    
    // Закрываем соединение с базой данных
    await mongoose.disconnect();
  });

  describe('POST /api/reminders', () => {
    test('должен создавать новое напоминание', async () => {
      const reminderData = {
        text: 'Тестовое напоминание',
        date: new Date().toISOString()
      };
      
      const response = await request(app)
        .post('/api/reminders')
        .set('Authorization', `Bearer ${token}`)
        .send(reminderData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.text).toBe(reminderData.text);
      
      // Сохраняем ID напоминания для использования в следующих тестах
      reminderId = response.body._id;
    });
    
    test('должен возвращать 400 при отсутствии обязательных полей', async () => {
      const invalidReminderData = {
        // text отсутствует
        date: new Date().toISOString()
      };
      
      const response = await request(app)
        .post('/api/reminders')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidReminderData);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/reminders', () => {
    test('должен возвращать список напоминаний пользователя', async () => {
      const response = await request(app)
        .get('/api/reminders')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
    
    test('должен фильтровать напоминания по статусу completed', async () => {
      const response = await request(app)
        .get('/api/reminders?completed=false')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Все напоминания должны иметь completed=false
      response.body.forEach(reminder => {
        expect(reminder.completed).toBe(false);
      });
    });
  });

  describe('GET /api/reminders/:id', () => {
    test('должен возвращать конкретное напоминание', async () => {
      const response = await request(app)
        .get(`/api/reminders/${reminderId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(reminderId);
    });
    
    test('должен возвращать 404 для несуществующего напоминания', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/reminders/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/reminders/:id', () => {
    test('должен обновлять напоминание', async () => {
      const updates = {
        text: 'Обновленное напоминание',
        completed: true
      };
      
      const response = await request(app)
        .put(`/api/reminders/${reminderId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(reminderId);
      expect(response.body.text).toBe(updates.text);
      expect(response.body.completed).toBe(updates.completed);
    });
    
    test('должен возвращать 404 при обновлении несуществующего напоминания', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/reminders/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'Обновление' });
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/reminders/:id', () => {
    test('должен удалять напоминание', async () => {
      const response = await request(app)
        .delete(`/api/reminders/${reminderId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(204);
      
      // Проверяем, что напоминание действительно удалено
      const checkResponse = await request(app)
        .get(`/api/reminders/${reminderId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(checkResponse.status).toBe(404);
    });
    
    test('должен возвращать 404 при удалении несуществующего напоминания', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/reminders/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
    });
  });
}); 
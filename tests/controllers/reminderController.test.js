const reminderController = require('../../server/controllers/reminderController');
const reminderService = require('../../server/services/reminderService');

// Мокаем сервис
jest.mock('../../server/services/reminderService');

describe('Reminder Controller', () => {
  let req, res, next;
  const userId = '60d21b4667d0d8992e610c85';
  const reminderId = '60d21b4667d0d8992e610c86';
  
  beforeEach(() => {
    // Создаем моки для req, res и next
    req = {
      params: {},
      body: {},
      user: { _id: userId }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn()
    };
    
    next = jest.fn();
    
    // Очищаем все моки перед каждым тестом
    jest.clearAllMocks();
  });

  describe('createReminder', () => {
    test('должен создавать напоминание и возвращать статус 201', async () => {
      // Подготовка данных
      const reminderData = {
        text: 'Тестовое напоминание',
        date: new Date()
      };
      
      req.body = reminderData;
      
      const mockReminder = {
        _id: reminderId,
        userId,
        ...reminderData,
        completed: false,
        createdAt: new Date()
      };
      
      reminderService.createReminder.mockResolvedValue(mockReminder);
      
      // Выполнение метода
      await reminderController.createReminder(req, res, next);
      
      // Проверка результата
      expect(reminderService.createReminder).toHaveBeenCalledWith(userId, reminderData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockReminder);
    });
    
    test('должен вызывать next с ошибкой при возникновении исключения', async () => {
      // Подготовка данных
      const error = new Error('Тестовая ошибка');
      reminderService.createReminder.mockRejectedValue(error);
      
      // Выполнение метода
      await reminderController.createReminder(req, res, next);
      
      // Проверка результата
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getReminders', () => {
    test('должен возвращать список напоминаний', async () => {
      // Подготовка данных
      const mockReminders = [
        { _id: reminderId, userId, text: 'Напоминание 1', date: new Date() },
        { _id: '60d21b4667d0d8992e610c87', userId, text: 'Напоминание 2', date: new Date() }
      ];
      
      reminderService.getReminders.mockResolvedValue(mockReminders);
      
      // Выполнение метода
      await reminderController.getReminders(req, res, next);
      
      // Проверка результата
      expect(reminderService.getReminders).toHaveBeenCalledWith(userId, {});
      expect(res.json).toHaveBeenCalledWith(mockReminders);
    });
    
    test('должен применять фильтры из query параметров', async () => {
      // Подготовка данных с query параметрами
      req.query = {
        completed: 'false',
        limit: '10',
        offset: '0'
      };
      
      const mockReminders = [
        { _id: reminderId, userId, text: 'Напоминание 1', date: new Date(), completed: false }
      ];
      
      reminderService.getReminders.mockResolvedValue(mockReminders);
      
      // Выполнение метода
      await reminderController.getReminders(req, res, next);
      
      // Проверка результата
      expect(reminderService.getReminders).toHaveBeenCalledWith(userId, {
        completed: false,
        limit: 10,
        offset: 0
      });
      expect(res.json).toHaveBeenCalledWith(mockReminders);
    });
  });

  describe('getReminder', () => {
    test('должен возвращать одно напоминание', async () => {
      // Подготовка данных
      req.params.id = reminderId;
      
      const mockReminder = {
        _id: reminderId,
        userId,
        text: 'Тестовое напоминание',
        date: new Date()
      };
      
      reminderService.getReminder.mockResolvedValue(mockReminder);
      
      // Выполнение метода
      await reminderController.getReminder(req, res, next);
      
      // Проверка результата
      expect(reminderService.getReminder).toHaveBeenCalledWith(userId, reminderId);
      expect(res.json).toHaveBeenCalledWith(mockReminder);
    });
    
    test('должен возвращать 404, если напоминание не найдено', async () => {
      // Подготовка данных
      req.params.id = reminderId;
      
      reminderService.getReminder.mockResolvedValue(null);
      
      // Выполнение метода
      await reminderController.getReminder(req, res, next);
      
      // Проверка результата
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Напоминание не найдено' });
    });
  });

  describe('updateReminder', () => {
    test('должен обновлять напоминание', async () => {
      // Подготовка данных
      req.params.id = reminderId;
      req.body = {
        text: 'Обновленное напоминание',
        completed: true
      };
      
      const mockUpdatedReminder = {
        _id: reminderId,
        userId,
        text: 'Обновленное напоминание',
        date: new Date(),
        completed: true
      };
      
      reminderService.updateReminder.mockResolvedValue(mockUpdatedReminder);
      
      // Выполнение метода
      await reminderController.updateReminder(req, res, next);
      
      // Проверка результата
      expect(reminderService.updateReminder).toHaveBeenCalledWith(userId, reminderId, req.body);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedReminder);
    });
    
    test('должен возвращать 404, если напоминание не найдено', async () => {
      // Подготовка данных
      req.params.id = reminderId;
      
      reminderService.updateReminder.mockResolvedValue(null);
      
      // Выполнение метода
      await reminderController.updateReminder(req, res, next);
      
      // Проверка результата
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Напоминание не найдено' });
    });
  });

  describe('deleteReminder', () => {
    test('должен удалять напоминание и возвращать 204', async () => {
      // Подготовка данных
      req.params.id = reminderId;
      
      reminderService.deleteReminder.mockResolvedValue({ deletedCount: 1 });
      
      // Выполнение метода
      await reminderController.deleteReminder(req, res, next);
      
      // Проверка результата
      expect(reminderService.deleteReminder).toHaveBeenCalledWith(userId, reminderId);
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });
    
    test('должен вызывать next с ошибкой при возникновении исключения', async () => {
      // Подготовка данных
      req.params.id = reminderId;
      const error = new Error('Тестовая ошибка');
      
      reminderService.deleteReminder.mockRejectedValue(error);
      
      // Выполнение метода
      await reminderController.deleteReminder(req, res, next);
      
      // Проверка результата
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
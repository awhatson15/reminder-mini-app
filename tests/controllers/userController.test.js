const userController = require('../../server/controllers/userController');
const userService = require('../../server/services/userService');

// Мокаем сервис
jest.mock('../../server/services/userService');

describe('User Controller', () => {
  let req, res, next;
  const userId = '60d21b4667d0d8992e610c85';
  const telegramId = 123456789;
  
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

  describe('getCurrentUser', () => {
    test('должен возвращать текущего пользователя', async () => {
      // Подготовка данных
      const mockUser = {
        _id: userId,
        telegramId,
        firstName: 'Иван',
        lastName: 'Иванов'
      };
      
      // Мок не нужен, т.к. пользователь уже в req.user
      
      // Выполнение метода
      await userController.getCurrentUser(req, res, next);
      
      // Проверка результата
      expect(res.json).toHaveBeenCalledWith(req.user);
    });
  });

  describe('updateCurrentUser', () => {
    test('должен обновлять текущего пользователя', async () => {
      // Подготовка данных
      const updates = {
        firstName: 'Петр',
        lastName: 'Петров'
      };
      
      req.body = updates;
      
      const mockUpdatedUser = {
        _id: userId,
        telegramId,
        firstName: 'Петр',
        lastName: 'Петров'
      };
      
      userService.updateUser.mockResolvedValue(mockUpdatedUser);
      
      // Выполнение метода
      await userController.updateCurrentUser(req, res, next);
      
      // Проверка результата
      expect(userService.updateUser).toHaveBeenCalledWith(userId, updates);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedUser);
    });
    
    test('должен возвращать 404, если пользователь не найден', async () => {
      // Подготовка данных
      userService.updateUser.mockResolvedValue(null);
      
      // Выполнение метода
      await userController.updateCurrentUser(req, res, next);
      
      // Проверка результата
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Пользователь не найден' });
    });
    
    test('должен вызывать next с ошибкой при возникновении исключения', async () => {
      // Подготовка данных
      const error = new Error('Тестовая ошибка');
      userService.updateUser.mockRejectedValue(error);
      
      // Выполнение метода
      await userController.updateCurrentUser(req, res, next);
      
      // Проверка результата
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteCurrentUser', () => {
    test('должен удалять текущего пользователя и возвращать 204', async () => {
      // Подготовка данных
      userService.deleteUser.mockResolvedValue({ deletedCount: 1 });
      
      // Выполнение метода
      await userController.deleteCurrentUser(req, res, next);
      
      // Проверка результата
      expect(userService.deleteUser).toHaveBeenCalledWith(userId);
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });
    
    test('должен вызывать next с ошибкой при возникновении исключения', async () => {
      // Подготовка данных
      const error = new Error('Тестовая ошибка');
      userService.deleteUser.mockRejectedValue(error);
      
      // Выполнение метода
      await userController.deleteCurrentUser(req, res, next);
      
      // Проверка результата
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('registerUser', () => {
    test('должен регистрировать нового пользователя', async () => {
      // Подготовка данных
      const userData = {
        telegramId,
        firstName: 'Иван',
        lastName: 'Иванов',
        username: 'ivanov'
      };
      
      req.body = userData;
      
      const mockUser = {
        _id: userId,
        ...userData,
        createdAt: new Date(),
        lastActivity: new Date()
      };
      
      userService.findOrCreateUser.mockResolvedValue(mockUser);
      
      // Выполнение метода
      await userController.registerUser(req, res, next);
      
      // Проверка результата
      expect(userService.findOrCreateUser).toHaveBeenCalledWith(userData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });
    
    test('должен вызывать next с ошибкой при возникновении исключения', async () => {
      // Подготовка данных
      const error = new Error('Тестовая ошибка');
      userService.findOrCreateUser.mockRejectedValue(error);
      
      // Выполнение метода
      await userController.registerUser(req, res, next);
      
      // Проверка результата
      expect(next).toHaveBeenCalledWith(error);
    });
  });
}); 
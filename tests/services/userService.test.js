const userService = require('../../server/services/userService');
const userRepository = require('../../server/repositories/userRepository');

// Мокаем репозиторий
jest.mock('../../server/repositories/userRepository');

describe('User Service', () => {
  const userId = '60d21b4667d0d8992e610c85';
  const telegramId = 123456789;
  
  beforeEach(() => {
    // Очищаем все моки перед каждым тестом
    jest.clearAllMocks();
  });

  test('createUser должен создавать пользователя', async () => {
    // Устанавливаем моки
    const mockUser = {
      _id: userId,
      telegramId,
      firstName: 'Иван',
      lastName: 'Иванов',
      username: 'ivanov',
      createdAt: new Date(),
      lastActivity: new Date()
    };

    userRepository.createUser.mockResolvedValue(mockUser);

    // Вызываем тестируемый метод
    const userData = {
      telegramId,
      firstName: 'Иван',
      lastName: 'Иванов',
      username: 'ivanov'
    };
    
    const result = await userService.createUser(userData);

    // Проверяем результат
    expect(result).toEqual(mockUser);
    expect(userRepository.createUser).toHaveBeenCalledWith(userData);
  });

  test('getUserById должен возвращать пользователя', async () => {
    // Устанавливаем моки
    const mockUser = {
      _id: userId,
      telegramId,
      firstName: 'Иван'
    };

    userRepository.findUserById.mockResolvedValue(mockUser);
    userRepository.updateLastActivity.mockResolvedValue({ ...mockUser, lastActivity: new Date() });

    // Вызываем тестируемый метод
    const result = await userService.getUserById(userId);

    // Проверяем результат
    expect(result).toEqual(mockUser);
    expect(userRepository.findUserById).toHaveBeenCalledWith(userId);
    expect(userRepository.updateLastActivity).toHaveBeenCalledWith(userId);
  });

  test('getUserById должен возвращать null если пользователь не найден', async () => {
    // Устанавливаем моки
    userRepository.findUserById.mockResolvedValue(null);

    // Вызываем тестируемый метод
    const result = await userService.getUserById(userId);

    // Проверяем результат
    expect(result).toBeNull();
    expect(userRepository.findUserById).toHaveBeenCalledWith(userId);
    expect(userRepository.updateLastActivity).not.toHaveBeenCalled();
  });

  test('getUserByTelegramId должен возвращать пользователя', async () => {
    // Устанавливаем моки
    const mockUser = {
      _id: userId,
      telegramId,
      firstName: 'Иван'
    };

    userRepository.findUserByTelegramId.mockResolvedValue(mockUser);
    userRepository.updateLastActivity.mockResolvedValue({ ...mockUser, lastActivity: new Date() });

    // Вызываем тестируемый метод
    const result = await userService.getUserByTelegramId(telegramId);

    // Проверяем результат
    expect(result).toEqual(mockUser);
    expect(userRepository.findUserByTelegramId).toHaveBeenCalledWith(telegramId);
    expect(userRepository.updateLastActivity).toHaveBeenCalledWith(userId);
  });

  test('updateUser должен обновлять данные пользователя', async () => {
    // Устанавливаем моки
    const mockUser = {
      _id: userId,
      telegramId,
      firstName: 'Иван',
      lastName: 'Иванов'
    };

    const updatedMockUser = {
      ...mockUser,
      firstName: 'Петр',
      lastName: 'Петров'
    };

    userRepository.findUserById.mockResolvedValue(mockUser);
    userRepository.updateUser.mockResolvedValue(updatedMockUser);
    userRepository.updateLastActivity.mockResolvedValue(updatedMockUser);

    // Вызываем тестируемый метод
    const updates = {
      firstName: 'Петр',
      lastName: 'Петров'
    };
    const result = await userService.updateUser(userId, updates);

    // Проверяем результат
    expect(result).toEqual(updatedMockUser);
    expect(userRepository.findUserById).toHaveBeenCalledWith(userId);
    expect(userRepository.updateUser).toHaveBeenCalledWith(userId, updates);
    expect(userRepository.updateLastActivity).toHaveBeenCalledWith(userId);
  });

  test('deleteUser должен удалять пользователя', async () => {
    // Устанавливаем моки
    userRepository.deleteUser.mockResolvedValue({ deletedCount: 1 });

    // Вызываем тестируемый метод
    await userService.deleteUser(userId);

    // Проверяем вызовы методов
    expect(userRepository.deleteUser).toHaveBeenCalledWith(userId);
  });

  test('getActiveUsers должен возвращать активных пользователей', async () => {
    // Устанавливаем моки
    const mockUsers = [
      {
        _id: userId,
        telegramId,
        firstName: 'Иван',
        lastActivity: new Date()
      },
      {
        _id: '60d21b4667d0d8992e610c86',
        telegramId: 987654321,
        firstName: 'Петр',
        lastActivity: new Date()
      }
    ];

    userRepository.findActiveUsers.mockResolvedValue(mockUsers);

    // Вызываем тестируемый метод
    const days = 7;
    const result = await userService.getActiveUsers(days);

    // Проверяем результат
    expect(result).toEqual(mockUsers);
    expect(userRepository.findActiveUsers).toHaveBeenCalledWith(days);
  });

  test('findOrCreateUser должен искать пользователя или создавать нового', async () => {
    // Устанавливаем моки для случая, когда пользователь найден
    const mockUser = {
      _id: userId,
      telegramId,
      firstName: 'Иван',
      lastActivity: new Date()
    };

    userRepository.findUserByTelegramId.mockResolvedValue(mockUser);
    userRepository.updateLastActivity.mockResolvedValue(mockUser);

    // Вызываем тестируемый метод
    const userData = {
      telegramId,
      firstName: 'Иван'
    };
    
    const result = await userService.findOrCreateUser(userData);

    // Проверяем результат когда пользователь найден
    expect(result).toEqual(mockUser);
    expect(userRepository.findUserByTelegramId).toHaveBeenCalledWith(telegramId);
    expect(userRepository.createUser).not.toHaveBeenCalled();
    expect(userRepository.updateLastActivity).toHaveBeenCalledWith(userId);

    // Сбрасываем моки
    jest.clearAllMocks();

    // Устанавливаем моки для случая, когда пользователь не найден
    userRepository.findUserByTelegramId.mockResolvedValue(null);
    userRepository.createUser.mockResolvedValue(mockUser);

    // Вызываем тестируемый метод еще раз
    const result2 = await userService.findOrCreateUser(userData);

    // Проверяем результат когда пользователь не найден и создается новый
    expect(result2).toEqual(mockUser);
    expect(userRepository.findUserByTelegramId).toHaveBeenCalledWith(telegramId);
    expect(userRepository.createUser).toHaveBeenCalledWith(userData);
    expect(userRepository.updateLastActivity).not.toHaveBeenCalled();
  });
}); 
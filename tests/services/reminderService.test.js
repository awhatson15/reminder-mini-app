const reminderService = require('../../server/services/reminderService');
const reminderRepository = require('../../server/repositories/reminderRepository');
const userRepository = require('../../server/repositories/userRepository');

// Мокаем репозитории
jest.mock('../../server/repositories/reminderRepository');
jest.mock('../../server/repositories/userRepository');

describe('Reminder Service', () => {
  const userId = '60d21b4667d0d8992e610c85';
  const reminderId = '60d21b4667d0d8992e610c86';
  
  beforeEach(() => {
    // Очищаем все моки перед каждым тестом
    jest.clearAllMocks();
  });

  test('createReminder должен создавать напоминание и обновлять lastActivity пользователя', async () => {
    // Устанавливаем моки
    const mockReminder = {
      _id: reminderId,
      userId,
      text: 'Тестовое напоминание',
      date: new Date(),
      completed: false
    };

    const mockUser = {
      _id: userId,
      telegramId: 123456,
      firstName: 'Тест'
    };

    reminderRepository.createReminder.mockResolvedValue(mockReminder);
    userRepository.findUserById.mockResolvedValue(mockUser);
    userRepository.updateLastActivity.mockResolvedValue({ ...mockUser, lastActivity: new Date() });

    // Вызываем тестируемый метод
    const reminderData = {
      text: 'Тестовое напоминание',
      date: new Date()
    };
    
    const result = await reminderService.createReminder(userId, reminderData);

    // Проверяем результат
    expect(result).toEqual(mockReminder);
    expect(reminderRepository.createReminder).toHaveBeenCalledWith({
      userId,
      ...reminderData
    });
    expect(userRepository.updateLastActivity).toHaveBeenCalledWith(userId);
  });

  test('getReminders должен получать напоминания пользователя', async () => {
    // Устанавливаем моки
    const mockReminders = [
      {
        _id: reminderId,
        userId,
        text: 'Напоминание 1',
        date: new Date(),
        completed: false
      },
      {
        _id: '60d21b4667d0d8992e610c87',
        userId,
        text: 'Напоминание 2',
        date: new Date(),
        completed: true
      }
    ];

    reminderRepository.findRemindersByUserId.mockResolvedValue(mockReminders);
    userRepository.updateLastActivity.mockResolvedValue({ _id: userId, lastActivity: new Date() });

    // Вызываем тестируемый метод
    const result = await reminderService.getReminders(userId);

    // Проверяем результат
    expect(result).toEqual(mockReminders);
    expect(reminderRepository.findRemindersByUserId).toHaveBeenCalledWith(userId, expect.any(Object));
    expect(userRepository.updateLastActivity).toHaveBeenCalledWith(userId);
  });

  test('getReminder должен получать одно напоминание пользователя', async () => {
    // Устанавливаем моки
    const mockReminder = {
      _id: reminderId,
      userId,
      text: 'Тестовое напоминание',
      date: new Date(),
      completed: false
    };

    reminderRepository.findReminderById.mockResolvedValue(mockReminder);
    userRepository.updateLastActivity.mockResolvedValue({ _id: userId, lastActivity: new Date() });

    // Вызываем тестируемый метод
    const result = await reminderService.getReminder(userId, reminderId);

    // Проверяем результат
    expect(result).toEqual(mockReminder);
    expect(reminderRepository.findReminderById).toHaveBeenCalledWith(reminderId);
    expect(userRepository.updateLastActivity).toHaveBeenCalledWith(userId);
  });

  test('getReminder должен возвращать ошибку, если напоминание не принадлежит пользователю', async () => {
    // Устанавливаем моки
    const mockReminder = {
      _id: reminderId,
      userId: 'anotherUserId',
      text: 'Напоминание другого пользователя',
      date: new Date(),
      completed: false
    };

    reminderRepository.findReminderById.mockResolvedValue(mockReminder);

    // Вызываем тестируемый метод и ожидаем ошибку
    await expect(reminderService.getReminder(userId, reminderId))
      .rejects.toThrow('Напоминание не принадлежит пользователю');
      
    expect(reminderRepository.findReminderById).toHaveBeenCalledWith(reminderId);
    expect(userRepository.updateLastActivity).not.toHaveBeenCalled();
  });

  test('updateReminder должен обновлять напоминание', async () => {
    // Устанавливаем моки
    const mockReminder = {
      _id: reminderId,
      userId,
      text: 'Тестовое напоминание',
      date: new Date(),
      completed: false
    };

    const updatedMockReminder = {
      ...mockReminder,
      text: 'Обновленное напоминание',
      completed: true
    };

    reminderRepository.findReminderById.mockResolvedValue(mockReminder);
    reminderRepository.updateReminder.mockResolvedValue(updatedMockReminder);
    userRepository.updateLastActivity.mockResolvedValue({ _id: userId, lastActivity: new Date() });

    // Вызываем тестируемый метод
    const updates = {
      text: 'Обновленное напоминание',
      completed: true
    };
    const result = await reminderService.updateReminder(userId, reminderId, updates);

    // Проверяем результат
    expect(result).toEqual(updatedMockReminder);
    expect(reminderRepository.findReminderById).toHaveBeenCalledWith(reminderId);
    expect(reminderRepository.updateReminder).toHaveBeenCalledWith(reminderId, updates);
    expect(userRepository.updateLastActivity).toHaveBeenCalledWith(userId);
  });

  test('deleteReminder должен удалять напоминание', async () => {
    // Устанавливаем моки
    const mockReminder = {
      _id: reminderId,
      userId,
      text: 'Тестовое напоминание для удаления',
      date: new Date(),
      completed: false
    };

    reminderRepository.findReminderById.mockResolvedValue(mockReminder);
    reminderRepository.deleteReminder.mockResolvedValue({ deletedCount: 1 });
    userRepository.updateLastActivity.mockResolvedValue({ _id: userId, lastActivity: new Date() });

    // Вызываем тестируемый метод
    await reminderService.deleteReminder(userId, reminderId);

    // Проверяем вызовы методов
    expect(reminderRepository.findReminderById).toHaveBeenCalledWith(reminderId);
    expect(reminderRepository.deleteReminder).toHaveBeenCalledWith(reminderId);
    expect(userRepository.updateLastActivity).toHaveBeenCalledWith(userId);
  });

  test('getUpcomingReminders должен получать предстоящие напоминания', async () => {
    // Устанавливаем моки
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const mockReminders = [
      {
        _id: reminderId,
        userId,
        text: 'Напоминание на завтра',
        date: tomorrow,
        completed: false
      }
    ];

    reminderRepository.findUpcomingReminders.mockResolvedValue(mockReminders);

    // Вызываем тестируемый метод
    const result = await reminderService.getUpcomingReminders();

    // Проверяем результат
    expect(result).toEqual(mockReminders);
    expect(reminderRepository.findUpcomingReminders).toHaveBeenCalled();
  });
}); 
const mongoose = require('mongoose');
const User = require('../../server/models/User');

describe('User Model', () => {
  test('Создание пользователя с обязательными полями успешно', async () => {
    const userData = {
      telegramId: 123456789,
      firstName: 'Иван',
      lastName: 'Иванов'
    };

    const user = await User.create(userData);
    expect(user._id).toBeDefined();
    expect(user.telegramId).toBe(userData.telegramId);
    expect(user.firstName).toBe(userData.firstName);
    expect(user.lastName).toBe(userData.lastName);
    expect(user.createdAt).toBeDefined();
    expect(user.lastActivity).toBeDefined();
  });

  test('Создание пользователя без telegramId вызывает ошибку', async () => {
    const invalidUser = {
      firstName: 'Иван',
      lastName: 'Иванов'
    };

    await expect(User.create(invalidUser)).rejects.toThrow();
  });

  test('Пользователь с одинаковым telegramId не может быть создан дважды', async () => {
    const userData = {
      telegramId: 123456789,
      firstName: 'Иван'
    };

    await User.create(userData);
    await expect(User.create(userData)).rejects.toThrow();
  });

  test('Поле lastActivity обновляется', async () => {
    const user = await User.create({
      telegramId: 987654321,
      firstName: 'Петр'
    });

    const originalLastActivity = user.lastActivity;
    
    // Ждем 5мс для обеспечения разницы во времени
    await new Promise(resolve => setTimeout(resolve, 5));
    
    // Обновляем пользователя
    const now = new Date();
    user.lastActivity = now;
    await user.save();
    
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.lastActivity.getTime()).not.toBe(originalLastActivity.getTime());
    expect(updatedUser.lastActivity.getTime()).toBe(now.getTime());
  });

  test('Индекс для telegramId настроен правильно', async () => {
    const indexes = await User.collection.getIndexes();
    
    // Проверяем, что существует индекс для telegramId
    expect(indexes.telegramId_1).toBeDefined();
    
    // Проверяем, что индекс уникальный
    expect(indexes.telegramId_1.unique).toBe(true);
  });

  test('Индекс для username настроен правильно', async () => {
    const indexes = await User.collection.getIndexes();
    
    // Проверяем, что существует индекс для username
    expect(indexes.username_1).toBeDefined();
  });

  test('Индекс для lastActivity настроен правильно', async () => {
    const indexes = await User.collection.getIndexes();
    
    // Проверяем, что существует индекс для lastActivity с сортировкой по убыванию (-1)
    expect(indexes.lastActivity_n1).toBeDefined();
  });
}); 
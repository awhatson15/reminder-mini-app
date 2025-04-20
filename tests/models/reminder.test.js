const mongoose = require('mongoose');
const Reminder = require('../../server/models/Reminder');
const User = require('../../server/models/User');

describe('Reminder Model', () => {
  let testUser;

  beforeEach(async () => {
    // Создаем тестового пользователя для всех тестов
    testUser = await User.create({
      telegramId: 12345678,
      firstName: 'Тест',
      lastName: 'Пользователь'
    });
  });

  afterEach(async () => {
    // Очищаем коллекции после каждого теста
    await Reminder.deleteMany();
    await User.deleteMany();
  });

  test('Создание напоминания с обязательными полями успешно', async () => {
    const reminderData = {
      userId: testUser._id,
      text: 'Тестовое напоминание',
      date: new Date()
    };

    const reminder = await Reminder.create(reminderData);
    expect(reminder._id).toBeDefined();
    expect(reminder.userId.toString()).toBe(testUser._id.toString());
    expect(reminder.text).toBe(reminderData.text);
    expect(reminder.date.getTime()).toBe(reminderData.date.getTime());
    expect(reminder.createdAt).toBeDefined();
    expect(reminder.completed).toBe(false);
  });

  test('Создание напоминания без userId вызывает ошибку', async () => {
    const invalidReminder = {
      text: 'Недействительное напоминание',
      date: new Date()
    };

    await expect(Reminder.create(invalidReminder)).rejects.toThrow();
  });

  test('Создание напоминания без текста вызывает ошибку', async () => {
    const invalidReminder = {
      userId: testUser._id,
      date: new Date()
    };

    await expect(Reminder.create(invalidReminder)).rejects.toThrow();
  });

  test('Создание напоминания без даты вызывает ошибку', async () => {
    const invalidReminder = {
      userId: testUser._id,
      text: 'Напоминание без даты'
    };

    await expect(Reminder.create(invalidReminder)).rejects.toThrow();
  });

  test('Поле completed изменяется', async () => {
    const reminder = await Reminder.create({
      userId: testUser._id,
      text: 'Напоминание для выполнения',
      date: new Date()
    });

    expect(reminder.completed).toBe(false);
    
    // Меняем значение поля completed
    reminder.completed = true;
    await reminder.save();
    
    const updatedReminder = await Reminder.findById(reminder._id);
    expect(updatedReminder.completed).toBe(true);
  });

  test('Поиск напоминаний пользователя работает', async () => {
    // Создаем несколько напоминаний для одного пользователя
    const reminders = [
      { userId: testUser._id, text: 'Напоминание 1', date: new Date() },
      { userId: testUser._id, text: 'Напоминание 2', date: new Date() },
      { userId: testUser._id, text: 'Напоминание 3', date: new Date() }
    ];
    
    await Reminder.create(reminders);
    
    // Ищем напоминания пользователя
    const foundReminders = await Reminder.find({ userId: testUser._id });
    expect(foundReminders.length).toBe(3);
  });

  test('Индекс для userId и date настроен правильно', async () => {
    const indexes = await Reminder.collection.getIndexes();
    
    // Проверяем составной индекс userId + date
    expect(indexes.userId_1_date_1).toBeDefined();
  });

  test('Индекс для completed и date настроен правильно', async () => {
    const indexes = await Reminder.collection.getIndexes();
    
    // Проверяем составной индекс completed + date
    expect(indexes.completed_1_date_1).toBeDefined();
  });
}); 
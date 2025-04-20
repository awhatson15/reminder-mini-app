const { validateRequiredFields, validateFieldTypes } = require('../../server/middlewares/validation');

describe('Validation Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    // Создаем моки для req, res и next
    req = {
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
    
    // Очищаем все моки перед каждым тестом
    jest.clearAllMocks();
  });

  describe('validateRequiredFields', () => {
    test('должен пропускать запрос, если все обязательные поля присутствуют', () => {
      // Подготовка запроса
      req.body = {
        text: 'Тестовое напоминание',
        date: new Date()
      };
      
      // Создаем middleware с обязательными полями
      const validator = validateRequiredFields(['text', 'date']);
      
      // Вызываем middleware
      validator(req, res, next);
      
      // Проверяем результат
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    test('должен возвращать ошибку 400, если отсутствует обязательное поле', () => {
      // Подготовка запроса с отсутствующим полем
      req.body = {
        text: 'Тестовое напоминание'
        // date отсутствует
      };
      
      // Создаем middleware с обязательными полями
      const validator = validateRequiredFields(['text', 'date']);
      
      // Вызываем middleware
      validator(req, res, next);
      
      // Проверяем результат
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Отсутствуют обязательные поля: date'
      });
    });
    
    test('должен возвращать ошибку 400 с перечислением всех отсутствующих полей', () => {
      // Подготовка запроса с отсутствующими полями
      req.body = {
        // Все поля отсутствуют
      };
      
      // Создаем middleware с обязательными полями
      const validator = validateRequiredFields(['text', 'date', 'userId']);
      
      // Вызываем middleware
      validator(req, res, next);
      
      // Проверяем результат
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Отсутствуют обязательные поля: text, date, userId'
      });
    });
  });

  describe('validateFieldTypes', () => {
    test('должен пропускать запрос, если все поля имеют правильный тип', () => {
      // Подготовка запроса
      req.body = {
        text: 'Тестовое напоминание',
        date: new Date(),
        count: 5,
        completed: false,
        tags: ['тест', 'важное']
      };
      
      // Создаем middleware с типами полей
      const validator = validateFieldTypes({
        text: 'string',
        date: 'date',
        count: 'number',
        completed: 'boolean',
        tags: 'array'
      });
      
      // Вызываем middleware
      validator(req, res, next);
      
      // Проверяем результат
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    test('должен пропускать запрос, если поля из схемы отсутствуют в запросе', () => {
      // Подготовка запроса с меньшим количеством полей
      req.body = {
        text: 'Тестовое напоминание',
        // Другие поля отсутствуют, но это не ошибка
      };
      
      // Создаем middleware с типами полей
      const validator = validateFieldTypes({
        text: 'string',
        date: 'date',
        count: 'number'
      });
      
      // Вызываем middleware
      validator(req, res, next);
      
      // Проверяем результат
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    test('должен возвращать ошибку 400, если поле имеет неправильный тип', () => {
      // Подготовка запроса с неправильным типом
      req.body = {
        text: 123, // Должно быть строкой
        date: new Date()
      };
      
      // Создаем middleware с типами полей
      const validator = validateFieldTypes({
        text: 'string',
        date: 'date'
      });
      
      // Вызываем middleware
      validator(req, res, next);
      
      // Проверяем результат
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Неверный тип поля: text должно быть string'
      });
    });
    
    test('должен возвращать ошибку для первого неправильного типа, если их несколько', () => {
      // Подготовка запроса с несколькими неправильными типами
      req.body = {
        text: 123, // Должно быть строкой
        date: 'не дата', // Должно быть датой
        completed: 'не boolean' // Должно быть boolean
      };
      
      // Создаем middleware с типами полей
      const validator = validateFieldTypes({
        text: 'string',
        date: 'date',
        completed: 'boolean'
      });
      
      // Вызываем middleware
      validator(req, res, next);
      
      // Проверяем результат - ошибка для первого неверного поля
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Неверный тип поля: text должно быть string'
      });
    });
    
    test('должен правильно проверять тип даты', () => {
      // Подготовка запроса с неправильным типом даты
      req.body = {
        text: 'Тестовое напоминание',
        date: 'не дата'
      };
      
      // Создаем middleware с типами полей
      const validator = validateFieldTypes({
        text: 'string',
        date: 'date'
      });
      
      // Вызываем middleware
      validator(req, res, next);
      
      // Проверяем результат
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Неверный тип поля: date должно быть date'
      });
    });
    
    test('должен правильно проверять тип массива', () => {
      // Подготовка запроса с неправильным типом массива
      req.body = {
        text: 'Тестовое напоминание',
        tags: 'не массив'
      };
      
      // Создаем middleware с типами полей
      const validator = validateFieldTypes({
        text: 'string',
        tags: 'array'
      });
      
      // Вызываем middleware
      validator(req, res, next);
      
      // Проверяем результат
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Неверный тип поля: tags должно быть array'
      });
    });
  });
}); 
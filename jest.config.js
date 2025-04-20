module.exports = {
  // Директории где Jest будет искать тестовые файлы
  testMatch: ['**/tests/**/*.test.js'],
  
  // Директории, которые Jest должен игнорировать
  testPathIgnorePatterns: ['/node_modules/', '/app/'],
  
  // Окружение для запуска тестов
  testEnvironment: 'node',
  
  // Покрытие кода тестами
  collectCoverage: true,
  collectCoverageFrom: [
    'server/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  
  // Настройка таймаутов для тестов
  testTimeout: 30000,
  
  // Перед каждым прогоном тестов очищаем моки
  clearMocks: true,
  
  // Файл для установки переменных окружения перед запуском тестов
  setupFiles: ['<rootDir>/tests/setup.js'],
  
  // Уровень детализации вывода
  verbose: true
}; 
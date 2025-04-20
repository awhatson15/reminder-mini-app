@echo off
echo ==== Установка зависимостей Reminder Mini App ====

REM Проверка наличия Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Node.js не установлен. Пожалуйста, установите Node.js версии 16 или выше.
  exit /b 1
)

REM Установка зависимостей сервера
echo Установка зависимостей сервера...
call npm install

REM Проверка наличия директории app
if not exist "app" (
  echo Директория 'app' не найдена. Убедитесь, что вы находитесь в корневой директории проекта.
  exit /b 1
)

REM Установка зависимостей клиента
echo Установка зависимостей клиента...
cd app && call npm install
cd ..

REM Создание директории для логов
echo Создание директории для логов...
if not exist "logs" mkdir logs

REM Создание .env файла, если он не существует
if not exist ".env" (
  echo .env файл не найден. Создаем на основе .env.example...
  copy .env.example .env
  echo .env файл создан. Пожалуйста, отредактируйте его и укажите правильные значения.
) else (
  echo .env файл уже существует.
)

echo ==== Установка завершена успешно! ====
echo Для запуска в режиме разработки выполните: npm run dev:all
echo Для сборки клиента выполните: npm run build
echo Для запуска в режиме production выполните: npm start 
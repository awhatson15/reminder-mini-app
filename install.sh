#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==== Установка зависимостей Reminder Mini App ====${NC}"

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js не установлен. Пожалуйста, установите Node.js версии 16 или выше.${NC}"
    exit 1
fi

# Проверка версии Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${YELLOW}Внимание: вы используете Node.js версии $NODE_VERSION. Рекомендуется использовать Node.js 16 или выше.${NC}"
fi

# Установка зависимостей сервера
echo -e "${BLUE}Установка зависимостей сервера...${NC}"
npm install

# Проверка наличия директории app
if [ ! -d "app" ]; then
    echo -e "${RED}Директория 'app' не найдена. Убедитесь, что вы находитесь в корневой директории проекта.${NC}"
    exit 1
fi

# Установка зависимостей клиента
echo -e "${BLUE}Установка зависимостей клиента...${NC}"
cd app && npm install
cd ..

# Создание директории для логов
echo -e "${BLUE}Создание директории для логов...${NC}"
mkdir -p logs

# Создание .env файла, если он не существует
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}.env файл не найден. Создаем на основе .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}.env файл создан. Пожалуйста, отредактируйте его и укажите правильные значения.${NC}"
else
    echo -e "${GREEN}.env файл уже существует.${NC}"
fi

echo -e "${GREEN}==== Установка завершена успешно! ====${NC}"
echo -e "Для запуска в режиме разработки выполните: ${YELLOW}npm run dev:all${NC}"
echo -e "Для сборки клиента выполните: ${YELLOW}npm run build${NC}"
echo -e "Для запуска в режиме production выполните: ${YELLOW}npm start${NC}" 
FROM node:18-alpine as builder

# Установка рабочей директории
WORKDIR /app

# Копирование package.json и установка зависимостей сервера
COPY package*.json ./
RUN npm install

# Копирование package.json для клиента и установка зависимостей
COPY app/package*.json ./app/
RUN cd app && npm install

# Копирование исходного кода
COPY . .

# Сборка React приложения
RUN cd app && npm run build

# Финальный образ
FROM node:18-alpine

WORKDIR /app

# Копирование зависимостей и собранных файлов из предыдущего этапа
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/app/build ./app/build
COPY --from=builder /app/server ./server
COPY --from=builder /app/package*.json ./
COPY firebase-service-account.json ./firebase-service-account.json

# Создание директории для логов
RUN mkdir -p /app/logs

# Открытие порта
EXPOSE 3000

# Запуск приложения
CMD ["npm", "start"] 
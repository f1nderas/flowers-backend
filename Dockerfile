# Используем образ Node.js версии 18 на основе Alpine Linux
FROM node:18-alpine
# Устанавливаем рабочую директорию внутри контейнера.
WORKDIR /app
# Копируем файлы package.json и package-lock.json
COPY package*.json ./
# Устанавливаем зависимости
RUN npm install
# Копируем весь исходный код в контейнер.
COPY . .
# Генерируем Prisma Client на основе вашей схемы.
RUN npx prisma generate
# Собираем приложение NestJS (компилируем TypeScript в JavaScript в папку dist).
RUN npm run build
# Открываем порт 5050
EXPOSE 5050
# Команда запуска контейнера
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]

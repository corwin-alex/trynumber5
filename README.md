# Система онлайн-тестирования

Веб-приложение для проведения онлайн-тестов с автоматической оценкой результатов.

## Стек технологий

- **Frontend**: React, React Router, SCSS
- **Backend**: Node.js, Express.js
- **База данных**: PostgreSQL
- **Сборка**: Webpack

## Функционал

### Для администратора:
- Создание и удаление тестов
- Добавление вопросов к тестам (с вариантами ответов)
- Просмотр всех результатов студентов

### Для студента:
- Прохождение доступных тестов
- Автоматическая оценка результатов
- Просмотр своих результатов

## Установка и запуск

### 1. Требования
- Node.js (v14+)
- PostgreSQL

### 2. Настройка базы данных

База данных создается автоматически при первом запуске сервера. 
Убедитесь, что PostgreSQL запущен и учетные данные в `.env` корректны.

Примечание: Пользователь PostgreSQL должен иметь права на создание баз данных.

### 3. Настройка переменных окружения

Отредактируйте файл `.env`:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=online_testing
DB_USER=postgres
DB_PASSWORD=ваш_пароль
JWT_SECRET=ваш_секретный_ключ
```

### 4. Установка зависимостей
```bash
npm install
```

### 5. Запуск приложения

#### Вариант A: Раздельный запуск (разработка)

Терминал 1 - Backend:
```bash
npm run dev:server
```

Терминал 2 - Frontend:
```bash
npm run dev:client
```

#### Вариант B: Продакшен сборка

```bash
npm run build
npm start
```

## Доступ по умолчанию

После первого запуска создается аккаунт администратора:
- **Логин**: admin
- **Пароль**: admin123

## Структура проекта

```
/workspace
├── server/                 # Backend (Node.js + Express)
│   ├── index.js           # Точка входа сервера
│   ├── db.js              # Подключение к БД
│   ├── createTables.js    # Создание таблиц
│   └── routes/            # API маршруты
│       ├── auth.js        # Авторизация
│       ├── tests.js       # Тесты
│       └── results.js     # Результаты
├── client/                # Frontend (React)
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js
│       ├── App.js
│       ├── styles/
│       │   └── app.scss
│       └── pages/
│           ├── Login.js
│           ├── Register.js
│           ├── TestList.js
│           ├── TakeTest.js
│           ├── Results.js
│           └── AdminPanel.js
├── webpack.config.js      # Конфигурация Webpack
├── .babelrc              # Конфигурация Babel
├── .env                  # Переменные окружения
└── package.json
```

## API Endpoints

### Авторизация
- `POST /api/auth/register` - Регистрация пользователя
- `POST /api/auth/login` - Вход пользователя

### Тесты
- `GET /api/tests` - Получить все тесты
- `GET /api/tests/:id` - Получить тест с вопросами
- `POST /api/tests` - Создать тест (админ)
- `POST /api/tests/:id/questions` - Добавить вопрос (админ)
- `DELETE /api/tests/:id` - Удалить тест (админ)

### Результаты
- `POST /api/results/submit` - Отправить результаты теста
- `GET /api/results/my-results` - Мои результаты
- `GET /api/results/all` - Все результаты (админ)

## Лицензия

ISC

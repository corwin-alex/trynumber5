const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const createTables = require('./createTables');
const authRoutes = require('./routes/auth');
const { router: testRoutes } = require('./routes/tests');
const resultRoutes = require('./routes/results');
const { checkDatabaseConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/results', resultRoutes);

// Инициализация базы данных и таблиц при запуске сервера (асинхронно, не блокируя сервер)
const initializeDatabase = async () => {
  try {
    // Проверяем подключение к базе данных
    await checkDatabaseConnection();
    
    // Создаем таблицы
    await createTables();
    
    console.log('База данных успешно инициализирована');
  } catch (error) {
    console.error('Ошибка инициализации базы данных:', error);
    // Не завершаем процесс, чтобы сервер продолжил работать
  }
};

initializeDatabase();

// Раздача статических файлов в продакшене
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('/*path', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Что-то пошло не так!' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Режим: ${process.env.NODE_ENV || 'development'}`);
});

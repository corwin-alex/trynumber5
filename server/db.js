const { Pool } = require('pg');
require('dotenv').config();

// Единый пул для подключения к нашей БД
// Для Render.com используйте переменные окружения из панели управления
const pool = new Pool({
  host: process.env.DB_HOST || process.env.PGHOST,
  port: process.env.DB_PORT || process.env.PGPORT || 5432,
  database: process.env.DB_NAME || process.env.PGDATABASE,
  user: process.env.DB_USER || process.env.PGUSER,
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Функция проверки подключения к базе данных
const checkDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('Подключение к базе данных успешно');
    return true;
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error.message);
    throw error;
  }
};

pool.on('connect', () => {
  console.log('База данных подключена');
});

module.exports = { pool, checkDatabaseConnection };

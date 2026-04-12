const { Pool } = require('pg');
require('dotenv').config();

// Пул для подключения к postgres (без указания конкретной БД)
const adminPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: 'postgres', // Подключаемся к системной БД postgres
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Пул для подключения к нашей БД
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Функция создания базы данных если она не существует
const ensureDatabaseExists = async () => {
  const dbName = process.env.DB_NAME;
  
  try {
    // Проверяем существует ли база данных
    const checkResult = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );
    
    if (checkResult.rows.length === 0) {
      // База данных не существует, создаем её
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`База данных "${dbName}" успешно создана`);
    } else {
      console.log(`База данных "${dbName}" уже существует`);
    }
    
    await adminPool.end();
    return true;
  } catch (error) {
    console.error('Ошибка при создании базы данных:', error);
    throw error;
  }
};

pool.on('connect', () => {
  console.log('База данных подключена');
});

module.exports = { pool, ensureDatabaseExists };

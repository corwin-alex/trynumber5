const { Pool } = require('pg');
require('dotenv').config();

// Поддержка как DATABASE_URL (для Render), так и отдельных переменных
let pool;

if (process.env.DATABASE_URL) {
  // Использование DATABASE_URL (Render.com и другие облачные платформы)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
} else {
  // Использование отдельных переменных окружения (локальная разработка)
  const adminPool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: 'postgres',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  // Функция создания базы данных если она не существует (только для локальной разработки)
  const ensureDatabaseExists = async () => {
    const dbName = process.env.DB_NAME;
    
    try {
      const checkResult = await adminPool.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [dbName]
      );
      
      if (checkResult.rows.length === 0) {
        await adminPool.query(`CREATE DATABASE ${dbName}`);
        console.log(`База данных "${dbName}" успешно создана`);
      } else {
        console.log(`База данных "${dbName}" уже существует`);
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка при создании базы данных:', error);
      throw error;
    }
  };

  module.exports.ensureDatabaseExists = ensureDatabaseExists;
}

pool.on('connect', () => {
  console.log('База данных подключена');
});

module.exports.pool = pool;

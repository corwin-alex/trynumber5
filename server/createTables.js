const { pool } = require('./db');

const createTables = async () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'student')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createTestsTable = `
    CREATE TABLE IF NOT EXISTS tests (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createQuestionsTable = `
    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
      question_text TEXT NOT NULL,
      options JSONB NOT NULL,
      correct_answer INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createResultsTable = `
    CREATE TABLE IF NOT EXISTS results (
      id SERIAL PRIMARY KEY,
      test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      percentage NUMERIC(5,2) NOT NULL,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(createUsersTable);
    console.log('Таблица users создана');

    await pool.query(createTestsTable);
    console.log('Таблица tests создана');

    await pool.query(createQuestionsTable);
    console.log('Таблица questions создана');

    await pool.query(createResultsTable);
    console.log('Таблица results создана');

    // Создаем админа по умолчанию если не существует
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    await pool.query(
      `INSERT INTO users (username, password, role) 
       SELECT $1, $2, $3 
       WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = $1)`,
      ['admin', adminPassword, 'admin']
    );
    console.log('Администратор по умолчанию создан (логин: admin, пароль: admin123)');

    console.log('Все таблицы успешно созданы и настроены');
  } catch (error) {
    console.error('Ошибка создания таблиц:', error);
    throw error;
  }
};

module.exports = createTables;

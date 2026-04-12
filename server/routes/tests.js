const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

const router = express.Router();

// Middleware для проверки токена
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Токен не предоставлен' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Неверный токен' });
  }
};

// Middleware для проверки роли админа
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора' });
  }
  next();
};

// Получить все тесты
router.get('/', async (req, res) => {
  try {
    const tests = await pool.query(
      'SELECT t.*, u.username as creator FROM tests t LEFT JOIN users u ON t.created_by = u.id ORDER BY t.created_at DESC'
    );
    res.json(tests.rows);
  } catch (error) {
    console.error('Ошибка получения тестов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить тест по ID с вопросами
router.get('/:id', async (req, res) => {
  try {
    const test = await pool.query('SELECT * FROM tests WHERE id = $1', [req.params.id]);
    
    if (test.rows.length === 0) {
      return res.status(404).json({ message: 'Тест не найден' });
    }

    const questions = await pool.query(
      'SELECT id, question_text, options FROM questions WHERE test_id = $1',
      [req.params.id]
    );

    res.json({
      test: test.rows[0],
      questions: questions.rows
    });
  } catch (error) {
    console.error('Ошибка получения теста:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создать тест (только админ)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Название теста обязательно' });
    }

    const newTest = await pool.query(
      'INSERT INTO tests (title, description, created_by) VALUES ($1, $2, $3) RETURNING *',
      [title, description, req.user.id]
    );

    res.status(201).json({
      message: 'Тест успешно создан',
      test: newTest.rows[0]
    });
  } catch (error) {
    console.error('Ошибка создания теста:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавить вопрос к тесту (только админ)
router.post('/:id/questions', verifyToken, isAdmin, async (req, res) => {
  try {
    const { question_text, options, correct_answer } = req.body;

    if (!question_text || !options || correct_answer === undefined) {
      return res.status(400).json({ message: 'Все поля вопроса обязательны' });
    }

    const test = await pool.query('SELECT * FROM tests WHERE id = $1', [req.params.id]);
    
    if (test.rows.length === 0) {
      return res.status(404).json({ message: 'Тест не найден' });
    }

    const newQuestion = await pool.query(
      'INSERT INTO questions (test_id, question_text, options, correct_answer) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.params.id, question_text, JSON.stringify(options), correct_answer]
    );

    res.status(201).json({
      message: 'Вопрос успешно добавлен',
      question: newQuestion.rows[0]
    });
  } catch (error) {
    console.error('Ошибка добавления вопроса:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удалить тест (только админ)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM tests WHERE id = $1', [req.params.id]);
    res.json({ message: 'Тест успешно удален' });
  } catch (error) {
    console.error('Ошибка удаления теста:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = { router, verifyToken, isAdmin };

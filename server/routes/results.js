const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('./db');
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

// Пройти тест и сохранить результат
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { test_id, answers } = req.body;

    if (!test_id || !answers) {
      return res.status(400).json({ message: 'ID теста и ответы обязательны' });
    }

    // Получаем правильные ответы
    const questions = await pool.query(
      'SELECT id, correct_answer FROM questions WHERE test_id = $1',
      [test_id]
    );

    if (questions.rows.length === 0) {
      return res.status(404).json({ message: 'Вопросы не найдены' });
    }

    // Подсчет результатов
    let score = 0;
    const totalQuestions = questions.rows.length;

    questions.rows.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer === question.correct_answer) {
        score++;
      }
    });

    const percentage = (score / totalQuestions) * 100;

    // Сохранение результата
    const result = await pool.query(
      `INSERT INTO results (test_id, user_id, score, total_questions, percentage) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [test_id, req.user.id, score, totalQuestions, percentage]
    );

    res.json({
      message: 'Тест завершен',
      result: {
        score,
        totalQuestions,
        percentage: percentage.toFixed(2),
        completedAt: result.rows[0].completed_at
      }
    });
  } catch (error) {
    console.error('Ошибка отправки теста:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить результаты пользователя
router.get('/my-results', verifyToken, async (req, res) => {
  try {
    const results = await pool.query(
      `SELECT r.*, t.title as test_title 
       FROM results r 
       JOIN tests t ON r.test_id = t.id 
       WHERE r.user_id = $1 
       ORDER BY r.completed_at DESC`,
      [req.user.id]
    );

    res.json(results.rows);
  } catch (error) {
    console.error('Ошибка получения результатов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить все результаты (только админ)
router.get('/all', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }

  try {
    const results = await pool.query(
      `SELECT r.*, t.title as test_title, u.username as student_name 
       FROM results r 
       JOIN tests t ON r.test_id = t.id 
       JOIN users u ON r.user_id = u.id 
       ORDER BY r.completed_at DESC`
    );

    res.json(results.rows);
  } catch (error) {
    console.error('Ошибка получения всех результатов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;

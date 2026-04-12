import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';

// const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
const API_URL = process.env.API_URL;

function AdminPanel() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTest, setNewTest] = useState({ title: '', description: '' });
  const [selectedTest, setSelectedTest] = useState(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: 0
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.role !== 'admin') {
      window.location.href = '/tests';
      return;
    }
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/tests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTests(data);
    } catch (err) {
      setError('Ошибка загрузки тестов');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTest)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка создания теста');
      }

      setMessage('Тест успешно создан!');
      setNewTest({ title: '', description: '' });
      setShowCreateForm(false);
      fetchTests();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/tests/${selectedTest.id}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newQuestion)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка добавления вопроса');
      }

      setMessage('Вопрос успешно добавлен!');
      setNewQuestion({
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: 0
      });
      setShowAddQuestion(false);
      setSelectedTest(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот тест?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/tests/${testId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Ошибка удаления теста');
      }

      setMessage('Тест успешно удален');
      fetchTests();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading"><div className="spinner"></div></div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1>Панель администратора</h1>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="admin-panel">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn"
            style={{ width: 'auto', padding: '10px 20px', marginBottom: '20px' }}
          >
            {showCreateForm ? 'Отмена' : 'Создать новый тест'}
          </button>

          {showCreateForm && (
            <div className="card create-form">
              <h3>Создание теста</h3>
              <form onSubmit={handleCreateTest}>
                <div className="form-group">
                  <label>Название теста *</label>
                  <input
                    type="text"
                    value={newTest.title}
                    onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Описание</label>
                  <textarea
                    value={newTest.description}
                    onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                    rows="3"
                    style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '5px' }}
                  />
                </div>
                <button type="submit" className="btn">Создать тест</button>
              </form>
            </div>
          )}

          {selectedTest && showAddQuestion && (
            <div className="card create-form">
              <h3>Добавление вопроса к тесту: {selectedTest.title}</h3>
              <form onSubmit={handleAddQuestion}>
                <div className="form-group">
                  <label>Текст вопроса *</label>
                  <textarea
                    value={newQuestion.question_text}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                    required
                    rows="3"
                    style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '5px' }}
                  />
                </div>
                <div className="form-group">
                  <label>Варианты ответов *</label>
                  {newQuestion.options.map((option, index) => (
                    <input
                      key={index}
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Вариант ${index + 1}`}
                      required
                      style={{ marginBottom: '10px' }}
                    />
                  ))}
                </div>
                <div className="form-group">
                  <label>Правильный ответ *</label>
                  <select
                    value={newQuestion.correct_answer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: parseInt(e.target.value) })}
                  >
                    {newQuestion.options.map((_, index) => (
                      <option key={index} value={index}>
                        Вариант {index + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn">Добавить вопрос</button>
                <button
                  type="button"
                  onClick={() => { setShowAddQuestion(false); setSelectedTest(null); }}
                  className="btn btn-secondary"
                  style={{ marginTop: '10px' }}
                >
                  Отмена
                </button>
              </form>
            </div>
          )}

          <h2>Существующие тесты</h2>
          {tests.length === 0 ? (
            <div className="empty-state">
              <h3>Нет созданных тестов</h3>
              <p>Создайте первый тест, чтобы начать</p>
            </div>
          ) : (
            <div className="test-list">
              {tests.map(test => (
                <div key={test.id} className="test-card">
                  <h3>{test.title}</h3>
                  <p>{test.description || 'Описание отсутствует'}</p>
                  <div className="test-meta">
                    <span className="creator">Создал: {test.creator || 'Админ'}</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => { setSelectedTest(test); setShowAddQuestion(true); }}
                        className="btn"
                        style={{ width: 'auto', padding: '6px 12px', fontSize: '14px' }}
                      >
                        Добавить вопрос
                      </button>
                      <button
                        onClick={() => handleDeleteTest(test.id)}
                        className="btn btn-secondary"
                        style={{ width: 'auto', padding: '6px 12px', fontSize: '14px', background: '#dc3545' }}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = require('react-router-dom').useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link to="/tests" className="logo">📝 Онлайн-тестирование</Link>
        <div className="nav-links">
          <Link to="/tests">Тесты</Link>
          <Link to="/results">Результаты</Link>
          {user.role === 'admin' && <Link to="/admin">Панель админа</Link>}
        </div>
        <div className="user-info">
          <span>{user.username}</span>
          <span className="role-badge">{user.role === 'admin' ? 'Админ' : 'Студент'}</span>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: 'auto', padding: '8px 16px' }}>
            Выход
          </button>
        </div>
      </div>
    </nav>
  );
}

export default AdminPanel;

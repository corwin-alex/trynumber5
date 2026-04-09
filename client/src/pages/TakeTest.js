import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';

const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

function TakeTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTest();
  }, [id]);

  const fetchTest = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/tests/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Тест не найден');
      }
      
      const data = await response.json();
      setTest(data.test);
      setQuestions(data.questions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount !== questions.length) {
      if (!window.confirm(`Вы ответили на ${answeredCount} из ${questions.length} вопросов. Продолжить?`)) {
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/results/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          test_id: parseInt(id),
          answers
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Ошибка отправки теста');
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading"><div className="spinner"></div></div>
      </div>
    );
  }

  if (result) {
    const percentage = parseFloat(result.percentage);
    let scoreClass = 'score-bad';
    if (percentage >= 80) scoreClass = 'score-good';
    else if (percentage >= 60) scoreClass = 'score-average';

    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="result-display">
            <div className="score-circle">{percentage}%</div>
            <h2 className="result-text">Тест завершен!</h2>
            <p className="result-details">
              Вы набрали {result.score} из {result.totalQuestions} баллов
            </p>
            <Link to="/tests" className="btn" style={{ display: 'inline-block', width: 'auto' }}>
              К списку тестов
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div style={{ marginBottom: '20px' }}>
          <Link to="/tests" className="btn btn-secondary" style={{ width: 'auto', padding: '8px 16px' }}>
            ← Назад к тестам
          </Link>
        </div>

        <h1>{test?.title}</h1>
        {test?.description && <p style={{ color: '#666', marginBottom: '30px' }}>{test.description}</p>}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          {questions.map((question, index) => (
            <div key={question.id} className="question-card">
              <div className="question-text">
                Вопрос {index + 1}: {question.question_text}
              </div>
              <div className="options">
                {question.options.map((option, optIndex) => (
                  <label
                    key={optIndex}
                    className={`option ${answers[question.id] === optIndex ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={answers[question.id] === optIndex}
                      onChange={() => handleAnswerChange(question.id, optIndex)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button 
            type="submit" 
            className="btn" 
            disabled={submitting}
            style={{ marginTop: '20px' }}
          >
            {submitting ? 'Отправка...' : 'Завершить тест'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Импортируем Navbar из TestList или создаем отдельно
function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

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

export default TakeTest;

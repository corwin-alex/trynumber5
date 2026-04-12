import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';

// В production используем relative URL (тот же домен), в development - localhost
const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchResults();
  }, [showAll]);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = showAll && user?.role === 'admin' ? '/api/results/all' : '/api/results/my-results';
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки результатов');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreClass = (percentage) => {
    const pct = parseFloat(percentage);
    if (pct >= 80) return 'score-good';
    if (pct >= 60) return 'score-average';
    return 'score-bad';
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>{showAll ? 'Все результаты' : 'Мои результаты'}</h1>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '8px 16px' }}
            >
              {showAll ? 'Показать мои' : 'Показать все'}
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {results.length === 0 ? (
          <div className="empty-state">
            <h3>Нет результатов</h3>
            <p>Пройдите тесты, чтобы увидеть свои результаты</p>
            <Link to="/tests" className="btn" style={{ display: 'inline-block', width: 'auto', marginTop: '20px' }}>
              К тестам
            </Link>
          </div>
        ) : (
          <table className="results-table">
            <thead>
              <tr>
                <th>Тест</th>
                {showAll && <th>Студент</th>}
                <th>Баллы</th>
                <th>Процент</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {results.map(result => (
                <tr key={result.id}>
                  <td>{result.test_title}</td>
                  {showAll && <td>{result.student_name}</td>}
                  <td>{result.score} из {result.total_questions}</td>
                  <td className={getScoreClass(result.percentage)}>
                    {parseFloat(result.percentage).toFixed(1)}%
                  </td>
                  <td>{new Date(result.completed_at).toLocaleDateString('ru-RU')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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

export default Results;

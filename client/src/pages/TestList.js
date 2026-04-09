import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

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

function TestList() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tests`);
      const data = await response.json();
      setTests(data);
    } catch (err) {
      setError('Ошибка загрузки тестов');
    } finally {
      setLoading(false);
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

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1>Доступные тесты</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        {tests.length === 0 ? (
          <div className="empty-state">
            <h3>Нет доступных тестов</h3>
            <p>Обратитесь к администратору для создания тестов</p>
          </div>
        ) : (
          <div className="test-list">
            {tests.map(test => (
              <div key={test.id} className="test-card">
                <h3>{test.title}</h3>
                <p>{test.description || 'Описание отсутствует'}</p>
                <div className="test-meta">
                  <span className="creator">Создал: {test.creator || 'Админ'}</span>
                  <Link to={`/test/${test.id}`} className="btn" style={{ width: 'auto', padding: '8px 16px' }}>
                    Пройти тест
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TestList;

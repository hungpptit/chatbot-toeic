import '../styles/Header.css';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  activeTab: 'home' | 'vocab' | 'chat';
  onChangeTab: (tab: 'home' | 'vocab' | 'chat') => void;
}

export default function Header({ activeTab, onChangeTab }: HeaderProps) {
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem('token');
  const rawUser = localStorage.getItem('user');
  const user = rawUser && rawUser !== 'undefined' ? JSON.parse(rawUser) : {};
  const username = user?.name || 'Người dùng';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header className="header">
      <h1 className="logo">📘 Chatbot TOEIC</h1>
      <nav className="nav">
        <button
          className={activeTab === 'home' ? 'active' : ''}
          onClick={() => onChangeTab('home')}
        >
          Trang chủ
        </button>
        <button
          className={activeTab === 'vocab' ? 'active' : ''}
          onClick={() => onChangeTab('vocab')}
        >
          Tra từ vựng
        </button>
        <button
          className={activeTab === 'chat' ? 'active' : ''}
          onClick={() => onChangeTab('chat')}
        >
          Chat TOEIC
        </button>

        {/* Đăng nhập / Đăng xuất */}
        {isLoggedIn ? (
          <>
            <span className="user-info">👤 {username}</span>
            <button onClick={handleLogout}>Đăng xuất</button>
          </>
        ) : (
          <button onClick={() => navigate('/login')}>Đăng nhập</button>
        )}
      </nav>
    </header>
  );
}
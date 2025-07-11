import '../styles/Header.css';
import { useLocation, useNavigate } from 'react-router-dom';

import { getCurrentUser,logout } from '../services/authService';
import { useEffect, useState } from 'react';

interface HeaderProps {
  activeTab: 'home' | 'vocab' | 'chat';
  onChangeTab: (tab: 'home' | 'vocab' | 'chat') => void;
}

export default function Header({ activeTab, onChangeTab }: HeaderProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const justLoggedIn = (location.state as { justLoggedIn?: boolean })?.justLoggedIn;

  // const isLoggedIn = !!Cookies.get('token');
  

  useEffect(() => {
    const fetchUser = async () => {
      console.log("👀 [Header] Gọi fetchUser");
      const userData = await getCurrentUser();
      console.log("🔍 [Header] Kết quả getCurrentUser:", userData);
      setUser(userData); // null nếu chưa login
    };

    fetchUser();
  }, [justLoggedIn]);

  const handleLogout = async () => {
    
    await logout();
    setUser(null);
    navigate('/login');
  };

   return (
    <header className="header">
      <div className="left-section">
        <div className="logo" onClick={() => onChangeTab('home')}>Chatbot TOEIC</div>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      </div>

      <div className={`nav-container ${menuOpen ? 'open' : ''}`}>
        <div className="nav-left">
          <button className={activeTab === 'home' ? 'active' : ''} onClick={() => onChangeTab('home')}>Trang chủ</button>
          <button className={activeTab === 'vocab' ? 'active' : ''} onClick={() => onChangeTab('vocab')}>Tra từ vựng</button>
          <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => onChangeTab('chat')}>Chat TOEIC</button>
        </div>
        <div className="nav-right">
          {user ? (
            <>
              <span className="user-info">👤 {user.name}</span>
              <button onClick={handleLogout}>Đăng xuất</button>
            </>
          ) : (
            <button onClick={() => navigate('/login')}>Đăng nhập</button>
          )}
        </div>
      </div>
    </header>
  );
}
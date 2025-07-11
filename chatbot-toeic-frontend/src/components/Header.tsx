import '../styles/Header.css';
import { useLocation, useNavigate } from 'react-router-dom';

import { getCurrentUser,logout } from '../services/authService';
import { useEffect, useRef, useState } from 'react';

interface HeaderProps {
  activeTab: 'home' | 'vocab' | 'chat';
  onChangeTab: (tab: 'home' | 'vocab' | 'chat') => void;
}

export default function Header({ activeTab, onChangeTab }: HeaderProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const location = useLocation();
  const [navMenuOpen, setNavMenuOpen] = useState(false); 
  const [userMenuOpen, setUserMenuOpen] = useState(false); 
  const justLoggedIn = (location.state as { justLoggedIn?: boolean })?.justLoggedIn;
  const navMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (navMenuOpen && navMenuRef.current && !navMenuRef.current.contains(target)) {
        setNavMenuOpen(false);
      }

      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navMenuOpen, userMenuOpen]);
  
  
  useEffect(() => {
    setUserMenuOpen(false);
  }, [user]);


  const handleLogout = async () => {
    
    await logout();
    setUser(null);
    navigate('/login');
  };

   return (
    <header className="header">
      <div className="left-section">
        <div className="logo" onClick={() => onChangeTab('home')}>Chatbot TOEIC</div>
        <button className="hamburger" onClick={() => setNavMenuOpen(!navMenuOpen)}>☰</button>
      </div>

      <div className={`nav-container ${navMenuOpen  ? 'open' : ''}`}ref={navMenuRef}>
        <div className="nav-left">
          <button className={activeTab === 'home' ? 'active' : ''} onClick={() => onChangeTab('home')}>Trang chủ</button>
          <button className={activeTab === 'vocab' ? 'active' : ''} onClick={() => onChangeTab('vocab')}>Tra từ vựng</button>
          <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => onChangeTab('chat')}>Chat TOEIC</button>
        </div>
        <div className="nav-right">
          {user ? (
            <div className="user-menu-wrapper">
              <span className="user-info" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                👤 {user.name}
              </span>

              {userMenuOpen && (
                <div className="user-dropdown" ref={userMenuRef }>
                  <button onClick={() => navigate('/profile')}>Thông tin</button>
                  <button onClick={handleLogout}>Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => navigate('/login')}>Đăng nhập</button>
          )}
        </div>

      </div>
    </header>
  );
}
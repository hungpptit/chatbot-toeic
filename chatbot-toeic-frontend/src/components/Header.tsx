import '../styles/Header.css';

interface HeaderProps {
  activeTab: 'home' | 'vocab' | 'chat';
  onChangeTab: (tab: 'home' | 'vocab' | 'chat') => void;
}

export default function Header({ activeTab, onChangeTab }: HeaderProps) {
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
      </nav>
    </header>
  );
}

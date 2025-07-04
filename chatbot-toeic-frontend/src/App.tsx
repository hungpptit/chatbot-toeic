import { useState } from 'react';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ChatPage from './container/ChatPage';
import VocabularyPage from './container/VocabularyPage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'vocab' | 'chat'>('home');

  let content;
  switch (activeTab) {
    case 'home':
      content = <HomePage />;
      break;
    case 'vocab':
      content = <VocabularyPage />;
      break;
    case 'chat':
      content = <ChatPage />;
      break;
  }

  return (
    <div>
      <Header activeTab={activeTab} onChangeTab={setActiveTab} />
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
        {content}
      </div>
    </div>
  );
}
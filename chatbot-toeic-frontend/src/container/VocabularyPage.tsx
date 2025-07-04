import { useState } from 'react';
import VocabResult from '../components/VocabResult'; // <- import component
import '../styles/VocabularyPage.css';

export default function VocabularyPage() {
  const [word, setWord] = useState('');
  const [resultVisible, setResultVisible] = useState(false);

  const handleSearch = () => {
    if (!word.trim()) return;
    setResultVisible(true);
  };

  return (
    <div className="vocab-page">
      <div className="vocab-container">
        <h2>Tra từ vựng TOEIC</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="Nhập từ cần tra..."
            value={word}
            onChange={(e) => {
              setWord(e.target.value);
              setResultVisible(false); // reset khi gõ lại từ
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Tìm</button>
        </div>

        {/* Sử dụng component riêng */}
        {resultVisible && <VocabResult word={word} />}
      </div>
    </div>
  );
}

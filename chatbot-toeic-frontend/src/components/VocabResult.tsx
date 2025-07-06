// src/components/VocabResult.tsx
import { useEffect, useState } from 'react';
import { getVocabularyByWordAPI } from '../services/Vocabulary_services';
import type { VocabularyData } from '../services/Vocabulary_services';
import '../styles/VocabResult.css';

interface VocabResultProps {
  word: string;
}

export default function VocabResult({ word }: VocabResultProps) {
  const [data, setData] = useState<VocabularyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWord = async () => {
      try {
        const result = await getVocabularyByWordAPI(word);
        setData(result);
        setError(null);
      } catch (err: any) {
        setError('Không tìm thấy từ hoặc lỗi server');
        setData(null);
      }
    };

    fetchWord();
  }, [word]);

  const speak = (text: string, lang: 'en-GB' | 'en-US') => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
  };

  if (error) return <div className="result-box error">{error}</div>;
  if (!data) return <div className="result-box">Đang tải dữ liệu...</div>;

  return (
    <div className="result-box">
      <div className="word-header">
        <h3>{data.word}</h3>
        <i>{data.meanings?.[0]?.partOfSpeech}</i>

        <div className="pronounce">
          <div className="pronounce-row">
            {data.pronunciations?.map((p) => (
              <div key={p.id} className="pronounce-item">
                <span><b>{p.accent}</b> {p.phoneticText}</span>
                <button className="speak-btn" onClick={() => speak(data.word, p.accent === 'UK' ? 'en-GB' : 'en-US')}>
                  🔊
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <hr />

      {data.meanings?.map((m) => (
        <div className="definition-group" key={m.id}>
          <p><b>{m.partOfSpeech}:</b> {m.definition}</p>
          {m.example && <ul><li><i>{m.example}</i></li></ul>}
        </div>
      ))}

      {data.antonyms?.length ? (
        <div className="definition-group">
          <p><b>Antonyms:</b> {data.antonyms.map(a => a.antonym).join(', ')}</p>
        </div>
      ) : null}

      {data.synonyms?.length ? (
        <div className="definition-group">
          <p><b>Synonyms:</b> {data.synonyms.map(s => s.synonym).join(', ')}</p>
        </div>
      ) : null}
    </div>
  );
}

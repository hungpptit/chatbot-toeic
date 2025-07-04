// src/components/VocabResult.tsx
import '../styles/VocabResult.css';

interface VocabResultProps {
  word: string;
}

export default function VocabResult({ word }: VocabResultProps) {
  const speak = (text: string, lang: 'en-GB' | 'en-US') => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="result-box">
      <div className="word-header">
        <h3>{word}</h3>
        <i>exclamation, noun</i>
        <div className="pronounce">
          <div className="pronounce-row">
  <div className="pronounce-item">
    <span><b>UK</b> /həˈləʊ/</span>
    <button className="speak-btn" onClick={() => speak(word, 'en-GB')} aria-label="Phát âm UK">
      <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" fill="#1a237e">
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M3 10v4h4l5 5V5l-5 5H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03z" />
      </svg>
    </button>
  </div>
  <div className="pronounce-item">
    <span><b>US</b> /həˈloʊ/</span>
    <button className="speak-btn" onClick={() => speak(word, 'en-US')} aria-label="Phát âm US">
      <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" fill="#1a237e">
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M3 10v4h4l5 5V5l-5 5H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03z" />
      </svg>
    </button>
  </div>
</div>
        </div>
      </div>

      <hr />

      <div className="definition-group">
        <p><b>used when meeting or greeting someone:</b></p>
        <ul>
          <li><i>Hello, Paul. I haven't seen you for ages.</i></li>
          <li><i>We've exchanged hellos a few times.</i></li>
          <li><b>say hello</b> — I just thought I'd call by and say hello.</li>
        </ul>
      </div>

      <div className="definition-group">
        <p><b>something said at the beginning of a phone call:</b></p>
        <ul>
          <li><i>"Hello, I'd like some information about flights."</i></li>
        </ul>
      </div>
    </div>
  );
}

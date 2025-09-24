import React, { useState, useEffect } from "react";
import "../styles/cardQuestion.css";
import type { Question as QuestionItem } from "../services/question_test_services";

export interface QuestionType {
  id: number;
  name: string;
  description: string;
}

export interface Part {
  id: number;
  name: string;
}

type CardQuestionProps = {
  item: QuestionItem;
  index: number;
  selectedAnswer: string | null;
  onAnswer: (questionNumber: number, isAnswered: boolean) => void;
  onSelectAnswer: (questionId: number, selected: string) => void;
  showResult: boolean;
  incorrectAnswer: {
    questionId: number;
    correctAnswer: string;
    selectedAnswer: string;
    explanation: string;
  } | null;
};

// Rearrangement Component với click để sắp xếp
function RearrangementComponent({ 
  item, 
  selectedAnswer, 
  onSelect, 
  showResult 
}: {
  item: any;
  selectedAnswer: string | null;
  onSelect: (value: string) => void;
  showResult: boolean;
}) {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<{key: string, text: string}[]>([]);

  // Initialize available words
  useEffect(() => {
    const words: {key: string, text: string}[] = [];
    if (item.optionA) words.push({ key: 'A', text: item.optionA });
    if (item.optionB) words.push({ key: 'B', text: item.optionB });
    if (item.optionC) words.push({ key: 'C', text: item.optionC });
    if (item.optionD) words.push({ key: 'D', text: item.optionD });
    setAvailableWords(words);

    // Parse existing answer if any
    if (selectedAnswer) {
      const sequence = selectedAnswer.split('-');
      const selected = sequence.map(key => {
        const word = words.find(w => w.key === key);
        return word ? word.key : '';
      }).filter(k => k);
      setSelectedWords(selected);
    }
  }, [item, selectedAnswer]);

  const handleWordClick = (wordKey: string) => {
    if (showResult) return;

    if (selectedWords.includes(wordKey)) {
      // Remove word from selected (trở lại vị trí ban đầu)
      const newSelected = selectedWords.filter(w => w !== wordKey);
      setSelectedWords(newSelected);
      updateAnswer(newSelected);
    } else {
      // Add word to selected (nhảy vào ô phía dưới)
      const newSelected = [...selectedWords, wordKey];
      setSelectedWords(newSelected);
      updateAnswer(newSelected);
    }
  };

  const updateAnswer = (selected: string[]) => {
    const result = selected.join('-');
    onSelect(result);
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSelect(value);
    
    // Update selected words based on manual input
    const sequence = value.split('-').filter(s => s.trim());
    setSelectedWords(sequence);
  };

  const handleResetOrder = () => {
    if (showResult) return;
    setSelectedWords([]);
    onSelect('');
  };

  return (
    <div className="card-rearrangement">
      <div className="rearrangement-instruction">
        <p>🔄 Sắp xếp lại các từ/câu sau theo thứ tự đúng:</p>
        <p><small>💡 Click vào từ để thêm vào thứ tự, click lại để bỏ ra</small></p>
      </div>
      
      {/* Available Words */}
      <div className="words-to-arrange">
        <h4>Từ có sẵn:</h4>
        <div className="available-words">
          {availableWords.map(word => (
            <span 
              key={word.key}
              className={`word-item ${selectedWords.includes(word.key) ? 'selected' : 'available'}`}
              onClick={() => handleWordClick(word.key)}
              style={{
                cursor: showResult ? 'default' : 'pointer',
                opacity: selectedWords.includes(word.key) ? 0.5 : 1
              }}
            >
              {word.key}. {word.text}
            </span>
          ))}
        </div>
      </div>

      {/* Selected Order */}
      <div className="selected-order">
        <h4>Thứ tự đã chọn:</h4>
        <div className="selected-words">
          {selectedWords.length > 0 ? (
            selectedWords.map((wordKey, index) => {
              const word = availableWords.find(w => w.key === wordKey);
              return word ? (
                <span 
                  key={`selected-${wordKey}-${index}`}
                  className="word-item selected-word"
                  onClick={() => handleWordClick(wordKey)}
                  style={{
                    cursor: showResult ? 'default' : 'pointer'
                  }}
                >
                  {word.key}. {word.text}
                </span>
              ) : null;
            })
          ) : (
            <span className="empty-selection">Chưa chọn từ nào...</span>
          )}
        </div>
        {selectedWords.length > 0 && !showResult && (
          <button 
            className="reset-btn"
            onClick={handleResetOrder}
            type="button"
          >
            🔄 Reset
          </button>
        )}
      </div>

      {/* Manual Input */}
      <div className="rearrangement-result">
        <label>Hoặc nhập thủ công:</label>
        <input 
          type="text" 
          placeholder="Nhập thứ tự đúng (ví dụ: C-A-D-B)..." 
          value={selectedAnswer || ""}
          onChange={handleManualInput}
          disabled={showResult}
        />
      </div>
    </div>
  );
}

// Matching Component với drag & drop
function MatchingComponent({ 
  item, 
  selectedAnswer, 
  onSelect, 
  showResult 
}: {
  item: any;
  selectedAnswer: string | null;
  onSelect: (value: string) => void;
  showResult: boolean;
}) {
  const [connections, setConnections] = useState<{[key: string]: string}>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Parse existing answer if any
  useEffect(() => {
    if (selectedAnswer) {
      const pairs = selectedAnswer.split(', ');
      const newConnections: {[key: string]: string} = {};
      pairs.forEach(pair => {
        const [left, right] = pair.split('-');
        if (left && right) {
          newConnections[left] = right;
        }
      });
      setConnections(newConnections);
    }
  }, [selectedAnswer]);

  const handleDragStart = (e: React.DragEvent, itemKey: string) => {
    if (showResult) return;
    setDraggedItem(itemKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (showResult || !draggedItem) return;

    const newConnections = { ...connections };
    
    // Remove existing connection for draggedItem
    Object.keys(newConnections).forEach(key => {
      if (newConnections[key] === targetKey || key === draggedItem) {
        delete newConnections[key];
      }
    });

    // Add new connection
    newConnections[draggedItem] = targetKey;
    setConnections(newConnections);

    // Convert to string format and send to parent
    const result = Object.entries(newConnections)
      .map(([left, right]) => `${left}-${right}`)
      .join(', ');
    onSelect(result);

    setDraggedItem(null);
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSelect(value);
  };

  return (
    <div className="card-matching">
      <div className="matching-instruction">
        <p>🔗 Kéo thả để ghép đôi các từ/cụm từ phù hợp:</p>
      </div>
      <div className="matching-area">
        <div className="matching-left">
          {item.optionA && (
            <div 
              className={`matching-item left-item ${connections['A'] ? 'connected' : ''}`}
              draggable={!showResult}
              onDragStart={(e) => handleDragStart(e, 'A')}
              style={{ 
                userSelect: 'none',
                cursor: showResult ? 'default' : 'grab'
              }}
            >
              A. {item.optionA}
              {connections['A'] && <span className="connection-indicator">→ {connections['A']}</span>}
            </div>
          )}
          {item.optionB && (
            <div 
              className={`matching-item left-item ${connections['B'] ? 'connected' : ''}`}
              draggable={!showResult}
              onDragStart={(e) => handleDragStart(e, 'B')}
              style={{ 
                userSelect: 'none',
                cursor: showResult ? 'default' : 'grab'
              }}
            >
              B. {item.optionB}
              {connections['B'] && <span className="connection-indicator">→ {connections['B']}</span>}
            </div>
          )}
        </div>
        <div className="matching-right">
          {item.optionC && (
            <div 
              className={`matching-item right-item`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'C')}
              style={{ 
                userSelect: 'none',
                backgroundColor: Object.values(connections).includes('C') ? '#e8f5e8' : '#ffffff'
              }}
            >
              C. {item.optionC}
            </div>
          )}
          {item.optionD && (
            <div 
              className={`matching-item right-item`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'D')}
              style={{ 
                userSelect: 'none',
                backgroundColor: Object.values(connections).includes('D') ? '#e8f5e8' : '#ffffff'
              }}
            >
              D. {item.optionD}
            </div>
          )}
        </div>
      </div>
      <div className="matching-result">
        <label>Kết quả ghép đôi:</label>
        <input 
          type="text" 
          placeholder="Hoặc nhập thủ công (ví dụ: A-C, B-D)..." 
          value={selectedAnswer || ""}
          onChange={handleManualInput}
          disabled={showResult}
          style={{ marginTop: '10px' }}
        />
      </div>
    </div>
  );
}

export default function CardQuestion({
  index,
  item,
  selectedAnswer,
  onAnswer,
  onSelectAnswer,
  showResult,
  incorrectAnswer
}: CardQuestionProps) {
  const handleSelect = (option: string) => {
    if (showResult) return;
    onSelectAnswer(item.id, option);
    onAnswer(index, true);
  };

  // Determine cursor style for card-option
  const getCursorStyle = () => {
    return showResult ? 'not-allowed' : 'pointer';
  };

  // const isCorrect = selectedAnswer === item.correctAnswer;

  const renderQuestionByType = () => {
    switch (item.typeId) {
      case 1: // Multiple Choice
        return (
          <div className="card-options">
            {["A", "B", "C", "D"].map((opt) => {
              let className = "card-option";

              if (showResult) {
                if (opt === item.correctAnswer) {
                  if (opt === selectedAnswer) {
                    className += " correct"; // Bạn chọn đúng → xanh lá
                  } else {
                    className += " correct-answer"; // Không chọn nhưng là đáp án đúng → xanh dương
                  }
                } else if (opt === selectedAnswer) {
                  className += " incorrect"; // Bạn chọn sai → đỏ
                }
              } else {
                if (opt === selectedAnswer) {
                  className += " selected"; // Khi chưa submit
                }
              }

              return (
                <button
                  key={opt}
                  className={className}
                  onClick={() => handleSelect(opt)}
                  disabled={showResult}
                  style={{ cursor: getCursorStyle() }}
                >
                  {opt}. {item[`option${opt}` as "optionA" | "optionB" | "optionC" | "optionD"]}
                </button>
              );
            })}
          </div>
        );

      case 2: // Fill in Blank
        return (
          <div className="card-input">
            <input 
              type="text" 
              placeholder="Điền từ vào chỗ trống..." 
              value={selectedAnswer || ""}
              onChange={(e) => handleSelect(e.target.value)}
              disabled={showResult}
              className={showResult ? (selectedAnswer === item.correctAnswer ? "correct-input" : "incorrect-input") : ""}
            />
          </div>
        );

      case 3: // Matching
        return <MatchingComponent 
          item={item} 
          selectedAnswer={selectedAnswer} 
          onSelect={handleSelect}
          showResult={showResult}
        />;

      case 4: // Rearrangement
        return <RearrangementComponent 
          item={item} 
          selectedAnswer={selectedAnswer} 
          onSelect={handleSelect}
          showResult={showResult}
        />;

      case 5: // True/False
        return (
          <div className="card-options">
            {["True", "False"].map((opt) => {
              let className = "card-option";

              if (showResult) {
                if (opt === item.correctAnswer) {
                  if (opt === selectedAnswer) {
                    className += " correct";
                  } else {
                    className += " correct-answer";
                  }
                } else if (opt === selectedAnswer) {
                  className += " incorrect";
                }
              } else {
                if (opt === selectedAnswer) {
                  className += " selected";
                }
              }

              return (
                <button
                  key={opt}
                  className={className}
                  onClick={() => handleSelect(opt)}
                  disabled={showResult}
                  style={{ cursor: getCursorStyle() }}
                >
                  {opt === "True" ? "✅ Đúng" : "❌ Sai"}
                </button>
              );
            })}
          </div>
        );

      case 6: // Short Answer
        return (
          <div className="card-input">
            <textarea 
              placeholder="Viết câu trả lời ngắn..." 
              value={selectedAnswer || ""}
              onChange={(e) => handleSelect(e.target.value)}
              disabled={showResult}
              rows={3}
              className={showResult ? (selectedAnswer === item.correctAnswer ? "correct-input" : "incorrect-input") : ""}
            />
          </div>
        );

      default: // Fallback cho các type chưa xác định
        return (
          <div className="card-input">
            <input 
              type="text" 
              placeholder="Your answer..." 
              value={selectedAnswer || ""}
              onChange={(e) => handleSelect(e.target.value)}
              disabled={showResult}
            />
          </div>
        );
    }
  };

  return (
    <div className="card-container">
      <h2 className="card-question">
        {index}. {item.question}
      </h2>

{renderQuestionByType()}

      {showResult && incorrectAnswer && (
        <div className="card-explanation">
          <p>
            Correct Answer: <span className="card-correct">{incorrectAnswer.correctAnswer}</span>
          </p>
          <p>Explanation: {incorrectAnswer.explanation}</p>
        </div>
      )}
    </div>
  );
}

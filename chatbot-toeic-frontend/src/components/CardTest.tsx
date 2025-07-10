import React from 'react';

interface CardTestProps {
  title: string;
  duration: string;
  participants: number;
  comments: number;
  questions: number;
  parts: number;
  tags: string[];
}

const CardTest: React.FC<CardTestProps> = ({
  title, duration, participants, comments, questions, parts, tags
}) => {
  return (
    <div className="test-card">
      <h3>{title}</h3>
      <p>⏱ {duration} | 👥 {participants.toLocaleString()} | 💬 {comments}</p>
      <p>{parts} phần thi | {questions} câu hỏi</p>
      <div className="tags">
        {tags.map((tag, index) => (
          <span className="tag" key={index}>#{tag}</span>
        ))}
      </div>
      <button className="result-button">Xem kết quả</button>
    </div>
  );
};

export default CardTest;

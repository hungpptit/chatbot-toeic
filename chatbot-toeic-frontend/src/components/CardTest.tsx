import React from 'react';
import { useNavigate } from 'react-router-dom';

interface CardTestProps {
  id: number;
  title: string;
  duration: string;
  participants: number;
  comments: number;
  questions: number;
  parts: number;
  tags: string[];
}

const CardTest: React.FC<CardTestProps> = ({
  id,title, duration, participants, comments, questions, parts, tags
}) => {
  const navigate = useNavigate();



  return (
    <div className="test-card" onClick={() => navigate(`/TestExam/${id}`, { state: { title } })}>
      <h3>{title}</h3>
      <p>⏱ {duration} | 👥 {participants.toLocaleString()} | 💬 {comments}</p>
      <p>{parts} phần thi | {questions} câu hỏi</p>
      <div className="tags">
        {tags.map((tag, index) => (
          <span className="tag" key={index}>#{tag}</span>
        ))}
      </div>
      <button className="result-button" onClick={(e) =>{ e.stopPropagation();
         navigate(`/TestReview/${id}`, { state: { title } })
         }}
         >
          Xem kết quả</button>
    </div>
  );
};

export default CardTest;

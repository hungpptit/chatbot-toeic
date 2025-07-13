import React, { useEffect, useState } from "react";
import "../styles/ExamSidebar.css";


interface ExamSidebarProps {
  answeredQuestions: number[];
  onJumpToQuestion: (num: number) => void;
}
const ExamSidebar: React.FC <ExamSidebarProps> = ({answeredQuestions, onJumpToQuestion }) => {
    const totalQuestions = 40;
    const questionNumbers = Array.from({ length: totalQuestions }, (_, i) => i + 1);
    const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes in seconds
    useEffect(() => {
        const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };
    return (
    <div className="exam-sidebar">
      <div className="exam-time">
        <p>Thời gian làm bài:</p>
        <p className="time-value">{formatTime(timeLeft)}</p>
      </div>
      <button className="submit-btn">NỘP BÀI</button>
      <p className="restore-btn">Khôi phục/lưu bài làm ➤</p>
      <p className="note-text">
        <strong>Chú ý:</strong> bạn có thể click vào số thứ tự câu hỏi trong bài để đánh dấu review
      </p>
      <div className="recording-title">Recording 4</div>
      <div className="question-grid">
        {questionNumbers.map((num) => (
          <button
            key={num}
            className={`question-btn ${answeredQuestions.includes(num) ? "answered" : ""}`}
            onClick={() => onJumpToQuestion(num)}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExamSidebar;

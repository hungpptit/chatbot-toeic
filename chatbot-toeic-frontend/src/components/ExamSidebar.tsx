import React, { useEffect, useState } from "react";
import "../styles/ExamSidebar.css";

interface ExamSidebarProps {
  answeredQuestions: number[];
  onJumpToQuestion: (num: number) => void;
  onSubmit: () => void;
  showResult: boolean;
  correctCount: number;
}

const ExamSidebar: React.FC<ExamSidebarProps> = ({
  answeredQuestions,
  onJumpToQuestion,
  onSubmit,
  showResult,
  correctCount,
}) => {
  const totalQuestions = 40;
  const examDuration = 45 * 60;
  const questionNumbers = Array.from({ length: totalQuestions }, (_, i) => i + 1);
  const [timeLeft, setTimeLeft] = useState(examDuration);
  const [finalTime, setFinalTime] = useState<number | null>(null);


  useEffect(() => {
    if (showResult) return; 
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [showResult]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };
  const handleSubmit = () => {
    const totalTimeSpent = examDuration - timeLeft;
    setFinalTime(totalTimeSpent);
    onSubmit();
  };

  return (
    <div className="exam-sidebar">
      <div className="exam-time">
        <p>Thời gian làm bài:</p>
        <p className="time-value">
          {showResult && finalTime !== null ? formatTime(finalTime) : formatTime(timeLeft)}
        </p>
      </div>

      {!showResult && <button className="submit-btn" onClick={handleSubmit}>NỘP BÀI</button>}


      {showResult && (
        <div className="exam-result">
          <p>Kết quả: {correctCount} / 40 câu đúng</p>
          <p>Điểm: {((correctCount / 40) * 10).toFixed(2)} / 10</p>
        </div>
      )}

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

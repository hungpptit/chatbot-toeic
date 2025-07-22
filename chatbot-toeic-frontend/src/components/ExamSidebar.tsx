import React, { useEffect, useState } from "react";
import "../styles/ExamSidebar.css";

interface ExamSidebarProps {
  answeredQuestions: number[];
  onJumpToQuestion: (num: number) => void;
  onSubmit: () => void;
  showResult: boolean;
  correctCount: number;
  totalQuestions: number;
  score: number;
  startTime: Date | null;
}

const ExamSidebar: React.FC<ExamSidebarProps> = ({
  answeredQuestions,
  onJumpToQuestion,
  onSubmit,
  showResult,
  correctCount,
  totalQuestions,
  score,
  startTime,
}) => {
  const examDuration = 45 * 60; // 45 phút
  console.log("Total questions truyền sang sidebar:", totalQuestions);
  // Nếu totalQuestions = 0 (chưa submit), lấy số câu từ answeredQuestions hoặc mặc định 40
  const numQuestions = totalQuestions > 0 ? totalQuestions : (answeredQuestions.length > 0 ? Math.max(...answeredQuestions) : 40);
  const questionNumbers = Array.from({ length: numQuestions }, (_, i) => i + 1);

  const [timeLeft, setTimeLeft] = useState(examDuration);
  const [finalTime, setFinalTime] = useState<number | null>(null);

  // ✅ Cập nhật ngay khi có startTime (hỗ trợ F5 không mất đồng bộ)
  useEffect(() => {
    if (!startTime) return;
    const updateTimeLeft = () => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - new Date(startTime).getTime()) / 1000);
      return Math.max(examDuration - elapsed, 0);
    };

    setTimeLeft(updateTimeLeft());

    if (!showResult) {
      const timer = setInterval(() => {
        setTimeLeft(updateTimeLeft());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, showResult]);

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
          {showResult && finalTime !== null
            ? formatTime(finalTime)
            : formatTime(timeLeft)}
        </p>
      </div>

      {!showResult && (
        <button className="submit-btn" onClick={handleSubmit}>
          NỘP BÀI
        </button>
      )}

      {showResult && (
        <div className="exam-result">
          <p>Kết quả: {correctCount} / {totalQuestions} câu đúng</p>
          <p>Điểm: {score} / 10</p>
        </div>
      )}

      <p className="restore-btn">Khôi phục/lưu bài làm ➤</p>
      <p className="note-text">
        <strong>Chú ý:</strong> bạn có thể click vào số thứ tự câu hỏi trong bài để
        đánh dấu review
      </p>
      <div className="recording-title">Recording 4</div>
      <div className="question-grid">
        {questionNumbers.map((num) => (
          <button
            key={num}
            className={`question-btn ${
              answeredQuestions.includes(num) ? "answered" : ""
            }`}
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

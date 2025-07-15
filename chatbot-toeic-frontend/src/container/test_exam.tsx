import "../styles/Test_exam.css";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import CardQuestion from "../components/Card Question";
import { useEffect, useState } from "react";
import { getQuestionsByTestIdAPI, submitTestAPI, startTestAPI, type Question, type SubmitResult } from "../services/question_test_services";
import ExamSidebar from "../components/ExamSidebar";

export default function TestExam() {
  const [questionData, setQuestionData] = useState<Question[]>([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const location = useLocation();
  const testTitle = location.state?.title || "New Economy TOEIC Test";

  const [userAnswers, setUserAnswers] = useState<{ [questionId: number]: string }>({});
  const [showResult, setShowResult] = useState(false);

  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState<SubmitResult["incorrectAnswers"]>([]);

  const [showStartPopup, setShowStartPopup] = useState(true); // ✅ popup lúc mới vào
  const [startTime, setStartTime] = useState<Date | null>(null);

  // ✅ Hàm bắt đầu làm bài
 const handleStartTest = async () => {
  try {
    if (!id) {
      console.warn("Không có test ID");
      return;
    }
    console.log("Bắt đầu gọi API start test...");
    await startTestAPI(Number(id));
    console.log("Đã gọi API thành công");

    setStartTime(new Date());
    console.log("Set start time: ", new Date());

    setShowStartPopup(false);
    console.log("Đã ẩn popup");
  } catch (error) {
    console.error("Lỗi bắt đầu bài test:", error);
  }
};

  // ✅ Hàm hủy (quay lại trang trước)
  const handleCancelTest = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (!id) return;
        const data = await getQuestionsByTestIdAPI(Number(id));
        setQuestionData(data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };
    fetchQuestions();
  }, [id]);

  const handleJumpToQuestion = (num: number) => {
    const target = document.getElementById(`question-${num}`);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmitTest = async () => {
    if (!id) {
      console.error("Missing test ID");
      return;
    }

    const answersArray = questionData.map(q => ({
      questionId: q.id,
      selectedAnswer: userAnswers[q.id] || "",
    }));

    try {
      const result = await submitTestAPI(Number(id), answersArray);
      setCorrectCount(result.correctCount);
      setIncorrectAnswers(result.incorrectAnswers);
      setShowResult(true);
    } catch (error) {
      console.error("Lỗi submit bài:", error);
    }
  };

  return (
    <div className="test-page">
      {/* ✅ POPUP XÁC NHẬN */}
      {showStartPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Bắt đầu làm bài?</h2>
            <p>Bài kiểm tra: <strong>{testTitle}</strong></p>
            <div className="popup-buttons">
              <button onClick={handleStartTest} className="start-btn">Bắt đầu</button>
              <button onClick={handleCancelTest} className="cancel-btn">Hủy</button>
            </div>
          </div>
        </div>
      )}

      {!showStartPopup && (
        <div className="test-container">
          <div className="test1">{testTitle}</div>
          <div className="test2">
            <ExamSidebar
              answeredQuestions={answeredQuestions}
              onJumpToQuestion={handleJumpToQuestion}
              onSubmit={handleSubmitTest}
              showResult={showResult}
              correctCount={correctCount}
              startTime={startTime}
            />
          </div>
          <div className="test3">
            <div className="audio-controls">
              <button>▶</button>
              <div className="progress-bar">
                <div className="filled"></div>
              </div>
              <span>-47:00</span>
              <input type="range" />
              <button>⚙</button>
            </div>
            <div className="parts">
              {["Part 1", "Part 2", "Part 3", "Part 4", "Part 5", "Part 6", "Part 7"].map((part, idx) => (
                <div key={idx} className={`part-button ${idx === 4 ? "active" : ""}`}>
                  {part}
                </div>
              ))}
            </div>
          </div>

          <div className="test4">
            {questionData.map((item, index) => (
              <div id={`question-${index + 1}`} key={item.id}>
                <CardQuestion
                  key={item.id}
                  item={item}
                  index={index + 1}
                  selectedAnswer={userAnswers[item.id] || null}
                  onSelectAnswer={(questionId, selected) => {
                    setUserAnswers(prev => ({
                      ...prev,
                      [questionId]: selected
                    }));

                    const alreadyAnswered = Object.keys(userAnswers).map(Number);
                    if (!alreadyAnswered.includes(questionId)) {
                      setAnsweredQuestions([...answeredQuestions, index + 1]);
                    }
                  }}
                  onAnswer={(questionNumber, isAnswered) => {
                    if (isAnswered) {
                      if (!answeredQuestions.includes(questionNumber)) {
                        setAnsweredQuestions([...answeredQuestions, questionNumber]);
                      }
                    } else {
                      setAnsweredQuestions(answeredQuestions.filter(q => q !== questionNumber));
                    }
                  }}
                  showResult={showResult}
                  incorrectAnswer={incorrectAnswers.find(ans => ans.questionId === item.id) || null}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

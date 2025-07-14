import "../styles/Test_exam.css";
import { useParams, useLocation  } from "react-router-dom";
import CardQuestion from "../components/Card Question";
import { useEffect, useState } from "react";
import { getQuestionsByTestIdAPI, submitTestAPI, type Question, type SubmitResult } from "../services/question_test_services";
import ExamSidebar from "../components/ExamSidebar";

export default function TestExam() {
  const [questionData, setQuestionData] = useState<Question[]>([]);
  const { id } = useParams();
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const location = useLocation();
  const testTitle = location.state?.title || "New Economy TOEIC Test";
  const [userAnswers, setUserAnswers] = useState<{ [questionId: number]: string }>({});
  const [showResult, setShowResult] = useState(false);

  const [correctCount, setCorrectCount] = useState(0);
  
const [incorrectAnswers, setIncorrectAnswers] = useState<SubmitResult["incorrectAnswers"]>([]);




  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log("id hiện tai: ", id)
        const data = await getQuestionsByTestIdAPI(Number(id));
        setQuestionData(data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, []);
  const handleJumpToQuestion = (num: number) => {
    const target = document.getElementById(`question-${num}`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmitTest = async () => {
    if (!id) {
      console.error("Missing test ID");
      return;
    }

    const answersArray = questionData.map(q => ({
      questionId: q.id,
      selectedAnswer: userAnswers[q.id] || "", // Câu chưa làm tính là ""
    }));

    console.log("Dữ liệu gửi lên submit:", answersArray);

    try {
      const result = await submitTestAPI(Number(id), answersArray);

      console.log("Kết quả từ backend:", result);

      setCorrectCount(result.correctCount);
      setIncorrectAnswers(result.incorrectAnswers); // Lưu lại để hiện giải thích
      setShowResult(true);
    } catch (error) {
      console.error("Lỗi submit bài:", error);
    }
  };


  return (
    <div className="test-page">
      <div className="test-container">
        <div className="test1">{testTitle}</div>
        <div className="test2">
             <ExamSidebar answeredQuestions={answeredQuestions} onJumpToQuestion={handleJumpToQuestion} onSubmit={handleSubmitTest} showResult={showResult}  correctCount={correctCount} />
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
              <div key={idx} className={`part-button ${idx === 4 ? "active" : ""}`}>{part}</div>
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
    </div>
  );
}

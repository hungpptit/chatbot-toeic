import "../styles/Test_exam.css";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import CardQuestion from "../components/Card Question";
import { useEffect, useState } from "react";
import {
  getQuestionsByTestIdAPI,
  getUserTestDetailByIdAPI,
  submitTestAPI,
  startTestAPI,
  type QuestionWithMedia,
  type MediaMapping,
  type SubmitResult,
} from "../services/question_test_services";
import ExamSidebar from "../components/ExamSidebar";

interface TestExamProps {
  mode: "exam" | "review";
  userTestId?: number;
}

export default function TestExam({ mode = "exam" }: TestExamProps) {
  const [questionData, setQuestionData] = useState<QuestionWithMedia[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: number]: string }>({});
  const [showResult, setShowResult] = useState(mode === "review");
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState<SubmitResult["incorrectAnswers"]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [showStartPopup, setShowStartPopup] = useState(mode === "exam");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [score, setScore] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [globalAudio, setGlobalAudio] = useState<string | null>(null);

  const { userTestId, id } = useParams();
  const userTestIdNum = Number(userTestId);
  const navigate = useNavigate();
  const location = useLocation();
  const testTitle = location.state?.title || "New Economy TOEIC Test";

  // Fetch data
  useEffect(() => {
    console.log("🌀 useEffect chạy", { mode, userTestId, id });
    
    // ✅ Đảm bảo trang có thể cuộn
    const originalBodyStyle = document.body.style.height;
    const originalRootStyle = document.getElementById('root')?.style.height;
    
    // ✅ Force styles để trang có thể cuộn
    document.body.style.height = 'auto !important';
    document.body.style.minHeight = '100vh';
    document.body.style.overflow = 'auto !important';
    document.body.style.maxHeight = 'none !important';
    
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.height = 'auto !important';
      rootElement.style.minHeight = '100vh';
      rootElement.style.overflow = 'visible !important';
      rootElement.style.maxHeight = 'none !important';
    }
    
    const fetchData = async () => {
      try {
        if (mode === "review" && userTestId) {
          const data = await getUserTestDetailByIdAPI(userTestIdNum);
          console.log('📥 Review mode received data:', data);

          // format questionData từ backend với media support
          const formattedQuestions = data.details.map(detail => ({
            id: detail.questionId,
            question: detail.question,
            optionA: detail.optionA,
            optionB: detail.optionB,
            optionC: detail.optionC,
            optionD: detail.optionD,
            correctAnswer: detail.correctAnswer,
            explanation: detail.explanation,
            typeId: detail.typeId,
            partId: detail.partId,
            questionType: { id: 0, name: "", description: "" },
            part: { id: 0, name: "" },
            // ✅ Transform mediaFiles to mediaMappings format
            mediaMappings: (detail as any).mediaFiles?.map((file: any) => ({
              id: file.id,
              mediaId: file.id,
              startSecond: file.startSecond,
              endSecond: file.endSecond,
              sortOrder: file.sortOrder,
              media: {
                id: file.id,
                type: file.mediaType, // mediaType → type
                url: file.mediaUrl,   // mediaUrl → url
                description: file.description
              }
            })) || []
          }));
          setQuestionData(formattedQuestions);

          // ✅ Extract global audio for review mode
          const audioMedia = formattedQuestions.find((q: QuestionWithMedia) => 
            q.mediaMappings?.some((m: MediaMapping) => m.media?.type === 'audio')
          );
          
          if (audioMedia) {
            const audioUrl = audioMedia.mediaMappings?.find((m: MediaMapping) => 
              m.media?.type === 'audio'
            )?.media?.url;
            setGlobalAudio(audioUrl || null);
            console.log('🎵 Found global audio for review:', audioUrl);
          }

          // userAnswers từ backend
          const userAns: { [questionId: number]: string } = {};
          data.details.forEach(d => {
            if (d.selectedOption) userAns[d.questionId] = d.selectedOption;
          });
          setUserAnswers(userAns);

          // set incorrectAnswers + correctCount
          setIncorrectAnswers(
            data.details
              .filter(d => !d.isCorrect)
              .map(d => ({
                questionId: d.questionId,
                correctAnswer: d.correctAnswer,
                selectedAnswer: d.selectedOption || "",
                explanation: d.explanation,
              }))
          );
          setCorrectCount(data.correctCount);

          // set answered
          setAnsweredQuestions(
            data.details.map((_, idx) => idx + 1)
          );

        } else if (mode === "exam" && id) {
          const data = await getQuestionsByTestIdAPI(Number(id));
          console.log('📥 Test exam received questions:', data);
          
          // ✅ Extract global audio (same audio for all questions)
          const audioMedia = data.find((q: QuestionWithMedia) => 
            q.mediaMappings?.some((m: MediaMapping) => m.media?.type === 'audio')
          );
          
          if (audioMedia) {
            const audioUrl = audioMedia.mediaMappings?.find((m: MediaMapping) => 
              m.media?.type === 'audio'
            )?.media?.url;
            setGlobalAudio(audioUrl || null);
            console.log('🎵 Found global audio for test:', audioUrl);
          }
          
          setQuestionData(data);
          setTotalQuestions(data.length);
        }
      } catch (err) {
        console.error("Fetch data error:", err);
      }
    };

    fetchData();
    
    // ✅ Apply styles để đảm bảo trang có thể cuộn
    setTimeout(() => {
      // ✅ Force HTML, BODY và ROOT có thể cuộn
      document.documentElement.style.cssText += '; height: auto !important; max-height: none !important; overflow: auto !important;';
      document.body.style.cssText += '; height: auto !important; max-height: none !important; overflow: auto !important;';
      
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.style.cssText += '; height: auto !important; max-height: none !important; overflow: visible !important;';
      }
    }, 100);
    
    // ✅ Cleanup function để restore styles khi component unmount
    return () => {
      document.body.style.height = originalBodyStyle;
      document.body.style.overflow = '';
      const rootElement = document.getElementById('root');
      if (rootElement && originalRootStyle) {
        rootElement.style.height = originalRootStyle;
      }
    };
  }, [mode, id, userTestId]);

  // Start test
  const handleStartTest = async () => {
    try {
      if (!id) {
        console.warn("Không có test ID");
        return;
      }
      await startTestAPI(Number(id));
      setStartTime(new Date());
      setShowStartPopup(false);
    } catch (error) {
      console.error("Lỗi bắt đầu bài test:", error);
    }
  };

  const handleCancelTest = () => {
    navigate(-1);
  };

  // Sidebar jump
  const handleJumpToQuestion = (num: number) => {
    const target = document.getElementById(`question-${num}`);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Submit
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
      setScore(result.score);
      setTotalQuestions(result.total);
      setShowResult(true);
    } catch (error) {
      console.error("Lỗi submit bài:", error);
    }
  };  
  console.log("🔍 Question data để render:", questionData);


  return (
    <div className="test-page">
      {/* ✅ POPUP XÁC NHẬN */}
      {mode === "exam" && showStartPopup && (
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

      {/* Main content */}
      {(mode === "review" || !showStartPopup) && (
        <div className="test-container">
          {/* ✅ Header */}
          <div className="test-header">
            <div className="test1">{testTitle}</div>
          </div>
          
          {/* ✅ Main content */}
          <div className="test-main">
            {/* ✅ Left content */}
            <div className="test-left">
              {/* ✅ test3 - Exam controls hoặc Review Summary */}
              <div className="test3">
                {mode === "exam" ? (
                  <>
                    {/* ✅ Global Audio Player (if exists) */}
                    {globalAudio && (
                      <div className="global-audio-container exam-mode">
                        <h4 className="global-audio-title exam-mode">
                          🎵 Audio cho toàn bộ đề thi:
                        </h4>
                        <audio controls className="global-audio-player">
                          <source src={globalAudio} type="audio/mpeg" />
                          Trình duyệt không hỗ trợ audio.
                        </audio>
                      </div>
                    )}
                    
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
                  </>
                ) : (
                  /* ✅ Review Summary - Ô riêng biệt */
                  showResult && (
                    <div className="review-summary flexible">
                      <div className="summary-box">
                        <h3 className="summary-title">Kết quả làm bài</h3>
                        <div className="summary-score">
                          <span className="big-score">{correctCount}/{questionData.length}</span>
                          <span className="accuracy">
                            🎯 Độ chính xác: <strong>{((correctCount / questionData.length) * 100).toFixed(1)}%</strong>
                          </span>
                        </div>
                      </div>
                      <div className="summary-status">
                        <div className="status correct">
                          <span>✔ Trả lời đúng</span>
                          <p>{correctCount} câu hỏi</p>
                        </div>
                        <div className="status incorrect">
                          <span>✘ Trả lời sai</span>
                          <p>{incorrectAnswers.length} câu hỏi</p>
                        </div>
                        <div className="status skipped">
                          <span>➖ Bỏ qua</span>
                          <p>{questionData.length - correctCount - incorrectAnswers.length} câu hỏi</p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* ✅ test3a - Audio Player riêng cho review mode */}
              {mode === "review" && globalAudio && (
                <div className="test3a">
                  <div className="global-audio-container review-mode">
                    <h4 className="global-audio-title review-mode">
                      🎵 Audio của đề thi:
                    </h4>
                    <audio controls className="global-audio-player">
                      <source src={globalAudio} type="audio/mpeg" />
                      Trình duyệt không hỗ trợ audio.
                    </audio>
                  </div>
                </div>
              )}

              {/* ✅ Questions area */}
              <div className="test4">
                {questionData.map((item, index) => (
                  <div id={`question-${index + 1}`} key={item.id}>
                    <CardQuestion
                      key={item.id}
                      item={item}
                      index={index + 1}
                      selectedAnswer={userAnswers[item.id] || null}
                      onSelectAnswer={
                        mode === "exam"
                          ? (questionId, selected) => {
                              setUserAnswers(prev => ({
                                ...prev,
                                [questionId]: selected
                              }));
                              const alreadyAnswered = Object.keys(userAnswers).map(Number);
                              if (!alreadyAnswered.includes(questionId)) {
                                setAnsweredQuestions([...answeredQuestions, index + 1]);
                              }
                            }
                          : () => {}
                      }
                      onAnswer={
                        mode === "exam"
                          ? (questionNumber, isAnswered) => {
                              if (isAnswered) {
                                if (!answeredQuestions.includes(questionNumber)) {
                                  setAnsweredQuestions([...answeredQuestions, questionNumber]);
                                }
                              } else {
                                setAnsweredQuestions(
                                  answeredQuestions.filter(q => q !== questionNumber)
                                );
                              }
                            }
                          : () => {}
                      }
                      showResult={showResult}
                      incorrectAnswer={incorrectAnswers.find(ans => ans.questionId === item.id) || null}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ✅ Right sidebar */}
            <div className="test-right">
              <div className="test2">
                <ExamSidebar
                  answeredQuestions={answeredQuestions}
                  onJumpToQuestion={handleJumpToQuestion}
                  onSubmit={mode === "exam" ? handleSubmitTest : () => {}}
                  showResult={showResult}
                  correctCount={correctCount}
                  totalQuestions={totalQuestions > 0 ? totalQuestions : questionData.length}
                  score={score}
                  startTime={startTime}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

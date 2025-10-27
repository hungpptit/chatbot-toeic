import "../styles/Test_exam.css";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import CardQuestion from "../components/Card Question";
import { useEffect, useState, useRef } from "react";
import {
  getQuestionsByTestIdAPI,
  getUserTestDetailByIdAPI,
  submitTestAPI,
  startTestAPI,
  type QuestionWithMedia,
  type MediaMapping,
  type SubmitResult,
} from "../services/question_test_services";
import { getAllPartsAPI, type Part } from "../services/adminTestService";
import ExamSidebar from "../components/ExamSidebar";
import { FaHeadphones, FaBook } from 'react-icons/fa';

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
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [showStartPopup, setShowStartPopup] = useState(mode === "exam");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [score, setScore] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [globalAudio, setGlobalAudio] = useState<string | null>(null);
  
  // ✅ Parts state and filtering
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionWithMedia[]>([]);

  // ✅ Ref to track current audio pause listener
  const currentAudioListenerRef = useRef<(() => void) | null>(null);

  const { userTestId, id } = useParams();
  const userTestIdNum = Number(userTestId);
  const navigate = useNavigate();
  const location = useLocation();
  const testTitle = location.state?.title || "New Economy TOEIC Test";

  // Fetch data
  useEffect(() => {
    console.log("🌀 useEffect chạy", { mode, userTestId, id });
    
    const fetchData = async () => {
      try {
        // ✅ Load Parts data
        const partsData = await getAllPartsAPI();
        setParts(partsData);
        console.log('📋 Loaded parts:', partsData);

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
                // ✅ Extract audio timing for replay
                startSecond: (d as any).mediaFiles?.find((f: any) => f.mediaType === 'audio')?.startSecond,
                endSecond: (d as any).mediaFiles?.find((f: any) => f.mediaType === 'audio')?.endSecond,
              }))
          );
          setCorrectCount(data.correctCount);

          // ✅ Set score và totalQuestions từ backend data
          setScore(data.score || 0);
          setTotalQuestions(data.totalQuestions || formattedQuestions.length);

          console.log('📊 Review mode - Set state from backend:', {
            correctCount: data.correctCount,
            score: data.score,
            totalQuestions: data.totalQuestions,
            formattedQuestionsLength: formattedQuestions.length
          });

          // set answered
          setAnsweredQuestions(
            new Set(data.details.map(d => d.questionId))
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
  }, [mode, id, userTestId]);

  // ✅ Cleanup audio listener on unmount
  useEffect(() => {
    return () => {
      if (currentAudioListenerRef.current) {
        const audioElement = document.querySelector('.global-audio-player') as HTMLAudioElement;
        if (audioElement) {
          audioElement.removeEventListener('timeupdate', currentAudioListenerRef.current);
        }
        currentAudioListenerRef.current = null;
      }
    };
  }, []);

  // ✅ Filter questions based on selected part
  useEffect(() => {
    if (selectedPartId === null) {
      // Show all questions
      setFilteredQuestions(questionData);
    } else {
      // Filter by selected part
      const filtered = questionData.filter(q => q.partId === selectedPartId);
      setFilteredQuestions(filtered);
      console.log(`🔍 Filtered ${filtered.length} questions for part ${selectedPartId}`);
    }
  }, [questionData, selectedPartId]);

  // ✅ Handle part selection
  const handlePartSelect = (partId: number) => {
    if (selectedPartId === partId) {
      // Deselect if clicking the same part
      setSelectedPartId(null);
    } else {
      setSelectedPartId(partId);
    }
  };

  // ✅ Calculate answered questions for sidebar (based on all questions, not filtered)
  const getAnsweredQuestionsForSidebar = (): number[] => {
    return questionData
      .map((q, index) => answeredQuestions.has(q.id) ? index + 1 : null)
      .filter((idx): idx is number => idx !== null);
  };

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
    // ✅ Check if question exists in current filtered view
    const questionIndex = num - 1;
    const targetQuestion = questionData[questionIndex];
    
    if (targetQuestion && selectedPartId !== null) {
      // If question doesn't belong to current part, switch to "All"
      if (targetQuestion.partId !== selectedPartId) {
        setSelectedPartId(null);
        console.log(`🔄 Switched to "All" to show question ${num}`);
      }
    }
    
    // Jump to question
    const target = document.getElementById(`question-${num}`);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ✅ Audio replay function for specific time segments
  const handleAudioReplay = (startSecond?: number, endSecond?: number) => {
    const audioElement = document.querySelector('.global-audio-player') as HTMLAudioElement;
    if (!audioElement || !globalAudio) {
      console.warn('🎵 No audio player found');
      return;
    }

    // ✅ Clear previous listener if exists
    if (currentAudioListenerRef.current) {
      audioElement.removeEventListener('timeupdate', currentAudioListenerRef.current);
      currentAudioListenerRef.current = null;
      console.log('🎵 Cleared previous audio listener');
    }

    // ✅ Stop current playback and switch immediately
    audioElement.pause();

    if (startSecond !== undefined) {
      audioElement.currentTime = startSecond;
      audioElement.play();
      
      // ✅ Auto pause at endSecond if specified
      if (endSecond !== undefined) {
        const checkTime = () => {
          if (audioElement.currentTime >= endSecond) {
            audioElement.pause();
            audioElement.removeEventListener('timeupdate', checkTime);
            currentAudioListenerRef.current = null;
            console.log(`🎵 Auto-paused at ${endSecond}s`);
          }
        };
        
        // ✅ Store listener reference for cleanup
        currentAudioListenerRef.current = checkTime;
        audioElement.addEventListener('timeupdate', checkTime);
      }
      
      console.log(`🎵 ▶️ Playing audio segment: ${startSecond}s - ${endSecond || 'end'}s`);
    } else {
      // Fallback: play from beginning
      audioElement.currentTime = 0;
      audioElement.play();
      console.log('🎵 ▶️ Playing from beginning (no timing specified)');
    }
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
                    
                    {/* <div className="audio-controls">
                      <button>▶</button>
                      <div className="progress-bar">
                        <div className="filled"></div>
                      </div>
                      <span>-47:00</span>
                      <input type="range" />
                      <button>⚙</button>
                    </div> */}
                    <div className="parts">
                      {parts.map((part) => (
                        <div 
                          key={part.id} 
                          className={`part-button ${selectedPartId === part.id ? "active" : ""}`}
                          onClick={() => handlePartSelect(part.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          {part.name}
                        </div>
                      ))}
                      {/* ✅ All Parts button */}
                      <div 
                        className={`part-button ${selectedPartId === null ? "active" : ""}`}
                        onClick={() => setSelectedPartId(null)}
                        style={{ cursor: 'pointer' }}
                      >
                        Tất cả
                      </div>
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
                {filteredQuestions.map((item, index) => (
                  <div id={`question-${index + 1}`} key={item.id}>
                    {/* Question type icon */}
                    <span className="question-icon">
                      {item.partId <= 4
                        ? <FaHeadphones title="Listening" style={{ marginRight: 8, color: '#FF9800' }} />
                        : <FaBook title="Reading" style={{ marginRight: 8, color: '#2196F3' }} />
                      }
                    </span>
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
                              // Add to answered questions set
                              setAnsweredQuestions(prev => new Set([...prev, questionId]));
                            }
                          : () => {}
                      }
                      onAnswer={
                        mode === "exam"
                          ? (_questionNumber, isAnswered) => {
                              const questionId = item.id;
                              if (isAnswered) {
                                setAnsweredQuestions(prev => new Set([...prev, questionId]));
                              } else {
                                setAnsweredQuestions(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(questionId);
                                  return newSet;
                                });
                              }
                            }
                          : () => {}
                      }
                      showResult={showResult}
                      incorrectAnswer={incorrectAnswers.find(ans => ans.questionId === item.id) || null}
                      onAudioReplay={handleAudioReplay} // ✅ Pass audio replay function
                      hasGlobalAudio={!!globalAudio && item.partId <= 4}    // ✅ Indicate if global audio exists
                    />
                  </div>
                ))}
                
                {/* ✅ Show message when no questions in selected part */}
                {filteredQuestions.length === 0 && selectedPartId !== null && (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#666',
                    fontSize: '16px'
                  }}>
                    📝 Không có câu hỏi nào thuộc phần này
                  </div>
                )}
              </div>
            </div>

            {/* ✅ Right sidebar */}
            <div className="test-right">
              <div className="test2">
                <ExamSidebar
                  answeredQuestions={getAnsweredQuestionsForSidebar()}
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

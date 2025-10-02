import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  getQuestionsByTestIdAPI,
  updateQuestionAPI,
  type QuestionWithMedia,
  type MediaMapping,
} from "../../services/question_test_services";
import { getAllPartsAPI, type Part } from "../../services/adminTestService";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import "../../styles/AdminTestViewPage.css";
import "../../styles/cardQuestion.css";

export default function AdminTestViewPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { title, mode = "view" } = location.state as {
    title: string;
    mode?: "view" | "edit";
  };

  const [questions, setQuestions] = useState<QuestionWithMedia[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [globalAudio, setGlobalAudio] = useState<string | null>(null);
  
  // ✅ Parts filtering
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionWithMedia[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Load Parts data
        const partsData = await getAllPartsAPI();
        setParts(partsData);
        console.log('📋 Admin view loaded parts:', partsData);

        // Load questions
        const data = await getQuestionsByTestIdAPI(Number(id));
        console.log('📥 Frontend received questions:', data);
        
        // ✅ DEBUG: Check first question structure in detail
        if (data.length > 0) {
          console.log('🔍 First question detailed structure:', {
            id: data[0].id,
            question: data[0].question?.substring(0, 50) + '...',
            hasMediaMappings: !!data[0].mediaMappings,
            mediaMappingsLength: data[0].mediaMappings?.length || 0,
            mediaMappingsStructure: data[0].mediaMappings,
            allKeys: Object.keys(data[0])
          });
          
          // Check each question for media
          data.forEach((q, idx) => {
            console.log(`Question ${idx + 1} media:`, {
              hasMedia: !!q.mediaMappings,
              mediaCount: q.mediaMappings?.length || 0,
              mediaTypes: q.mediaMappings?.map(m => m.media?.type) || []
            });
          });
        }
        
        // ✅ Extract global audio (same audio for all questions)
        const audioMedia = data.find((q: QuestionWithMedia) => 
          q.mediaMappings?.some((m: MediaMapping) => m.media?.type === 'audio')
        );
        
        if (audioMedia) {
          const audioUrl = audioMedia.mediaMappings?.find((m: MediaMapping) => 
            m.media?.type === 'audio'
          )?.media?.url;
          setGlobalAudio(audioUrl || null);
          console.log('🎵 Found global audio:', audioUrl);
        }
        
        setQuestions(data);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết đề thi:", error);
      }
    };
    fetchData();
  }, [id]);

  // ✅ Filter questions based on selected part
  useEffect(() => {
    if (selectedPartId === null) {
      setFilteredQuestions(questions);
    } else {
      const filtered = questions.filter(q => q.partId === selectedPartId);
      setFilteredQuestions(filtered);
      console.log(`🔍 Admin filtered ${filtered.length} questions for part ${selectedPartId}`);
    }
  }, [questions, selectedPartId]);

  // ✅ Handle part selection
  const handlePartSelect = (partId: number) => {
    if (selectedPartId === partId) {
      setSelectedPartId(null);
    } else {
      setSelectedPartId(partId);
    }
  };

  // ✅ Helper function to get image URL for a question
  const getQuestionImage = (question: QuestionWithMedia): string | null => {
    const imageMapping = question.mediaMappings?.find((m: MediaMapping) => 
      m.media?.type === 'image'
    );
    return imageMapping?.media?.url || null;
  };

  const handleEditQuestion = (q: any) => {
    if (mode !== "edit") return;
    setEditingId(q.id);
    setEditData({ ...q });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleChange = (field: string, value: string) => {
    if (mode === "view") return;
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSaveQuestion = async () => {
    if (mode === "edit") {
      try {
        await updateQuestionAPI(editingId as number, editData);
        setQuestions((prev) =>
          prev.map((q) => (q.id === editingId ? { ...editData } : q))
        );
        setEditingId(null);
        setEditData({});
        alert("✅ Cập nhật thành công!");
      } catch (error) {
        console.error("Lỗi khi lưu câu hỏi:", error);
        alert("❌ Lỗi khi lưu câu hỏi!");
      }
    }
  };

  if (!questions.length) return <p>Đang tải đề thi...</p>;

  return (
    <div className="admin-test-view">
      <h2>Đề thi: {title}</h2>
      <p>Tổng số câu: {questions.length}</p>

      {/* ✅ Parts Filter */}
      <div className="parts-filter-container">
        <h4>Lọc theo phần:</h4>
        <div className="parts-filter">
          <div 
            className={`part-filter-button ${selectedPartId === null ? "active" : ""}`}
            onClick={() => setSelectedPartId(null)}
          >
            Tất cả ({questions.length})
          </div>
          {parts.map((part) => {
            const partQuestionCount = questions.filter(q => q.partId === part.id).length;
            return (
              <div 
                key={part.id} 
                className={`part-filter-button ${selectedPartId === part.id ? "active" : ""}`}
                onClick={() => handlePartSelect(part.id)}
              >
                {part.name} ({partQuestionCount})
              </div>
            );
          })}
        </div>
        {selectedPartId !== null && (
          <p className="filter-info">
            Hiển thị {filteredQuestions.length} câu hỏi thuộc {parts.find(p => p.id === selectedPartId)?.name}
          </p>
        )}
      </div>

      {/* ✅ Global Audio Player (if exists) */}
      {globalAudio && (
        <div className="global-audio-container">
          <h4 className="global-audio-title">
            🎵 Audio cho toàn bộ đề thi:
          </h4>
          <audio controls className="global-audio-player">
            <source src={globalAudio} type="audio/mpeg" />
            Trình duyệt không hỗ trợ audio.
          </audio>
        </div>
      )}

      {filteredQuestions.map((q, i) => {
        const isEditing = editingId === q.id;
        const questionImage = getQuestionImage(q);
        
        // ✅ Calculate actual question index in full list
        const actualIndex = questions.findIndex(question => question.id === q.id) + 1;

        return (
          <div key={q.id} className="card-container">
            {/* ✅ Question Image (if exists) */}
            {questionImage && (
              <div className="question-image-container">
                <img 
                  src={questionImage} 
                  alt={`Question ${i + 1} image`}
                  className="question-image"
                />
              </div>
            )}

            <h2 className="card-question">
              {actualIndex}.{" "}
              {isEditing ? (
                <input
                  value={editData.question}
                  onChange={(e) => handleChange("question", e.target.value)}
                />
              ) : (
                q.question
              )}
            </h2>

            <div className="card-options">
              {["A", "B", "C", "D"].map((opt) => {
                const optionKey = `option${opt}` as 'optionA' | 'optionB' | 'optionC' | 'optionD';
                const isCorrect =
                  (isEditing ? editData.correctAnswer : q.correctAnswer) === opt;

                return isEditing ? (
                  <div key={opt} className="card-option edit-mode">
                    <input
                      value={editData[optionKey]}
                      onChange={(e) => handleChange(optionKey as string, e.target.value)}

                    />
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={isCorrect}
                      onChange={() => handleChange("correctAnswer", opt)}
                    />
                    <label>Đáp án đúng</label>
                  </div>
                ) : (
                  <button
                    key={opt}
                    className={`card-option ${
                      opt === q.correctAnswer ? "correct-answer" : ""
                    }`}
                    disabled
                  >
                    {opt}. {q[optionKey]}
                  </button>
                );
              })}
            </div>

            <div className="card-explanation">
              <p>
                Correct Answer:{" "}
                <span className="card-correct">
                  {isEditing ? editData.correctAnswer : q.correctAnswer}
                </span>
              </p>
              {isEditing ? (
                <textarea
                  value={editData.explanation}
                  onChange={(e) =>
                    handleChange("explanation", e.target.value)
                  }
                />
              ) : (
                <p>Explanation: {q.explanation}</p>
              )}
            </div>

            {mode === "edit" && (
              <div className="card-actions">
                {isEditing ? (
                  <>
                    <button className="save-btn" onClick={handleSaveQuestion}>
                      <FaSave /> Lưu
                    </button>
                    <button className="cancel-btn" onClick={handleCancelEdit}>
                      <FaTimes /> Hủy
                    </button>
                  </>
                ) : (
                  <button
                    className="edit-btn"
                    onClick={() => handleEditQuestion(q)}
                  >
                    <FaEdit /> Chỉnh sửa
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* ✅ Show message when no questions in selected part */}
      {filteredQuestions.length === 0 && selectedPartId !== null && (
        <div className="no-questions-message">
          <p>📝 Không có câu hỏi nào thuộc phần này</p>
        </div>
      )}
    </div>
  );
}

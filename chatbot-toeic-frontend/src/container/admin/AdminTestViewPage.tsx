import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  getQuestionsByTestIdAPI,
  updateQuestionAPI,
} from "../../services/question_test_services";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import "../../styles/AdminTestViewPage.css";
import "../../styles/CardQuestion.css";

export default function AdminTestViewPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { title, mode = "view" } = location.state as {
    title: string;
    mode?: "view" | "edit";
  };

  const [questions, setQuestions] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getQuestionsByTestIdAPI(Number(id));
        setQuestions(data);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết đề thi:", error);
      }
    };
    fetchQuestions();
  }, [id]);

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

      {questions.map((q, i) => {
        const isEditing = editingId === q.id;

        return (
          <div key={q.id} className="card-container">
            <h2 className="card-question">
              {i + 1}.{" "}
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
                const optionKey = `option${opt}` as keyof typeof q;
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
    </div>
  );
}

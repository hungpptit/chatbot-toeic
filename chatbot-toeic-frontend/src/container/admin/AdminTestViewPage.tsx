import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  getQuestionsByTestIdAPI,
  updateQuestionAPI,
} from "../../services/question_test_services";
import { FaEdit, FaSave, FaTimes, FaPlus, FaUpload } from "react-icons/fa";
import "../../styles/AdminTestViewPage.css";
import "../../styles/CardQuestion.css";

export default function AdminTestViewPage() {
  const { id } = useParams<{ id: string }>();
  const [questions, setQuestions] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const location = useLocation();
  const [testTitle, setTestTitle] = useState<string>("");


  // ✅ Nhận mode từ state (thêm "add")
  const { title, mode } = (location.state as { title: string; mode?: "view" | "edit" | "add" }) || {
    title: "",
    mode: "view",
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      if (mode === "add") {
        // ✅ Nếu thêm mới thì tạo sẵn 1 câu hỏi trống
        const tempId = Date.now();
        setQuestions([
          {
            id: tempId,
            question: "",
            optionA: "",
            optionB: "",
            optionC: "",
            optionD: "",
            correctAnswer: "",
            explanation: "",
          },
        ]);
        setEditingId(tempId);
        setEditData({
          question: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctAnswer: "",
          explanation: "",
        });
      } else {
        try {
          const data = await getQuestionsByTestIdAPI(Number(id));
          setQuestions(data);
        } catch (error) {
          console.error("Lỗi khi lấy chi tiết đề thi:", error);
        }
      }
    };
    fetchQuestions();
  }, [id, mode]);

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
    if (mode === "view") return;

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
    } else if (mode === "add") {
      // ✅ Tạm thời chỉ in ra log (chưa gửi API)
      console.log("Thêm mới đề (từng câu hỏi):", questions);
      alert("✅ Dữ liệu thêm mới đã in ra console (chưa gửi API)");
    }
  };

  const handleAddMoreQuestion = () => {
    if (mode !== "add") return;
    const newId = Date.now();
    const newQuestion = {
      id: newId,
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "",
      explanation: "",
    };
    setQuestions((prev) => [...prev, newQuestion]);
    setEditingId(newId);
    setEditData(newQuestion);
  };

  // ✅ Xử lý chọn file upload
  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
  };

  // ✅ Xử lý gửi file (tạm thời console.log)
  const handleSubmitFile = async () => {
    if (!uploadFile) {
      alert("❌ Vui lòng chọn file trước!");
      return;
    }

    console.log("✅ File đã chọn:", uploadFile);
    alert("✅ Đã chọn file, chi tiết xem ở console (API xử lý sau)");
  };

  if (mode !== "add" && !questions.length) return <p>Đang tải đề thi...</p>;

  return (
    <div className="admin-test-view">
      {mode === "add" ? (
        <div className="add-test-header">
          <h2>Thêm đề mới</h2>
          <input
            type="text"
            className="add-test-title-input"
            placeholder="Nhập tiêu đề đề thi..."
            value={testTitle}
            onChange={(e) => setTestTitle(e.target.value)}
          />
        </div>
      ) : (
        <h2>Đề thi: {title}</h2>
      )}
      {mode !== "add" && <p>Tổng số câu: {questions.length}</p>}

      {mode === "add" && (
        <div className="upload-section" style={{ marginBottom: "20px" }}>
          <h3>Hoặc tải lên file JSON/CSV</h3>
          <input type="file" accept=".json,.csv" onChange={handleUploadFile} />
          <button
            className="save-btn"
            style={{ marginTop: "10px" }}
            onClick={handleSubmitFile}
          >
            <FaUpload /> Gửi file lên BE
          </button>
        </div>
      )}

      {questions.map((q, i) => {
        const isEditing = editingId === q.id || mode === "add";

        return (
          <div key={q.id} className="card-container">
            <h2 className="card-question">
              {i + 1}.{" "}
              {isEditing ? (
                <input
                  value={editData.question}
                  onChange={(e) => handleChange("question", e.target.value)}
                  disabled={mode === "view"}
                />
              ) : (
                q.question
              )}
            </h2>

            <div className="card-options">
              {["A", "B", "C", "D"].map((opt) => {
                const optionKey = `option${opt}` as
                  | "optionA"
                  | "optionB"
                  | "optionC"
                  | "optionD";

                const isCorrect =
                  (isEditing ? editData.correctAnswer : q.correctAnswer) === opt;

                return isEditing ? (
                  <div key={opt} className="card-option edit-mode">
                    <input
                      value={editData[optionKey]}
                      onChange={(e) => handleChange(optionKey, e.target.value)}
                      disabled={mode === "view"}
                    />
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={isCorrect}
                      onChange={() => handleChange("correctAnswer", opt)}
                      disabled={mode === "view"}
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
                  disabled={mode === "view"}
                />
              ) : (
                <p>Explanation: {q.explanation}</p>
              )}
            </div>

            <div className="card-actions">
              {mode === "edit" &&
                (isEditing ? (
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
                ))}

              {mode === "add" && (
                <>
                  <button className="save-btn" onClick={handleSaveQuestion}>
                    <FaSave /> Lưu đề
                  </button>
                  <button
                    className="edit-btn"
                    style={{ backgroundColor: "#007bff" }}
                    onClick={handleAddMoreQuestion}
                  >
                    <FaPlus /> Thêm câu hỏi
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

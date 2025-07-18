import { useEffect, useState } from "react";
import { FaSave, FaPlus, FaUpload } from "react-icons/fa";
import Select from "react-select";
import "../../styles/AdminTestViewPage.css";
import "../../styles/CardQuestion.css";
import {
  getAllCourseNamesAPI,
  type Course,
} from "../../services/testCourseService";
import {
  getAllQuestionTypesAPI,
  getAllPartsAPI,
  type QuestionType,
  type Part,
  createNewTestAPI,
} from "../../services/adminTestService";

export default function AdminTestAddPage() {
  const [testTitle, setTestTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([createEmptyQuestion()]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [parts, setParts] = useState<Part[]>([]);

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);

  useEffect(() => {
    getAllCourseNamesAPI().then(setCourses);
    getAllQuestionTypesAPI().then(setQuestionTypes);
    getAllPartsAPI().then(setParts);
  }, []);

  const handleChange = (index: number, field: string, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const handleAddMoreQuestion = () => {
    setQuestions((prev) => [...prev, createEmptyQuestion()]);
  };

  const handleSave = async () => {
    if (!testTitle || !selectedCourseId || !selectedTypeId || !selectedPartId) {
      alert("❌ Vui lòng điền đầy đủ thông tin đề thi và chọn đủ các mục.");
      return;
    }

    const fullTestData = {
      title: testTitle,
      courseId: selectedCourseId,
      // typeId: selectedTypeId,
      // partId: selectedPartId,
      questions: questions.map((q) => ({
        ...q,
        // courseId: selectedCourseId,
        typeId: selectedTypeId,
        partId: selectedPartId,
      })),
    };
    try {
      // console.log("🔍 Payload gửi lên:", fullTestData);
      const result = await createNewTestAPI(fullTestData);
      console.log("✅ Tạo đề thi thành công:", result);
      alert("✅ Đề thi đã được tạo!");
    } catch (error) {
       console.error("❌ Lỗi khi tạo đề thi:", error);
      alert("❌ Tạo đề thi thất bại");
    }


  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadFile(file);
  };

  // const handleSubmitFile = () => {
  //   if (!uploadFile) return alert("❌ Vui lòng chọn file trước!");
  //   console.log("📤 File upload:", uploadFile);
  //   alert("✅ Đã chọn file, chi tiết xem ở console");
  // };

  const handleSubmitFile = () => {
    if (!uploadFile) return alert("❌ Vui lòng chọn file trước!");

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);

        // Validate format
        if (
          !json.title ||
          !json.courseId ||
          !Array.isArray(json.questions) ||
          json.questions.length === 0
        ) {
          alert("❌ File JSON không đúng định dạng hoặc thiếu dữ liệu!");
          return;
        }

        // Lấy typeId và partId từ câu hỏi đầu tiên (giả định giống nhau)
        const firstQuestion = json.questions[0];
        const typeId = firstQuestion.typeId || null;
        const partId = firstQuestion.partId || null;

        // Fill vào form
        setTestTitle(json.title);
        setSelectedCourseId(json.courseId);
        setSelectedTypeId(typeId);
        setSelectedPartId(partId);

        // Loại bỏ các field không cần thiết khỏi mỗi question (nếu muốn)
        const cleanedQuestions = json.questions.map((q: any) => ({
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        }));

        setQuestions(cleanedQuestions);

        alert("✅ Đã load dữ liệu đề thi thành công!");
      } catch (err) {
        console.error("❌ Lỗi khi đọc JSON:", err);
        alert("❌ Không thể đọc file JSON!");
      }
    };

    reader.readAsText(uploadFile);
  };


  return (
    <div className="admin-test-view">
      <div className="add-test-header">
        <h2>Thêm đề thi mới</h2>
        <input
          className="add-test-title-input"
          value={testTitle}
          placeholder="Nhập tiêu đề đề thi..."
          onChange={(e) => setTestTitle(e.target.value)}
        />
      </div>

      <div className="box-items">
        <Dropdown label="Chọn Course" options={courses} onChange={setSelectedCourseId}  value={selectedCourseId}/>
        <Dropdown label="Chọn Part" options={parts} onChange={setSelectedPartId}  value={selectedPartId}/>
        <Dropdown label="Chọn Type" options={questionTypes} onChange={setSelectedTypeId} value={selectedTypeId}/>
      </div>

      <div className="upload-section" style={{ marginBottom: "20px" }}>
        <h3>Hoặc tải lên file JSON/CSV</h3>
        <input type="file" accept=".json,.csv" onChange={handleUploadFile} />
        <button className="save-btn" style={{ marginTop: "10px" }} onClick={handleSubmitFile}>
          <FaUpload /> Load File lên form
        </button>
      </div>

      {questions.map((q, i) => (
        <div key={i} className="card-container">
          <h2 className="card-question">
            {i + 1}.{" "}
            <input
              value={q.question}
              onChange={(e) => handleChange(i, "question", e.target.value)}
              placeholder="Nhập nội dung câu hỏi..."
            />
          </h2>

          <div className="card-options">
            {["A", "B", "C", "D"].map((opt) => {
              const optionKey = `option${opt}` as keyof Question;
              return (
                <div key={opt} className="card-option edit-mode">
                  <input
                    value={q[optionKey]}
                    onChange={(e) => handleChange(i, optionKey, e.target.value)}
                    placeholder={`Đáp án ${opt}`}
                  />
                  <input
                    type="radio"
                    name={`correct-${i}`}
                    checked={q.correctAnswer === opt}
                    onChange={() => handleChange(i, "correctAnswer", opt)}
                  />
                  <label>Đúng</label>
                </div>
              );
            })}
          </div>

          <div className="card-explanation">
            <p>
              Correct Answer:{" "}
              <span className="card-correct">{q.correctAnswer || "?"}</span>
            </p>
            <textarea
              value={q.explanation}
              onChange={(e) => handleChange(i, "explanation", e.target.value)}
              placeholder="Giải thích đáp án..."
            />
          </div>

          <div className="card-actions">
            <button className="save-btn" onClick={handleSave}>
              <FaSave /> Lưu đề
            </button>
            <button className="edit-btn" onClick={handleAddMoreQuestion}>
              <FaPlus /> Thêm câu hỏi
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper Types
type Question = {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
};

// Init câu hỏi trống
function createEmptyQuestion(): Question {
  return {
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "",
    explanation: "",
  };
}

// Dropdown Component
// function Dropdown({
//   label,
//   options,
//   onChange,
// }: {
//   label: string;
//   options: { id: number; name: string }[];
//   onChange: (id: number | null) => void;
// }) {
//   return (
//     <div className="dropdown-wrapper">
//       <label>
//         <strong>{label}:</strong>
//       </label>
//       <Select
//         classNamePrefix="custom-react-select"
//         options={options.map((item) => ({
//           value: item.id,
//           label: item.name,
//         }))}
//         onChange={(selected) => onChange(selected ? selected.value : null)}
//         placeholder={`-- ${label} --`}
//         menuPortalTarget={document.body}
//       />
//     </div>
//   );
// }


function Dropdown({
  label,
  options,
  onChange,
  value, // <-- Thêm prop này
}: {
  label: string;
  options: { id: number; name: string }[];
  onChange: (id: number | null) => void;
  value: number | null; // <-- Thêm type cho prop mới
}) {
  const selectedOption = options.find((item) => item.id === value) || null;

  return (
    <div className="dropdown-wrapper">
      <label>
        <strong>{label}:</strong>
      </label>
      <Select
        classNamePrefix="custom-react-select"
        options={options.map((item) => ({
          value: item.id,
          label: item.name,
        }))}
        value={
          selectedOption
            ? { value: selectedOption.id, label: selectedOption.name }
            : null
        }
        onChange={(selected) => onChange(selected ? selected.value : null)}
        placeholder={`-- ${label} --`}
        menuPortalTarget={document.body}
      />
    </div>
  );
}

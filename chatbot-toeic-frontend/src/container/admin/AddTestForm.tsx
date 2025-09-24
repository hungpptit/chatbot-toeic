// Thêm đề thi mới - Admin
import { useEffect, useState } from "react";
import { FaSave, FaPlus, FaUpload } from "react-icons/fa";
import Select from "react-select";
import "../../styles/AdminTestViewPage.css";
import "../../styles/cardQuestion.css";
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
  getAllSkillsAPI,
  type Skill,
} from "../../services/adminTestService";

export default function AdminTestAddPage() {
  const [testTitle, setTestTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([createEmptyQuestion()]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [parts, setParts] = useState<Part[]>([]);

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);

  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    getAllCourseNamesAPI().then(setCourses);
    getAllQuestionTypesAPI().then(setQuestionTypes);
    getAllPartsAPI().then(setParts);
    getAllSkillsAPI().then(setSkills);
  }, []);

  const handleChange = (index: number, field: string, value: string | number | null) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };  

  const handleAddMoreQuestion = () => {
    setQuestions((prev) => [...prev, createEmptyQuestion()]);
  };

  const handleSave = async () => {
    if (!testTitle || !selectedCourseId || !selectedPartId) {
      alert("❌ Vui lòng điền đầy đủ thông tin đề thi và chọn đủ các mục.");
      return;
    }

    // Kiểm tra từng câu hỏi có skill và type chưa
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.skillId || !q.typeId) {
        alert(`❌ Câu hỏi ${i + 1}: Vui lòng chọn đủ Skill và Type!`);
        return;
      }
    }

    const fullTestData = {
      title: testTitle,
      courseId: selectedCourseId,
      // typeId: selectedTypeId,
      // partId: selectedPartId,
      questions: questions.map((q) => ({
        ...q,
        // courseId: selectedCourseId,
        typeId: q.typeId as number, // đã validate nên chắc chắn không null
        partId: selectedPartId,
        skillId: q.skillId as number, // đã validate nên chắc chắn không null
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

        // Lấy partId từ level gốc của JSON hoặc từ câu hỏi đầu tiên
        const partId = json.partId || json.questions[0]?.partId || null;

        // Validate từng câu hỏi theo loại (typeId và skillId có thể null)
        for (let i = 0; i < json.questions.length; i++) {
          const q = json.questions[i];
          const questionType = q.typeId || 1; // Default là Multiple Choice
          
          // Validate question và correctAnswer - bắt buộc cho tất cả loại
          if (!q.question || !q.correctAnswer) {
            alert(`❌ File JSON: Câu hỏi ${i + 1} thiếu nội dung câu hỏi hoặc đáp án đúng!`);
            return;
          }

          // Validate options theo từng loại câu hỏi
          switch (questionType) {
            case 1: // Multiple Choice - cần đủ 4 options
              if (!q.optionA || !q.optionB || !q.optionC || !q.optionD) {
                alert(`❌ File JSON: Câu hỏi ${i + 1} (Multiple Choice) thiếu đáp án A, B, C, hoặc D!`);
                return;
              }
              break;

            case 2: // Fill in Blank - options có thể null
              // Không cần validate options, chỉ cần question và correctAnswer
              break;

            case 3: // Matching - cần ít nhất 2 cặp để ghép
              if (!q.optionA || !q.optionB || !q.optionC || !q.optionD) {
                alert(`❌ File JSON: Câu hỏi ${i + 1} (Matching) cần đủ 4 options để ghép đôi!`);
                return;
              }
              break;

            case 4: // Rearrangement - cần các từ để sắp xếp
              if (!q.optionA || !q.optionB) {
                alert(`❌ File JSON: Câu hỏi ${i + 1} (Rearrangement) cần ít nhất 2 từ để sắp xếp!`);
                return;
              }
              break;

            case 5: // True/False - options có thể null vì chỉ cần True/False
              // Không cần validate options
              break;

            case 6: // Short Answer - options có thể null
              // Không cần validate options, chỉ cần question và correctAnswer
              break;

            default:
              // Loại câu hỏi không xác định - validate như Multiple Choice
              if (!q.optionA || !q.optionB || !q.optionC || !q.optionD) {
                alert(`❌ File JSON: Câu hỏi ${i + 1} (Unknown type) thiếu thông tin options!`);
                return;
              }
          }
        }

        // Fill vào form
        setTestTitle(json.title);
        setSelectedCourseId(json.courseId);
        setSelectedPartId(partId);

        // Xử lý dữ liệu theo từng loại câu hỏi
        const cleanedQuestions = json.questions.map((q: any) => {
          const questionType = q.typeId || 1;
          
          // Base data cho tất cả loại câu hỏi
          const baseQuestion = {
            question: q.question,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || "",
            typeId: q.typeId || null,
            skillId: q.skillId || null,
          };

          // Xử lý options theo từng loại
          switch (questionType) {
            case 2: // Fill in Blank - options có thể để trống
            case 6: // Short Answer - options có thể để trống
              return {
                ...baseQuestion,
                optionA: q.optionA || "",
                optionB: q.optionB || "",
                optionC: q.optionC || "",
                optionD: q.optionD || "",
              };

            case 5: // True/False - chỉ cần optionA, B làm placeholder
              return {
                ...baseQuestion,
                optionA: q.optionA || "True",
                optionB: q.optionB || "False", 
                optionC: q.optionC || "",
                optionD: q.optionD || "",
              };

            default: // Multiple Choice, Matching, Rearrangement - giữ nguyên options
              return {
                ...baseQuestion,
                optionA: q.optionA || "",
                optionB: q.optionB || "",
                optionC: q.optionC || "",
                optionD: q.optionD || "",
              };
          }
        });

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
        {/* ✅ Dropdown chọn Skill cho từng câu hỏi */}
        <Dropdown
          label="Chọn Skill"
          options={skills}             // mảng lấy từ API getAllSkillsAPI
          value={q.skillId ?? null}    // giá trị hiện tại của câu hỏi
          onChange={(id) => handleChange(i, "skillId", id)} // update skillId trong state
        />

        {/* ✅ Dropdown chọn Type cho từng câu hỏi */}
        <Dropdown
          label="Chọn Type"
          options={questionTypes}      // mảng lấy từ API getAllQuestionTypesAPI
          value={q.typeId ?? null}     // giá trị hiện tại của câu hỏi
          onChange={(id) => handleChange(i, "typeId", id)} // update typeId trong state
        />

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
                  value={q[optionKey] ?? ""} 
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
  typeId?: number | null;
  skillId?: number | null;
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
    typeId: null,
    skillId: null,
  };
}




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

// Thêm đề thi mới - Admin
import { useEffect, useState } from "react";
import { FaSave, FaPlus, FaUpload } from "react-icons/fa";
import Select from "react-select";
import "../../styles/AdminTestViewPage.css";
import "../../styles/cardQuestion.css";
import AdminMixTestForm from "./AdminMixTestForm";
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
  type TestCreateInput,
  type QuestionInput,
  type MediaInput,
} from "../../services/adminTestService";
import { batchUploadFromPathsAPI } from "../../services/uploadService";

// ✅ Helper: Tự động convert Windows paths (\) sang forward slash (/)
const normalizeWindowsPath = (path: string): string => {
  if (!path) return path;
  // Replace all backslashes with forward slashes
  return path.replace(/\\/g, '/');
};

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

  // ✅ Test mode: 'reading', 'listening', hoặc 'mixed'
  const [testMode, setTestMode] = useState<'reading' | 'listening' | 'mixed'>('reading');
  
  // ✅ State để hiện/ẩn Mixed Test Form
  const [showMixedForm, setShowMixedForm] = useState(false);
  
  // ✅ Global audio (cho listening mode)
  const [globalAudioFile, setGlobalAudioFile] = useState<File | null>(null);
  const [globalAudioUrl, setGlobalAudioUrl] = useState<string>('');
  
  // ✅ Loading states
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  useEffect(() => {
    getAllCourseNamesAPI().then(setCourses);
    getAllQuestionTypesAPI().then(setQuestionTypes);
    getAllPartsAPI().then(setParts);
    getAllSkillsAPI().then(setSkills);
  }, []);

  const handleChange = (index: number, field: string, value: string | number | null | File) => {
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

    try {
      setIsUploadingMedia(true);

      // ✅ Prepare questions based on test mode
      const questionsInput: QuestionInput[] = [];

      for (const q of questions) {
        const questionInput: QuestionInput = {
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          typeId: q.typeId as number,
          partId: selectedPartId,
          skillId: q.skillId as number,
        };

        // ✅ Handle media for LISTENING mode only
        if (testMode === 'listening') {
          const mediaFiles: MediaInput[] = [];
          const questionIndex = questions.indexOf(q);

          // ✅ DEBUG: Check states
          console.log(`🔍 Question ${questionIndex} debug:`, {
            hasImageFile: !!q.imageFile,
            hasImageUrl: !!q.imageUrl,
            imageUrl: q.imageUrl,
            hasGlobalAudioFile: !!globalAudioFile,
            hasGlobalAudioUrl: !!globalAudioUrl,
            globalAudioUrl: globalAudioUrl
          });

          // Add image if exists (per question)
          // Ưu tiên imageFile (File object), fallback sang imageUrl
          if (q.imageFile) {
            mediaFiles.push({
              type: 'image',
              file: q.imageFile,
              description: 'Question image',
            });
            console.log(`✅ Added imageFile for question ${questionIndex}`);
          } else if (q.imageUrl) {
            // Batch upload đã có URL, gửi trực tiếp
            mediaFiles.push({
              type: 'image',
              url: q.imageUrl,
              description: 'Question image',
            } as any);
            console.log(`✅ Added imageUrl for question ${questionIndex}: ${q.imageUrl}`);
          }

          // Add global audio (for all questions) with timing
          // Ưu tiên globalAudioFile (File object), fallback sang globalAudioUrl
          if (globalAudioFile) {
            mediaFiles.push({
              type: 'audio',
              file: globalAudioFile,
              description: 'Test audio',
              startSecond: q.startSecond !== null ? q.startSecond : undefined,
              endSecond: q.endSecond !== null ? q.endSecond : undefined,
            });
            console.log(`✅ Added globalAudioFile with timing: ${q.startSecond}-${q.endSecond}`);
          } else if (globalAudioUrl) {
            // Batch upload đã có URL, gửi trực tiếp
            mediaFiles.push({
              type: 'audio',
              url: globalAudioUrl,
              description: 'Test audio',
              startSecond: q.startSecond !== null ? q.startSecond : undefined,
              endSecond: q.endSecond !== null ? q.endSecond : undefined,
            } as any);
            console.log(`✅ Added globalAudioUrl with timing: ${globalAudioUrl} (${q.startSecond}-${q.endSecond})`);
          }

          console.log(`📦 Question ${questionIndex} mediaFiles count:`, mediaFiles.length);

          if (mediaFiles.length > 0) {
            questionInput.mediaFiles = mediaFiles;
          }
        }

        questionsInput.push(questionInput);
      }

      const fullTestData: TestCreateInput = {
        title: testTitle,
        courseId: selectedCourseId,
        questions: questionsInput,
      };

      // ✅ LOG: Check data trước khi gửi
      console.log('📤 Frontend sending to createNewTestAPI:');
      console.log({
        title: fullTestData.title,
        courseId: fullTestData.courseId,
        totalQuestions: fullTestData.questions.length,
        testMode: testMode,
        sampleQuestion: {
          ...fullTestData.questions[0],
          hasMediaFiles: fullTestData.questions[0].mediaFiles && fullTestData.questions[0].mediaFiles.length > 0,
          mediaCount: fullTestData.questions[0].mediaFiles?.length || 0
        }
      });

      console.log("📤 Đang tạo test...");
      const result = await createNewTestAPI(fullTestData);
      
      // ✅ LOG: Check response từ backend
      console.log('📥 Frontend received from createNewTestAPI:', result);
      
      console.log("✅ Tạo đề thi thành công:", result);
      alert("✅ Đề thi đã được tạo!");
    } catch (error) {
      console.error("❌ Lỗi khi tạo đề thi:", error);
      alert("❌ Tạo đề thi thất bại");
    } finally {
      setIsUploadingMedia(false);
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

        // Validate từng câu hỏi có đủ thông tin cơ bản không (typeId và skillId có thể null)
        for (let i = 0; i < json.questions.length; i++) {
          const q = json.questions[i];
          
          // Chỉ validate các field bắt buộc cơ bản
          if (!q.question || !q.optionA || !q.optionB || !q.optionC || !q.optionD || !q.correctAnswer) {
            alert(`❌ File JSON: Câu hỏi ${i + 1} thiếu thông tin bắt buộc!`);
            return;
          }
        }

        // Fill vào form
        setTestTitle(json.title);
        setSelectedCourseId(json.courseId);
        setSelectedPartId(partId);

        // Loại bỏ các field không cần thiết khỏi mỗi question (typeId, skillId có thể null)
        const cleanedQuestions = json.questions.map((q: any) => ({
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || "",
          typeId: q.typeId || null, // có thể null, sẽ chỉnh tay sau
          skillId: q.skillId || null, // có thể null, sẽ chỉnh tay sau
          startSecond: q.startSecond || null,
          endSecond: q.endSecond || null,
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

  // ✅ Handle batch upload từ paths trong JSON (cho Listening mode)
  const handleBatchUploadFromPaths = async () => {
    if (!uploadFile) {
      alert("❌ Vui lòng chọn file JSON trước!");
      return;
    }

    try {
      setIsBatchProcessing(true);
      
      const text = await uploadFile.text();
      const testData = JSON.parse(text);
      
      // Kiểm tra có paths không
      const hasPaths = testData.audioPath || 
        testData.questions?.some((q: any) => q.imagePath || q.audioPath);
      
      if (!hasPaths) {
        alert("❌ JSON không chứa audioPath hoặc imagePath! Vui lòng sử dụng 'Load File lên form' thay vì.");
        return;
      }
      
      // ✅ Auto-format Windows paths (convert \ to /)
      if (testData.audioPath) {
        testData.audioPath = normalizeWindowsPath(testData.audioPath);
      }
      
      if (testData.questions) {
        testData.questions = testData.questions.map((q: any) => ({
          ...q,
          imagePath: q.imagePath ? normalizeWindowsPath(q.imagePath) : q.imagePath,
          audioPath: q.audioPath ? normalizeWindowsPath(q.audioPath) : q.audioPath,
        }));
      }
      
      console.log('📤 Uploading files from local paths (auto-formatted)...');
      console.log('🔧 Formatted audioPath:', testData.audioPath);
      
      // Gọi API batch upload
      const uploadedData = await batchUploadFromPathsAPI(testData);
      
      // ✅ DEBUG: Check uploadedData structure
      console.log('📥 Batch upload response:', {
        hasAudioUrl: !!uploadedData.audioUrl,
        audioUrl: uploadedData.audioUrl,
        questionsCount: uploadedData.questions?.length,
        firstQuestionImageUrl: uploadedData.questions?.[0]?.imageUrl,
        sampleQuestion: uploadedData.questions?.[0]
      });
      
      // Load data với URLs vào form
      setTestTitle(uploadedData.title);
      setSelectedCourseId(uploadedData.courseId);
      setSelectedPartId(uploadedData.partId || uploadedData.questions[0]?.partId);
      
      // Set listening mode và global audio URL
      setTestMode('listening');
      if (uploadedData.audioUrl) {
        setGlobalAudioUrl(uploadedData.audioUrl);
        console.log('✅ Set globalAudioUrl:', uploadedData.audioUrl);
      }
      
      const cleanedQuestions = uploadedData.questions.map((q: any) => ({
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "",
        typeId: q.typeId || null,
        skillId: q.skillId || null,
        imageUrl: q.imageUrl || '',
        startSecond: q.startSecond || null,
        endSecond: q.endSecond || null,
      }));
      
      setQuestions(cleanedQuestions);
      
      alert("✅ Upload thành công! Files đã được upload lên Cloudinary.");
    } catch (error: any) {
      console.error("❌ Batch upload failed:", error);
      alert(`❌ Upload thất bại: ${error.message}`);
    } finally {
      setIsBatchProcessing(false);
    }
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
        {/* Only show Part selection for Reading and Listening modes, not Mixed */}
        {testMode !== 'mixed' && (
          <Dropdown label="Chọn Part" options={parts} onChange={setSelectedPartId}  value={selectedPartId}/>
        )}
      </div>

      {/* ✅ Test Mode Selection: Reading or Listening */}
      <div className="test-mode-selection">
        <h3 className="test-mode-title">🎯 Chọn loại đề thi:</h3>
        <div className="test-mode-options">
          <label className="test-mode-option">
            <input
              type="radio"
              name="testMode"
              checked={testMode === 'reading'}
              onChange={() => {
                setTestMode('reading');
                setShowMixedForm(false);
              }}
            />
            <strong>📖 Reading</strong>
            <span className="test-mode-description">(Không cần audio/image)</span>
          </label>
          <label className="test-mode-option">
            <input
              type="radio"
              name="testMode"
              checked={testMode === 'listening'}
              onChange={() => {
                setTestMode('listening');
                setShowMixedForm(false);
              }}
            />
            <strong>🎧 Listening</strong>
            <span className="test-mode-description">(Có audio/image)</span>
          </label>
          <label className="test-mode-option">
            <input
              type="radio"
              name="testMode"
              checked={testMode === 'mixed'}
              onChange={() => {
                setTestMode('mixed');
                setShowMixedForm(true);
              }}
            />
            <strong>📚 Mixed (Reading + Listening)</strong>
            <span className="test-mode-description">(Kết hợp cả 2 loại)</span>
          </label>
        </div>

      </div>

      {/* ✅ Show Mixed Form when selected */}
      {showMixedForm && (
        <AdminMixTestForm 
          onBack={() => setShowMixedForm(false)} 
          testTitle={testTitle}
          setTestTitle={setTestTitle}
          selectedCourseId={selectedCourseId}
        />
      )}

      {/* ✅ Hide normal form when showing mixed form */}
      {!showMixedForm && (
        <>
      <div className="upload-section">
        <h3>Hoặc tải lên file JSON/CSV</h3>
        <input type="file" accept=".json,.csv" onChange={handleUploadFile} />
        <div className="upload-buttons">
          <button className="save-btn" onClick={handleSubmitFile}>
            <FaUpload /> Load File lên form
          </button>
          {testMode === 'listening' && (
            <button 
              className="save-btn upload-btn-green" 
              onClick={handleBatchUploadFromPaths}
              disabled={isBatchProcessing}
            >
              <FaUpload /> {isBatchProcessing ? "Đang upload..." : "Upload từ paths (JSON có paths)"}
            </button>
          )}
        </div>
        {testMode === 'listening' && (
          <p className="upload-tip">
            💡 <strong>Tip:</strong> Nếu JSON có <code>audioPath</code>/<code>imagePath</code>, dùng button "Upload từ paths". 
            Nếu không có paths, dùng "Load File" rồi chọn files bên dưới.
          </p>
        )}
      </div>

      {/* ✅ Global Audio Input - Chỉ hiện khi Listening mode */}
      {testMode === 'listening' && (
        <div className="global-audio-section">
          <h4>🎵 Audio chung cho toàn bộ đề thi</h4>
          {globalAudioUrl ? (
            <div className="audio-url-display">
              <strong>URL đã upload:</strong> <a href={globalAudioUrl} target="_blank" rel="noopener noreferrer">{globalAudioUrl}</a>
            </div>
          ) : (
            <div className="audio-file-input">
              <label>Chọn audio file từ máy:</label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setGlobalAudioFile(e.target.files?.[0] || null)}
              />
              {globalAudioFile && (
                <p className="audio-file-selected">
                  ✅ Đã chọn: <strong>{globalAudioFile.name}</strong>
                </p>
              )}
            </div>
          )}
        </div>
      )}

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

        {/* ✅ Image input cho Listening mode */}
        {testMode === 'listening' && (
          <div className="question-media-section">
            <h4 className="question-media-title">🖼️ Hình ảnh cho câu hỏi này (tùy chọn)</h4>
            {q.imageUrl ? (
              <div className="audio-url-display">
                <strong>URL đã upload:</strong> <a href={q.imageUrl} target="_blank" rel="noopener noreferrer">{q.imageUrl}</a>
              </div>
            ) : (
              <div className="question-image-input">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleChange(i, 'imageFile', file);
                    }
                  }}
                />
                {q.imageFile && (
                  <p className="question-image-selected">
                    ✅ Đã chọn: <strong>{(q.imageFile as File).name}</strong>
                  </p>
                )}
              </div>
            )}
            
            {/* ✅ Audio timing controls */}
            <div className="audio-timing-section">
              <h5 className="audio-timing-title">🎵 Timing cho audio (giây)</h5>
              <div className="audio-timing-controls">
                <div className="timing-input-group">
                  <label className="timing-input-label">Bắt đầu:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0"
                    value={q.startSecond || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : parseFloat(e.target.value);
                      handleChange(i, 'startSecond', value);
                    }}
                    className="timing-input"
                  />
                </div>
                <div className="timing-input-group">
                  <label className="timing-input-label">Kết thúc:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="auto"
                    value={q.endSecond || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : parseFloat(e.target.value);
                      handleChange(i, 'endSecond', value);
                    }}
                    className="timing-input"
                  />
                </div>
                <div className="timing-duration-display">
                  <span className="timing-duration-label">Thời lượng:</span>
                  <span className="timing-duration-value">
                    {q.startSecond !== null && q.startSecond !== undefined && 
                     q.endSecond !== null && q.endSecond !== undefined
                      ? `${(q.endSecond - q.startSecond).toFixed(1)}s`
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
              <p className="audio-timing-tip">
                💡 <strong>Tip:</strong> Để trống = toàn bộ audio. VD: 10-15 = phát từ giây 10 đến 15.
              </p>
            </div>
          </div>
        )}

        <div className="card-options">
          {["A", "B", "C", "D"].map((opt) => {
            const optionKey = `option${opt}` as keyof Question;
            const optionValue = q[optionKey];
            const displayValue = typeof optionValue === 'string' ? optionValue : '';
            return (
              <div key={opt} className="card-option edit-mode">
                <input
                  value={displayValue} 
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
          <button 
            className="save-btn" 
            onClick={handleSave}
            disabled={isUploadingMedia}
          >
            <FaSave /> {isUploadingMedia ? "Đang upload..." : "Lưu đề"}
          </button>
          <button className="edit-btn" onClick={handleAddMoreQuestion}>
            <FaPlus /> Thêm câu hỏi
          </button>
        </div>
      </div>
    ))}

        </>
      )}
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
  // ✅ Media fields for listening mode
  imageFile?: File | null;
  imageUrl?: string;
  // ✅ Audio timing fields
  startSecond?: number | null;
  endSecond?: number | null;
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
    imageFile: null,
    imageUrl: '',
    startSecond: null,
    endSecond: null,
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

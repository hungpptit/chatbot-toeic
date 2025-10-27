import { useState, useEffect } from "react";
import { FaSave, FaPlus, FaArrowLeft, FaBook, FaHeadphones, FaUpload, FaChevronDown, FaChevronUp } from "react-icons/fa";
import Select from "react-select";
import "../../styles/AdminMixTestForm.css";
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

// Question type for Mixed Test
type MixedQuestion = {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  typeId?: number | null;
  skillId?: number | null;
  partId?: number | null; // Individual part selection per question
  // Media fields for listening questions
  imageFile?: File | null;
  imageUrl?: string;
  imagePreviewUrl?: string; // ✅ Preview URL từ URL.createObjectURL()
  // Audio timing fields (for global audio)
  startSecond?: number | null;
  endSecond?: number | null;
};

interface AdminMixTestFormProps {
  onBack: () => void;
  testTitle: string;
  setTestTitle: (title: string) => void;
  selectedCourseId: number | null;
}

// ✅ Helper: Normalize Windows paths
const normalizeWindowsPath = (path: string): string => {
  if (!path) return path;
  return path.replace(/\\/g, '/');
};

export default function AdminMixTestForm({ onBack, testTitle, setTestTitle, selectedCourseId }: AdminMixTestFormProps) {
  // State for questions - separate arrays for Reading and Listening
  const [readingQuestions, setReadingQuestions] = useState<MixedQuestion[]>([createEmptyMixedQuestion()]);
  const [listeningQuestions, setListeningQuestions] = useState<MixedQuestion[]>([createEmptyMixedQuestion()]);
  
  // Global audio for all listening questions
  const [globalAudioFile, setGlobalAudioFile] = useState<File | null>(null);
  const [globalAudioUrl, setGlobalAudioUrl] = useState<string>('');
  const [globalAudioPreviewUrl, setGlobalAudioPreviewUrl] = useState<string>(''); // ✅ Preview URL for local file
  
  // Dropdown options
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  
  // Loading state
  const [isCreating, setIsCreating] = useState(false);
  
  // ✅ JSON upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [showJsonFormat, setShowJsonFormat] = useState(false);

  

  useEffect(() => {
    getAllQuestionTypesAPI().then(setQuestionTypes);
    getAllPartsAPI().then(setParts);
    getAllSkillsAPI().then(setSkills);
  }, []);

  // ✅ Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      // Revoke all preview URLs to prevent memory leaks
      [...readingQuestions, ...listeningQuestions].forEach(q => {
        if (q.imagePreviewUrl) {
          URL.revokeObjectURL(q.imagePreviewUrl);
        }
      });
      
      // Revoke global audio preview URL
      if (globalAudioPreviewUrl) {
        URL.revokeObjectURL(globalAudioPreviewUrl);
      }
    };
  }, [readingQuestions, listeningQuestions, globalAudioPreviewUrl]);

  // Handle question changes for Reading section
  const handleReadingChange = (index: number, field: string, value: string | number | null | File) => {
    setReadingQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  // Handle question changes for Listening section
  const handleListeningChange = (index: number, field: string, value: string | number | null | File) => {
    setListeningQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  // Add new Reading question
  const handleAddReadingQuestion = () => {
    setReadingQuestions((prev) => [...prev, createEmptyMixedQuestion()]);
  };

  // Add new Listening question
  const handleAddListeningQuestion = () => {
    setListeningQuestions((prev) => [...prev, createEmptyMixedQuestion()]);
  };

  // ✅ Handle JSON file upload
  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadFile(file);
  };

  // ✅ Load JSON file to form (without uploading media)
  const handleLoadJsonToForm = () => {
    if (!uploadFile) return alert("❌ Vui lòng chọn file JSON trước!");

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);

        // Validate basic structure
        if (!json.title || !json.courseId) {
          alert("❌ File JSON thiếu title hoặc courseId!");
          return;
        }

        // Set basic info
        setTestTitle(json.title);

        // Separate questions into Reading and Listening
        const readingQs: MixedQuestion[] = [];
        const listeningQs: MixedQuestion[] = [];

        if (json.readingQuestions && Array.isArray(json.readingQuestions)) {
          json.readingQuestions.forEach((q: any) => {
            readingQs.push({
              question: q.question || "",
              optionA: q.optionA || "",
              optionB: q.optionB || "",
              optionC: q.optionC || "",
              optionD: q.optionD || "",
              correctAnswer: q.correctAnswer || "",
              explanation: q.explanation || "",
              typeId: q.typeId || null,
              skillId: q.skillId || null,
              partId: q.partId || null,
              imageFile: null,
              imageUrl: '',
              imagePreviewUrl: '',
              startSecond: null,
              endSecond: null,
            });
          });
        }

        if (json.listeningQuestions && Array.isArray(json.listeningQuestions)) {
          json.listeningQuestions.forEach((q: any) => {
            listeningQs.push({
              question: q.question || "",
              optionA: q.optionA || "",
              optionB: q.optionB || "",
              optionC: q.optionC || "",
              optionD: q.optionD || "",
              correctAnswer: q.correctAnswer || "",
              explanation: q.explanation || "",
              typeId: q.typeId || null,
              skillId: q.skillId || null,
              partId: q.partId || null,
              imageFile: null,
              imageUrl: q.imagePath || '', // Keep path for batch upload
              imagePreviewUrl: '',
              startSecond: q.startSecond || null,
              endSecond: q.endSecond || null,
            });
          });
        }

        if (readingQs.length > 0) setReadingQuestions(readingQs);
        if (listeningQs.length > 0) setListeningQuestions(listeningQs);

        alert("✅ Đã load dữ liệu JSON lên form!");
      } catch (err) {
        console.error("❌ Lỗi đọc JSON:", err);
        alert("❌ Không thể đọc file JSON!");
      }
    };
    reader.readAsText(uploadFile);
  };

  // ✅ Batch upload from JSON with paths (upload images to Cloudinary first)
  const handleBatchUploadFromPaths = async () => {
    if (!uploadFile) {
      alert("❌ Vui lòng chọn file JSON trước!");
      return;
    }

    try {
      setIsBatchProcessing(true);

      const text = await uploadFile.text();
      const testData = JSON.parse(text);

      // Auto-format Windows paths
      if (testData.audioPath) {
        testData.audioPath = normalizeWindowsPath(testData.audioPath);
      }

      // Format paths in both reading and listening sections
      if (testData.readingQuestions) {
        testData.readingQuestions = testData.readingQuestions.map((q: any) => ({
          ...q,
          imagePath: q.imagePath ? normalizeWindowsPath(q.imagePath) : q.imagePath,
        }));
      }

      if (testData.listeningQuestions) {
        testData.listeningQuestions = testData.listeningQuestions.map((q: any) => ({
          ...q,
          imagePath: q.imagePath ? normalizeWindowsPath(q.imagePath) : q.imagePath,
          audioPath: q.audioPath ? normalizeWindowsPath(q.audioPath) : q.audioPath,
        }));
      }

      console.log('📤 Uploading mixed test files from paths...');

      // Call batch upload API
      const uploadedData = await batchUploadFromPathsAPI(testData);

      console.log('📥 Batch upload response:', uploadedData);

      // Load data with URLs to form
      setTestTitle(uploadedData.title);

      // Set global audio if exists
      if (uploadedData.audioUrl) {
        setGlobalAudioUrl(uploadedData.audioUrl);
        console.log('✅ Set globalAudioUrl:', uploadedData.audioUrl);
      }

      // Process reading questions
      const readingQs: MixedQuestion[] = [];
      if (uploadedData.readingQuestions && Array.isArray(uploadedData.readingQuestions)) {
        uploadedData.readingQuestions.forEach((q: any) => {
          readingQs.push({
            question: q.question || "",
            optionA: q.optionA || "",
            optionB: q.optionB || "",
            optionC: q.optionC || "",
            optionD: q.optionD || "",
            correctAnswer: q.correctAnswer || "",
            explanation: q.explanation || "",
            typeId: q.typeId || null,
            skillId: q.skillId || null,
            partId: q.partId || null,
            imageFile: null,
            imageUrl: q.imageUrl || '',
            imagePreviewUrl: '',
            startSecond: null,
            endSecond: null,
          });
        });
      }

      // Process listening questions
      const listeningQs: MixedQuestion[] = [];
      if (uploadedData.listeningQuestions && Array.isArray(uploadedData.listeningQuestions)) {
        uploadedData.listeningQuestions.forEach((q: any) => {
          listeningQs.push({
            question: q.question || "",
            optionA: q.optionA || "",
            optionB: q.optionB || "",
            optionC: q.optionC || "",
            optionD: q.optionD || "",
            correctAnswer: q.correctAnswer || "",
            explanation: q.explanation || "",
            typeId: q.typeId || null,
            skillId: q.skillId || null,
            partId: q.partId || null,
            imageFile: null,
            imageUrl: q.imageUrl || '', // ✅ Cloudinary URL
            imagePreviewUrl: '',
            startSecond: q.startSecond || null,
            endSecond: q.endSecond || null,
          });
        });
      }

      if (readingQs.length > 0) setReadingQuestions(readingQs);
      if (listeningQs.length > 0) setListeningQuestions(listeningQs);

      alert("✅ Upload thành công! Files đã được upload lên Cloudinary và hiển thị preview.");
    } catch (error: any) {
      console.error("❌ Batch upload failed:", error);
      alert(`❌ Upload thất bại: ${error.message}`);
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // Auto-upload local image paths to Cloudinary
  const uploadLocalImagePath = async (path: string): Promise<string> => {
    try {
      const response = await fetch('/api/upload-from-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagePath: path }),
      });
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Failed to upload local image:', error);
      return path; // Return original path if upload fails
    }
  };

  // Create Mixed Test
  const handleCreateMixedTest = async () => {
    if (!testTitle || !selectedCourseId) {
      alert("❌ Vui lòng điền tiêu đề đề thi và chọn Course!");
      return;
    }

    // Validate Reading questions
    for (let i = 0; i < readingQuestions.length; i++) {
      const q = readingQuestions[i];
      if (!q.skillId || !q.typeId || !q.partId) {
        alert(`❌ Câu hỏi Reading ${i + 1}: Vui lòng chọn đủ Skill, Type và Part!`);
        return;
      }
    }

    // Validate Listening questions
    for (let i = 0; i < listeningQuestions.length; i++) {
      const q = listeningQuestions[i];
      if (!q.skillId || !q.typeId || !q.partId) {
        alert(`❌ Câu hỏi Listening ${i + 1}: Vui lòng chọn đủ Skill, Type và Part!`);
        return;
      }
    }

    try {
      setIsCreating(true);

      // Prepare all questions
      const allQuestions: QuestionInput[] = [];

      // Process Reading questions
      for (const q of readingQuestions) {
        const questionInput: QuestionInput = {
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          typeId: q.typeId as number,
          partId: q.partId as number,
          skillId: q.skillId as number,
        };

        allQuestions.push(questionInput);
      }

      // Process Listening questions
      for (const q of listeningQuestions) {
        const questionInput: QuestionInput = {
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          typeId: q.typeId as number,
          partId: q.partId as number,
          skillId: q.skillId as number,
        };

        // Handle media for listening questions
        const mediaFiles: MediaInput[] = [];

        // Auto-upload local image paths
        if (q.imageUrl && q.imageUrl.startsWith('C:') || q.imageUrl?.startsWith('D:')) {
          q.imageUrl = await uploadLocalImagePath(q.imageUrl);
        }

        // Add image if exists
        if (q.imageFile) {
          mediaFiles.push({
            type: 'image',
            file: q.imageFile,
            description: 'Question image',
          });
        } else if (q.imageUrl) {
          mediaFiles.push({
            type: 'image',
            url: q.imageUrl,
            description: 'Question image',
          } as any);
        }

        // Add global audio for this question with timing
        if (globalAudioFile) {
          mediaFiles.push({
            type: 'audio',
            file: globalAudioFile,
            description: 'Test audio',
            startSecond: q.startSecond !== null ? q.startSecond : undefined,
            endSecond: q.endSecond !== null ? q.endSecond : undefined,
          });
        } else if (globalAudioUrl) {
          mediaFiles.push({
            type: 'audio',
            url: globalAudioUrl,
            description: 'Test audio',
            startSecond: q.startSecond !== null ? q.startSecond : undefined,
            endSecond: q.endSecond !== null ? q.endSecond : undefined,
          } as any);
        }

        if (mediaFiles.length > 0) {
          questionInput.mediaFiles = mediaFiles;
        }

        allQuestions.push(questionInput);
      }

      const fullTestData: TestCreateInput = {
        title: testTitle,
        courseId: selectedCourseId,
        questions: allQuestions,
      };

      console.log("📤 Creating Mixed Test...", fullTestData);
      const result = await createNewTestAPI(fullTestData);
      
      console.log("✅ Mixed Test created successfully:", result);
      alert(`✅ Đề thi Mixed "${testTitle}" đã được tạo thành công!`);
      
      // Reset form
      setReadingQuestions([createEmptyMixedQuestion()]);
      setListeningQuestions([createEmptyMixedQuestion()]);
      setTestTitle("");
      
    } catch (error) {
      console.error("❌ Error creating Mixed Test:", error);
      alert("❌ Tạo đề thi Mixed thất bại");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mixed-test-container">
      {/* ✅ JSON Upload Section */}
      <div className="upload-section">
        <h3>📤 Tải lên file JSON cho Mixed Test</h3>
        <input type="file" accept=".json" onChange={handleUploadFile} />
        <div className="upload-buttons">
          <button className="save-btn" onClick={handleLoadJsonToForm}>
            <FaUpload /> Load File lên form (không upload media)
          </button>
          <button 
            className="save-btn upload-btn-green" 
            onClick={handleBatchUploadFromPaths}
            disabled={isBatchProcessing}
          >
            <FaUpload /> {isBatchProcessing ? "Đang upload..." : "Upload từ paths (có imagePath/audioPath)"}
          </button>
        </div>
        <p className="upload-tip">
          💡 <strong>Tip:</strong> Nếu JSON có <code>imagePath</code>/<code>audioPath</code>, dùng "Upload từ paths" để upload ảnh lên Cloudinary và hiển thị preview.
        </p>
        <div className="upload-format-tip">
          <button
            className="json-toggle-btn"
            onClick={() => setShowJsonFormat(!showJsonFormat)}
          >
            {showJsonFormat ? <FaChevronUp /> : <FaChevronDown />} {" "}
            <strong>📝 Format JSON</strong>
          </button>
          {showJsonFormat && (
            <pre className="json-format-example">
{`{
  "title": "Mixed Test 1",
  "courseId": 1,
  "audioPath": "D:/audio/test.mp3",
  "readingQuestions": [
    {
      "question": "Question text",
      "optionA": "...",
      "optionB": "...",
      "optionC": "...",
      "optionD": "...",
      "correctAnswer": "A",
      "explanation": "...",
      "typeId": 1,
      "skillId": 2,
      "partId": 5
    }
  ],
  "listeningQuestions": [
    {
      "question": "Question text",
      "optionA": "...",
      "optionB": "...",
      "optionC": "...",
      "optionD": "...",
      "correctAnswer": "B",
      "explanation": "...",
      "typeId": 2,
      "skillId": 1,
      "partId": 1,
      "imagePath": "D:/images/q1.jpg",
      "startSecond": 0,
      "endSecond": 10
    }
  ]
}`}
            </pre>
          )}
        </div>
      </div>

      {/* Reading Section */}
      <div className="test-section reading">
        <div className="section-header">
          <FaBook className="section-icon" style={{ color: '#2196F3' }} />
          <h3 className="section-title">Reading Questions</h3>
          <span className="question-count">{readingQuestions.length} câu hỏi</span>
        </div>

        {readingQuestions.map((q, i) => (
          <QuestionCard
            key={`reading-${i}`}
            question={q}
            index={i}
            questionType="Reading"
            parts={parts}
            skills={skills}
            questionTypes={questionTypes}
            onChange={(field, value) => handleReadingChange(i, field, value)}
          />
        ))}

        <button className="add-question-btn" onClick={handleAddReadingQuestion}>
          <FaPlus /> Thêm câu hỏi Reading
        </button>
      </div>

      {/* Listening Section */}
      <div className="test-section listening">
        <div className="section-header">
          <FaHeadphones className="section-icon" style={{ color: '#FF9800' }} />
          <h3 className="section-title">Listening Questions</h3>
          <span className="question-count">{listeningQuestions.length} câu hỏi</span>
        </div>

        {/* Global Audio Input for all Listening questions */}
        <div className="global-audio-section">
          <h4>🎵 Audio chung cho tất cả câu hỏi Listening</h4>
          {globalAudioUrl || globalAudioPreviewUrl ? (
            <div className="audio-preview-container">
              <div className="audio-player-wrapper">
                <audio controls style={{ width: '100%', marginBottom: '10px' }}>
                  <source src={globalAudioUrl || globalAudioPreviewUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
              <div className="audio-url-info">
                {globalAudioUrl ? (
                  <p style={{ fontSize: '12px', color: '#666', wordBreak: 'break-all', margin: '8px 0' }}>
                    ✅ <strong>Cloudinary URL:</strong> <a href={globalAudioUrl} target="_blank" rel="noopener noreferrer">{globalAudioUrl}</a>
                  </p>
                ) : (
                  <p style={{ fontSize: '12px', color: '#666', margin: '8px 0' }}>
                    📁 <strong>Preview từ file:</strong> {globalAudioFile?.name || 'Unknown'}
                  </p>
                )}
              </div>
              <button 
                onClick={() => {
                  // Revoke preview URL
                  if (globalAudioPreviewUrl) {
                    URL.revokeObjectURL(globalAudioPreviewUrl);
                  }
                  setGlobalAudioUrl('');
                  setGlobalAudioFile(null);
                  setGlobalAudioPreviewUrl('');
                }}
                style={{
                  padding: '6px 12px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  marginTop: '8px'
                }}
              >
                🗑️ Xóa audio
              </button>
            </div>
          ) : (
            <div className="audio-file-input">
              <label>Chọn audio file từ máy:</label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // ✅ Tạo preview URL cho audio
                    const previewUrl = URL.createObjectURL(file);
                    setGlobalAudioFile(file);
                    setGlobalAudioPreviewUrl(previewUrl);
                  }
                }}
              />
            </div>
          )}
        </div>

        {listeningQuestions.map((q, i) => (
          <QuestionCard
            key={`listening-${i}`}
            question={q}
            index={i}
            questionType="Listening"
            parts={parts}
            skills={skills}
            questionTypes={questionTypes}
            onChange={(field, value) => handleListeningChange(i, field, value)}
          />
        ))}

        <button className="add-question-btn" onClick={handleAddListeningQuestion}>
          <FaPlus /> Thêm câu hỏi Listening
        </button>
      </div>

      {/* Actions */}
      <div className="mixed-actions">
        <button className="back-btn" onClick={onBack}>
          <FaArrowLeft /> Quay lại
        </button>
        <button 
          className="create-test-btn" 
          onClick={handleCreateMixedTest}
          disabled={isCreating}
        >
          <FaSave /> {isCreating ? "Đang tạo..." : "Tạo đề thi Mixed"}
        </button>
      </div>
    </div>
  );
}

// Question Card Component
function QuestionCard({
  question,
  index,
  questionType,
  parts,
  skills,
  questionTypes,
  onChange,
}: {
  question: MixedQuestion;
  index: number;
  questionType: "Reading" | "Listening";
  parts: Part[];
  skills: Skill[];
  questionTypes: QuestionType[];
  onChange: (field: string, value: string | number | null | File) => void;
}) {
  return (
    <div className="card-container">
      {/* Individual dropdowns for each question */}
      <div className="question-meta">
        <Dropdown
          label="Part"
          options={parts}
          value={question.partId ?? null}
          onChange={(id) => onChange("partId", id)}
        />
        <Dropdown
          label="Skill"
          options={skills}
          value={question.skillId ?? null}
          onChange={(id) => onChange("skillId", id)}
        />
        <Dropdown
          label="Type"
          options={questionTypes}
          value={question.typeId ?? null}
          onChange={(id) => onChange("typeId", id)}
        />
      </div>

      <h2 className="card-question">
        {questionType} {index + 1}.{" "}
        <input
          value={question.question}
          onChange={(e) => onChange("question", e.target.value)}
          placeholder="Nhập nội dung câu hỏi..."
        />
      </h2>

      {/* Media inputs for Listening questions */}
      {questionType === "Listening" && (
        <div className="question-media-section">
          {/* Image input */}
          <div className="media-input-group">
            <h4>🖼️ Hình ảnh (tùy chọn)</h4>
            {question.imageUrl || question.imagePreviewUrl ? (
              <div className="media-preview">
                <img 
                  src={question.imageUrl || question.imagePreviewUrl || ''} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    marginBottom: '10px'
                  }} 
                />
                {question.imageUrl ? (
                  <p style={{ fontSize: '12px', color: '#666', wordBreak: 'break-all' }}>
                    ✅ <strong>Cloudinary URL:</strong> <a href={question.imageUrl} target="_blank" rel="noopener noreferrer">{question.imageUrl}</a>
                  </p>
                ) : (
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    📁 <strong>Preview từ file:</strong> {question.imageFile ? (question.imageFile as File).name : 'Unknown'}
                  </p>
                )}
                <button 
                  onClick={() => {
                    // ✅ Revoke preview URL để tránh memory leak
                    if (question.imagePreviewUrl) {
                      URL.revokeObjectURL(question.imagePreviewUrl);
                    }
                    onChange('imageUrl', '');
                    onChange('imagePreviewUrl', '');
                    onChange('imageFile', null);
                  }}
                  style={{
                    padding: '6px 12px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    marginTop: '8px'
                  }}
                >
                  🗑️ Xóa ảnh
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // ✅ Tạo preview URL cho ảnh từ máy
                      const previewUrl = URL.createObjectURL(file);
                      onChange('imageFile', file);
                      onChange('imagePreviewUrl', previewUrl);
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Audio input */}
          <div className="media-input-group">
            <h4>🎵 Audio timing cho câu hỏi này (sử dụng audio chung)</h4>

            {/* Audio timing */}
            <div className="audio-timing-controls">
              <div className="timing-input-group">
                <label>Bắt đầu (s):</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={question.startSecond || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : parseFloat(e.target.value);
                    onChange('startSecond', value);
                  }}
                />
              </div>
              <div className="timing-input-group">
                <label>Kết thúc (s):</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="auto"
                  value={question.endSecond || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : parseFloat(e.target.value);
                    onChange('endSecond', value);
                  }}
                />
              </div>
            </div>
            <p className="audio-timing-tip">
              💡 <strong>Tip:</strong> Chỉ định thời gian phát audio cho câu hỏi này từ audio chung.
            </p>
          </div>
        </div>
      )}

      {/* Options */}
      <div className="card-options">
        {["A", "B", "C", "D"].map((opt) => {
          const optionKey = `option${opt}` as keyof MixedQuestion;
          const optionValue = question[optionKey];
          const displayValue = typeof optionValue === 'string' ? optionValue : '';
          return (
            <div key={opt} className="card-option edit-mode">
              <input
                value={displayValue}
                onChange={(e) => onChange(optionKey, e.target.value)}
                placeholder={`Đáp án ${opt}`}
              />
              <input
                type="radio"
                name={`correct-${questionType}-${index}`}
                checked={question.correctAnswer === opt}
                onChange={() => onChange("correctAnswer", opt)}
              />
              <label>Đúng</label>
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      <div className="card-explanation">
        <p>
          Correct Answer:{" "}
          <span className="card-correct">{question.correctAnswer || "?"}</span>
        </p>
        <textarea
          value={question.explanation}
          onChange={(e) => onChange("explanation", e.target.value)}
          placeholder="Giải thích đáp án..."
        />
      </div>
    </div>
  );
}

// Helper function to create empty Mixed question
function createEmptyMixedQuestion(): MixedQuestion {
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
    partId: null,
    imageFile: null,
    imageUrl: '',
    imagePreviewUrl: '',
    startSecond: null,
    endSecond: null,
  };
}

// Dropdown component
function Dropdown({
  label,
  options,
  onChange,
  value,
}: {
  label: string;
  options: { id: number; name: string }[];
  onChange: (id: number | null) => void;
  value: number | null;
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
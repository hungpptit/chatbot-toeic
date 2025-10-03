import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  getQuestionsByTestIdAPI,
  updateQuestionAPI,
  type QuestionWithMedia,
  type MediaMapping,
} from "../../services/question_test_services";
import { getAllPartsAPI, type Part } from "../../services/adminTestService";
import { uploadImageAPI, uploadAudioAPI } from "../../services/uploadService";
import { FaEdit, FaSave, FaTimes, FaUpload, FaTrash } from "react-icons/fa";
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
  
  // ✅ Media editing states
  const [uploadingMedia, setUploadingMedia] = useState<{ [key: string]: boolean }>({});
  const [globalAudioFile, setGlobalAudioFile] = useState<File | null>(null);
  const [questionImageFiles, setQuestionImageFiles] = useState<{ [questionId: number]: File }>({});
  
  // ✅ Image preview states
  const [questionImagePreviews, setQuestionImagePreviews] = useState<{ [questionId: number]: string }>({});
  
  // ✅ Pending changes tracking
  const [pendingAudioUrl, setPendingAudioUrl] = useState<string | null>(null);
  const [pendingAudioDuration, setPendingAudioDuration] = useState<number | null>(null);
  const [hasPendingChanges, setHasPendingChanges] = useState<boolean>(false);
  const [savingChanges, setSavingChanges] = useState<boolean>(false);
  
  // ✅ Track original data for comparison
  const [originalQuestions, setOriginalQuestions] = useState<QuestionWithMedia[]>([]);
  const [changedImageQuestions, setChangedImageQuestions] = useState<Set<number>>(new Set());
  
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
        setOriginalQuestions(JSON.parse(JSON.stringify(data))); // ✅ Store deep copy of original data
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết đề thi:", error);
      }
    };
    fetchData();
  }, [id]);

  // ✅ Cleanup preview URLs on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      Object.values(questionImagePreviews).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [questionImagePreviews]);

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

  // ✅ Handle global audio upload (only upload, don't save to DB)
  const handleGlobalAudioUpload = async () => {
    if (!globalAudioFile) {
      alert("❌ Vui lòng chọn file audio!");
      return;
    }

    try {
      setUploadingMedia(prev => ({ ...prev, global: true }));
      const response = await uploadAudioAPI(globalAudioFile);
      // Handle response based on its type
      const audioUrl = typeof response === 'string' ? response : response.url;
      const audioDuration = typeof response === 'object' ? response.duration : undefined;
      
      console.log('🎵 Audio uploaded with duration:', audioDuration, 'seconds');
      
      // ✅ Store as pending changes (don't save to DB yet)
      setPendingAudioUrl(audioUrl);
      setPendingAudioDuration(audioDuration || null);
      setGlobalAudio(audioUrl); // Update UI preview
      setHasPendingChanges(true);
      
      setGlobalAudioFile(null);
      alert("✅ Audio uploaded! Click 'Save All Changes' to apply to all questions.");
      
    } catch (error) {
      console.error("❌ Lỗi upload audio:", error);
      alert("❌ Upload audio thất bại!");
    } finally {
      setUploadingMedia(prev => ({ ...prev, global: false }));
    }
  };

  // ✅ Handle question image upload (only upload, don't save to DB)
  const handleQuestionImageUpload = async (questionId: number) => {
    const imageFile = questionImageFiles[questionId];
    if (!imageFile) {
      alert("❌ Vui lòng chọn file hình ảnh!");
      return;
    }

    try {
      setUploadingMedia(prev => ({ ...prev, [questionId]: true }));
      const response = await uploadImageAPI(imageFile);
      // Handle response based on its type
      const imageUrl = typeof response === 'string' ? response : (response as any).url;
      
      // Update question data with new image (UI only)
      setQuestions(prev => prev.map(q => {
        if (q.id === questionId) {
          const newMediaMappings = q.mediaMappings || [];
          const existingImageIndex = newMediaMappings.findIndex(m => m.media?.type === 'image');
          
          if (existingImageIndex >= 0) {
            // Replace existing image
            newMediaMappings[existingImageIndex] = {
              ...newMediaMappings[existingImageIndex],
              media: {
                id: Date.now(),
                type: 'image',
                url: imageUrl,
                description: 'Question image'
              }
            };
          } else {
            // Add new image
            newMediaMappings.push({
              id: Date.now(),
              mediaId: Date.now(),
              startSecond: undefined,
              endSecond: undefined,
              media: {
                id: Date.now(),
                type: 'image',
                url: imageUrl,
                description: 'Question image'
              }
            } as MediaMapping);
          }
          
          return { ...q, mediaMappings: newMediaMappings };
        }
        return q;
      }));
      
      // ✅ Clean up preview and files after successful upload
      setQuestionImageFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[questionId];
        return newFiles;
      });
      
      setQuestionImagePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[questionId];
        return newPreviews;
      });
      
      // ✅ Mark as having pending changes
      setHasPendingChanges(true);
      
      // ✅ Track that this question's image was changed
      setChangedImageQuestions(prev => new Set(prev).add(questionId));
      
      alert("✅ Image uploaded! Click 'Save All Changes' to save to database.");
    } catch (error) {
      console.error("❌ Lỗi upload hình ảnh:", error);
      alert("❌ Upload hình ảnh thất bại!");
    } finally {
      setUploadingMedia(prev => ({ ...prev, [questionId]: false }));
    }
  };

  // ✅ Handle file selection with preview
  const handleImageFileSelect = (questionId: number, file: File) => {
    setQuestionImageFiles(prev => ({
      ...prev,
      [questionId]: file
    }));
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setQuestionImagePreviews(prev => ({
      ...prev,
      [questionId]: previewUrl
    }));
  };

  // ✅ Handle cancel image selection
  const handleCancelImageSelection = (questionId: number) => {
    // Clean up preview URL to prevent memory leak
    const previewUrl = questionImagePreviews[questionId];
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setQuestionImageFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[questionId];
      return newFiles;
    });
    
    setQuestionImagePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[questionId];
      return newPreviews;
    });
  };

  // ✅ Handle delete question image
  const handleDeleteQuestionImage = (questionId: number) => {
    if (!confirm("❓ Bạn có chắc muốn xóa hình ảnh này?")) return;
    
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const newMediaMappings = (q.mediaMappings || []).filter(m => m.media?.type !== 'image');
        return { ...q, mediaMappings: newMediaMappings };
      }
      return q;
    }));
    
    // Mark as having pending changes
    setHasPendingChanges(true);
    
    // ✅ Track that this question's image was changed (deleted)
    setChangedImageQuestions(prev => new Set(prev).add(questionId));
  };

  // ✅ Save all pending changes to database
  const handleSaveAllChanges = async () => {
    if (!hasPendingChanges) {
      alert("📌 Không có thay đổi nào để lưu!");
      return;
    }

    try {
      setSavingChanges(true);
      console.log('💾 Saving only changed media to database...');

      const updatePromises = [];
      
      // ✅ Collect questions that need updating
      for (const question of questions) {
        let hasChangesForThisQuestion = false;
        const mediaFiles = [];
        
        // ✅ Only add audio if it was actually changed (pendingAudioUrl exists)
        if (pendingAudioUrl) {
          mediaFiles.push({
            type: 'audio',
            url: pendingAudioUrl,
            description: 'Global audio',
            duration: pendingAudioDuration || undefined
          });
          hasChangesForThisQuestion = true;
          console.log(`🎵 Will update audio for question ${question.id}`);
        }
        
        // ✅ Only add images that were actually changed
        const currentImage = question.mediaMappings?.find(m => m.media?.type === 'image');
        if (currentImage?.media && changedImageQuestions.has(question.id)) {
          // This image was changed, include it in update
          mediaFiles.push({
            type: 'image',
            url: currentImage.media.url,
            description: currentImage.media.description || 'Question image',
            duration: undefined
          });
          hasChangesForThisQuestion = true;
          console.log(`🖼️ Will update changed image for question ${question.id}`);
        } else if (currentImage?.media) {
          console.log(`⏭️ Skipping unchanged image for question ${question.id}`);
        }
        
        // ✅ Only add to update list if this question actually has changes
        if (hasChangesForThisQuestion && mediaFiles.length > 0) {
          updatePromises.push({
            questionId: question.id,
            mediaFiles: mediaFiles
          });
        } else {
          console.log(`⏭️ No changes for question ${question.id}, skipping API call`);
        }
      }
      
      // ✅ Update questions sequentially to avoid deadlocks
      let successCount = 0;
      for (const update of updatePromises) {
        try {
          console.log(`📤 Updating question ${update.questionId} with ${update.mediaFiles.length} changed media`);
          await updateQuestionAPI(update.questionId, { mediaFiles: update.mediaFiles });
          successCount++;
          console.log(`✅ Updated question ${update.questionId} successfully`);
        } catch (error) {
          console.error(`❌ Failed to update question ${update.questionId}:`, error);
          // Continue with other questions even if one fails
        }
      }
      
      // Clear pending changes
      setPendingAudioUrl(null);
      setPendingAudioDuration(null);
      setHasPendingChanges(false);
      setChangedImageQuestions(new Set()); // ✅ Clear changed images tracking
      
      if (successCount > 0) {
        alert(`✅ Đã lưu thay đổi cho ${successCount}/${updatePromises.length} câu hỏi!`);
        console.log(`✅ Successfully updated ${successCount} questions`);
      } else {
        alert("ℹ️ Không có thay đổi nào để lưu!");
      }
      
    } catch (error) {
      console.error("❌ Lỗi lưu thay đổi:", error);
      alert("❌ Có lỗi khi lưu thay đổi!");
    } finally {
      setSavingChanges(false);
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
        // ✅ Prepare media files for update if any
        const currentQuestion = questions.find(q => q.id === editingId);
        const mediaFiles = [];
        
        // Include existing media mappings in update
        if (currentQuestion?.mediaMappings) {
          for (const mapping of currentQuestion.mediaMappings) {
            if (mapping.media) {
              mediaFiles.push({
                type: mapping.media.type,
                url: mapping.media.url,
                description: mapping.media.description || 'Question media'
              });
            }
          }
        }
        
        // Prepare update data with media
        const updateData = {
          ...editData,
          mediaFiles: mediaFiles.length > 0 ? mediaFiles : undefined
        };
        
        console.log('📤 Updating question with media:', {
          questionId: editingId,
          hasMedia: mediaFiles.length > 0,
          mediaCount: mediaFiles.length
        });

        await updateQuestionAPI(editingId as number, updateData);
        
        // Update local state
        setQuestions((prev) =>
          prev.map((q) => (q.id === editingId ? { ...q, ...editData } : q))
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

      {/* ✅ Global Audio Section */}
      <div className="global-audio-container">
        <h4 className="global-audio-title">
          🎵 Audio cho toàn bộ đề thi:
        </h4>
        {globalAudio ? (
          <div className="global-audio-display">
            <audio controls className="global-audio-player">
              <source src={globalAudio} type="audio/mpeg" />
              Trình duyệt không hỗ trợ audio.
            </audio>
            {mode === "edit" && (
              <div className="global-audio-edit" style={{ marginTop: "10px", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}>
                <p style={{ fontSize: "13px", color: "#666", margin: "0 0 8px 0" }}>Thay đổi audio:</p>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setGlobalAudioFile(e.target.files?.[0] || null)}
                  style={{ marginRight: "10px", fontSize: "12px" }}
                />
                {globalAudioFile && (
                  <button 
                    className="save-btn"
                    onClick={handleGlobalAudioUpload}
                    disabled={uploadingMedia.global}
                    style={{ fontSize: "12px", padding: "5px 10px" }}
                  >
                    <FaUpload /> {uploadingMedia.global ? "Uploading..." : "Upload Audio"}
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          mode === "edit" && (
            <div className="global-audio-upload" style={{ padding: "15px", border: "1px dashed #ccc", borderRadius: "4px", backgroundColor: "#f9f9f9" }}>
              <p style={{ color: "#666", fontSize: "14px", margin: "0 0 10px 0" }}>Chưa có audio cho đề thi này</p>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setGlobalAudioFile(e.target.files?.[0] || null)}
                style={{ marginRight: "10px", fontSize: "12px" }}
              />
              {globalAudioFile && (
                <button 
                  className="save-btn"
                  onClick={handleGlobalAudioUpload}
                  disabled={uploadingMedia.global}
                  style={{ fontSize: "12px", padding: "5px 10px" }}
                >
                  <FaUpload /> {uploadingMedia.global ? "Uploading..." : "Upload Audio"}
                </button>
              )}
            </div>
          )
        )}
      </div>

      {filteredQuestions.map((q) => {
        const isEditing = editingId === q.id;
        const questionImage = getQuestionImage(q);
        
        // ✅ Calculate actual question index in full list
        const actualIndex = questions.findIndex(question => question.id === q.id) + 1;

        return (
          <div key={q.id} className="card-container">
            {/* ✅ Question Image Section */}
            <div className="question-image-section">
              {questionImage ? (
                <div className="question-image-container">
                  <img 
                    src={questionImage} 
                    alt={`Question ${actualIndex} image`}
                    className="question-image"
                  />
                  {mode === "edit" && (
                    <div className="image-edit-controls" style={{ marginTop: "8px", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", backgroundColor: "#f8f8f8" }}>
                      <p style={{ fontSize: "12px", color: "#666", margin: "0 0 5px 0" }}>Thay đổi hình ảnh:</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleImageFileSelect(q.id, e.target.files[0]);
                          }
                        }}
                        style={{ fontSize: "12px", marginRight: "8px" }}
                      />
                      {/* ✅ Show preview if file selected */}
                      {questionImagePreviews[q.id] && (
                        <div className="image-preview-container">
                          <img 
                            src={questionImagePreviews[q.id]} 
                            alt="Preview" 
                            className="image-preview"
                          />
                          <div className="preview-actions">
                            <button 
                              className="save-btn"
                              onClick={() => handleQuestionImageUpload(q.id)}
                              disabled={uploadingMedia[q.id]}
                            >
                              <FaUpload /> {uploadingMedia[q.id] ? "Uploading..." : "Upload"}
                            </button>
                            <button 
                              className="cancel-btn"
                              onClick={() => handleCancelImageSelection(q.id)}
                            >
                              <FaTimes /> Hủy
                            </button>
                          </div>
                        </div>
                      )}
                      {questionImageFiles[q.id] && !questionImagePreviews[q.id] && (
                        <button 
                          className="save-btn"
                          onClick={() => handleQuestionImageUpload(q.id)}
                          disabled={uploadingMedia[q.id]}
                          style={{ fontSize: "11px", padding: "4px 8px", marginRight: "5px" }}
                        >
                          <FaUpload /> {uploadingMedia[q.id] ? "Uploading..." : "Thay đổi"}
                        </button>
                      )}
                      <button 
                        className="cancel-btn"
                        onClick={() => handleDeleteQuestionImage(q.id)}
                        style={{ fontSize: "11px", padding: "4px 8px" }}
                      >
                        <FaTrash /> Xóa
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                mode === "edit" && (
                  <div className="question-image-upload" style={{ marginBottom: "15px", padding: "10px", border: "1px dashed #ccc", borderRadius: "4px", backgroundColor: "#f9f9f9" }}>
                    <p style={{ color: "#666", fontSize: "13px", margin: "0 0 8px 0" }}>Thêm hình ảnh cho câu hỏi này:</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleImageFileSelect(q.id, e.target.files[0]);
                        }
                      }}
                      style={{ fontSize: "12px", marginRight: "8px" }}
                    />
                    {/* ✅ Show preview if file selected */}
                    {questionImagePreviews[q.id] && (
                      <div className="image-preview-container">
                        <img 
                          src={questionImagePreviews[q.id]} 
                          alt="Preview" 
                          className="image-preview"
                        />
                        <div className="preview-actions">
                          <button 
                            className="save-btn"
                            onClick={() => handleQuestionImageUpload(q.id)}
                            disabled={uploadingMedia[q.id]}
                          >
                            <FaUpload /> {uploadingMedia[q.id] ? "Uploading..." : "Upload"}
                          </button>
                          <button 
                            className="cancel-btn"
                            onClick={() => handleCancelImageSelection(q.id)}
                          >
                            <FaTimes /> Hủy
                          </button>
                        </div>
                      </div>
                    )}
                    {questionImageFiles[q.id] && !questionImagePreviews[q.id] && (
                      <button 
                        className="save-btn"
                        onClick={() => handleQuestionImageUpload(q.id)}
                        disabled={uploadingMedia[q.id]}
                        style={{ fontSize: "11px", padding: "4px 8px" }}
                      >
                        <FaUpload /> {uploadingMedia[q.id] ? "Uploading..." : "Upload"}
                      </button>
                    )}
                  </div>
                )
              )}
            </div>

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

      {/* ✅ Save All Changes Button - Bottom of page */}
      {mode === "edit" && hasPendingChanges && (
        <div className="save-all-container" style={{ 
          margin: "30px 0 20px 0", 
          padding: "20px", 
          backgroundColor: "#e8f5e8", 
          border: "2px solid #4caf50", 
          borderRadius: "8px",
          textAlign: "center",
          position: "sticky",
          bottom: "20px",
          zIndex: 10,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        }}>
          <p style={{ margin: "0 0 12px 0", color: "#2e7d32", fontWeight: "600", fontSize: "16px" }}>
            📝 Bạn có thay đổi chưa được lưu
          </p>
          <button 
            className="save-btn"
            onClick={handleSaveAllChanges}
            disabled={savingChanges}
            style={{ fontSize: "18px", padding: "12px 30px", fontWeight: "600" }}
          >
            {savingChanges ? "🔄 Đang lưu..." : "💾 Save All Changes"}
          </button>
        </div>
      )}
    </div>
  );
}

# 📝 MEDIA EDITING SYSTEM DOCUMENTATION
*Tài liệu chi tiết về hệ thống chỉnh sửa media trong AdminTestViewPage*

---

## 🎯 TỔNG QUAN HỆ THỐNG

### Mục tiêu
Xây dựng hệ thống chỉnh sửa media (audio/image) cho admin trong chế độ edit test, cho phép:
- Upload và quản lý audio global cho toàn bộ đề thi
- Upload và quản lý hình ảnh cho từng câu hỏi
- Preview trước khi lưu
- Lưu hàng loạt với tối ưu hiệu suất

### Kiến trúc
```
Frontend (React) → Cloudinary Upload → Pending Changes → Bulk Save → Database
```

---

## 🔄 LUỒNG HOẠT ĐỘNG CHÍNH

### 1. KHỞI TẠO HỆ THỐNG
```
1. Load questions từ API getQuestionsByTestIdAPI()
2. Extract global audio từ mediaMappings
3. Load parts data để filter
4. Store original data để so sánh thay đổi
```

### 2. UPLOAD MEDIA WORKFLOW

#### 🎵 Global Audio Upload:
```
1. User chọn file audio → setGlobalAudioFile()
2. Click "Upload Audio" → handleGlobalAudioUpload()
3. Upload to Cloudinary với duration detection
4. Store pending changes:
   - setPendingAudioUrl()
   - setPendingAudioDuration() 
   - setHasPendingChanges(true)
5. Update UI preview
6. Chờ "Save All Changes" để lưu vào DB
```

#### 🖼️ Question Image Upload:
```
1. User chọn file image → handleImageFileSelect()
2. Create preview URL → setQuestionImagePreviews()
3. Click "Upload" → handleQuestionImageUpload()
4. Upload to Cloudinary
5. Update questions state với new image URL
6. Mark question as changed → setChangedImageQuestions()
7. setHasPendingChanges(true)
8. Chờ "Save All Changes" để lưu vào DB
```

### 3. SAVE ALL CHANGES WORKFLOW
```
1. Click "Save All Changes" → handleSaveAllChanges()
2. Collect changed questions:
   - Questions with pending audio changes
   - Questions with changed images only
3. Sequential processing (tránh deadlock):
   - for...of loop thay vì Promise.all()
   - updateQuestionAPI() cho từng question
4. Clear pending changes
5. Show success message
```

---

## 🏗️ CẤU TRÚC FILE VÀ COMPONENTS

### Frontend: AdminTestViewPage.tsx

#### State Management:
```typescript
// Media upload states
const [uploadingMedia, setUploadingMedia] = useState<{ [key: string]: boolean }>({});
const [globalAudioFile, setGlobalAudioFile] = useState<File | null>(null);
const [questionImageFiles, setQuestionImageFiles] = useState<{ [questionId: number]: File }>({});

// Preview states
const [questionImagePreviews, setQuestionImagePreviews] = useState<{ [questionId: number]: string }>({});

// Pending changes tracking
const [pendingAudioUrl, setPendingAudioUrl] = useState<string | null>(null);
const [pendingAudioDuration, setPendingAudioDuration] = useState<number | null>(null);
const [hasPendingChanges, setHasPendingChanges] = useState<boolean>(false);
const [savingChanges, setSavingChanges] = useState<boolean>(false);

// Change detection
const [originalQuestions, setOriginalQuestions] = useState<QuestionWithMedia[]>([]);
const [changedImageQuestions, setChangedImageQuestions] = useState<Set<number>>(new Set());
```

#### Key Functions:
```typescript
// Global audio management
handleGlobalAudioUpload() // Upload audio, store pending changes
handleImageFileSelect()   // Create preview for image
handleQuestionImageUpload() // Upload image, update UI
handleSaveAllChanges()    // Save all pending changes to DB

// Utility functions
getQuestionImage()        // Extract image URL from mediaMappings
handleDeleteQuestionImage() // Remove image from question
handleCancelImageSelection() // Cancel file selection, cleanup preview
```

---

## 🗄️ DATABASE SCHEMA

### MediaFiles Table Enhancement:
```sql
-- Added duration column for audio files
ALTER TABLE MediaFiles 
ADD duration FLOAT NULL;

-- Structure:
- id (Primary Key)
- mediaType ('image', 'audio', 'video')  
- mediaUrl (Cloudinary URL)
- description (Media description)
- duration (FLOAT, seconds - for audio/video only)
- createdAt, updatedAt (Timestamps)
```

### QuestionMediaMappings Table:
```sql
-- Links questions to media files
- id (Primary Key)
- questionId (Foreign Key → Questions.id)
- mediaId (Foreign Key → MediaFiles.id)  
- startSecond (FLOAT, optional)
- endSecond (FLOAT, optional)
```

---

## 🔧 BACKEND SERVICES

### Enhanced Upload Service (upload.js):
```javascript
// Audio upload với duration detection (3 methods)
uploadAudio() {
  1. Upload to Cloudinary
  2. Try get duration from Cloudinary API metadata
  3. Fallback: ffprobe buffer analysis  
  4. Fallback: ffprobe URL analysis
  5. Return { url, duration }
}

// Image upload
uploadImage() {
  1. Upload to Cloudinary
  2. Return { url }
}
```

### Enhanced Question Service (question_test_service.js):
```javascript
// Update question với media support
updateQuestion() {
  1. Start transaction
  2. Update question fields
  3. Delete old media mappings
  4. Create new MediaFiles records
  5. Create new QuestionMediaMappings
  6. Commit transaction
  7. Retry logic for deadlock (3 attempts)
}
```

---

## ⚡ PERFORMANCE OPTIMIZATIONS

### 1. Smart Change Detection:
```javascript
// Chỉ update questions thực sự có thay đổi
- Track changedImageQuestions Set
- Only send API calls for modified questions
- Skip unchanged media trong bulk save
```

### 2. Sequential Processing:
```javascript
// Tránh database deadlock
for (const update of updatePromises) {
  await updateQuestionAPI(update.questionId, update.data);
}
// Thay vì: Promise.all(updatePromises)
```

### 3. Memory Management:
```javascript
// Cleanup preview URLs
useEffect(() => {
  return () => {
    Object.values(questionImagePreviews).forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });
  };
}, [questionImagePreviews]);
```

### 4. Retry Logic cho Deadlock:
```javascript
const maxRetries = 3;
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    // Database operation
    break;
  } catch (error) {
    if (error.message.includes('deadlocked') && attempt < maxRetries) {
      await new Promise(resolve => 
        setTimeout(resolve, Math.random() * 1000 + 500)
      );
      continue;
    }
    throw error;
  }
}
```

---

## 🎨 UI/UX FEATURES

### 1. Parts Filtering:
```typescript
// Filter questions by part
- Show all parts với question count
- Click to filter/unfilter
- Maintain filter state across operations
```

### 2. Image Preview System:
```typescript
// Preview before upload
- File selection → Create blob URL → Show preview
- Upload/Cancel actions
- Memory cleanup khi cancel
```

### 3. Sticky Save Button:
```css
// Save All Changes button ở cuối trang
position: sticky;
bottom: 20px;
zIndex: 10;
boxShadow: 0 4px 12px rgba(0,0,0,0.15);
```

### 4. Upload Status Indicators:
```typescript
// Loading states cho từng action
- Global audio upload: uploadingMedia.global
- Question image upload: uploadingMedia[questionId] 
- Bulk save: savingChanges
```

---

## 🚨 ERROR HANDLING

### 1. Upload Errors:
```javascript
try {
  const response = await uploadAPI(file);
} catch (error) {
  console.error("Upload failed:", error);
  alert("❌ Upload thất bại!");
}
```

### 2. Database Deadlock:
```javascript
// Retry logic với exponential backoff
if (error.original?.number === 1205) { // SQL Server deadlock
  await delay(Math.random() * 1000 + 500);
  retry();
}
```

### 3. Validation:
```javascript
// File validation
if (!file) {
  alert("❌ Vui lòng chọn file!");
  return;
}

// Pending changes validation  
if (!hasPendingChanges) {
  alert("📌 Không có thay đổi nào để lưu!");
  return;
}
```

---

## 📊 MONITORING & DEBUGGING

### Console Logging Strategy:
```javascript
// Structured logging với emoji
console.log('🎵 Audio uploaded with duration:', duration);
console.log('📤 Updating question with media:', questionId);
console.log('✅ Successfully saved changes:', successCount);
console.log('❌ Failed to update question:', error);
```

### Debug Information:
```javascript
// Log detailed question structure
console.log('🔍 First question detailed structure:', {
  id: data[0].id,
  hasMediaMappings: !!data[0].mediaMappings,
  mediaMappingsLength: data[0].mediaMappings?.length || 0
});
```

---

## 🔄 VERSION HISTORY

### v1.0 - Initial Implementation:
- ✅ Basic media upload functionality
- ✅ Image preview system
- ✅ Global audio management

### v1.1 - Duration Support:
- ✅ Audio duration detection (3 fallback methods)
- ✅ Database schema enhancement
- ✅ Duration storage và display

### v1.2 - Performance Optimization:
- ✅ Smart change detection
- ✅ Sequential processing
- ✅ Memory management improvements

### v1.3 - Reliability Enhancement:
- ✅ Transaction deadlock prevention
- ✅ Retry logic implementation
- ✅ Error handling improvements

### v1.4 - UX Improvements:
- ✅ Sticky save button
- ✅ Parts filtering
- ✅ Better upload status indicators

---

## 🚀 FUTURE ENHANCEMENTS

### Planned Features:
1. **Bulk Image Upload**: Upload multiple images at once
2. **Audio Trimming**: Edit audio start/end times  
3. **Image Editing**: Basic crop/resize functionality
4. **Media Library**: Reuse uploaded media across questions
5. **Progress Indicators**: Show upload progress percentage
6. **Drag & Drop**: Drag files to upload areas

### Technical Improvements:
1. **WebSocket**: Real-time upload progress
2. **Service Worker**: Background uploads
3. **IndexedDB**: Local media caching
4. **CDN Optimization**: Image optimization pipeline

---

## 📝 NOTES

### Important Considerations:
- **Memory Management**: Always cleanup blob URLs
- **Transaction Safety**: Use sequential processing for bulk operations  
- **Error Recovery**: Implement retry logic for external dependencies
- **User Feedback**: Provide clear status indicators và error messages

### Best Practices:
- Validate files before upload
- Use structured logging for debugging
- Implement progressive enhancement
- Test with large files và slow connections
- Monitor database performance under load

---

*Last Updated: October 3, 2025*
*Author: Development Team*
*Version: 1.4*
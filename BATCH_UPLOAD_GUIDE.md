# 🚀 Hướng dẫn Batch Upload Files từ Local Paths

## 📋 Tổng quan

Hệ thống hỗ trợ upload hàng loạt files (audio/image) từ đường dẫn local trong máy lên Cloudinary khi tạo đề thi.

## 🔧 Cách hoạt động

```
JSON với paths → Backend API → Đọc files → Upload Cloudinary → Trả URLs → Lưu DB
```

## 📝 Định dạng JSON

### Ví dụ JSON với local paths:

```json
{
  "title": "TOEIC Listening Part 1 - Test 1",
  "courseId": 1,
  "partId": 1,
  "audioPath": "D:/toeic-audio/test1-audio.mp3",
  "questions": [
    {
      "question": "What is the man doing?",
      "imagePath": "D:/toeic-images/test1-q1.jpg",
      "optionA": "Walking",
      "optionB": "Running",
      "optionC": "Sitting",
      "optionD": "Standing",
      "correctAnswer": "A",
      "explanation": "The man is walking in the park",
      "typeId": 1,
      "skillId": 6
    },
    {
      "question": "Where is this taking place?",
      "imagePath": "D:/toeic-images/test1-q2.jpg",
      "optionA": "Office",
      "optionB": "Park",
      "optionC": "Library",
      "optionD": "Store",
      "correctAnswer": "B",
      "explanation": "The scene is in a park",
      "typeId": 1,
      "skillId": 6
    }
  ]
}
```

## 🎯 Cách sử dụng

### Option 1: Sử dụng API trực tiếp (Postman/curl)

```bash
# 1. Validate paths trước
POST http://localhost:8080/api/upload/validate-paths
Headers: 
  Content-Type: application/json
  Cookie: [your-auth-token]
Body: [JSON với paths như trên]

# 2. Upload tất cả files
POST http://localhost:8080/api/upload/batch-from-paths
Headers: 
  Content-Type: application/json
  Cookie: [your-auth-token]
Body: [JSON với paths như trên]

# Response sẽ trả về JSON với URLs:
{
  "success": true,
  "message": "✅ Batch upload completed successfully",
  "data": {
    "title": "TOEIC Listening Part 1 - Test 1",
    "courseId": 1,
    "partId": 1,
    "audioUrl": "https://res.cloudinary.com/xxx/audio.mp3",
    "questions": [
      {
        ...
        "imageUrl": "https://res.cloudinary.com/xxx/image1.jpg"
      }
    ]
  }
}
```

### Option 2: Sử dụng Node.js script

Tạo file `upload-batch.js`:

```javascript
const axios = require('axios');
const fs = require('fs');

async function uploadBatch() {
  // Đọc JSON file
  const testData = JSON.parse(fs.readFileSync('./test-data.json', 'utf8'));
  
  try {
    // Validate paths
    console.log('🔍 Validating paths...');
    const validateRes = await axios.post(
      'http://localhost:8080/api/upload/validate-paths',
      testData,
      { withCredentials: true }
    );
    
    if (!validateRes.data.success) {
      console.error('❌ Invalid paths found');
      return;
    }
    
    // Upload files
    console.log('📤 Uploading files...');
    const uploadRes = await axios.post(
      'http://localhost:8080/api/upload/batch-from-paths',
      testData,
      { withCredentials: true }
    );
    
    if (uploadRes.data.success) {
      console.log('✅ Upload completed!');
      
      // Save result với URLs
      fs.writeFileSync(
        './test-data-with-urls.json',
        JSON.stringify(uploadRes.data.data, null, 2)
      );
      
      console.log('💾 Saved to test-data-with-urls.json');
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

uploadBatch();
```

Chạy:
```bash
node upload-batch.js
```

### Option 3: Tích hợp vào AddTestForm (Frontend)

Thêm vào `AddTestForm.tsx`:

```typescript
import { batchUploadFromPathsAPI } from "../../services/uploadService";

// Trong component:
const [isProcessingBatch, setIsProcessingBatch] = useState(false);

const handleBatchUploadFromPaths = async () => {
  if (!uploadFile) {
    alert("❌ Vui lòng chọn file JSON trước!");
    return;
  }

  try {
    setIsProcessingBatch(true);
    
    // Đọc JSON
    const text = await uploadFile.text();
    const testData = JSON.parse(text);
    
    // Kiểm tra có paths không
    const hasPaths = testData.audioPath || 
      testData.questions?.some((q: any) => q.imagePath || q.audioPath);
    
    if (!hasPaths) {
      alert("❌ JSON không chứa audioPath hoặc imagePath!");
      return;
    }
    
    console.log('📤 Uploading files from local paths...');
    
    // Gọi API batch upload
    const uploadedData = await batchUploadFromPathsAPI(testData);
    
    // Load data với URLs vào form
    setTestTitle(uploadedData.title);
    setSelectedCourseId(uploadedData.courseId);
    setSelectedPartId(uploadedData.partId);
    
    if (uploadedData.audioUrl) {
      setGlobalAudioUrl(uploadedData.audioUrl);
      setTestMode('listening');
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
      audioUrl: q.audioUrl || '',
    }));
    
    setQuestions(cleanedQuestions);
    
    alert("✅ Upload thành công! Files đã được upload lên Cloudinary.");
  } catch (error: any) {
    console.error("❌ Batch upload failed:", error);
    alert(`❌ Upload thất bại: ${error.message}`);
  } finally {
    setIsProcessingBatch(false);
  }
};

// Trong JSX, thêm button:
<div className="upload-section" style={{ marginBottom: "20px" }}>
  <h3>Hoặc tải lên file JSON/CSV</h3>
  <input type="file" accept=".json,.csv" onChange={handleUploadFile} />
  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
    <button className="save-btn" onClick={handleSubmitFile}>
      <FaUpload /> Load File lên form
    </button>
    <button 
      className="save-btn" 
      onClick={handleBatchUploadFromPaths}
      disabled={isProcessingBatch}
      style={{ backgroundColor: "#4CAF50" }}
    >
      <FaUpload /> {isProcessingBatch ? "Đang upload..." : "Upload từ paths trong JSON"}
    </button>
  </div>
</div>
```

## ⚠️ Lưu ý quan trọng

1. **Paths phải tồn tại**: Backend phải có quyền đọc files từ paths đó
2. **Windows paths**: Dùng forward slash `/` hoặc escape backslash `\\`
   - ✅ Đúng: `"D:/audio/test.mp3"` hoặc `"D:\\audio\\test.mp3"`
   - ❌ Sai: `"D:\audio\test.mp3"`
3. **Authentication**: Phải login trước khi gọi API
4. **File size**: Audio < 50MB, Image < 5MB
5. **Backend phải chạy**: Backend và frontend phải cùng máy hoặc có share folder

## 🔒 Bảo mật

- API yêu cầu authentication token (verifyToken middleware)
- Chỉ accept paths từ máy server, không phải client
- Validate paths trước khi upload để tránh path traversal

## 🎉 Workflow hoàn chỉnh

```bash
# 1. Chuẩn bị files
D:/toeic-data/
  ├── audio/
  │   ├── test1.mp3
  │   └── test2.mp3
  └── images/
      ├── test1-q1.jpg
      ├── test1-q2.jpg
      └── test1-q3.jpg

# 2. Tạo JSON với paths
{
  "title": "Test 1",
  "audioPath": "D:/toeic-data/audio/test1.mp3",
  "questions": [
    {
      "imagePath": "D:/toeic-data/images/test1-q1.jpg",
      ...
    }
  ]
}

# 3. Upload batch
POST /api/upload/batch-from-paths

# 4. Nhận URLs
{
  "audioUrl": "https://res.cloudinary.com/xxx/test1.mp3",
  "questions": [
    {
      "imageUrl": "https://res.cloudinary.com/xxx/test1-q1.jpg",
      ...
    }
  ]
}

# 5. Lưu vào DB thông qua createNewTestAPI
```

## 🐛 Troubleshooting

### Lỗi "File not found"
- Kiểm tra path có đúng không
- Kiểm tra file có tồn tại không
- Kiểm tra quyền đọc file

### Lỗi "Invalid paths"
- Sử dụng forward slash `/` trong path
- Đảm bảo không có ký tự đặc biệt
- Test với path tuyệt đối

### Lỗi "Upload failed"
- Kiểm tra Cloudinary config
- Kiểm tra kết nối mạng
- Xem log backend để biết chi tiết

## 📚 API Endpoints

### POST /api/upload/batch-from-paths
- **Description**: Upload nhiều files từ local paths
- **Auth**: Required
- **Body**: Test data JSON với paths
- **Response**: Test data với URLs

### POST /api/upload/validate-paths
- **Description**: Validate paths trước khi upload
- **Auth**: Required
- **Body**: Test data JSON
- **Response**: Success/fail với danh sách invalid paths

---

Tạo bởi: Chatbot TOEIC Team 🚀

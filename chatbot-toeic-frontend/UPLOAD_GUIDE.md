# 📚 Hướng dẫn tạo Test với Upload File

## 🎯 Tổng quan

Hệ thống đã được cấu hình để:
1. ✅ Upload file (ảnh/audio) qua **Backend**
2. ✅ Tự động thay thế File object → URL
3. ✅ Lưu metadata vào database

---

## 🔧 Cấu trúc File đã tạo

### Backend:
- `src/routes/upload.js` - Upload routes
- `src/config/cloudinary.js` - Cloudinary config

### Frontend:
- `src/services/uploadService.ts` - Upload API functions
- `src/services/adminTestService.ts` - Test creation with auto upload
- `src/examples/CreateTestExample.tsx` - Usage examples

---

## 📝 Cách sử dụng

### 1️⃣ Import services

```typescript
import { createNewTestAPI, type TestCreateInput, type QuestionInput } from '../services/adminTestService';
```

### 2️⃣ Chuẩn bị data với File objects

```typescript
const testData: TestCreateInput = {
  title: 'TOEIC Test 1',
  courseId: 1,
  questions: [
    {
      question: 'Listen and choose the answer',
      optionA: 'A',
      optionB: 'B',
      optionC: 'C',
      optionD: 'D',
      correctAnswer: 'A',
      explanation: 'Explanation here',
      typeId: 1,
      partId: 3,
      skillId: 6, // Listening
      
      // ✅ Add files here
      mediaFiles: [
        {
          type: 'audio',
          file: audioFile, // File object from input
          description: 'Question audio',
          startSecond: 0,
          endSecond: 30,
        }
      ]
    },
    {
      question: 'Reading question here',
      // ... other fields
      partId: 5,
      skillId: 7, // Reading
      // ✅ NO mediaFiles for reading questions
    }
  ]
};
```

### 3️⃣ Gọi API - Upload tự động

```typescript
try {
  const result = await createNewTestAPI(testData);
  console.log('✅ Test created:', result.data.testId);
} catch (error) {
  console.error('❌ Error:', error);
}
```

---

## 🎨 Ví dụ với Form Component

```typescript
function CreateTestForm() {
  const [questions, setQuestions] = useState<QuestionInput[]>([]);

  // Handle file input
  const handleAudioUpload = (index: number, file: File) => {
    const updated = [...questions];
    updated[index].mediaFiles = [
      {
        type: 'audio',
        file: file,
        description: file.name,
      }
    ];
    setQuestions(updated);
  };

  // Submit form
  const handleSubmit = async () => {
    const testData: TestCreateInput = {
      title: 'My Test',
      courseId: 1,
      questions: questions,
    };

    await createNewTestAPI(testData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {questions.map((q, idx) => (
        <div key={idx}>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleAudioUpload(idx, e.target.files[0]);
              }
            }}
          />
        </div>
      ))}
      <button type="submit">Create Test</button>
    </form>
  );
}
```

---

## 🔄 Data Flow

```
┌─────────────────┐
│  Frontend Form  │
│  (File object)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ createNewTestAPI()      │
│ - Loop through questions│
│ - Upload mediaFiles     │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────────┐
│ uploadFileAPI()          │
│ POST /api/upload/audio   │
│ POST /api/upload/image   │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Backend Upload Router    │
│ - Validate file          │
│ - Upload to Cloudinary   │
│ - Return URL             │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Replace File → URL       │
│ mediaFiles: [{file}]     │
│    ↓                     │
│ media: [{url}]           │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ POST /api/adminTest/     │
│      createTestNew       │
│ - Save to Questions      │
│ - Save to MediaFiles     │
│ - Save to MediaMap       │
└──────────────────────────┘
```

---

## 📋 Interface Reference

### QuestionInput (Frontend input)
```typescript
interface QuestionInput {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  typeId: number;
  partId: number;
  skillId?: number;
  mediaFiles?: MediaInput[]; // ← File objects
}
```

### MediaInput (Frontend)
```typescript
interface MediaInput {
  type: 'audio' | 'image' | 'video';
  file: File; // ← File object from input
  description?: string;
  startSecond?: number;
  endSecond?: number;
}
```

### Question (Backend format)
```typescript
interface Question {
  // ... same fields
  media?: MediaFile[]; // ← URLs after upload
}
```

### MediaFile (Backend)
```typescript
interface MediaFile {
  type: 'audio' | 'image' | 'video';
  url: string; // ← Cloudinary URL
  description?: string;
  startSecond?: number;
  endSecond?: number;
}
```

---

## ✅ Checklist

### Backend:
- [x] Upload routes configured (`/api/upload/image`, `/api/upload/audio`)
- [x] Cloudinary config with credentials
- [x] File validation (size, type)
- [x] Auth middleware for upload routes
- [x] Delete API for cleanup

### Frontend:
- [x] Upload service created (`uploadService.ts`)
- [x] Test service updated with auto upload (`adminTestService.ts`)
- [x] Interfaces defined (`QuestionInput`, `MediaInput`)
- [x] Example usage created (`CreateTestExample.tsx`)

### Database:
- [x] MediaFiles table
- [x] QuestionMediaMap table
- [x] Service handles media saving

---

## 🎯 Usage Examples

### Example 1: Listening question with audio
```typescript
{
  question: 'What is the topic?',
  // ... options
  partId: 3,
  skillId: 6, // Listening
  mediaFiles: [{
    type: 'audio',
    file: audioFile,
  }]
}
```

### Example 2: Reading question (no media)
```typescript
{
  question: 'Choose the correct word',
  // ... options
  partId: 5,
  skillId: 7, // Reading
  // No mediaFiles needed
}
```

### Example 3: Picture description with image + audio
```typescript
{
  question: 'Describe the picture',
  // ... options
  partId: 1,
  skillId: 6,
  mediaFiles: [
    {
      type: 'image',
      file: imageFile,
    },
    {
      type: 'audio',
      file: audioFile,
    }
  ]
}
```

---

## 🚀 Ready to use!

Bây giờ bạn có thể:
1. ✅ Tạo form với file input
2. ✅ Gọi `createNewTestAPI(testData)`
3. ✅ Files tự động upload và lưu vào DB
4. ✅ Không cần xử lý upload thủ công!

---

## 📞 API Endpoints Summary

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/upload/image` | POST | Upload image | Yes |
| `/api/upload/audio` | POST | Upload audio | Yes |
| `/api/upload/delete/:publicId` | DELETE | Delete file | Yes |
| `/api/adminTest/createTestNew` | POST | Create test | Yes |

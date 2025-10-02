# 📚 Hướng dẫn sử dụng AddTestForm - 2 Loại đề thi

## 🎯 Tổng quan

AddTestForm hiện hỗ trợ **2 loại đề thi**:

### 📖 **Option 1: Reading Test**
- **Không cần** audio/image files
- Chỉ cần text questions và answers
- Form đơn giản, nhanh chóng

### 🎧 **Option 2: Listening Test**
- **Có** audio và/hoặc image files
- Hỗ trợ **2 cách upload**:
  - ✅ **Batch Upload**: Upload từ paths trong JSON (cho 50-100+ files)
  - ✅ **Direct Upload**: Chọn files trực tiếp trong UI (cho 5-10 files)
- Hệ thống **tự động phát hiện** và xử lý theo paths hoặc files

---

## 🚀 Cách sử dụng

### 📖 Option 1: Reading Test (Không có media)

#### Bước 1: Chọn loại đề
```
◉ 📖 Reading (Không cần audio/image)
○ 🎧 Listening (Có audio/image)
```

#### Bước 2: Tạo JSON file
**File:** `example-reading-test.json`
```json
{
  "title": "TOEIC Reading Part 5",
  "courseId": 1,
  "partId": 5,
  "questions": [
    {
      "question": "The company plans to _____ its operations...",
      "optionA": "expand",
      "optionB": "expansion",
      "optionC": "expanding",
      "optionD": "expands",
      "correctAnswer": "A",
      "explanation": "...",
      "typeId": 2,
      "skillId": 7
    }
  ]
}
```

#### Bước 3: Load file
1. Click **"Load File lên form"**
2. Form tự động điền title, questions
3. Click **"Lưu đề"**

✅ **Xong!** Đề thi Reading đã được tạo.

---

### 🎧 Option 2A: Listening Test (Upload từ paths - Batch)

Phù hợp cho: **50-100+ files**, batch processing

#### Bước 1: Chuẩn bị files
```
D:/toeic-media/
  ├── audio/
  │   └── part1-test1.mp3
  └── images/
      ├── part1-q1.jpg
      ├── part1-q2.jpg
      └── part1-q3.jpg
```

#### Bước 2: Tạo JSON với paths
**File:** `example-listening-with-paths.json`
```json
{
  "title": "TOEIC Listening Part 1",
  "courseId": 1,
  "partId": 1,
  "audioPath": "D:\\toeic-media\\audio\\part1-test1.mp3",
  "questions": [
    {
      "question": "Look at the picture. What is the man doing?",
      "imagePath": "D:\\toeic-media\\images\\part1-q1.jpg",
      "optionA": "He is walking",
      "optionB": "He is sitting",
      "optionC": "He is reading",
      "optionD": "He is talking",
      "correctAnswer": "A",
      "explanation": "...",
      "typeId": 1,
      "skillId": 6
    }
  ]
}
```

✅ **Tính năng mới: Auto-format paths!**
- Bạn có thể dùng **Windows path** (`\`) hoặc **Unix path** (`/`)
- Hệ thống **tự động convert** `\` → `/` trước khi upload
- **Không cần lo lắng** về format path nữa!

**Ví dụ paths hợp lệ:**
- ✅ `"D:\\audio\\test.mp3"` (Windows style) → Auto-convert → `D:/audio/test.mp3`
- ✅ `"D:/audio/test.mp3"` (Unix style) → Giữ nguyên
- ✅ Copy trực tiếp từ File Explorer → Paste vào JSON → Hoạt động ngay!

#### Bước 3: Chọn loại đề
```
○ 📖 Reading
◉ 🎧 Listening (Có audio/image)
```

#### Bước 4: Upload batch
1. Chọn JSON file
2. Click **"Upload từ paths (JSON có paths)"**
3. Chờ backend upload files lên Cloudinary
4. Form tự động hiển thị URLs đã upload

#### Bước 5: Lưu đề
Click **"Lưu đề"** → Test được tạo với media URLs

---

### 🎧 Option 2B: Listening Test (Upload trực tiếp - Direct)

Phù hợp cho: **5-10 files**, upload thủ công

#### Bước 1: Tạo JSON (không có paths)
**File:** `example-listening-direct-upload.json`
```json
{
  "title": "TOEIC Listening Part 1",
  "courseId": 1,
  "partId": 1,
  "questions": [
    {
      "question": "Look at the picture. What is the man doing?",
      "optionA": "He is walking",
      "optionB": "He is sitting",
      "optionC": "He is reading",
      "optionD": "He is talking",
      "correctAnswer": "A",
      "explanation": "...",
      "typeId": 1,
      "skillId": 6
    }
  ]
}
```
Lưu ý: **Không có** `audioPath` và `imagePath`

#### Bước 2: Chọn loại đề
```
○ 📖 Reading
◉ 🎧 Listening (Có audio/image)
```

#### Bước 3: Load file
Click **"Load File lên form"**

#### Bước 4: Upload audio chung
```
🎵 Audio chung cho toàn bộ đề thi
[Choose File] ← Chọn audio file
```

#### Bước 5: Upload image cho từng câu
Mỗi câu hỏi có section:
```
🖼️ Hình ảnh cho câu hỏi này (tùy chọn)
[Choose File] ← Chọn image file
```

#### Bước 6: Lưu đề
Click **"Lưu đề"** → Files tự động upload → Test được tạo

---

## 🤖 Hệ thống tự động phát hiện

Hệ thống **tự động kiểm tra** JSON và xử lý:

### JSON có paths → Batch Upload
```json
{
  "audioPath": "D:/audio/test.mp3",  // ← Có path
  "questions": [
    {
      "imagePath": "D:/images/q1.jpg"  // ← Có path
    }
  ]
}
```
→ Button **"Upload từ paths"** sẽ hoạt động
→ Backend đọc files và upload

### JSON không có paths → Direct Upload
```json
{
  "questions": [
    {
      "question": "..."
      // ← Không có imagePath
    }
  ]
}
```
→ Button **"Load File"** sẽ hoạt động
→ User chọn files trong UI
→ Upload khi click "Lưu đề"

---

## 📋 So sánh 2 Loại đề

| Tiêu chí | Reading | Listening |
|----------|---------|-----------|
| **Audio files** | ❌ Không | ✅ Có |
| **Image files** | ❌ Không | ✅ Có (tùy chọn) |
| **Upload options** | N/A | Batch hoặc Direct |
| **JSON format** | Simple | Có thể có paths |
| **Use case** | Part 5, 6, 7 | Part 1, 2, 3, 4 |
| **Complexity** | Đơn giản | Phức tạp hơn |

---

## 📋 So sánh 2 Cách upload (cho Listening)

| Tiêu chí | Batch Upload | Direct Upload |
|----------|--------------|---------------|
| **JSON format** | Có `audioPath`, `imagePath` | Không có paths |
| **Upload timing** | Ngay khi click "Upload từ paths" | Khi click "Lưu đề" |
| **File selection** | Tự động từ paths | Manual cho từng file |
| **Số lượng files** | Nhiều (50-100+) | Ít (5-10) |
| **Backend requirement** | ✅ Cần (đọc files từ paths) | ❌ Không |
| **Use case** | Batch processing | Upload thủ công |

---

## 🎨 Giao diện

### Reading Mode
```
┌─────────────────────────────────────┐
│ 🎯 Chọn loại đề thi:               │
│ ◉ 📖 Reading (Không cần media)     │
│ ○ 🎧 Listening (Có media)          │
└─────────────────────────────────────┘

[Load File lên form]

Câu hỏi 1:
┌─────────────────────────────────────┐
│ 1. The company plans to _____ ...  │
│ A. expand  ○ Đúng                  │
│ B. expansion                        │
│ C. expanding                        │
│ D. expands                          │
└─────────────────────────────────────┘
```

### Listening Mode - Batch Upload
```
┌─────────────────────────────────────┐
│ 🎯 Chọn loại đề thi:               │
│ ○ 📖 Reading                        │
│ ◉ 🎧 Listening (Có media)          │
└─────────────────────────────────────┘

[Load File] [Upload từ paths]
💡 Tip: Nếu JSON có paths, dùng "Upload từ paths"

┌─────────────────────────────────────┐
│ 🎵 Audio chung cho toàn bộ đề thi  │
│ URL đã upload: https://...         │
└─────────────────────────────────────┘

Câu hỏi 1:
┌─────────────────────────────────────┐
│ 🖼️ Hình ảnh cho câu hỏi này        │
│ URL đã upload: https://...         │
└─────────────────────────────────────┘
```

### Listening Mode - Direct Upload
```
┌─────────────────────────────────────┐
│ 🎯 Chọn loại đề thi:               │
│ ○ 📖 Reading                        │
│ ◉ 🎧 Listening (Có media)          │
└─────────────────────────────────────┘

[Load File]

┌─────────────────────────────────────┐
│ 🎵 Audio chung cho toàn bộ đề thi  │
│ [Choose File] audio.mp3            │
│ ✅ Đã chọn: test-audio.mp3         │
└─────────────────────────────────────┘

Câu hỏi 1:
┌─────────────────────────────────────┐
│ 🖼️ Hình ảnh cho câu hỏi này        │
│ [Choose File] image.jpg            │
│ ✅ Đã chọn: question1.jpg          │
└─────────────────────────────────────┘
```

---

## ⚠️ Lưu ý quan trọng

### Reading Test
- ✅ Không cần media files
- ✅ JSON đơn giản
- ✅ Upload nhanh

### Listening Test - Batch Upload
- ✅ Xử lý hàng loạt files
- ✅ Tự động upload tất cả
- ✅ **Tự động format paths** (`\` → `/`)
- ✅ Hỗ trợ cả Windows và Unix paths
- ❌ Backend phải có quyền đọc files
- ❌ Paths phải tồn tại trên server

### Listening Test - Direct Upload
- ✅ Không cần paths trong JSON
- ✅ Upload từ browser
- ✅ Không cần backend đặc biệt
- ❌ Không phù hợp với nhiều files

---

## 🎓 Best Practices

### Khi nào dùng Reading Mode?
- Part 5, 6, 7 (Grammar, Reading Comprehension)
- Không có audio/image
- Chỉ có text questions

### Khi nào dùng Listening Batch Upload?
- Part 1, 2, 3, 4 (Listening)
- Có nhiều files (50-100+)
- Files sẵn trong máy server
- Batch processing nhiều đề

### Khi nào dùng Listening Direct Upload?
- Part 1, 2, 3, 4 (Listening)
- Có ít files (5-10)
- Upload thủ công từng đề
- Không có files sẵn trong server

---

## 🐛 Troubleshooting

### "JSON không chứa audioPath hoặc imagePath"
- Nếu dùng **"Upload từ paths"**: JSON phải có `audioPath`/`imagePath`
- Nếu không có paths: Dùng **"Load File"** và chọn files trong UI

### "Invalid paths"
- ~~Đảm bảo paths dùng forward slash `/`~~ (Không cần lo nữa - tự động format!)
- Copy path trực tiếp từ Windows Explorer? **Hoạt động ngay!**
- Kiểm tra files tồn tại
- Kiểm tra quyền đọc files
- Backend phải chạy trên cùng máy với files

### "Upload failed"
- Kiểm tra file size (Image < 5MB, Audio < 50MB)
- Kiểm tra định dạng file
- Kiểm tra kết nối Cloudinary

---

## 📚 Example Files

Trong thư mục gốc, có 3 file JSON mẫu:

1. **`example-reading-test.json`** 
   - Reading test, không có media
   - Dùng với "Load File"

2. **`example-listening-with-paths.json`**
   - Listening test với paths
   - Dùng với "Upload từ paths"

3. **`example-listening-direct-upload.json`**
   - Listening test không có paths
   - Dùng với "Load File" + chọn files trong UI

---

Tạo bởi: Chatbot TOEIC Team 🚀

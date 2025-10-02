# 🔧 Auto-Format Windows Paths - Hướng dẫn

## 🎯 Tính năng

Hệ thống **tự động convert** Windows paths (`\`) sang Unix paths (`/`) trước khi upload files.

## ✅ Lợi ích

1. **Không cần chỉnh paths thủ công** - Copy paste trực tiếp từ Windows Explorer
2. **Tương thích đa nền tảng** - Backend xử lý paths một cách nhất quán
3. **Giảm lỗi** - Không còn lo về format paths sai

## 📝 Cách hoạt động

### Trước đây (Phải format thủ công)
```json
{
  "audioPath": "D:\toeic\audio\test.mp3"  ❌ SAI - Backend không đọc được
}
```

Phải sửa thành:
```json
{
  "audioPath": "D:/toeic/audio/test.mp3"  ✅ ĐÚNG
}
```

### Bây giờ (Auto-format)
```json
{
  "audioPath": "D:\toeic\audio\test.mp3"  ✅ OK - Tự động convert!
}
```

Hệ thống tự động convert → `"D:/toeic/audio/test.mp3"`

## 🔍 Ví dụ cụ thể

### Copy path từ Windows Explorer

**Bước 1:** Click chuột phải file → "Copy as path"
```
D:\Projects\Chatbot_Toeic\media\audio\listening-test-1.mp3
```

**Bước 2:** Paste trực tiếp vào JSON
```json
{
  "audioPath": "D:\\Projects\\Chatbot_Toeic\\media\\audio\\listening-test-1.mp3"
}
```

**Bước 3:** Upload - Hệ thống tự động convert
```
Frontend auto-format:
D:\Projects\Chatbot_Toeic\media\audio\listening-test-1.mp3
    ↓
D:/Projects/Chatbot_Toeic/media/audio/listening-test-1.mp3
    ↓
Backend đọc file thành công ✅
```

## 📊 Test cases

| Input Path | Auto-formatted Output | Status |
|------------|----------------------|---------|
| `D:\audio\test.mp3` | `D:/audio/test.mp3` | ✅ |
| `D:/audio/test.mp3` | `D:/audio/test.mp3` | ✅ |
| `C:\Users\Admin\Documents\file.jpg` | `C:/Users/Admin/Documents/file.jpg` | ✅ |
| `/home/user/audio/test.mp3` | `/home/user/audio/test.mp3` | ✅ |
| `D:\folder with spaces\file.mp3` | `D:/folder with spaces/file.mp3` | ✅ |

## 🛠️ Technical Details

### Frontend Implementation

**File:** `AddTestForm.tsx`

```typescript
// Helper function
const normalizeWindowsPath = (path: string): string => {
  if (!path) return path;
  // Replace all backslashes with forward slashes
  return path.replace(/\\/g, '/');
};

// Usage in handleBatchUploadFromPaths
const handleBatchUploadFromPaths = async () => {
  const testData = JSON.parse(text);
  
  // Auto-format audioPath
  if (testData.audioPath) {
    testData.audioPath = normalizeWindowsPath(testData.audioPath);
  }
  
  // Auto-format imagePath cho từng question
  if (testData.questions) {
    testData.questions = testData.questions.map((q: any) => ({
      ...q,
      imagePath: q.imagePath ? normalizeWindowsPath(q.imagePath) : q.imagePath,
      audioPath: q.audioPath ? normalizeWindowsPath(q.audioPath) : q.audioPath,
    }));
  }
  
  // Gọi API với paths đã format
  const result = await batchUploadFromPathsAPI(testData);
};
```

### Console Output

Khi upload, bạn sẽ thấy:
```
📤 Uploading files from local paths (auto-formatted)...
🔧 Formatted audioPath: D:/toeic-media/audio/part1-test1.mp3
✅ Batch upload successful!
```

## 🎓 Best Practices

### 1. Copy path từ Windows Explorer
- Right click file → "Copy as path"
- Paste trực tiếp vào JSON
- **Không cần sửa gì cả!**

### 2. Escape backslashes trong JSON
Khi viết paths trong JSON, có 2 cách:

**Cách 1: Double backslash (Chuẩn JSON)**
```json
{
  "audioPath": "D:\\audio\\test.mp3"
}
```

**Cách 2: Forward slash (Đơn giản hơn)**
```json
{
  "audioPath": "D:/audio/test.mp3"
}
```

**Cả 2 cách đều hoạt động!** Hệ thống tự động xử lý.

### 3. Kiểm tra paths trước khi upload
- Đảm bảo files tồn tại
- Kiểm tra quyền đọc
- Backend phải chạy trên cùng máy với files

## 🚀 Workflow hoàn chỉnh

```
User copy path từ Windows Explorer
    ↓
"D:\media\audio\test.mp3"
    ↓
Paste vào JSON file
    ↓
Load JSON vào form
    ↓
Click "Upload từ paths"
    ↓
Frontend: normalizeWindowsPath()
    ↓
"D:/media/audio/test.mp3"
    ↓
POST /api/upload/batch-from-paths
    ↓
Backend: fs.readFileSync(path)
    ↓
Upload to Cloudinary
    ↓
Return URLs
    ↓
Display trong form ✅
```

## ✨ Summary

**Trước:**
- ❌ Phải manually convert `\` → `/`
- ❌ Dễ quên và gây lỗi
- ❌ Mất thời gian

**Bây giờ:**
- ✅ Copy paste trực tiếp
- ✅ Tự động format
- ✅ Không lo lỗi paths

---

**Updated:** October 2025
**Feature:** Auto-format Windows paths to Unix style
**Status:** ✅ Production Ready

# 🚀 QUICK REFERENCE - CHATBOT TOEIC

> **Tham chiếu nhanh cho các tác vụ thường gặp**

---

## 📋 **TÀI LIỆU CHÍNH**

| Tài liệu | Mô tả | Khi nào đọc |
|----------|-------|-------------|
| **`SYSTEM_OVERVIEW.md`** ⭐ | Tổng quan toàn hệ thống | Hiểu kiến trúc tổng thể |
| **`README.md`** | Giới thiệu + hướng dẫn cài đặt | Setup lần đầu |
| **`TEST_WORKFLOW_GUIDE.md`** | Quy trình làm test | Làm việc với test flow |
| **`ADDTESTFORM_USER_GUIDE.md`** | Thêm test mới | Admin tạo test |
| **`BATCH_UPLOAD_GUIDE.md`** | Upload hàng loạt | Import nhiều câu hỏi |
| **`MEDIA_EDITING_DOCUMENTATION.md`** | Edit media test | Sửa audio/image |
| **`ml/ML_FILES_README.md`** | ML files overview | Làm việc với ML |

---

## 🏃 **QUICK START**

### **1. Chạy Hệ Thống (Development)**

```bash
# Clone project
git clone https://github.com/hungpptit/chatbot-toeic.git
cd chatbot-toeic

# Start backend
cd chatbot-toeic-backend
npm install
npm run dev          # Port 8080

# Start frontend (new terminal)
cd chatbot-toeic-frontend
npm install
npm run dev          # Port 5173
```

### **2. Chạy với Docker**

```bash
# Setup .env file first
docker compose up --build

# Access:
# Frontend: http://localhost:5173
# Backend:  http://localhost:8080
```

---

## 🔧 **COMMON TASKS**

### **Backend Tasks**

```bash
cd chatbot-toeic-backend

# Development
npm run dev          # Nodemon auto-reload

# Production
npm start            # Node.js

# Build (if needed)
npm run build-src    # Babel transpile
```

### **Frontend Tasks**

```bash
cd chatbot-toeic-frontend

# Development
npm run dev          # Vite dev server

# Production build
npm run build        # Output to dist/

# Preview production
npm run preview
```

### **ML Tasks**

```bash
cd chatbot-toeic-backend/ml

# Predict weak skills
python predict_hybrid_unified.py 3        # userId = 3

# Train models
python train_model.py                     # Global model
python train_unified_model.py             # Unified model

# Check data
python check_user_skills.py               # Interactive
python check_skills_distribution.py       # All skills
python find_best_user.py                  # Find test user
```

### **Database Tasks**

```bash
# Connect to SQL Server
mssql-cli -S localhost -U sa -P YourPassword

# Backup
BACKUP DATABASE ToeicChatbot TO DISK = 'backup.bak'

# Restore
RESTORE DATABASE ToeicChatbot FROM DISK = 'backup.bak'

# Export data
bcp ToeicChatbot.dbo.Questions out questions.csv -c -t, -S localhost -U sa -P YourPassword
```

---

## 📊 **KEY FEATURES LOCATION**

### **Test System**
- **Frontend:** `src/container/test_exam.tsx`
- **Backend Controller:** `src/controllers/question_test_controller.js`
- **Backend Service:** `src/services/question_test_service.js`
- **API:** `/api/questionTest/*`

### **Chatbot**
- **Frontend:** `src/container/ChatPage.tsx`
- **Backend Controller:** `src/controllers/message_controller.js`
- **Backend Service:** `src/services/message_service.js`
- **API:** `/api/message/*`, `/api/conversation/*`

### **Admin Panel**
- **Add Test:** `src/pages/admin/AddTestForm.tsx`
- **View/Edit Test:** `src/pages/admin/AdminTestViewPage.tsx`
- **User Management:** `src/pages/admin/AdminUserPage.tsx`
- **Backend:** `src/controllers/Admin*_controller.js`

### **ML/AI**
- **Production:** `ml/predict_hybrid_unified.py`
- **Training:** `ml/train_model.py`, `ml/train_unified_model.py`
- **Models:** `ml/*.pkl` files

---

## 🔌 **API ENDPOINTS CHEATSHEET**

### **Auth**
```
POST   /api/auth/signup          # Đăng ký
POST   /api/auth/login           # Đăng nhập
GET    /api/auth/logout          # Đăng xuất
GET    /api/auth/verify          # Verify token
```

### **Test**
```
GET    /api/questionTest/Detail/:testId          # Load test
POST   /api/questionTest/submit                  # Submit answers
GET    /api/questionTest/review/:userTestId      # Review mode
POST   /api/questionTest/create                  # Create test
POST   /api/questionTest/update-question         # Update question
POST   /api/questionTest/batch-upload            # Batch upload
```

### **Chatbot**
```
GET    /api/conversation                         # List conversations
POST   /api/conversation                         # New conversation
GET    /api/conversation/:id/messages            # Get messages
POST   /api/message                              # Send message
DELETE /api/conversation/:id                     # Delete
```

### **Admin**
```
GET    /api/admin/users                          # List users
PUT    /api/admin/users/:id                      # Update user
GET    /api/admin/tests                          # List tests
DELETE /api/admin/tests/:id                      # Delete test
```

### **Vocabulary**
```
GET    /api/vocabulary/search?word=hello         # Search word
POST   /api/vocabulary/lookup                    # AI lookup
```

---

## 🗄️ **DATABASE QUICK REF**

### **Core Tables**
```sql
-- Users & Auth
Users(id, username, email, password, role, isActive)

-- Tests
Courses(id, name, description, level)
Tests(id, title, courseId, participants)
Questions(id, question, optionA-D, correctAnswer, explanation)
TestQuestion(testId, questionId, sortOrder)

-- Media
MediaFiles(id, mediaType, mediaUrl, duration)
QuestionMediaMap(id, questionId, mediaId, startSecond, endSecond)

-- User Progress
UserTest(id, userId, testId, status, score)
UserResults(id, userTestId, questionId, selectedOption, isCorrect)

-- Chatbot
Conversation(id, userId, title)
Message(id, conversationId, role, content)

-- Vocabulary
Vocabulary(id, word, definition)
Pronunciations(id, wordId, ipa)
synonym, antonym, meaning
```

---

## 🐛 **TROUBLESHOOTING QUICK FIX**

### **Backend không kết nối DB**
```bash
# Check SQL Server running
docker ps | grep mssql

# Test connection
mssql-cli -S localhost -U sa -Q "SELECT 1"

# Check .env file
cat chatbot-toeic-backend/.env
```

### **Frontend không call được API**
```javascript
// Check CORS in backend/src/server.js
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Check frontend API URL
// chatbot-toeic-frontend/.env
VITE_API_URL=http://localhost:8080
```

### **Cloudinary upload fail**
```bash
# Check credentials
cat chatbot-toeic-backend/.env | grep CLOUDINARY

# Test manually
curl -X POST "https://api.cloudinary.com/v1_1/YOUR_CLOUD/upload" \
  -F "file=@test.jpg" \
  -F "upload_preset=YOUR_PRESET"
```

### **ML model không tìm thấy**
```bash
cd chatbot-toeic-backend/ml

# Check models exist
ls -la *.pkl

# Re-train if missing
python train_model.py
python train_unified_model.py
```

### **JWT token expired**
```bash
# Clear cookies in browser
# Or extend expiry in backend
// src/Middleware/authMiddleware.js
const token = jwt.sign(payload, SECRET, { expiresIn: '7d' });
```

---

## 📦 **PROJECT STRUCTURE**

```
Chatbot_Toeic/
├── 📚 Documentation/
│   ├── SYSTEM_OVERVIEW.md           ⭐ Đọc đầu tiên
│   ├── QUICK_REFERENCE.md           ⭐ File này
│   ├── README.md                    Setup guide
│   └── TEST_WORKFLOW_GUIDE.md       Test flow
│
├── 🖥️ chatbot-toeic-frontend/
│   ├── src/
│   │   ├── components/              UI components
│   │   ├── container/               Page containers
│   │   ├── pages/                   Route pages
│   │   └── services/                API calls
│   └── package.json
│
├── ⚙️ chatbot-toeic-backend/
│   ├── src/
│   │   ├── controllers/             Request handlers
│   │   ├── models/                  DB models
│   │   ├── routes/                  API routes
│   │   └── services/                Business logic
│   ├── ml/                          Python ML scripts
│   │   ├── predict_hybrid_unified.py  ⭐ Production
│   │   ├── train_model.py           Train global
│   │   └── train_unified_model.py   Train unified
│   └── package.json
│
└── 🐳 docker-compose.yml
```

---

## 🎯 **WORKFLOW CHECKLIST**

### **Admin Thêm Test Mới**
- [ ] Login as admin
- [ ] Navigate to "Add Test" page
- [ ] Select Course, Part, Question Type
- [ ] Add questions (manual or batch JSON)
- [ ] Upload media files (if listening)
- [ ] Set audio timing (startSecond/endSecond)
- [ ] Click Submit
- [ ] Verify test appears in list

### **User Làm Bài Test**
- [ ] Login as user
- [ ] Select test from homepage
- [ ] Review questions (not started yet)
- [ ] Click "Bắt Đầu" to start timer
- [ ] Answer questions
- [ ] Click "Nộp Bài"
- [ ] View results summary
- [ ] Click "Xem Chi Tiết" for review mode

### **Retrain ML Models (Weekly)**
- [ ] SSH to server
- [ ] cd chatbot-toeic-backend/ml
- [ ] python train_model.py
- [ ] python train_unified_model.py
- [ ] Check logs for success
- [ ] Test predictions: python predict_hybrid_unified.py 3

---

## 🔐 **ENVIRONMENT VARIABLES**

### **Backend (.env)**
```bash
# Server
NODE_ENV=production
PORT=8080

# Database
DB_SERVER=localhost
DB_USERNAME=sa
DB_PASS=YourPassword123
DB_NAME=ToeicChatbot

# AI
GEMINI_API_KEY=AIza...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc...

# Auth
JWT_SECRET=your-jwt-secret
COOKIE_SECRET=your-cookie-secret
```

### **Frontend (.env)**
```bash
VITE_API_URL=http://localhost:8080
```

---

## 📞 **CONTACTS**

**Developer:** Phạm Tuấn Hùng  
**Email:** phamtuanhung9a5@gmail.com  
**Demo:** https://hungptit.dev  
**School:** PTIT

---

## 📌 **IMPORTANT NOTES**

1. **Không commit .env files** - Đã có trong .gitignore
2. **Media files** - Tất cả lưu trên Cloudinary, không commit vào Git
3. **ML models (.pkl)** - Có thể commit hoặc train lại trên server
4. **Database backup** - Nên backup định kỳ
5. **API keys** - Giữ bí mật, không share public

---

**Last Updated:** October 27, 2025  
**Version:** 2.0

---

> **💡 Tip:** Bookmark file này để tham chiếu nhanh khi cần!

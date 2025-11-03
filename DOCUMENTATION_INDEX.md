# 📚 CHATBOT TOEIC - DOCUMENTATION INDEX

> **Tổng hợp tất cả tài liệu hệ thống - Updated Nov 1, 2025**

---

## 🎯 BẮT ĐẦU TỪ ĐÂY

| Tài liệu | Mục đích | Người đọc |
|----------|----------|-----------|
| **[README.md](README.md)** ⭐ | Giới thiệu dự án + Quick start | Mọi người |
| **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** | Tham chiếu nhanh các tác vụ | Developers |
| **[SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md)** | Kiến trúc tổng thể hệ thống | Developers, Architects |

---

## 🚀 TÍNH NĂNG MỚI: REAL-TIME ML SYSTEM

| Tài liệu | Nội dung | Trạng thái |
|----------|----------|-----------|
| **[REAL_TIME_ML_SYSTEM.md](REAL_TIME_ML_SYSTEM.md)** ⭐⭐⭐ | **Hệ thống dự đoán kỹ năng yếu real-time** với database caching | ✅ Production Ready |
| [UNIFIED_MODEL_GUIDE.md](UNIFIED_MODEL_GUIDE.md) | Kiến trúc ML models (Global + Unified) | ✅ Reference |

**Highlights:**
- ⚡ Response time: <100ms (sau lần đầu)
- 🔄 Real-time updates: Sau mỗi lần làm bài (>=5 câu mới)
- 📊 Database-backed: Persistent, scalable
- 🎯 Smart triggers: Non-blocking background updates

**Files quan trọng:**
- `migrations/create_ml_predictions_table.sql` - Database schema
- `src/models/MLPrediction.js` - Sequelize model
- `src/services/ml_service.js` - Trigger logic
- `src/pages/MLRecommendationsPage.tsx` - Frontend UI

---

## 📝 TEST & EXAM WORKFLOW

| Tài liệu | Nội dung | Use Cases |
|----------|----------|-----------|
| [TEST_WORKFLOW_GUIDE.md](TEST_WORKFLOW_GUIDE.md) | Quy trình làm bài test (Exam/Practice/Review) | User làm bài, nộp bài, xem kết quả |
| [MIXED_TEST_GUIDE.md](MIXED_TEST_GUIDE.md) | Test trộn câu hỏi từ nhiều test | Tạo test custom |
| [ADDTESTFORM_USER_GUIDE.md](ADDTESTFORM_USER_GUIDE.md) | Admin tạo test mới | Admin quản lý test |
| [BATCH_UPLOAD_GUIDE.md](BATCH_UPLOAD_GUIDE.md) | Upload hàng loạt câu hỏi (CSV/JSON) | Admin import data |

**Flow tổng quan:**
```
User chọn test → Start → Answer questions → Submit
  ↓
Backend: Save UserTest + UserResults + QuestionStats
  ↓
Trigger: ML Update (background, non-blocking)
  ↓
Update MLPredictions table
  ↓
Next time: Fresh recommendations (<100ms)
```

---

## 🎵 MEDIA MANAGEMENT

| Tài liệu | Nội dung | Use Cases |
|----------|----------|-----------|
| [MEDIA_EDITING_DOCUMENTATION.md](MEDIA_EDITING_DOCUMENTATION.md) | Edit audio/image trong test | Admin sửa media |
| [MEDIA_API_RESPONSE_FORMAT.md](MEDIA_API_RESPONSE_FORMAT.md) | Format response API cho media | Developers |
| [MEDIA_UPDATE_SUMMARY.md](MEDIA_UPDATE_SUMMARY.md) | Summary các thay đổi media | Reference |
| [FRONTEND_MEDIA_HELPERS_GUIDE.md](FRONTEND_MEDIA_HELPERS_GUIDE.md) | Helper functions frontend | Frontend devs |

**Key Features:**
- 📁 Cloudinary integration
- ⏱️ Audio timing (startSecond, endSecond)
- 🖼️ Image upload & preview
- 🎧 Per-question audio (practice mode)

---

## 🛠️ TECHNICAL REFERENCES

| Tài liệu | Nội dung | Developers |
|----------|----------|-----------|
| [PATH_AUTO_FORMAT_INFO.md](PATH_AUTO_FORMAT_INFO.md) | Auto-format paths Windows/Linux | Backend |
| [CLEANUP_LOG.md](CLEANUP_LOG.md) | Log các thay đổi cleanup code | Reference |

---

## 📊 DATABASE SCHEMA

### **Core Tables**
- `Users` - User accounts
- `Tests` - Test definitions
- `Questions` - Question bank
- `UserTests` - User test sessions (exam + practice)
- `UserResults` - Per-question answers
- `QuestionStats` - Question statistics (for ML)

### **ML Tables (NEW)**
- ⭐ `MLPredictions` - Cached ML predictions (real-time)
- `MLPredictionHistory` - Prediction history (optional)

### **Media Tables**
- `MediaFiles` - Audio/image files
- `QuestionMediaMap` - Question-media relationships

### **Skill Tables**
- `Skills` - Skill definitions
- `QuestionSkills` - Question-skill mappings

---

## 🔄 DEVELOPMENT WORKFLOW

### **1. Setup mới**
```bash
# Clone repo
git clone https://github.com/hungpptit/chatbot-toeic.git
cd chatbot-toeic

# Backend
cd chatbot-toeic-backend
npm install
# Setup .env (DB_HOST, DB_USERNAME, DB_PASS, etc.)
npm run dev

# Frontend (new terminal)
cd chatbot-toeic-frontend
npm install
npm run dev
```

### **2. Thêm tính năng mới**
1. Đọc `SYSTEM_OVERVIEW.md` - Hiểu kiến trúc
2. Đọc `QUICK_REFERENCE.md` - Common tasks
3. Tham khảo tài liệu cụ thể theo feature
4. Code + Test
5. Update documentation (if needed)

### **3. Testing**
- Backend: Postman/cURL (`/api/...`)
- Frontend: Browser DevTools
- ML: Run Python script trực tiếp
- Database: SQL queries

### **4. Deployment**
- Docker: `docker compose up --build`
- Manual: `npm run build` + Setup PM2/systemd
- Database: Run migrations
- ML: Train models on prod server

---

## 🎯 COMMON TASKS

### **Admin Tasks**

| Task | Tài liệu | Steps |
|------|----------|-------|
| Tạo test mới | [ADDTESTFORM_USER_GUIDE.md](ADDTESTFORM_USER_GUIDE.md) | Admin panel → Add Test Form |
| Upload câu hỏi hàng loạt | [BATCH_UPLOAD_GUIDE.md](BATCH_UPLOAD_GUIDE.md) | Prepare CSV/JSON → Upload |
| Sửa audio/image | [MEDIA_EDITING_DOCUMENTATION.md](MEDIA_EDITING_DOCUMENTATION.md) | Edit Question → Upload new media |
| Train ML models | [UNIFIED_MODEL_GUIDE.md](UNIFIED_MODEL_GUIDE.md) | `python train_model.py` |

### **Developer Tasks**

| Task | Tài liệu | Steps |
|------|----------|-------|
| Add new API endpoint | [SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md) | Controller → Router → api.js |
| Add new database table | - | Create migration → Sequelize model → Associate |
| Optimize performance | [REAL_TIME_ML_SYSTEM.md](REAL_TIME_ML_SYSTEM.md) | Check caching strategy |
| Debug ML issues | [UNIFIED_MODEL_GUIDE.md](UNIFIED_MODEL_GUIDE.md) | Run Python script directly |

### **User Flow**

| Flow | Tài liệu | Description |
|------|----------|-------------|
| Làm bài test | [TEST_WORKFLOW_GUIDE.md](TEST_WORKFLOW_GUIDE.md) | Home → Select Test → Start → Submit |
| Xem kỹ năng yếu | [REAL_TIME_ML_SYSTEM.md](REAL_TIME_ML_SYSTEM.md) | Home → "Tạo ngay" → ML page |
| Luyện tập theo kỹ năng | [REAL_TIME_ML_SYSTEM.md](REAL_TIME_ML_SYSTEM.md) | ML page → "Bắt đầu luyện tập" → Practice mode |
| Review bài làm | [TEST_WORKFLOW_GUIDE.md](TEST_WORKFLOW_GUIDE.md) | History → Click userTestId → Review mode |

---

## 📝 CHANGELOG

### **November 1, 2025**
- ✅ Implemented Real-time ML System (database-backed)
- ✅ Added `MLPredictions` table + Sequelize model
- ✅ Created `ml_service.js` for background updates
- ✅ Updated `question_test_service.js` with triggers
- ✅ Frontend: `MLRecommendationsPage.tsx` + practice mode
- ✅ Cleaned up outdated documentation:
  - ❌ Removed `ML_WEB_INTEGRATION_GUIDE.md` (outdated)
  - ❌ Removed `ML_FILES_QUICK_ANSWER.md` (outdated)
  - ❌ Removed `ML_MODELS_USAGE_EXPLAINED.md` (outdated)
  - ✅ Replaced with `REAL_TIME_ML_SYSTEM.md` (complete guide)

### **October 2025**
- ✅ Media upload & editing
- ✅ Batch question upload
- ✅ Test workflow improvements

---

## 🔗 EXTERNAL RESOURCES

- **GitHub Repo**: https://github.com/hungpptit/chatbot-toeic
- **Demo**: https://hungptit.dev
- **Stack**: Node.js + React + SQL Server + Python (ML)
- **Cloud**: Azure SQL Database + Cloudinary (media)

---

## 📞 SUPPORT

**Questions?**
- Check relevant documentation first
- Backend issues: Check server logs
- Frontend issues: Check browser console
- ML issues: Run Python script directly
- Database issues: Check SQL queries

**Contributors:**
- Backend: Node.js (Express) + Sequelize
- Frontend: React + TypeScript + Vite
- ML: Python (scikit-learn) + Hybrid models
- Database: SQL Server (Azure)

---

**Last Updated:** November 1, 2025  
**Total Docs:** 15 files  
**Status:** ✅ Production Ready  

---

> **💡 Quick Navigation:**  
> - 🚀 New features → [REAL_TIME_ML_SYSTEM.md](REAL_TIME_ML_SYSTEM.md)  
> - 📝 Test workflow → [TEST_WORKFLOW_GUIDE.md](TEST_WORKFLOW_GUIDE.md)  
> - 🛠️ System architecture → [SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md)  
> - 🎯 Common tasks → [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

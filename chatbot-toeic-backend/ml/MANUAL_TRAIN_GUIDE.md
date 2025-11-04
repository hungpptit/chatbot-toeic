# 🛠️ HƯỚNG DẪN TRAIN THỦ CÔNG

Tài liệu chi tiết hướng dẫn train lại models sau khi xóa data hoặc khi cần update models.

---

## 📋 **KHI NÀO CẦN TRAIN THỦ CÔNG?**

✅ **BẮT BUỘC train lại khi:**
- Xóa hết data và import lại database
- Lần đầu setup project (chưa có model files)
- Models bị lỗi hoặc corrupted
- Muốn test ngay mà không đợi auto-retrain (6 tiếng/lần)

⚠️ **KHÔNG CẦN train thủ công khi:**
- Hệ thống đang chạy bình thường
- Auto-retrain đã hoạt động (mỗi 6 tiếng)
- Chỉ thêm vài users mới (auto-retrain sẽ lo)

---

## 🚀 **CÁCH 1: TRAIN NHANH (KHUYẾN NGHỊ)**

### **Bước 1: Mở Terminal trong thư mục backend**

```bash
# Windows PowerShell
cd D:\Chatbot_Toeic\chatbot-toeic-backend

# Hoặc Git Bash / CMD
cd /d/Chatbot_Toeic/chatbot-toeic-backend
```

### **Bước 2: Train cả 2 models**

```bash
# Train Global Model (30 giây)
python ml/train_model.py

# Train Unified Model (1-2 phút)
python ml/train_unified_model.py
```

### **Bước 3: Verify models đã tạo**

```bash
# Kiểm tra files model đã được tạo chưa
ls ml/model/

# Output mong đợi:
# weak_skill_model.pkl          ← Global model
# unified_model.pkl             ← Unified model
# unified_model_info.pkl        ← Metadata
```

### **✅ XONG! Hệ thống sẵn sàng hoạt động.**

---

## 🔍 **CÁCH 2: TRAIN CHI TIẾT (CÓ KIỂM TRA)**

### **Bước 1: Check database có data chưa**

```bash
cd D:\Chatbot_Toeic\chatbot-toeic-backend

# Xem tất cả skills trong DB
python ml/check_skills_distribution.py
```

**Output mong đợi:**
```
📊 Skills Distribution:
Skill 1 (Vocabulary): 500 questions
Skill 2 (Grammar): 450 questions
Skill 4 (Reading): 300 questions
Skill 6 (Listening): 250 questions

Total: 1500 questions across 4 skills
```

**Nếu không có output hoặc lỗi:**
- ❌ Database chưa có data → Import data trước
- ❌ Connection lỗi → Check .env file

---

### **Bước 2: Train Global Model**

```bash
python ml/train_model.py
```

**Output mong đợi:**
```
================================================================================
TRAIN GLOBAL MODEL - For users with <10 attempts per skill
================================================================================

📊 Loading data from database...
   Server: localhost\SQLEXPRESS
   Database: ChatbotToeic

📊 Data loaded:
   - Total users: 15
   - Total skills: 4
   - Total records: 245

📊 Training data:
   Features: ['attempts', 'correct', 'accuracy']
   Samples: 245
   Weak skills: 125 (51%)
   Strong skills: 120 (49%)

🤖 Training Naive Bayes model...

✅ Model trained successfully!

📊 Model evaluation:
   Accuracy: 0.78 (78%)
   Precision: 0.75
   Recall: 0.72
   F1-Score: 0.73

💾 Saving model...
   ✅ Model saved: ml/model/weak_skill_model.pkl

================================================================================
✅ TRAINING COMPLETE - Global Model Ready!
================================================================================
```

**Nếu gặp lỗi:**
- `ModuleNotFoundError: No module named 'sklearn'` → Chạy: `pip install scikit-learn pandas pyodbc`
- `Connection failed` → Check .env: `DB_SERVER`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD`
- `No data found` → Database chưa có UserResults/Questions

---

### **Bước 3: Train Unified Model**

```bash
python ml/train_unified_model.py
```

**Output mong đợi:**
```
================================================================================
TRAIN UNIFIED MODEL - One model for all users
================================================================================

📊 Loading data from database...

📊 Building user profiles...
   Users with data: 15

📊 Creating training data with 9 features:
   - userId_hash
   - user_level
   - total_tests
   - total_questions
   - overall_accuracy
   - days_active
   - attempts (skill-specific)
   - correct (skill-specific)
   - skill_accuracy (skill-specific)

📊 Training data:
   Samples: 245
   Features: 9
   Weak skills: 125 (51%)
   Strong skills: 120 (49%)

🤖 Training Unified Naive Bayes model...

✅ Model trained successfully!

📊 Model evaluation:
   Accuracy: 0.82 (82%)
   Precision: 0.80
   Recall: 0.77
   F1-Score: 0.78

💾 Saving models...
   ✅ Model saved: ml/model/unified_model.pkl
   ✅ Info saved: ml/model/unified_model_info.pkl

📊 Model info:
   Total users trained: 15
   Total samples: 245
   Accuracy: 82%
   Training time: 2025-11-04 10:30:45

================================================================================
✅ TRAINING COMPLETE - Unified Model Ready!
================================================================================
```

**Nếu gặp lỗi:**
- Tương tự như Global Model
- `Not enough data` → Cần ít nhất 5 users có ≥10 attempts

---

### **Bước 4: Test models đã hoạt động chưa**

#### **Test 4.1: Find user để test**

```bash
python ml/find_best_user.py
```

**Output:**
```
🔍 Finding users with most skills and attempts...

Top users for testing:
User 6: 3 skills, 160 attempts ← BEST
User 3: 3 skills, 96 attempts
User 7: 2 skills, 50 attempts

💡 Recommended: Use userId=6 for testing
```

#### **Test 4.2: Predict với user đó**

```bash
# Thay 6 bằng userId từ bước trên
python ml/predict_hybrid_unified.py 6
```

**Output mong đợi:**
```
================================================================================
USER 6 - WEAK SKILLS PREDICTION
================================================================================

📊 User Statistics:
   Total attempts: 160
   Total skills: 3
   Overall accuracy: 45%
   Strategy: UNIFIED MODEL (≥10 attempts)

📌 Weak Skills Detected:

1. Vocabulary (Skill 1):
   ├─ Attempts: 60
   ├─ Correct: 6
   ├─ Accuracy: 10.0%
   ├─ Status: ❌ WEAK
   ├─ Model: UNIFIED
   └─ Probability: 0.95

2. Grammar (Skill 2):
   ├─ Attempts: 8
   ├─ Correct: 2
   ├─ Accuracy: 25.0%
   ├─ Status: ❌ WEAK
   ├─ Model: GLOBAL (not enough attempts)
   └─ Probability: 0.88

================================================================================
✅ PREDICTION COMPLETE
================================================================================

📝 Recommendations: 30 questions total
```

**Nếu output này xuất hiện → Models hoạt động tốt! ✅**

---

## 🎯 **CÁCH 3: SCRIPT TRAIN ALL (1 LỆNH)**

### **Tạo script train_all.bat (Windows)**

```bash
# Tạo file train_all.bat
notepad train_all.bat
```

**Nội dung file:**
```batch
@echo off
echo ========================================
echo TRAINING ALL ML MODELS
echo ========================================
echo.

echo [1/2] Training Global Model...
python ml/train_model.py
if %errorlevel% neq 0 (
    echo ERROR: Global model training failed!
    pause
    exit /b 1
)
echo.

echo [2/2] Training Unified Model...
python ml/train_unified_model.py
if %errorlevel% neq 0 (
    echo ERROR: Unified model training failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo ALL MODELS TRAINED SUCCESSFULLY!
echo ========================================
pause
```

**Cách dùng:**
```bash
# Chỉ cần double-click file train_all.bat
# Hoặc chạy trong terminal:
.\train_all.bat
```

---

## 📊 **KIỂM TRA SAU KHI TRAIN**

### **Check 1: Model files đã tồn tại**

```bash
ls ml/model/

# Phải có 3 files:
# weak_skill_model.pkl          ← 50-200 KB
# unified_model.pkl             ← 100-300 KB
# unified_model_info.pkl        ← 1-5 KB
```

### **Check 2: Predict hoạt động**

```bash
# Test với userId=6 (hoặc userId khác có nhiều data)
python ml/predict_hybrid_unified.py 6

# Phải có output weak skills + recommendations
```

### **Check 3: Backend có nhận models không**

```bash
# Start backend
npm start

# Làm 1 bài test bất kỳ
# Check backend console:
# ✅ [Background] ML prediction completed for user 6
```

---

## ⚠️ **TROUBLESHOOTING**

### **Lỗi: `ModuleNotFoundError: No module named 'sklearn'`**

**Giải pháp:**
```bash
pip install scikit-learn pandas pyodbc python-dotenv
```

---

### **Lỗi: `Connection to database failed`**

**Giải pháp:**

1. Check file `.env` trong `chatbot-toeic-backend/`:
```env
DB_SERVER=localhost\\SQLEXPRESS
DB_DATABASE=ChatbotToeic
DB_USER=sa
DB_PASSWORD=sa
```

2. Test connection:
```bash
python -c "import pyodbc; print(pyodbc.drivers())"
```

3. Install SQL Server driver nếu chưa có:
   - Download: [ODBC Driver 17 for SQL Server](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)

---

### **Lỗi: `Not enough data to train`**

**Giải pháp:**

1. Check database có data chưa:
```bash
python ml/check_skills_distribution.py
```

2. Cần ít nhất:
   - Global model: ≥50 records (tổng tất cả users)
   - Unified model: ≥5 users có ≥10 attempts

3. Nếu chưa đủ → Import thêm data hoặc tạo test users

---

### **Lỗi: `File not found: weak_skill_model.pkl`**

**Giải pháp:**

1. Check thư mục `ml/model/` có tồn tại không:
```bash
mkdir ml/model
```

2. Train lại:
```bash
python ml/train_model.py
```

---

## 📝 **CHECKLIST SAU KHI TRAIN**

- [ ] File `weak_skill_model.pkl` đã được tạo (50-200 KB)
- [ ] File `unified_model.pkl` đã được tạo (100-300 KB)
- [ ] File `unified_model_info.pkl` đã được tạo (1-5 KB)
- [ ] Test predict với userId bất kỳ: `python ml/predict_hybrid_unified.py 6`
- [ ] Output có weak skills + recommendations
- [ ] Backend server chạy được (npm start)
- [ ] Làm test → Submit → Check backend console có log ML prediction

**Nếu tất cả đều ✅ → Hệ thống sẵn sàng! 🎉**

---

## 🤖 **AUTO-RETRAIN (Không cần làm gì sau này)**

Sau khi train thủ công lần đầu, hệ thống sẽ **tự động train lại** mỗi 6 tiếng:

- **Schedule:** 0h, 6h, 12h, 18h mỗi ngày
- **File:** `backend/cronJobs/mlRetrainCron.js`
- **Command:** `python ml/train_model.py`
- **Auto-start:** Khi backend server khởi động

**Bạn KHÔNG CẦN train thủ công nữa!** ✅

---

## 📚 **TÀI LIỆU LIÊN QUAN**

- `QUICK_START.md` - Commands nhanh
- `ML_FILES_README.md` - Giải thích tất cả files
- `SETUP_SUMMARY.md` - Tóm tắt setup
- `WHEN_TO_RETRAIN.md` - Khi nào cần retrain

---

**Last Updated:** 2025-11-04  
**Author:** AI Assistant  
**Purpose:** Hướng dẫn train thủ công sau khi xóa data

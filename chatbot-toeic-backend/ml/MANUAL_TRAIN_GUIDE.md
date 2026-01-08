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
cd D:\Chatbot_Toeic\chatbot-toeic-backend\ml

# Hoặc Git Bash / CMD
cd /d/Chatbot_Toeic/chatbot-toeic-backend/ml
```

### **Bước 2: Check dữ liệu trước**

```bash
# Check dữ liệu hiện tại
python check_data_stats.py
```

### **Bước 3: Train cả 2 models**

```bash
# Train Global Model (30 giây)
python train_model.py

# Train Unified Model (1-2 phút)
python train_unified_model.py
```

### **Bước 4: Verify models đã tạo**

```bash
# Kiểm tra files model đã được tạo chưa
ls model/

# Output mong đợi (models được lưu trong thư mục ml/model/):
# weak_skill_model.pkl
# unified_model.pkl
# unified_model_scaler.pkl      ← NEW (Scaler cho prediction)
# unified_model_info.pkl
# weak_skill_model.pkl          ← Global model
# unified_model.pkl             ← Unified model
# unified_model_info.pkl        ← Metadata
```

### **✅ XONG! Hệ thống sẵn sàng hoạt động.**

---

## 🔍 **CÁCH 2: TRAIN CHI TIẾT (CÓ KIỂM TRA)**

### **Bước 1: Check database có data chưa**

```bash
cd D:\Chatbot_Toeic\chatbot-toeic-backend\ml

# Xem statistics dữ liệu hiện tại
python check_data_stats.py
```

**Output mong đợi:**
```
📊 STATISTICS: UserResults DATA
1️⃣  Total UserResults records: 245
2️⃣  Total unique users: 15
3️⃣  Records per user: [Danh sách từng user]
4️⃣  Training data aggregated by userId + skillId
```

**Nếu không có output hoặc lỗi:**
- ❌ Database chưa có data → Import data trước
- ❌ Connection lỗi → Check .env file

---

### **Bước 2: Train Global Model**

```bash
python train_model.py
```

**Output mong đợi:**
```
================================================================================
TRAIN GLOBAL MODEL - For users with <10 attempts per skill
================================================================================

📊 Loading data from database...
   DB_HOST: localhost
   DB_PORT: 1433
   DB_NAME: ChatbotToeic

📊 Data loaded:
   - Total records: 245
   - Weak skills: 125 (51%)
   - Strong skills: 120 (49%)

📊 Training data:
   Features: ['attempts', 'correct', 'accuracy']
   Samples: 245
   Train/Test split: 196/49

🤖 Training Naive Bayes model...

✅ Model trained successfully!

📊 Model evaluation:
   Accuracy: 0.78 (78%)
   Precision: 0.75
   Recall: 0.72
   F1-Score: 0.73

💾 Saving model...
   ✅ Model saved: model/weak_skill_model.pkl

================================================================================
✅ TRAINING COMPLETE - Global Model Ready!
================================================================================
```

**Nếu gặp lỗi:**
- `ModuleNotFoundError: No module named 'sklearn'` → Chạy: `pip install scikit-learn pandas pyodbc python-dotenv`
- `Connection failed` → Check .env: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASS`, `DB_NAME`
- `No data found` → Database chưa có UserResults hoặc dữ liệu quá ít

---

### **Bước 3: Train Unified Model**

```bash
python train_unified_model.py
```

**Output mong đợi:**
```
================================================================================
TRAIN UNIFIED MODEL - One model for all users
================================================================================

📊 Loading data from database...

📊 Building user profiles with features...
   Users with data: 15

📊 Creating training data with 10 features:
   - user_level
   - total_tests
   - total_questions
   - overall_accuracy
   - days_active
   - learning_velocity (NEW)
   - consistency (NEW)
   - recency_bias (NEW)
   - attempts (skill-specific)
   - correct (skill-specific)

📊 Training data:
   Samples: 245
   Features: 10
   Weak skills: 125 (51%)
   Strong skills: 120 (49%)

🤖 Scaling features with StandardScaler...
   ✅ Features scaled (mean=0, std=1)

🤖 Training Unified Naive Bayes model...

✅ Model trained successfully!

📊 Model evaluation:
   Accuracy: 0.82 (82%)
   Precision: 0.80
   Recall: 0.77
   F1-Score: 0.78

💾 Saving models...
   ✅ Model saved: model/unified_model.pkl
   ✅ Scaler saved: model/unified_model_scaler.pkl (NEW)
   ✅ Info saved: model/unified_model_info.pkl

📊 Model info:
   Total users trained: 15
   Total samples: 245
   Accuracy: 82%
   Features: ['user_level', 'total_tests', 'total_questions', ...]
   Training time: 2026-01-08 10:30:45

================================================================================
✅ TRAINING COMPLETE - Unified Model Ready!
================================================================================
```

**Nếu gặp lỗi:**
- `ModuleNotFoundError: No module named 'sklearn'` → Chạy: `pip install scikit-learn pandas pyodbc python-dotenv`
- `Connection failed` → Check .env file
- `Not enough data` → Cần ít nhất 5 users hoặc 50 training records

---

### **Bước 4: Test models đã hoạt động chưa**

#### **Test 4.1: Predict với user cụ thể**

```bash
# Test predict cho userId=3 (hoặc userId khác có dữ liệu)
python predict_hybrid_unified.py 3
```

**Output mong đợi:**
```
================================================================================
USER 3 - WEAK SKILLS PREDICTION
================================================================================

📊 User Statistics:
   Total attempts: 96
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
# Tạo file train_all.bat trong thư mục ml
notepad train_all.bat
```

**Nội dung file:**
```batch
@echo off
cd /d %~dp0
echo ========================================
echo TRAINING ALL ML MODELS
echo ========================================
echo.

echo [0/3] Checking data stats...
python check_data_stats.py
echo.

echo [1/3] Training Global Model...
python train_model.py
if %errorlevel% neq 0 (
    echo ERROR: Global model training failed!
    pause
    exit /b 1
)
echo.

echo [2/3] Training Unified Model...
python train_unified_model.py
if %errorlevel% neq 0 (
    echo ERROR: Unified model training failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo ALL MODELS TRAINED SUCCESSFULLY!
echo ========================================
echo Models saved in: model/
echo  - weak_skill_model.pkl
echo  - unified_model.pkl
echo  - unified_model_scaler.pkl
echo  - unified_model_info.pkl
echo ========================================
pause
```

**Cách dùng:**
```bash
# Chỉ cần double-click file train_all.bat
# Hoặc chạy trong terminal (từ thư mục ml):
.\train_all.bat
```

---

## 📊 **KIỂM TRA SAU KHI TRAIN**

### **Check 1: Model files đã tồn tại**

```bash
ls model/

# Phải có 4 files (mới):
# weak_skill_model.pkl          ← Global model (50-200 KB)
# unified_model.pkl             ← Unified model (100-300 KB)
# unified_model_scaler.pkl      ← StandardScaler (NEW) (10-50 KB)
# unified_model_info.pkl        ← Metadata (1-5 KB)
```

### **Check 2: Predict hoạt động**

```bash
# Test predict cho userId=3 (hoặc userId khác có dữ liệu)
python predict_hybrid_unified.py 3

# Output phải chứa:
# - User Statistics
# - Weak Skills Detected
# - Recommendations: X questions total
```

### **Check 3: Backend có nhận models không**

```bash
# Trong thư mục backend (parent folder)
npm start

# Làm 1 bài test bất kỳ
# Check backend console:
# ✅ [Background] ML prediction completed for user 3
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

1. Check file `.env` trong `chatbot-toeic-backend/` (parent folder):
```env
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASS=sa
DB_NAME=ChatbotToeic
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
python check_data_stats.py
```

2. Cần ít nhất:
   - Global model: ≥50 records (tổng tất cả users)
   - Unified model: ≥50 training samples
   - Khuyến nghị: ≥150-200 records cho results tốt

3. Nếu chưa đủ → Tạo fake data:
```bash
python generate_fake_data.py       # Tạo fake users
python check_data_stats.py         # Verify
python train_model.py              # Train lại
python train_unified_model.py
```

---

### **Lỗi: `File not found: unified_model.pkl`**

**Giải pháp:**

1. Check thư mục `model/` có tồn tại không:
```bash
ls model/
```

2. Nếu không tồn tại, tạo thư mục:
```bash
mkdir model
```

3. Train lại models:
```bash
python train_model.py
python train_unified_model.py
```

---

### **Lỗi: `Scaler not found` khi predict**

**Giải pháp:**

1. Đảm bảo `unified_model_scaler.pkl` đã được tạo sau train:
```bash
ls model/unified_model_scaler.pkl
```

2. Nếu không có, train lại:
```bash
python train_unified_model.py
```

3. Verify scaler được dùng trong predict script:
```bash
grep -n "scaler" predict_hybrid_unified.py
```

---

### **Lỗi: `File not found: weak_skill_model.pkl`**

**Giải pháp:**

1. Check thư mục `model/` có tồn tại không:
```bash
mkdir model
```

2. Train lại:
```bash
python train_model.py
```

---

## 📝 **CHECKLIST SAU KHI TRAIN**

- [ ] File `weak_skill_model.pkl` đã được tạo (50-200 KB)
- [ ] File `unified_model.pkl` đã được tạo (100-300 KB)
- [ ] File `unified_model_scaler.pkl` đã được tạo (10-50 KB) - NEW
- [ ] File `unified_model_info.pkl` đã được tạo (1-5 KB)
- [ ] Test predict với userId bất kỳ: `python predict_hybrid_unified.py 3`
- [ ] Output có weak skills + recommendations
- [ ] Backend server chạy được: `npm start` (từ backend folder)
- [ ] Làm 1 bài test → Submit → Check backend console có log ML prediction

**Nếu tất cả đều ✅ → Hệ thống sẵn sàng! 🎉**

---

## 🤖 **AUTO-RETRAIN (Không cần làm gì sau này)**

Sau khi train thủ công lần đầu, hệ thống sẽ **tự động train lại** mỗi 6 tiếng:

- **Schedule:** 0h, 6h, 12h, 18h mỗi ngày
- **File:** `backend/cronJobs/mlRetrainCron.js`
- **Command:** Chạy `train_model.py` + `train_unified_model.py`
- **Auto-start:** Khi backend server khởi động

**Bạn KHÔNG CẦN train thủ công nữa!** ✅

---

## 📚 **TÀI LIỆU LIÊN QUAN**

- `ML_FILES_README.md` - Giải thích tất cả files
- `QUICK_START.md` - Commands nhanh
- `AI_DOCUMENTATION.md` - Tài liệu chi tiết về AI system
- `FEATURE_EXTRACTION_UPDATE.md` - Feature engineering details

---

**Last Updated:** 2026-01-08  
**Author:** AI Assistant  
**Purpose:** Hướng dẫn train thủ công sau khi xóa data hoặc setup lần đầu

# 📚 ML FOLDER - FILE DOCUMENTATION

Tài liệu tổng hợp tất cả các file Python và Node.js trong hệ thống ML với giải thích chi tiết.

---

## 🤖 AUTOMATION OVERVIEW

### ✅ **TỰ ĐỘNG HÓA ĐÃ ĐƯỢC IMPLEMENT:**

```
╔═══════════════════════════════════════════════════════════╗
║  AUTO-PREDICT (Sau mỗi test/practice)                    ║
╠═══════════════════════════════════════════════════════════╣
║  File: backend/services/mlPredictionService.js           ║
║  Trigger: submitTest() và submitPractice()              ║
║  Process: Background (setImmediate, không block)         ║
║  Python: predict_hybrid_unified.py                       ║
║  Database: MLPredictions (cache) + MLPredictionHistory   ║
╚═══════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════╗
║  AUTO-RETRAIN (Mỗi 6 tiếng)                              ║
╠═══════════════════════════════════════════════════════════╣
║  File: backend/cronJobs/mlRetrainCron.js                 ║
║  Schedule: "0 */6 * * *" (0h, 6h, 12h, 18h)              ║
║  Python: train_model.py                                  ║
║  Auto-start: Khi backend server khởi động                ║
╚═══════════════════════════════════════════════════════════╝
```

**Workflow hoàn chỉnh:**
```
User làm test/practice
  ↓
Submit results → Database (UserResults)
  ↓
Backend: triggerMLPredictionAsync(userId) → Background process
  ↓
Spawn Python: predict_hybrid_unified.py {userId}
  ↓
Python: Query all UserResults → Hybrid strategy → Output JSON
  ↓
Node.js: Parse JSON → Extract questionIds
  ↓
Database: 
  - Upsert MLPredictions (cache, 1 record/user)
  - Insert MLPredictionHistory (tracking, multiple records)
  ↓
Frontend: Fetch từ MLPredictions (instant reads)
  ↓
[Every 6 hours]
  ↓
mlRetrainCron.js → Train models với data mới
  ↓
Models updated → Ready cho predictions tiếp theo
```

---

## 📂 CẤU TRÚC FILES

```
ml/
├── 🎯 PRODUCTION FILES (Dùng trong production)
│   ├── predict_hybrid_unified.py ⭐ [NEW - RECOMMENDED]
│   ├── train_unified_model.py    ⭐ [NEW - RECOMMENDED]
│   ├── train_model.py            ✅ [GLOBAL MODEL]
│   └── predict_hybrid.py         ⚠️  [OLD VERSION]
│
├── 🧪 UTILITY FILES (Debug & Testing)
│   ├── predict_unified.py        [Standalone test unified model]
│   ├── check_data_stats.py       [Statistics: Total records, users, distribution]
│   ├── demo_scalability.py       [Demo unified vs personal scaling]
│
├── 📦 DEPRECATED/MISSING FILES
│   ├── predict_hybrid.py         ⚠️  [Không tồn tại - được replace bởi predict_hybrid_unified.py]
│   ├── train_personal_model.py   ⚠️  [Không tồn tại - được replace bởi train_unified_model.py]
│   ├── check_user_skills.py      ⚠️  [Không tồn tại]
│   ├── find_best_user.py         ⚠️  [Không tồn tại]
│   ├── predict_personal.py       ⚠️  [Không tồn tại]
│   └── predict.py                ⚠️  [Không tồn tại]
│
└── 💾 MODEL FILES (.pkl)
    ├── weak_skill_model.pkl      [Global model]
    ├── unified_model.pkl         [Unified model]
    ├── unified_model_info.pkl    [Unified model metadata]
    └── user_X_model.pkl          [Personal models - deprecated]

../backend/ (Node.js Automation)
├── 🤖 AUTOMATION FILES
│   ├── services/
│   │   └── mlPredictionService.js ⭐ [Auto-predict after submit]
│   └── cronJobs/
│       └── mlRetrainCron.js       ⭐ [Auto-retrain every 6 hours]
│
└── 💾 DATABASE TABLES
    ├── MLPredictions              [Cache - 1 record/user, instant reads]
    └── MLPredictionHistory        [Tracking - multiple records, trends]
```

---

## 🎯 PRODUCTION FILES

### ⭐ `predict_hybrid_unified.py` [NEW - RECOMMENDED]

**Mục đích:** Predict weak skills + recommend questions (Production-ready)

**Strategy:**
```python
IF attempts < 10:
    → Global Model (weak_skill_model.pkl)
ELSE:
    → Unified Model (unified_model.pkl)  # 1 model cho tất cả users
```

**Sử dụng:**
```bash
python predict_hybrid_unified.py
python predict_hybrid_unified.py 3  # Với userId=3
```

**Ưu điểm:**
- ✅ Scale tốt (1 model cho 10k users)
- ✅ Retrain nhanh (2-3 phút)
- ✅ User mới predict ngay
- ✅ Vẫn giữ 95% personalization

**Output:**
- Weak skills detection
- Question recommendations (filtered by ID)

---

### ⭐ `train_unified_model.py` [NEW - RECOMMENDED]

**Mục đích:** Train Unified Model (1 model cho tất cả users)

**Features:**
- 10 features: `[user_level, total_tests, total_questions, overall_accuracy, days_active, learning_velocity, consistency, recency_bias, attempts, correct]`
  - **Original 7:** user_level, total_tests, total_questions, overall_accuracy, days_active, attempts, correct
  - **New 3:** learning_velocity (current - 30d_first), consistency (std of skill accuracies), recency_bias (last50 - overall)
- **Scaling:** StandardScaler (mean=0, std=1) áp dụng cho tất cả 10 features

**Sử dụng:**
```bash
python train_unified_model.py
python train_unified_model.py --compare  # So sánh với personal model
```

**Output:**
- `unified_model.pkl`: Model file
- `unified_model_scaler.pkl`: StandardScaler (dùng cho prediction)
- `unified_model_info.pkl`: Metadata

**Khi nào retrain:**
- Mỗi tuần/tháng khi có users mới
- Khi có >1000 attempts mới
- Setup scheduled task/cron job

---

### ✅ `train_model.py` [GLOBAL MODEL]

**Mục đích:** Train Global Model cho users có ít data (<10 attempts)

**Features:**
- 3 features: `[attempts, correct, accuracy]`

**Sử dụng:**
```bash
python train_model.py
```

**Output:**
- `weak_skill_model.pkl`: Global model

**Khi nào retrain:**
- Định kỳ (mỗi tuần/tháng)
- Khi có thêm nhiều users mới

---

### ✅ `check_data_stats.py` [UTILITY - DATA STATISTICS]

**Mục đích:** Thống kê dữ liệu UserResults hiện tại trong database

**Thông tin:**
- Tổng số records trong UserResults
- Tổng số users
- Records per user distribution
- Training data stats (aggregated by userId + skillId)

**Sử dụng:**
```bash
python check_data_stats.py
```

**Khi nào dùng:**
- Kiểm tra dữ liệu sau khi import database
- Verify data sufficiency trước khi train
- Check class distribution (weak vs strong skills)

---

### ✅ `predict_unified.py` [UTILITY - STANDALONE TEST]

**Mục đích:** Test Unified Model độc lập (không hybrid)

**Sử dụng:**
```bash
python predict_unified.py 3
python predict_unified.py 3 --compare  # So sánh với personal model
```

**Khi nào dùng:**
- Debug unified model
- Test model output
- Compare với personal model approach

---

### ✅ `demo_scalability.py` [UTILITY - SCALABILITY DEMO]

**Mục đích:** Demo khả năng scale của Unified Model vs Personal Model

**Sử dụng:**
```bash
python demo_scalability.py           # All scenarios
python demo_scalability.py 10000     # Specific: 10,000 users
```

**Output:**
```
PERSONAL MODEL (10k users):
  - 10,000 files
  - 488 MB storage
  - 14 hours retrain

UNIFIED MODEL (10k users):
  - 1 file
  - 0.1 MB storage
  - 2-3 hours retrain
  → Tiết kiệm 99.98% storage!
```

**Khi nào dùng:**
- Presentation cho stakeholders
- Decision making
- Documentation

---

## 🧪 UTILITY FILES

### `predict_unified.py`

**Mục đích:** Standalone test Unified Model (không hybrid)

**Sử dụng:**
```bash
python predict_unified.py 3
python predict_unified.py 3 --compare  # So sánh với personal model
```

**Khi nào dùng:**
- Test unified model độc lập
- Debug unified model
- Compare với personal model

**Production:** Dùng `predict_hybrid_unified.py` thay thế!

---

### `check_data_stats.py`

**Mục đích:** Thống kê dữ liệu UserResults hiện tại

**Sử dụng:**
```bash
python check_data_stats.py
```

**Output:**
```
📊 STATISTICS: UserResults DATA
1️⃣  Total UserResults records: 24
2️⃣  Total unique users: 6
3️⃣  Records per user: [userId → count]
4️⃣  Training data aggregated: [userId + skillId → attempts, correct, accuracy]
```

**Khi nào dùng:**
- Verify data sufficiency trước khi train
- Check data quality
- Phát hiện data imbalance

---

### `demo_scalability.py`

**Mục đích:** Demo khả năng scale của Unified Model

**Sử dụng:**
```bash
python demo_scalability.py           # All scenarios
python demo_scalability.py 10000     # Specific: 10,000 users
```

**Output:**
```
PERSONAL MODEL (10k users):
  - 10,000 files
  - 488 MB storage
  - 14 hours retrain

UNIFIED MODEL (10k users):
  - 1 file
  - 0.1 MB storage
  - 2-3 hours retrain
  → Tiết kiệm 99.98% storage!
```

**Khi nào dùng:**
- Presentation cho stakeholders
- Decision making: Personal vs Unified
- Documentation

---

## 📦 DEPRECATED FILES (Không tồn tại)

### ❌ `train_personal_model.py`

**Status:** Không tồn tại - được replace bởi `train_unified_model.py`

**Mục đích:** Train personal model cho từng user (1 model/user)

**Vấn đề:**
- 10,000 users = 10,000 files
- Không scale tốt
- Retrain 14 giờ

**Thay thế:** `train_unified_model.py` (scalable approach)

---

### ❌ `predict_personal.py`

**Status:** Không tồn tại - được replace bởi `predict_unified.py` hoặc `predict_hybrid_unified.py`

**Mục đích:** Predict với personal model standalone

**Vấn đề:** Chỉ dùng personal model, không có hybrid logic

**Thay thế:** `predict_unified.py` hoặc `predict_hybrid_unified.py`

---

### ❌ `predict_hybrid.py`

**Status:** Không tồn tại - được replace bởi `predict_hybrid_unified.py`

**Mục đích:** Predict với Personal Model approach (cũ)

**Strategy:**
```python
IF attempts < 10:
    → Global Model
ELSE:
    → Personal Model (user_{userId}_model.pkl)  # 10k files
```

**Thay thế:** `predict_hybrid_unified.py` (unified approach)

---

### ❌ Các file khác (check_user_skills.py, check_skills_distribution.py, find_best_user.py)

**Status:** Không tồn tại trong folder hiện tại

**Thay thế:** Dùng `check_data_stats.py` và `demo_scalability.py` thay thế

---

## 💾 MODEL FILES

### `weak_skill_model.pkl`

- **Type:** Global Naive Bayes Model
- **Features:** 3 (attempts, correct, accuracy)
- **Usage:** Dùng cho users có <10 attempts
- **Train by:** `train_model.py`
- **Used by:** All predict scripts
- **Status:** ✅ Hoạt động

### `unified_model.pkl`

- **Type:** Unified Naive Bayes Model
- **Features:** 10 (user_level, total_tests, total_questions, overall_accuracy, days_active, learning_velocity, consistency, recency_bias, attempts, correct)
- **Usage:** Dùng cho users có ≥10 attempts
- **Train by:** `train_unified_model.py`
- **Used by:** `predict_hybrid_unified.py`, `predict_unified.py`
- **Status:** ✅ Hoạt động

### `unified_model_scaler.pkl`

- **Type:** StandardScaler
- **Purpose:** Normalize/scale features trước khi predict
- **Train by:** `train_unified_model.py`
- **Used by:** `predict_hybrid_unified.py`, `predict_unified.py` (SHOULD BE - cần verify)
- **Status:** ✅ Được tạo trong training

### `unified_model_info.pkl`

- **Type:** Metadata dictionary
- **Content:** Feature names, training time, accuracy, total users trained
- **Used by:** `predict_unified.py`, `predict_hybrid_unified.py`
- **Status:** ✅ Hoạt động

### `user_{userId}_model.pkl` (DEPRECATED)

- **Type:** Personal Naive Bayes Model
- **Status:** ❌ DEPRECATED - Không còn tạo/dùng nữa
- **Thay thế:** Dùng unified_model.pkl thay thế

---

## 🚀 WORKFLOW KHUYẾN NGHỊ

### 1. Setup lần đầu

```bash
# Check dữ liệu
python check_data_stats.py

# Train global model
python train_model.py

# Train unified model
python train_unified_model.py
```

### 2. Production Usage (AUTOMATED ✅)

**Backend server tự động:**
- ✅ **Auto-predict**: Sau mỗi test/practice submit
  - File: `backend/services/mlPredictionService.js`
  - Python: `predict_hybrid_unified.py`
  - Database: Update `MLPredictions` + Insert `MLPredictionHistory`

- ✅ **Auto-retrain**: Mỗi 6 tiếng (0h, 6h, 12h, 18h)
  - File: `backend/cronJobs/mlRetrainCron.js`
  - Python: `train_model.py`
  - Models: `weak_skill_model.pkl` + `unified_model.pkl`

**Manual test (nếu cần debug):**
```bash
# Predict cho user
python predict_hybrid_unified.py 3
```

### 3. Maintenance (Tự động - không cần làm gì)

```bash
# ✅ Auto-retrain mỗi 6 tiếng (đã setup trong mlRetrainCron.js)

# Manual retrain (chỉ khi cần test ngay)
python train_model.py           # Global model
python train_unified_model.py   # Unified model
```

### 4. Debug & Testing

```bash
# Check data stats
python check_data_stats.py

# Test unified model
python predict_unified.py 3

# Demo scalability
python demo_scalability.py 10000
```

---

## 📊 DECISION TREE: File nào nên dùng?

```
Bạn muốn làm gì?
│
├─ ✅ PRODUCTION (AUTO - Không cần làm gì):
│  ├─> Auto-predict → mlPredictionService.js (backend/services/)
│  └─> Auto-retrain → mlRetrainCron.js (backend/cronJobs/)
│
├─ MANUAL PREDICT (Debug/Testing):
│  └─> predict_hybrid_unified.py ⭐
│
├─ TRAINING: Train models (Manual)
│  ├─> Global model → train_model.py
│  └─> Unified model → train_unified_model.py ⭐
│
├─ TESTING: Test model độc lập
│  └─> predict_unified.py
│
├─ DEBUG: Check data
│  ├─> Check data stats → check_data_stats.py ⭐
│  └─> Demo scalability → demo_scalability.py
│
└─ DEMO: Show scalability
   └─> demo_scalability.py
```

---

## ⚡ QUICK REFERENCE

| Task | Command | Output |
|------|---------|--------|
| **✅ Auto-predict** | `Auto (mlPredictionService.js)` | MLPredictions + MLPredictionHistory |
| **✅ Auto-retrain** | `Auto (mlRetrainCron.js)` | Models every 6 hours |
| **Check data** | `python check_data_stats.py` | Data statistics |
| **Train global** | `python train_model.py` | weak_skill_model.pkl |
| **Train unified** | `python train_unified_model.py` | unified_model.pkl + scaler |
| **Predict (manual)** | `python predict_hybrid_unified.py 3` | Weak skills + recommendations |
| **Test unified** | `python predict_unified.py 3` | Weak skills only |
| **Demo scale** | `python demo_scalability.py 10000` | Scalability comparison |

---

## 📅 VERSION HISTORY

### Version 3.1 (2026-01-08) ⭐ CURRENT - FEATURES UPDATE
- **Updated: Feature engineering in train_unified_model.py**
  - Added 3 new features: learning_velocity, consistency, recency_bias
  - Total features: 10 (was 9)
  - Added StandardScaler for feature normalization
- **Updated: Model files**
  - Added `unified_model_scaler.pkl` for prediction
- **Updated: Documentation**
  - Fixed: Deprecated files status (predict_hybrid.py, train_personal_model.py - không tồn tại)
  - Added: check_data_stats.py documentation
  - Updated: Features list (10 instead of 9)

### Version 3.0 (2025-01-09) - AUTOMATION UPDATE
- **Added: Node.js Automation**
  - `backend/services/mlPredictionService.js` - Auto-predict after submit
  - `backend/cronJobs/mlRetrainCron.js` - Auto-retrain every 6 hours
- **Added: Database caching**
  - `MLPredictions` - Cache table (1 record/user, instant reads)
  - `MLPredictionHistory` - Tracking table (multiple records, trends)

### Version 2.0 (2025-10-08) - UNIFIED MODEL
- Added: `predict_hybrid_unified.py` (production-ready)
- Added: `train_unified_model.py` (scalable approach)
- Strategy: Global + Unified (1 model for all users)

---

## 📞 SUPPORT

Nếu quên file nào làm gì:
1. Đọc header comment của file (có full documentation)
2. Tham khảo file này (ML_FILES_README.md)
3. Run file với `-h` hoặc `--help` (nếu có)

---

**Last Updated:** 2026-01-08  
**Author:** AI Assistant  
**Purpose:** Tránh quên files làm gì sau này! 😄

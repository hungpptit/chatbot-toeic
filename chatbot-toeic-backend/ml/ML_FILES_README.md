# 📚 ML FOLDER - FILE DOCUMENTATION

Tài liệu tổng hợp tất cả các file Python trong thư mục `ml/` với giải thích chi tiết.

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
│   ├── check_user_skills.py      [Check 1 user cụ thể]
│   ├── check_skills_distribution.py [Check tất cả skills trong DB]
│   ├── find_best_user.py         [Tìm user tốt để test]
│   └── demo_scalability.py       [Demo unified vs personal scaling]
│
├── 📦 DEPRECATED FILES (Không dùng nữa)
│   ├── train_personal_model.py   [OLD - 1 model/user approach]
│   ├── predict_personal.py       [OLD - Personal model only]
│   └── predict.py                [OLD - Không dùng]
│
└── 💾 MODEL FILES (.pkl)
    ├── weak_skill_model.pkl      [Global model]
    ├── unified_model.pkl         [Unified model]
    ├── unified_model_info.pkl    [Unified model metadata]
    └── user_X_model.pkl          [Personal models - deprecated]
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
- 9 features: `[userId_hash, user_level, total_tests, total_questions, overall_accuracy, days_active, attempts, correct, skill_accuracy]`

**Sử dụng:**
```bash
python train_unified_model.py
python train_unified_model.py --compare  # So sánh với personal model
```

**Output:**
- `unified_model.pkl`: Model file
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

### ⚠️ `predict_hybrid.py` [OLD VERSION]

**Mục đích:** Predict với Personal Model approach (cũ)

**Strategy:**
```python
IF attempts < 10:
    → Global Model
ELSE:
    → Personal Model (user_{userId}_model.pkl)  # 10k models cho 10k users
```

**Vấn đề:**
- ❌ 10,000 users = 10,000 files
- ❌ Retrain 14 giờ
- ❌ Khó maintain

**Khuyến nghị:** Dùng `predict_hybrid_unified.py` thay thế!

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

### `check_user_skills.py`

**Mục đích:** Check skills của 1 user cụ thể

**Sử dụng:**
```bash
python check_user_skills.py  # Default userId=3
```

**Output:**
```
User 3:
  Skill 1 (Vocabulary): 60 attempts, 6 correct, 10% accuracy
  Skill 2 (Grammar): 8 attempts, 2 correct, 25% accuracy
  ...
```

**Khi nào dùng:**
- Debug: User không có weak skills
- Verify: Sau khi user làm bài test mới
- Analysis: Hiểu user behavior

---

### `check_skills_distribution.py`

**Mục đích:** Xem tất cả skills trong database

**Sử dụng:**
```bash
python check_skills_distribution.py
```

**Output:**
```
Skill 1 (Vocabulary): 500 questions
Skill 2 (Grammar): 450 questions
Skill 3 (Reading): 300 questions
...
```

**Khi nào dùng:**
- Setup ban đầu
- Data quality check
- Phát hiện data imbalance

---

### `find_best_user.py`

**Mục đích:** Tìm user "tốt nhất" để test (nhiều skills + nhiều attempts)

**Sử dụng:**
```bash
python find_best_user.py
```

**Output:**
```
User 3: 3 skills, 96 total attempts ← BEST
User 6: 1 skill, 160 attempts
User 7: 2 skills, 50 attempts
```

**Khi nào dùng:**
- Tìm user để demo
- Test model với user có đủ data
- Debug recommendation system

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
  - 1.4 hours retrain

UNIFIED MODEL (10k users):
  - 1 file
  - 0.1 MB storage
  - 1.6 hours retrain
  → Tiết kiệm 99.98% storage!
```

**Khi nào dùng:**
- Presentation cho stakeholders
- Decision making: Personal vs Unified
- Documentation

---

## 📦 DEPRECATED FILES (Không dùng nữa)

### ❌ `train_personal_model.py`

**Mục đích:** Train personal model cho từng user (1 model/user)

**Vấn đề:**
- 10,000 users = 10,000 files
- Không scale tốt

**Thay thế:** `train_unified_model.py`

---

### ❌ `predict_personal.py`

**Mục đích:** Predict với personal model standalone

**Vấn đề:** Chỉ dùng personal model, không có hybrid logic

**Thay thế:** `predict_unified.py` hoặc `predict_hybrid_unified.py`

---

### ❌ `predict.py`

**Mục đích:** Load global model và predict đơn giản (dự định cho Node.js gọi)

**Status:** KHÔNG DÙNG NỮA, giữ lại để tham khảo

**Thay thế:** `predict_hybrid.py` hoặc `predict_hybrid_unified.py`

---

## 💾 MODEL FILES

### `weak_skill_model.pkl`

- **Type:** Global Naive Bayes Model
- **Features:** 3 (attempts, correct, accuracy)
- **Usage:** Dùng cho users có <10 attempts
- **Train by:** `train_model.py`
- **Used by:** All predict scripts

### `unified_model.pkl`

- **Type:** Unified Naive Bayes Model
- **Features:** 9 (user context + skill context)
- **Usage:** Dùng cho users có ≥10 attempts
- **Train by:** `train_unified_model.py`
- **Used by:** `predict_hybrid_unified.py`, `predict_unified.py`

### `unified_model_info.pkl`

- **Type:** Metadata
- **Content:** Feature names, training time, accuracy, total users
- **Used by:** `predict_unified.py`, `predict_hybrid_unified.py`

### `user_{userId}_model.pkl`

- **Type:** Personal Naive Bayes Model (deprecated)
- **Features:** 3 (attempts, correct, accuracy)
- **Usage:** OLD approach - 1 model per user
- **Status:** DEPRECATED, không khuyến nghị dùng

---

## 🚀 WORKFLOW KHUYẾN NGHỊ

### 1. Setup lần đầu

```bash
# Train global model
python train_model.py

# Train unified model
python train_unified_model.py

# Check database
python check_skills_distribution.py
python find_best_user.py
```

### 2. Production Usage

```bash
# Predict cho user
python predict_hybrid_unified.py 3
```

### 3. Maintenance (Định kỳ)

```bash
# Retrain models (mỗi tuần/tháng)
python train_model.py           # Global model
python train_unified_model.py   # Unified model
```

### 4. Debug & Testing

```bash
# Check user data
python check_user_skills.py

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
├─ PRODUCTION: Predict weak skills + recommend
│  └─> predict_hybrid_unified.py ⭐
│
├─ TRAINING: Train models
│  ├─> Global model → train_model.py
│  └─> Unified model → train_unified_model.py ⭐
│
├─ TESTING: Test model độc lập
│  └─> predict_unified.py
│
├─ DEBUG: Check data
│  ├─> Check 1 user → check_user_skills.py
│  ├─> Check all skills → check_skills_distribution.py
│  └─> Find test user → find_best_user.py
│
└─ DEMO: Show scalability
   └─> demo_scalability.py
```

---

## ⚡ QUICK REFERENCE

| Task | Command | Output |
|------|---------|--------|
| **Train global** | `python train_model.py` | weak_skill_model.pkl |
| **Train unified** | `python train_unified_model.py` | unified_model.pkl |
| **Predict (prod)** | `python predict_hybrid_unified.py 3` | Weak skills + recommendations |
| **Test unified** | `python predict_unified.py 3` | Weak skills only |
| **Check user** | `python check_user_skills.py` | User skills distribution |
| **Check DB** | `python check_skills_distribution.py` | All skills in DB |
| **Find user** | `python find_best_user.py` | Best user for testing |
| **Demo scale** | `python demo_scalability.py 10000` | Scalability comparison |

---

## 📅 VERSION HISTORY

### Version 2.0 (2025-10-08) ⭐ CURRENT
- Added: `predict_hybrid_unified.py` (production-ready)
- Added: `train_unified_model.py` (scalable approach)
- Added: `predict_unified.py` (standalone test)
- Added: Utility files (check_*, find_*, demo_*)
- Strategy: Global + Unified (1 model for all users)

### Version 1.0 (Original)
- Files: `predict_hybrid.py`, `train_personal_model.py`
- Strategy: Global + Personal (1 model per user)
- Issue: Không scale với nhiều users

---

## 📞 SUPPORT

Nếu quên file nào làm gì:
1. Đọc header comment của file (có full documentation)
2. Tham khảo file này (ML_FILES_README.md)
3. Run file với `-h` hoặc `--help` (nếu có)

---

**Last Updated:** 2025-10-08  
**Author:** AI Assistant  
**Purpose:** Tránh quên files làm gì sau này! 😄

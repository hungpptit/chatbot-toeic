# 🚀 QUICK START GUIDE

Hướng dẫn nhanh sử dụng các files trong `ml/` folder.

---

## ⚡ TÓM TẮT 1 DÒNG

| File | 1 Dòng Mô Tả |
|------|--------------|
| **predict_hybrid_unified.py** ⭐ | Predict + recommend (Production) - Global + Unified strategy |
| **train_unified_model.py** ⭐ | Train unified model (1 model cho tất cả users) |
| **train_model.py** | Train global model (cho users ít data) |
| **predict_unified.py** | Test unified model standalone (không hybrid) |
| **predict_hybrid.py** ⚠️ | [OLD] Hybrid với personal model (1 model/user) |
| **check_user_skills.py** | Check skills của 1 user cụ thể |
| **check_skills_distribution.py** | Xem tất cả skills trong database |
| **find_best_user.py** | Tìm user tốt nhất để test |
| **demo_scalability.py** | Demo unified vs personal scaling |
| **train_personal_model.py** ❌ | [DEPRECATED] Train personal model |
| **predict_personal.py** ❌ | [DEPRECATED] Predict với personal model |
| **predict.py** ❌ | [DEPRECATED] Không dùng nữa |

---

## 📝 COMMANDS THƯỜNG DÙNG

```bash
# ═══════════════════════════════════════════════════════════
# 🎯 PRODUCTION (AUTO)
# ═══════════════════════════════════════════════════════════
# ✅ AUTO-PREDICT: Tự động chạy sau khi submit test/practice
#    - File: backend/services/mlPredictionService.js
#    - Trigger: submitTest() và submitPractice()
#    - Background: setImmediate() để không block response
#    - Cache: Update MLPredictions + Insert MLPredictionHistory
#
# ✅ AUTO-RETRAIN: Tự động train mỗi 6 tiếng
#    - File: backend/cronJobs/mlRetrainCron.js
#    - Schedule: 0h, 6h, 12h, 18h (cron: "0 */6 * * *")
#    - Command: python ml/train_model.py
#    - Auto-start: Khi backend server khởi động
# ═══════════════════════════════════════════════════════════

# MANUAL PREDICT (khi cần test)
python predict_hybrid_unified.py 3              # Predict cho userId=3

# MANUAL TRAINING (khi cần train ngay)
python train_model.py                           # Train global model
python train_unified_model.py                   # Train unified model

# DEBUG
python check_user_skills.py                     # Check 1 user
python find_best_user.py                        # Find test user
python check_skills_distribution.py             # Check all skills

# TESTING
python predict_unified.py 3                     # Test unified model
python demo_scalability.py 10000                # Demo scaling
```

---

## 🎯 DECISION FLOWCHART

```
Bạn muốn gì?
│
├─ ✅ AUTO (Production - Không cần làm gì):
│   ├─ Predict sau submit → mlPredictionService.js (auto)
│   └─ Train định kỳ → mlRetrainCron.js (6 tiếng/lần)
│
├─ MANUAL (Debugging/Testing):
│   ├─ Predict weak skills + recommend → predict_hybrid_unified.py ⭐
│   ├─ Train models → train_model.py + train_unified_model.py
│   ├─ Check data → check_user_skills.py / find_best_user.py
│   ├─ Test model → predict_unified.py
│   └─ Demo scaling → demo_scalability.py
│
└─ Database:
    ├─ MLPredictions → Cache (1 record/user, instant reads)
    └─ MLPredictionHistory → Tracking (multiple records, trends)
```

---

## 📂 FILES CẦN NHỚ

### ⭐ QUAN TRỌNG NHẤT (3 files Python + 2 files Node.js)

**Python (ML Core):**
1. **`predict_hybrid_unified.py`** - Production predict (called by Node.js)
2. **`train_unified_model.py`** - Train unified model
3. **`train_model.py`** - Train global model

**Node.js (Automation):**
4. **`backend/services/mlPredictionService.js`** - Auto-predict sau submit
5. **`backend/cronJobs/mlRetrainCron.js`** - Auto-train mỗi 6 tiếng

### 📚 TÀI LIỆU
- **`ML_FILES_README.md`** - Đọc khi quên files làm gì
- **`SETUP_SUMMARY.md`** - Tóm tắt những gì đã tạo
- **`WHEN_TO_RETRAIN.md`** - Khi nào cần train lại model

---

## 🔍 NẾU QUÊN...

**"File nào để predict?"**  
→ AUTO: `backend/services/mlPredictionService.js` (tự động sau submit)  
→ MANUAL: `predict_hybrid_unified.py` ⭐

**"File nào để train?"**  
→ AUTO: `backend/cronJobs/mlRetrainCron.js` (mỗi 6 tiếng)  
→ MANUAL: `train_unified_model.py` (unified) + `train_model.py` (global)

**"Auto-predict hoạt động thế nào?"**  
→ User làm test/practice → Submit → `triggerMLPredictionAsync(userId)`  
→ Background: spawn Python `predict_hybrid_unified.py`  
→ Parse JSON → Upsert `MLPredictions` + Insert `MLPredictionHistory`

**"Auto-retrain hoạt động thế nào?"**  
→ Backend server start → Load `mlRetrainCron.js`  
→ Cron schedule "0 */6 * * *" (0h, 6h, 12h, 18h)  
→ Spawn Python `train_model.py` → Train models → Save to `ml/model/`

**"Database nào lưu predictions?"**  
→ `MLPredictions`: Cache (1 record/user, upsert, instant reads)  
→ `MLPredictionHistory`: Tracking (multiple records, insert only)

**"Tại sao có 2 file predict_hybrid?"**  
→ `predict_hybrid.py` = OLD (personal model)  
→ `predict_hybrid_unified.py` = NEW (unified model) ⭐

**"File nào deprecated?"**  
→ `train_personal_model.py`, `predict_personal.py`, `predict.py` ❌

**"Quên hết rồi, đọc file nào?"**  
→ `ML_FILES_README.md` 📚

---

**Last Updated:** 2025-01-09 (Added auto-retrain and auto-predict info)

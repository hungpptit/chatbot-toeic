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
# PRODUCTION
python predict_hybrid_unified.py 3              # Predict cho userId=3

# TRAINING
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
├─ Predict weak skills + recommend → predict_hybrid_unified.py ⭐
├─ Train models → train_model.py + train_unified_model.py
├─ Check data → check_user_skills.py / find_best_user.py
├─ Test model → predict_unified.py
└─ Demo scaling → demo_scalability.py
```

---

## 📂 FILES CẦN NHỚ

### ⭐ QUAN TRỌNG NHẤT (3 files)
1. **`predict_hybrid_unified.py`** - Production predict
2. **`train_unified_model.py`** - Train unified model
3. **`train_model.py`** - Train global model

### 📚 TÀI LIỆU
- **`ML_FILES_README.md`** - Đọc khi quên files làm gì
- **`SETUP_SUMMARY.md`** - Tóm tắt những gì đã tạo

---

## 🔍 NẾU QUÊN...

**"File nào để predict?"**  
→ `predict_hybrid_unified.py` ⭐

**"File nào để train?"**  
→ `train_unified_model.py` (unified) + `train_model.py` (global)

**"Tại sao có 2 file predict_hybrid?"**  
→ `predict_hybrid.py` = OLD (personal model)  
→ `predict_hybrid_unified.py` = NEW (unified model) ⭐

**"File nào deprecated?"**  
→ `train_personal_model.py`, `predict_personal.py`, `predict.py` ❌

**"Quên hết rồi, đọc file nào?"**  
→ `ML_FILES_README.md` 📚

---

**Last Updated:** 2025-10-08

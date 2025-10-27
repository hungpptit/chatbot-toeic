# 🎯 ML FILES - QUICK ANSWER

> **Trả lời nhanh: File nào train? File nào demo trên web?**

---

## 📊 **FILES TRAIN (Chạy định kỳ - offline)**

```bash
cd chatbot-toeic-backend/ml

# 1️⃣ Train Global Model (cho users mới)
python train_model.py
# Output: weak_skill_model.pkl

# 2️⃣ Train Unified Model (cho users có data)
python train_unified_model.py  
# Output: unified_model.pkl, unified_model_info.pkl
```

**Khi nào chạy:**
- Lần đầu setup
- Mỗi tuần/tháng (cron job)
- Khi có data mới

---

## 🚀 **FILE DEMO TRÊN WEB (Production)**

```bash
cd chatbot-toeic-backend/ml

# ⭐⭐⭐ FILE DUY NHẤT CHO WEB
python predict_hybrid_unified.py <userId>

# Ví dụ:
python predict_hybrid_unified.py 3
```

**File này làm gì:**
✅ Phát hiện weak skills của user  
✅ Gợi ý câu hỏi phù hợp  
✅ Tự động chọn model (Global hoặc Unified)  
✅ Return JSON để frontend hiển thị

**Output mẫu:**
```json
{
    "userId": 3,
    "weakSkills": [
        {
            "skillName": "Vocabulary",
            "accuracy": 10.5,
            "status": "WEAK"
        }
    ],
    "recommendations": [
        {
            "questionId": 123,
            "question": "Choose the correct word..."
        }
    ]
}
```

---

## 🔌 **TÍCH HỢP VÀO WEB**

### **Backend API (Đã tạo sẵn ✅)**

```javascript
// File: src/controllers/ml_recommendation_controller.js
// File: src/routes/ml_router.js

// API Endpoint:
GET /api/ml/recommend/:userId

// Usage:
const response = await fetch('http://localhost:8080/api/ml/recommend/3');
const data = await response.json();
```

### **Frontend Component (Đã tạo sẵn ✅)**

```tsx
// File: src/components/MLRecommendations.tsx
// File: src/services/mlRecommendation_services.ts

// Usage trong page:
import MLRecommendations from '../components/MLRecommendations';

<MLRecommendations userId={3} />
```

---

## 📋 **SUMMARY TABLE**

| File | Mục đích | Khi nào dùng | Chạy ở đâu |
|------|----------|--------------|------------|
| `train_model.py` | Train Global Model | Định kỳ (tuần/tháng) | Server (offline) |
| `train_unified_model.py` | Train Unified Model | Định kỳ (tuần/tháng) | Server (offline) |
| **`predict_hybrid_unified.py`** ⭐ | **Predict cho web** | **Mỗi khi user request** | **Backend API** |

---

## 🎯 **WORKFLOW**

```
1. OFFLINE (1 lần/tuần):
   └─> python train_model.py
   └─> python train_unified_model.py
   
2. ONLINE (mỗi khi user vào web):
   └─> Frontend call API: /api/ml/recommend/3
   └─> Backend spawn: python predict_hybrid_unified.py 3
   └─> Return JSON → Frontend hiển thị
```

---

## 🚀 **NEXT STEPS**

1. **Test Python script:**
   ```bash
   cd chatbot-toeic-backend/ml
   python predict_hybrid_unified.py 3
   ```

2. **Test Backend API:**
   ```bash
   # Start backend
   cd chatbot-toeic-backend
   npm run dev
   
   # Test với Postman:
   GET http://localhost:8080/api/ml/recommend/3
   ```

3. **Add vào Frontend:**
   ```tsx
   // Trong Home.tsx hoặc trang riêng
   import MLRecommendations from '../components/MLRecommendations';
   
   <MLRecommendations userId={userId} />
   ```

---

## 📚 **TÀI LIỆU CHI TIẾT**

- **`ML_WEB_INTEGRATION_GUIDE.md`** - Hướng dẫn tích hợp đầy đủ
- **`ml/ML_FILES_README.md`** - Giải thích tất cả ML files
- **`SYSTEM_OVERVIEW.md`** - Kiến trúc tổng thể

---

**Câu trả lời ngắn gọn:**

✅ **Train:** `train_model.py` + `train_unified_model.py` (offline)  
✅ **Demo Web:** `predict_hybrid_unified.py` (production)

---

**Last Updated:** October 27, 2025

# 📊 PHÂN TÍCH SO SÁNH BÁO CÁO VỚI HỆ THỐNG THỰC TẾ
## Chatbot TOEIC System - Report Validation

---

## ✅ PHẦN ĐÚNG VỚI HỆ THỐNG

### 1. **Công nghệ Frontend** ✅
**Báo cáo nói:**
- ReactJS version 18
- Next.js version 14
- TypeScript

**Thực tế hệ thống:**
```json1. Hệ thống đề xuất sản phẩm cho người dùng dựa trên hành vi của một người dùng khác.
Thu thập và xử lý dữ liệu (LSTM cho gợi ý bài hát cá nhân hóa)
-	ListeningHistory(HistoryID, UserID, TrackID, listenCount, createdAt, …): dữ liệu chuỗi nghe theo thời gian – lõi để huấn luyện LSTM.
-	Tracks(TrackID, trackUrl, imageUrl, uploaderId, Status, Privacy, …): kho bài hát làm tập mục tiêu dự đoán; chỉ lấy Track có Status=Active và Privacy=Public.
-	Users(UserID, …): dùng để gắn chuỗi nghe với người dùng; có thể rút user embedding nếu cần.
-	Likes(LikeID, UserID, TrackID, …): tín hiệu dương tính để tăng trọng số mẫu (optional).
-	Metadata(Track_id, …): đặc trưng nội dung (tempo, valence, energy…) dùng làm side features để cải thiện cold-start.
-	Playlists / PlaylistTrack: có thể gom thành phiên nghe (session) bổ sung.
-	SearchHistory: dùng để bias theo ý định gần đây (optional).
Dạng dữ liệu đầu vào cho model (sequence):
•	Hàng (rows): mỗi hàng là một chuỗi nghe của một User (hoặc một phiên nghe).
•	Cột (timesteps): thứ tự TrackID theo createdAt (gần → xa hoặc ngược lại).
•	Giá trị: là mã Track (đã ánh xạ sang chỉ số), có thể kèm vector đặc trưng bài từ Metadata.
•	Nhãn (label): bài kế tiếp trong chuỗi (next-item).
•	Với mỗi chuỗi [t₁, t₂, t₃, …, tₙ], sinh các mẫu trượt:
o	Input: [t₁, t₂] → Label: t₃
o	Input: [t₁, t₂, t₃] → Label: t₄, …
Ví dụ (rút gọn) cho User U1:
ListeningHistory theo thời gian: [A, B, C, D]
Sinh mẫu: ( [A]→B ), ( [A,B]→C ), ( [A,B,C]→D ).
Nếu có Metadata, tại mỗi timestep nối embedding bài từ Metadata vào embedding TrackID.
Tiền xử lý quan trọng:
•	Lọc mục tiêu: loại Track không hợp lệ (Status≠Active hoặc Privacy≠Public).
•	Reindex: ánh xạ TrackID → index liên tục [0..V-1].
•	Cắt/đệm: chuẩn hoá độ dài chuỗi (padding/truncation).
•	Sampling: bỏ bớt lặp lại quá dày; negative sampling (lấy vài track không phải nhãn) cho huấn luyện sampled-softmax.
•	Tách tập theo thời gian: Train ≤ T-1, Validate/Test = (T).
Mô hình LSTM cho gợi ý bài hát
Ý tưởng: LSTM học phụ thuộc theo trình tự để dự đoán bài tiếp theo mà người dùng có khả năng nghe.
Kiến trúc điển hình:
1.	Embedding Track: ma trận E ∈ ℝ^(V×d), ánh xạ TrackIndex → vector d-chiều.
2.	(Tuỳ chọn) Embedding User: nếu muốn cá nhân hoá sâu hơn.
3.	(Tuỳ chọn) Side features: đặc trưng từ Metadata (tempo, valence, energy, …) → qua MLP nhỏ rồi concatenate với track embedding tại mỗi bước.
4.	LSTM/GRU (1–2 lớp): nhận chuỗi embedding, trả hidden state.
5.	Projection + Softmax: cho phân phối xác suất trên tập bài hát; dùng sampled softmax/candidate softmax nếu V lớn.
6.	Loss: cross-entropy với nhãn là track kế tiếp.
7.	Regularization: dropout, weight decay; time-decay tăng trọng số cho sự kiện mới.
Công thức tóm tắt:
•	Input tại bước t: xₜ = concat(Emb(trackₜ), SideFeatₜ).
•	hₜ = LSTM(xₜ, hₜ₋₁).
•	p(next = j | hₜ) = softmax(W·hₜ + b)[j].
•	Tối ưu: −∑logp(trackt+1|ht)
Suy luận (dự đoán)
Bài toán thực tế: dự đoán Top-K bài cho User U tại thời điểm t.
•	Lấy chuỗi gần nhất của U từ ListeningHistory (ví dụ 50 bản ghi mới nhất).
•	Biến đổi → tensor, đưa vào LSTM lấy hₜ.
•	Sinh ứng viên (candidate generation): 500–2000 bài (mới phổ biến, cùng nghệ sĩ/genre, bài từ Playlists người dùng tương tự, hoặc từ Likes).
•	Chấm điểm: p(j | hₜ) với j thuộc tập ứng viên (nhanh, giảm độ trễ).
•	Trả kết quả: Top-K (songId, score) chỉ gồm Track hợp lệ (Active/Public).
Định dạng API gợi ý (ví dụ):
•	Input: GET /api/recommend?user_id=U1&k=10
•	Output:
{
  "user_id": "U1",
  "items": [
    {"track_id":"C","score":0.82},
    {"track_id":"E","score":0.77},
    ...
  ]
}
Đánh giá (trên dữ liệu hệ thống)
•	Tập test: tách theo mốc thời gian (giữ tuần/tháng gần nhất).
•	Chỉ số: Recall@K, NDCG@K, HitRate@K, MRR.
•	Baseline: Top-popular theo thời gian, hoặc Item-CF.
•	Online: theo dõi CTR thẻ gợi ý, thời lượng nghe sau click, skip rate.
Ví dụ “dự đoán bài kế tiếp” (minh họa)
Giả sử chuỗi gần nhất của U1: [A, B, C].
Model LSTM cho p(next | [A,B,C]) trên tập ứng viên {C, D, E, F…}:
•	p(D) = 0.41, p(E) = 0.33, p(F) = 0.17, p(C) = 0.09 → Top-3: D, E, F.
Nếu U1 Like nghệ sĩ của E gần đây (từ Likes), có thể re-rank:
•	final_score = 0.8·p + 0.2·bonus_like → E có thể nhảy lên Top-1.
Kết luận
•	LSTM tận dụng trật tự thời gian trong ListeningHistory để học gu ngắn hạn lẫn dài hạn, từ đó gợi ý bài kế tiếp phù hợp hơn so với ma trận tĩnh.
•	Việc kết hợp Metadata (tempo, valence, energy, …) làm side features giúp giải quyết cold-start và tăng khả năng giải thích.
•	Triển khai thực tế cần candidate generation để bảo đảm độ trễ thấp, cùng cơ chế fine-tune định kỳ để thích ứng thói quen nghe mới

// chatbot-toeic-frontend/package.json
"react": "^18.3.1"
"next": "14.2.5"
"typescript": "^5"
```
✅ **ĐÚNG HOÀN TOÀN**

---

### 2. **Công nghệ Backend** ✅
**Báo cáo nói:**
- Node.js 20 LTS
- ExpressJS
- JWT Authentication

**Thực tế hệ thống:**
```javascript
// chatbot-toeic-backend sử dụng:
- Node.js 20.x
- Express ^4.21.1
- jsonwebtoken ^9.0.2
```
✅ **ĐÚNG HOÀN TOÀN**

---

### 3. **Database SQL Server** ✅
**Báo cáo nói:**
- SQL Server
- Sequelize ORM
- MSSQL

**Thực tế hệ thống:**
```javascript
// src/models/index.js
dialect: 'mssql'
sequelize: ^6.37.5
```
✅ **ĐÚNG HOÀN TOÀN**

---

### 4. **Cấu trúc Database Tables** ✅
**Báo cáo liệt kê các bảng:**
- Users, Conversations, Messages, Logs
- Vocabulary, Pronunciations, Synonyms, Antonyms, Meanings
- Tests, Courses, Questions, QuestionType, Part
- MediaFiles, QuestionMediaMap
- UserResults, UserTests, UserVocabulary
- QuestionStats, QuestionEmbeddings, QuestionSkills, Skills

**Thực tế hệ thống:**
```javascript
// src/models/ có đầy đủ các file:
Users.js, Conversations.js, Message.js, Logs.js
Vocabulary.js, Pronunciations.js, synonym.js, antonym.js, meaning.js
Tests.js, Courses.js, Questions.js, QuestionType.js, Part.js
MediaFiles.js, QuestionMediaMap.js
UserResults.js, UserTests.js, UserVocabulary.js
QuestionStats.js, QuestionEmbeddings.js, QuestionSkills.js, skill.js
```
✅ **ĐÚNG 100% - TẤT CẢ CÁC BẢNG ĐỀU TỒN TẠI**

---

## ⚠️ PHẦN CHƯA CHÍNH XÁC / THIẾU

### 1. **AI và Machine Learning** ⚠️

**Báo cáo nói:**
> "Áp dụng các giải thuật học máy Naïve Bayes và k-Nearest Neighbors (kNN)"
> "Python 3.12 để hiện thực Naïve Bayes và kNN"

**Thực tế hệ thống:**
```python
# DISCOVERED: chatbot-toeic-backend/ml/ folder EXISTS!
# ✅ train_model.py - GaussianNB implementation
# ✅ predict.py - Global predictions
# ✅ train_personal_model.py - Per-user models
# ✅ predict_personal.py - Personal predictions
# ✅ predict_hybrid.py - Hybrid global+personal system
# ✅ weak_skill_model.pkl, user_3_model.pkl, user_6_model.pkl, user_7_model.pkl
# ✅ findSimilar.js - Semantic similarity (all-MiniLM-L6-v2 Transformers)
```

✅ **ĐÃ TRIỂN KHAI (Naïve Bayes + kNN)** - Report is CORRECT!

**Evidence:**
- ✅ **Naïve Bayes**: `sklearn.naive_bayes.GaussianNB` in `train_model.py` - Weak skill classification
- ✅ **kNN**: `findSimilar.js` with cosine similarity - Find k-nearest questions (semantic similarity)
- ✅ ML system MORE ADVANCED than reported: personal models, hybrid predictions, Transformers embeddings
- ⚠️ **NO Express API endpoints found** - Python scripts exist but no REST routes calling them yet

**kNN Implementation:**
```javascript
// findSimilar.js implements k-Nearest Neighbors
function findSimilar(input, k = 5) {
  // 1. Get embedding for anchor question
  // 2. Calculate cosine similarity with all questions
  // 3. Sort by similarity score (descending)
  // 4. Return top-k nearest neighbors
}
```

---

### 2. **NLP và Chatbot AI** ⚠️

**Báo cáo nói:**
> "Tích hợp Gemini API của Google DeepMind"
> "OpenAI API cho chatbot và trợ lý học tập"

**Thực tế hệ thống:**
```javascript
// Có Conversations và Messages models
// Nhưng chưa thấy integration với Gemini/OpenAI API
// File testGemini.js tồn tại nhưng chưa integrate vào main app
```

⚠️ **ĐANG PHÁT TRIỂN** - Có infrastructure (Conversations, Messages) nhưng chưa kết nối AI

---

### 3. **Chức năng "Gợi ý kỹ năng cần ôn luyện"** ⚠️

**Báo cáo nói:**
> "Gợi ý cho người học các kỹ năng tiếng Anh cần ôn luyện dựa trên kết quả làm bài"

**Thực tế hệ thống:**
```javascript
// ✅ QuestionStats, QuestionSkills, Skills tables exist
// ✅ UserResults, UserTests tracking implemented
// ✅ ML LOGIC EXISTS: ml/predict_hybrid.py
// ⚠️ NO Express API endpoints yet - ML scripts standalone
```

✅ **ĐÃ TRIỂN KHAI (ML Backend)** - Infrastructure complete + Python ML scripts exist, but NOT YET integrated into Node.js API

---

### 4. **Phần "Xem và Mua Khóa Học"** ⚠️

**Báo cáo nói:**
> "Tích hợp cổng thanh toán (VNPay, Momo, PayPal)"

**Thực tế hệ thống:**
```javascript
// Có Courses model
// Có Test_Courses relationship
// NHƯNG: Không thấy payment gateway integration
```

❌ **CHƯA TRIỂN KHAI** - Chức năng mua khóa học chưa có

---

### 5. **Chức năng "2FA Authentication"** ⚠️

**Báo cáo nói:**
> "Hỗ trợ chức năng đăng nhập an toàn (bao gồm xác thực 2 lớp – 2FA)"

**Thực tế hệ thống:**
```javascript
// Có JWT authentication
// NHƯNG: Không thấy 2FA implementation
```

❌ **CHƯA TRIỂN KHAI**

---

### 6. **Login Social Media** ⚠️

**Báo cáo nói:**
> "Đăng nhập bằng Google/Facebook"

**Thực tế hệ thống:**
```javascript
// Có login/signup controllers
// NHƯNG: Chỉ có email/password authentication
// Không thấy OAuth integration
```

❌ **CHƯA TRIỂN KHAI**

---

## 🆕 PHẦN CÓ TRONG CODE NHƯNG KHÔNG CÓ TRONG BÁO CÁO

### 1. **Mixed Test Feature** ✅ (Mới nhất)

**Thực tế hệ thống:**
```typescript
// AdminMixTestForm.tsx - Tạo đề thi Mixed (Reading + Listening)
// Mixed mode với global audio cho Listening
// Individual Part selection per question
```

📝 **CẦN BỔ SUNG VÀO BÁO CÁO** - Đây là feature mới, chưa có trong báo cáo

---

### 2. **Advanced Media System** ✅

**Thực tế hệ thống:**
```javascript
// MediaFiles với audio timing (startSecond, endSecond)
// QuestionMediaMap với sortOrder
// Batch upload từ local paths
// Auto-upload to Cloudinary
```

📝 **CẦN BỔ SUNG VÀO BÁO CÁO** - Phức tạp hơn mô tả trong báo cáo

---

### 3. **Question Embeddings & Stats** ✅

**Thực tế hệ thống:**
```javascript
// QuestionEmbeddings - Vector embeddings cho AI similarity search
// QuestionStats - Track attempts, correct rate, median time
// Auto-create QuestionStat sau khi tạo Question
```

📝 **CẦN BỔ SUNG VÀO BÁO CÁO** - Advanced features cho AI/ML

---

### 4. **Soft Delete cho Conversations** ✅

**Thực tế hệ thống:**
```javascript
// Conversations.js: paranoid: true, deletedAt field
// Soft delete thay vì hard delete
```

📝 **CẦN BỔ SUNG VÀO BÁO CÁO** - Detail implementation

---

## 📊 TÓM TẮT ĐÁNH GIÁ

### **Tỷ lệ khớp với báo cáo:**

| Phần | Trạng thái | Tỷ lệ hoàn thành |
|------|------------|------------------|
| **Frontend (React/Next.js)** | ✅ Hoàn thành | 100% |
| **Backend (Node/Express)** | ✅ Hoàn thành | 100% |
| **Database (SQL Server)** | ✅ Hoàn thành | 100% |
| **Authentication (JWT)** | ✅ Hoàn thành | 90% (thiếu 2FA, OAuth) |
| **Tests & Questions System** | ✅ Hoàn thành | 100% |
| **Media System** | ✅ Hoàn thành | 100% |
| **Vocabulary System** | ✅ Hoàn thành | 100% |
| **Chatbot Infrastructure** | ⚠️ Đang phát triển | 60% (có DB, thiếu AI) |
| **ML Recommendations** | ✅ Implemented (Python only) | 70% |
| **Payment Gateway** | ❌ Chưa triển khai | 0% |
| **Social Login** | ❌ Chưa triển khai | 0% |

### **Tổng quan:**
- **✅ Đã triển khai:** 7/11 modules (63%)
- **⚠️ Đang phát triển:** 1/11 modules (9%)
- **❌ Chưa triển khai:** 2/11 modules (18%) - Payment Gateway, Social Login

---

## 🧠 PHẦN BỔ SUNG: CHI TIẾT ML IMPLEMENTATION

### **Machine Learning System Architecture**

#### ✅ **Discovered Files:**
```
chatbot-toeic-backend/ml/
├── train_model.py              # Global weak skill model training
├── train_personal_model.py     # Personal user model training
├── predict.py                  # Global predictions
├── predict_personal.py         # Personal predictions  
├── predict_hybrid.py           # Hybrid prediction system
├── weak_skill_model.pkl        # Trained global model
├── user_3_model.pkl           # Personal model for user 3
├── user_6_model.pkl           # Personal model for user 6
└── user_7_model.pkl           # Personal model for user 7

chatbot-toeic-backend/
└── findSimilar.js             # Semantic similarity (Node.js)
```

#### ✅ **Implementation Details:**

**1. Global Model (`train_model.py`):**
- **Algorithm:** `sklearn.naive_bayes.GaussianNB`
- **Features:** attempts, correct, accuracy
- **Training Query:**
  ```sql
  SELECT ur.userId, qs.skillId, 
         COUNT(*) AS attempts,
         SUM(CASE WHEN ur.isCorrect = 1 THEN 1 ELSE 0 END) AS correct,
         accuracy, isWeak
  FROM UserResults ur
  JOIN QuestionSkills qs ON ur.questionId = qs.questionId
  GROUP BY ur.userId, qs.skillId
  ```
- **Classification Threshold:** accuracy < 0.6 → isWeak = 1
- **Output:** `weak_skill_model.pkl`

**2. Personal Models (`train_personal_model.py`):**
- Creates per-user models: `user_{userId}_model.pkl`
- Same GaussianNB algorithm
- Trained on individual user's historical data
- Used when user has ≥10 attempts per skill

**3. Hybrid Prediction System (`predict_hybrid.py`):**
- **Decision Logic:**
  - If attempts < 10: Use global model
  - If attempts ≥ 10: Use personal model (auto-train if missing)
- **Returns:** Dict of {skillName: "Weak/Strong (global/personal)"}

**4. Question Recommendation Engine:**
- Queries user's wrong answers per weak skill
- For each mistake, calls `findSimilar.js` via subprocess
- Returns 2-3 semantically similar questions per mistake
- Total ~30 recommended questions per weak skill

**5. Semantic Similarity (`findSimilar.js`):**
- **Technology:** @xenova/transformers (Hugging Face)
- **Model:** sentence-transformers/all-MiniLM-L6-v2
- **Database:** QuestionEmbeddings table (pre-computed vectors)
- **Algorithm:** Cosine similarity
- **Integration:** Python → Node.js subprocess call

#### ⚠️ **Report Accuracy Check:**

| Report Claim | Actual Implementation | Status |
|--------------|----------------------|---------|
| Naïve Bayes | ✅ GaussianNB exists | ✅ CORRECT |
| kNN | ✅ Cosine similarity in findSimilar.js | ✅ CORRECT |
| Basic recommendation | ✅ Advanced hybrid system | ✅ UNDERREPORTED |
| No mention of personal models | ✅ Personal models exist | ⚠️ INCOMPLETE |
| No mention of semantic similarity | ✅ Transformers model exists | ⚠️ INCOMPLETE |

#### 🎯 **Critical Findings:**

**What's EXCELLENT:**
- ✅ Report claims are ACCURATE (both Naïve Bayes AND kNN exist)
- ✅ ML system is MORE sophisticated than minimally reported
- ✅ GaussianNB properly implemented with SQL integration
- ✅ kNN via cosine similarity on semantic embeddings (findSimilar.js)
- ✅ Personal user modeling (adaptive learning)
- ✅ Hybrid prediction strategy (global → personal)

**What's MISSING from Report:**
- ⚠️ Doesn't mention **personal models** (user-specific training)
- ⚠️ Doesn't mention **Transformers** (all-MiniLM-L6-v2)
- ⚠️ Doesn't mention **hybrid strategy** (10-attempt threshold)
- ⚠️ Doesn't explain kNN implementation details (cosine similarity)

**What's MISSING from Codebase:**
- ❌ Express API endpoints (no `/api/ml/recommend` route found)
- ❌ Frontend integration (ML scripts are standalone)
- ⚠️ ML models are callable via CLI, but NOT exposed as REST API yet

#### 📊 **ML Implementation Completeness:**

| Component | Status | Completion |
|-----------|--------|------------|
| Naïve Bayes Training | ✅ Complete | 100% |
| kNN (Cosine Similarity) | ✅ Complete | 100% |
| Personal Model Training | ✅ Complete | 100% |
| Hybrid Prediction | ✅ Complete | 100% |
| Semantic Embeddings | ✅ Complete | 100% |
| Question Recommendation | ✅ Complete | 100% |
| Node.js API Integration | ❌ Missing | 0% |
| Frontend UI | ❌ Missing | 0% |

**Overall ML Completion: 75%** (Both algorithms implemented, but no API/Frontend integration)

---

## 🎯 KHUYẾN NGHỊ

### **Cần làm ngay:**

1. **Làm rõ hơn trong báo cáo:**
   - ✅ **Naïve Bayes và kNN đã đúng** - Giữ nguyên!
   - ✅ **BỔ SUNG chi tiết**: 
     - Personal models (user-specific training)
     - Hybrid prediction (global → personal at 10 attempts)
     - Transformers (all-MiniLM-L6-v2) for embeddings
     - kNN via cosine similarity on semantic vectors
   - ✅ **BỔ SUNG các tính năng mới:**
     - Mixed Test feature (mới nhất, chưa có trong báo cáo)
     - Advanced Media System với timing
     - Question Embeddings & Stats system

2. **Hoàn thiện ML integration:**
   - ⚠️ **Tạo Express API endpoints** để gọi Python ML scripts
   - Suggested routes:
     - `POST /api/ml/predict-weak-skills` → calls `predict_hybrid.py`
     - `POST /api/ml/recommend-questions` → returns similar questions
     - `POST /api/ml/train-personal-model` → trains user-specific model
   - ⚠️ **Integrate with Frontend**: Create UI for viewing weak skills + recommendations

3. **Triển khai các phần còn thiếu trong báo cáo:**
   - ❌ **Payment gateway** (VNPay, Momo, PayPal)
   - ❌ **2FA Authentication**
   - ❌ **Social Login** (Google/Facebook)

4. **Hoặc điều chỉnh báo cáo (nếu không làm thêm):**
   - Nếu không làm payment → Bỏ phần "Xem và mua khóa học"
   - Focus vào những gì đã build: Mixed Test, ML Backend, Media System, Chatbot Infrastructure

---

## 📝 KẾT LUẬN

**Báo cáo và hệ thống thực tế:**
- **Phần core (Frontend, Backend, Database):** ✅ **ĐÚNG 100%**
- **Phần mô tả chức năng:** ⚠️ **Một số chưa hoàn chỉnh** (ML backend exists but no API integration yet, Payment, Social Login)
- **Phần thiếu trong báo cáo:** ⚠️ **Mixed Test, Advanced features chưa ghi**

**Đề xuất:**
1. **Nếu còn thời gian:** Triển khai ML recommendation, payment
2. **Nếu gấp:** Cập nhật báo cáo theo thực tế đã code
3. **Tốt nhất:** Làm cả 2 - Code thêm + Update báo cáo

---

**Ngày phân tích:** October 8, 2025
**Phân tích bởi:** AI Analysis Tool
**Status:** Ready for review

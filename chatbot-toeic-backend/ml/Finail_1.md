# ML Documentation (Consolidated)

Mục tiêu của file này: gom nội dung quan trọng từ các tài liệu trong `ml/` thành **1 tài liệu duy nhất**, loại bỏ trùng lặp và chuẩn hóa theo trạng thái hiện tại của code.

## TL;DR (dành cho thầy đọc nhanh)

Hệ thống ML trong project này là một **hệ thống gợi ý học tập thông minh** (intelligent tutoring / recommender) cho TOEIC:
- **Quan sát** lịch sử làm bài của học viên từ DB (`UserResults`).
- **Suy luận** điểm yếu theo từng kỹ năng (skill) bằng mô hình ML.
- **Cá nhân hoá lộ trình** bằng cách trả về danh sách skill yếu + gợi ý câu hỏi để luyện.
- **Tự động hoá** chạy dự đoán sau mỗi lần học viên submit và có cron để retrain.

Điểm “thông minh” cốt lõi nằm ở 4 ý:
1) **Personalization**: dự đoán theo từng user dựa trên hành vi thật (accuracy, độ ổn định, xu hướng gần đây…).
2) **Hybrid strategy**: user ít dữ liệu vẫn chạy được (global model), user đủ dữ liệu dùng unified model giàu đặc trưng hơn.
3) **Caching**: kết quả dự đoán được lưu DB (`MLPrediction`) để API trả nhanh, tránh spam chạy Python.
4) **Actionable output**: không chỉ “bạn yếu skill X” mà còn trả luôn `questionIds` để frontend render bài luyện.

### Trả lời nhanh: “Hệ thống này thông minh ở chỗ nào?”

Hệ thống này “thông minh” ở chỗ nó không chỉ chấm điểm, mà **tự động suy ra điểm yếu và đưa ra bài luyện phù hợp cho từng người**, dựa trên dữ liệu thật và cập nhật liên tục:

- **Cá nhân hoá theo hành vi**: dùng lịch sử làm bài trong DB để tính các tín hiệu như `overall_accuracy`, `learning_velocity` (tiến bộ so với 30 ngày đầu), `recency_bias` (phong độ 50 câu gần nhất), `consistency` (độ phân hoá giữa các skill).
- **Chẩn đoán theo từng kỹ năng (skill-level)**: không gộp chung một điểm, mà dự đoán `weakSkills` theo `skillId`.
- **Thích nghi theo mức dữ liệu (Hybrid)**: user ít dữ liệu vẫn dự đoán được bằng global model; user đủ dữ liệu dùng unified model giàu ngữ cảnh hơn.
- **Gợi ý hành động cụ thể**: đầu ra không chỉ “yếu skill X” mà trả `questionIds` để luyện ngay; phần gợi ý dựa trên embeddings + cosine similarity (kNN retrieval) để tìm câu tương tự.
- **Tự động hoá và cập nhật**: có trigger chạy nền sau submit + cache DB-first để trả nhanh + cron retrain để model học lại theo dữ liệu mới.

## 0) Nguồn tham chiếu

Các file gốc đã được gộp/chuẩn hóa:
- `ml/FEATURE_EXTRACTION_UPDATE.md`
- `ml/ML_FILES_README.md`
- `ml/QUICK_START.md`
- `ml/AI_DOCUMENTATION.md`
- `ml/FIX_ML_FEATURE_MISMATCH.md`
- `ml/FIX_SUMMARY.md`

## 1) Tổng quan hệ thống ML

Hệ thống ML phục vụ 2 mục tiêu:
1) **Weak-skill prediction**: dự đoán kỹ năng yếu của user dựa trên lịch sử làm bài (`UserResults`).
2) **Question recommendation**: gợi ý câu hỏi để luyện dựa trên skill yếu + câu hỏi tương tự (kNN/embeddings).

Trong production đang dùng **Hybrid Strategy**:
- Global model cho user/skill ít dữ liệu.
- Unified model cho user/skill đủ dữ liệu.

### 1.1 Luồng hệ thống end-to-end (dễ hình dung)

Luồng tổng quát:

```
[User làm bài] -> ghi vào DB (UserResults)
  |
  | (A) API: GET /api/ml/recommend/:userId
  |     - ưu tiên đọc cache từ MLPrediction
  |     - nếu thiếu/cũ -> spawn Python -> lưu cache -> trả về
  |
  | (B) Service: trigger background sau submit
  |     - spawn Python -> lưu cache + history
  |
  v
[Python ML] -> predict weak skills + recommend questionIds -> JSON
  |
  v
[DB cache] MLPrediction + MLPredictionHistory
  |
  v
[Frontend] gọi endpoint detail -> query Questions + media -> render bài luyện
```

Tại sao thiết kế vậy:
- API có **cache DB-first** để trả nhanh và ổn định.
- Service chạy nền để “làm sẵn”, giảm thời gian chờ của user.
- Cron retrain để mô hình cập nhật theo dữ liệu mới.

## 2) Hybrid Strategy: điều kiện chọn model

Quyết định theo ngưỡng attempts (mỗi skill):

```
IF attempts < 10:
  dùng Global Model (weak_skill_model.pkl)
ELSE:
  dùng Unified Model (unified_model.pkl)
```

## 3) Models & Feature Sets (chuẩn hóa theo hiện trạng)

### 3.1 Global Model (weak_skill_model.pkl)

- Mục tiêu: xử lý “cold start” (user/skill ít dữ liệu).
- Features (3):
  - `attempts`
  - `correct`
  - `accuracy = correct / attempts`

Labeling rule (fixed threshold):
- `isWeak = 1` nếu `accuracy < 0.60`
- `isWeak = 0` nếu `accuracy >= 0.60`

### 3.2 Unified Model (unified_model.pkl)

Lưu ý quan trọng: tài liệu cũ có đoạn mô tả **7 features**. Trạng thái hiện tại (theo `train_unified_model.py` + `model/unified_model_info.pkl`) là **10 features**.

Features (10):
1. `user_level` (0/1/2 dựa trên `overall_accuracy`)
2. `total_tests`
3. `total_questions`
4. `overall_accuracy`
5. `days_active`
6. `learning_velocity` (overall - first_30d)
7. `consistency` (STDEV của skill_accuracy per user)
8. `recency_bias` (recent_50 - overall)
9. `attempts`
10. `correct`

Skill leakage:
- `skill_accuracy` **KHÔNG** đưa vào feature vector.
- `skill_accuracy` chỉ dùng để gán nhãn `isWeak` khi train.

Labeling rule (dynamic + fallback):
- Nếu đủ điều kiện:
  - `attempts >= 5`
  - `user_num_skills >= 3`
  - `std_user_skill_acc > 0`
  → `dynamic_threshold = avg_user_skill_acc - 1.0 * std_user_skill_acc`
  → `isWeak = 1` nếu `skill_accuracy < dynamic_threshold`.
- Ngược lại fallback:
  → `isWeak = 1` nếu `skill_accuracy < 0.60`.

## 3.2.1 Feature Dictionary (giải thích chi tiết từng feature)

Mục tiêu của phần này: giải thích **từng feature đang dùng thật trong code** (train/predict) để thầy/đội dev đọc là hiểu ngay “feature nói lên điều gì” và “tính thế nào”.

### A) Global model features (3)

Global model dùng trong `train_model.py` và được gọi khi `attempts < 10`.

1) `attempts`
- Ý nghĩa: số lần user làm các câu thuộc skill đó.
- Cách tính: `COUNT(*)` trên `UserResults` join `QuestionSkills` theo (userId, skillId).
- Lưu ý: attempts càng nhỏ → độ tin cậy đánh giá skill càng thấp.

2) `correct`
- Ý nghĩa: số lần trả lời đúng trong skill đó.
- Cách tính: `SUM(CASE WHEN isCorrect = 1 THEN 1 ELSE 0 END)`.
- Lưu ý: nếu DB có null/khác 0/1 thì cần chuẩn hoá trước.

3) `accuracy`
- Ý nghĩa: tỷ lệ đúng trong skill đó.
- Công thức:

$$
accuracy = \frac{correct}{attempts}
$$

- Lưu ý: khi `attempts = 0` thì phải tránh chia 0 (code hiện xử lý bằng điều kiện khi predict).

### B) Unified model features (10)

Unified model dùng trong `train_unified_model.py` (train) và `predict_hybrid_unified.py` (predict khi `attempts ≥ 10`).
Nhóm feature gồm 2 phần: **user context (8)** + **skill context (2)**.

#### B1) User context

1) `user_level`
- Ý nghĩa: mức trình độ tổng quát theo accuracy toàn bộ.
- Cách tính (đúng theo code):
  - 0 nếu `overall_accuracy < 0.5`
  - 1 nếu `0.5 ≤ overall_accuracy < 0.7`
  - 2 nếu `overall_accuracy ≥ 0.7`
- Lý do: gom user vào 3 tầng để model phân biệt hành vi của beginner/intermediate/advanced.

2) `total_tests`
- Ý nghĩa: số bài test/practice (distinct `userTestId`) user đã làm.
- Cách tính: `COUNT(DISTINCT userTestId)`.
- Lưu ý: nếu `userTestId` có thể null thì total_tests có thể bị thấp hơn thực tế.

3) `total_questions`
- Ý nghĩa: tổng số câu user đã làm.
- Cách tính: `COUNT(*)` trên `UserResults` theo `userId`.

4) `overall_accuracy`
- Ý nghĩa: accuracy tổng quát của user.
- Công thức:

$$
overall\_accuracy = \frac{\sum \mathbf{1}[isCorrect=1]}{\text{total\_questions}}
$$

- Lưu ý: phản ánh “mặt bằng chung”, không nói rõ skill nào yếu.

5) `days_active`
- Ý nghĩa: số ngày kể từ lần đầu làm bài tới hiện tại.
- Cách tính: `DATEDIFF(DAY, MIN(answeredAt), GETDATE())`.
- Lưu ý: user mới có thể days_active nhỏ; user lâu nhưng ít học cũng có thể days_active lớn (không đồng nghĩa chăm chỉ).

6) `learning_velocity`
- Ý nghĩa: tốc độ cải thiện (trend dài hạn) so với giai đoạn đầu.
- Cách tính trong code:

$$
learning\_velocity = overall\_accuracy - first\_30d\_accuracy
$$

- `first_30d_accuracy`: accuracy của các câu trong 30 ngày đầu (tính bằng subquery).
- Lưu ý:
  - Nếu user không đủ dữ liệu trong 30 ngày đầu hoặc subquery trả null, code dùng `ISNULL(..., 0)` khi select.
  - Giá trị dương → càng học càng khá; âm → sa sút so với giai đoạn đầu.

7) `consistency`
- Ý nghĩa: độ ổn định kỹ năng của user (dao động giữa các skill).
- Cách tính:
  - Tính `skill_accuracy` cho từng (userId, skillId).
  - `consistency = STDEV(skill_accuracy)` theo user.
- Diễn giải:
  - `consistency` thấp → skill accuracies gần nhau (đều đều).
  - `consistency` cao → có skill rất mạnh và skill rất yếu (phân hoá).
- Lưu ý: nếu user có ít skill, STDEV có thể null/0; code dùng `ISNULL(..., 0)`.

8) `recency_bias`
- Ý nghĩa: xu hướng gần đây so với toàn bộ lịch sử.
- Cách tính trong code:

$$
recency\_bias = recent\_50\_accuracy - overall\_accuracy
$$

- `recent_50_accuracy`: accuracy của 50 câu gần nhất.
- Lưu ý:
  - Dương → gần đây làm tốt hơn mặt bằng.
  - Âm → gần đây kém hơn (có thể do xuống phong độ/đang học phần mới khó hơn).

#### B2) Skill context (giữ nguyên bản chất personal/global)

9) `attempts`
- Ý nghĩa: số lần user làm câu thuộc skill đó.
- Cách tính: giống global model (group by skill).

10) `correct`
- Ý nghĩa: số câu đúng thuộc skill đó.
- Cách tính: giống global model.

#### Feature “skill_accuracy” (chỉ dùng để gán nhãn, không đưa vào X)

Trong unified training có tính `skill_accuracy`, nhưng **KHÔNG đưa vào feature vector** để tránh leakage:

$$
skill\_accuracy = \frac{correct}{attempts}
$$

Nó chỉ được dùng để tạo nhãn `isWeak` theo rule dynamic+fallback.

## 3.3 Thuật toán dùng trong hệ thống (Naive Bayes + kNN)

### A) Gaussian Naive Bayes (phần “ML dự đoán skill yếu”)

Hệ thống dùng `GaussianNB` (Naive Bayes cho dữ liệu số) trong cả:
- Global model: `weak_skill_model.pkl`
- Unified model: `unified_model.pkl`

**Ý tưởng**
- Bài toán là phân loại nhị phân: `isWeak ∈ {0,1}`.
- Naive Bayes tính xác suất hậu nghiệm:

$$
P(y\mid x) \propto P(y)\prod_{i=1}^{d} P(x_i\mid y)
$$

Trong đó:
- $y$ là nhãn (`isWeak`), $x$ là vector features.
- Giả định “naive” là các feature $x_i$ độc lập có điều kiện theo $y$.
- Với `GaussianNB`, mỗi $P(x_i\mid y)$ được mô hình hoá bằng phân phối Gaussian theo từng class.

**Vì sao hợp lý trong project này**
- Features đều là số (attempts, accuracy, days_active, …) → phù hợp `GaussianNB`.
- Train/predict rất nhanh → phù hợp chạy tự động (cron + background).
- Là baseline tốt cho bài toán “weak vs strong” khi ta đã feature-engineer sẵn.

**Điểm cần nhớ khi vận hành**
- Naive Bayes không “học quan hệ phức tạp” như deep model; chất lượng phụ thuộc nhiều vào feature/labeling rules.
- Unified model trong `train_unified_model.py` có bước **StandardScaler** (chuẩn hoá mean=0, std=1) và lưu ra `unified_model_scaler.pkl`.
  - Khi predict, cần áp cùng scaler để đúng phân phối lúc train. (Nếu không áp scaler, model vẫn chạy nhưng kết quả có thể lệch.)

### B) kNN (phần “gợi ý câu hỏi tương tự”)

Trong hệ thống này, “kNN” được dùng theo kiểu **item-based retrieval**:
- Mỗi câu hỏi được biểu diễn bằng vector embedding trong bảng `QuestionEmbeddings`.
- Khi cần gợi ý, ta chọn câu hỏi “anchor” rồi tìm `k` câu **gần nhất** trong không gian embedding.

**Embedding model**
- Backend dùng MiniLM `all-MiniLM-L6-v2` qua `@xenova/transformers`.
- Sinh embedding bằng pooling mean và normalize.

**Khoảng cách/độ giống nhau**
- Dùng cosine similarity:

$$
	ext{cosine}(a,b)=\frac{a\cdot b}{\|a\|\,\|b\|}
$$

**Cách triển khai trong repo**
- Sinh và lưu embedding: `src/services/embeddingService.js`
- Tìm câu gần nhất: `findSimilar.js`
  - Lấy embedding của input (theo `questionId` từ DB hoặc text → tạo embedding mới).
  - Load toàn bộ embeddings từ DB.
  - Tính cosine similarity với từng câu.
  - Sort giảm dần, lấy top-k, dedupe theo `id`.

Ghi chú: cách tìm “nearest neighbors” hiện tại là scan toàn bộ (O(N)) nên DB lớn có thể chậm; nếu cần scale lớn hơn có thể chuyển sang index/ANN (FAISS/HNSW), nhưng đó là scope tối ưu hoá về sau.

## 4) SQL Feature Extraction (tham khảo)

### 4.1 Global model extraction (attempts/correct)

```sql
SELECT 
    ur.userId,
    qs.skillId,
    s.name AS skillName,
    COUNT(*) AS attempts,
    SUM(CASE WHEN ur.isCorrect = 1 THEN 1 ELSE 0 END) AS correct
FROM UserResults ur
JOIN QuestionSkills qs ON ur.questionId = qs.questionId
JOIN Skills s ON qs.skillId = s.id
WHERE ur.userId IS NOT NULL
GROUP BY ur.userId, qs.skillId, s.name
```

### 4.2 Unified model extraction (10 features + skill_accuracy)

Tùy script, SQL có thể được triển khai bằng CTE như sau (logic tương đương `train_unified_model.py`):
- `UserStats`: tổng quan user
- `SkillStats`: attempts/correct/skill_accuracy theo skill
- `UserConsistency`: STDEV của skill_accuracy

Các computed fields chính:
- `learning_velocity = overall_accuracy - first_30d_accuracy`
- `recency_bias = recent_50_accuracy - overall_accuracy`
- `consistency = STDEV(skill_accuracy)`

## 5) Production automation (Node.js)

### 5.1 Auto-predict (sau submit)

File: `src/services/mlPredictionService.js`
- Hàm: `triggerMLPredictionAsync(userId)`
- Cơ chế:
  - chạy nền bằng `setImmediate` (không block response)
  - spawn python: `ml/predict_hybrid_unified.py {userId} --quiet --out <tmp.json>`
  - parse output JSON
  - upsert `MLPredictions`
  - insert `MLPredictionHistory`

Đoạn code quan trọng (rút gọn) minh hoạ việc gọi Python và đọc output:

```js
// src/services/mlPredictionService.js (core idea)
const mlScriptPath = path.join(__dirname, '../../ml/predict_hybrid_unified.py');
const outPath = path.join(os.tmpdir(), `result_user_${userId}_${Date.now()}.json`);
const pythonArgs = [mlScriptPath, userId.toString(), '--quiet', '--out', outPath];

const pythonProcess = spawn('python', pythonArgs, { stdio: ['ignore', 'ignore', 'pipe'] });
// ... collect stderr
// ... on close: read outPath -> JSON.parse -> extract questionIds -> upsert DB
```

Ngoài ra còn có file `src/services/ml_service.js` với logic trigger/update tương tự (cùng gọi `predict_hybrid_unified.py`).

### 5.2 API endpoints (controller) cho ML

#### 5.2.1 API lấy recommendations (có cache)

File: `src/controllers/ml_recommendation_controller.js`
- Route: `GET /api/ml/recommend/:userId`
- Hành vi:
  1) Đọc cache từ `MLPrediction`.
  2) Nếu cache “fresh” (TTL) và có data → trả ngay.
  3) Nếu cache thiếu/cũ hoặc `?force=true` → spawn Python, đọc JSON, lưu cache (upsert), trả kết quả.

Đoạn code quan trọng (rút gọn):

```js
// src/controllers/ml_recommendation_controller.js (cache-first)
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes
const prediction = await db.MLPrediction.findOne({ where: { userId } });

if (prediction && !forceRecompute) {
  const isFresh = updatedAt ? (Date.now() - updatedAt.getTime() <= CACHE_TTL_MS) : false;
  const hasData = weakSkills.length > 0 || questionIds.length > 0;
  if (isFresh && hasData) return res.status(200).json({ data: { weakSkills, questionIds } });
}

// miss/stale -> run python
const pythonArgs = [mlScriptPath, userId.toString(), '--quiet', '--out', outPath];
spawn('python', pythonArgs, { stdio: ['ignore', 'ignore', 'pipe'] });
```

Ghi chú cho vận hành:
- Nếu muốn debug “tại sao cache không cập nhật”, gọi `GET /api/ml/recommend/:userId?force=true` để ép recompute.

#### 5.2.2 API lấy chi tiết câu hỏi gợi ý

File: `src/controllers/ml_recommendation_detail_controller.js`
- Route (theo tên): thường là `GET /api/ml/recommend/details/:userId` hoặc tương tự (tuỳ routes).
- Ý tưởng:
  - Gọi thẳng `getRecommendations()` (tránh fetch/cookie issues).
  - Lấy `questionIds` rồi query `Question` + join `QuestionType`, `Part`, `MediaFiles`.
  - Sắp xếp theo thứ tự ML trả về.
  - Deduplicate theo `question` content để giảm trùng.

Đoạn code quan trọng (rút gọn):

```js
// src/controllers/ml_recommendation_detail_controller.js (core idea)
await getRecommendations(req, mockRes);
const questionIds = mlData.questionIds || [];

const questions = await db.Question.findAll({
  where: { id: questionIds },
  include: [/* questionType, part, media mappings */]
});

// keep order, then dedupe by content
const ordered = questions.sort((a, b) => questionIds.indexOf(a.id) - questionIds.indexOf(b.id));
```

### 5.2 Auto-retrain (cron)

File: `src/cronJobs/mlRetrainCron.js`
- Dùng `node-cron`
- Chạy tuần tự:
  - `ml/train_model.py` (global)
  - `ml/train_unified_model.py` (unified)

Ghi chú:
- Trong file có comment “production = mỗi 6 giờ”, nhưng cron hiện đang là `*/10 * * * *` (mỗi 10 phút). Nếu muốn đúng production schedule, cần chỉnh về `0 */6 * * *`.

Đoạn code quan trọng (rút gọn):

```js
// src/cronJobs/mlRetrainCron.js
cron.schedule("*/10 * * * *", async () => {
  await runPythonScript('train_model.py');
  await runPythonScript('train_unified_model.py');
});

// env PYTHONIOENCODING giúp tránh lỗi Unicode trên Windows
env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
```

## 6) Runtime Deep Dive: Naive Bayes + kNN được dùng như thế nào?

Phần này trả lời 3 câu hỏi hay bị hỏi nhất:
1) Naive Bayes được dùng ở đâu, chạy như thế nào?
2) kNN được dùng ở đâu, chạy như thế nào?
3) Mỗi khi user làm bài xong thì chuyện gì xảy ra (code chạy đường nào)?

### 6.1 Naive Bayes “in action”: dự đoán skill yếu theo từng skill

Python entrypoint chính (production) là `ml/predict_hybrid_unified.py`.

**Step A — lấy dữ liệu theo skill từ DB**
- Script query bảng `UserResults` join `QuestionSkills` + `Skills` để gom theo (skill):
  - `attempts = COUNT(*)`
  - `correct = SUM(isCorrect)`
  - `accuracy = correct/attempts`

**Step B — Hybrid decision**
- Với mỗi skill của user:
  - nếu `attempts < 10` → dùng **Global Naive Bayes** (`weak_skill_model.pkl`)
  - nếu `attempts >= 10` → dùng **Unified Naive Bayes** (`unified_model.pkl`)

**Step C — Feature vector đưa vào model**
- Global model (3D): `X = [attempts, correct, accuracy]`.
- Unified model (10D): `X = [user_level, total_tests, total_questions, overall_accuracy, days_active, learning_velocity, consistency, recency_bias, attempts, correct]`.
  - Các phần user-context được lấy bằng query `UserStats/SkillStats/UserConsistency` trong hàm `prepare_unified_features()`.

**Step D — Predict**
- Cả 2 model gọi:
  - `predict()` → ra nhãn `isWeak` (0/1)
  - `predict_proba()` → ra xác suất Strong/Weak (để log/giải thích)

Kết quả trung gian của bước này là map kiểu:

```json
{
  "Grammar": "Weak (unified)",
  "Vocabulary": "Strong (global)"
}
```

Sau đó script lấy `weak_skills = [skillName...]` bằng cách filter status có chữ `Weak`.

### 6.2 kNN “in action”: gợi ý câu hỏi tương tự (embedding + cosine)

Sau khi có `weak_skills`, script mới chuyển sang phần recommendation.

**Ý tưởng**: với mỗi skill yếu, lấy một số câu hỏi thuộc skill đó làm “anchor”, rồi tìm câu hỏi tương tự trong không gian embedding.

#### 6.2.1 Anchor selection (trong Python)

Trong `full_pipeline()`:
- Với mỗi `skill` yếu, script query ngẫu nhiên `TOP 50` câu hỏi thuộc skill:

```sql
SELECT TOP 50 q.id, q.question
FROM Questions q
JOIN QuestionSkills qs ON q.id = qs.questionId
JOIN Skills s ON qs.skillId = s.id
WHERE s.name = '<skill>'
ORDER BY NEWID()
```

- Lấy `head(20)` câu đầu làm anchor (tăng anchor để đủ số lượng đề xuất).

#### 6.2.2 kNN retrieval (thực tế chạy bằng Node)

Python không tự tính cosine trên toàn DB, mà gọi Node script `findSimilar.js` qua `subprocess.run()`:

```py
subprocess.run(["node", FIND_SIMILAR_PATH, str(anchor_id), str(k)], capture_output=True, text=True)
```

Trong `findSimilar.js`:
1) Lấy embedding của anchor từ DB (`QuestionEmbeddings.vector`).
2) Lấy toàn bộ embeddings trong DB (join `Questions` + `QuestionEmbeddings`).
3) Tính cosine similarity cho từng câu.
4) Sort giảm dần, lấy top-k.

**Vì sao gọi qua Node?**
- Backend đã có pipeline embedding MiniLM trong JS (`@xenova/transformers`) + logic similarity.
- Python chỉ orchestration (gọi và gom kết quả).

#### 6.2.3 Deduplication & top-30 per skill (trong Python)

Script gom các gợi ý từ nhiều anchors vào `all_suggestions`:
- Dedupe theo `question` content (normalize + set) để tránh trùng.
- Early-exit khi đủ `>= 30` câu unique.

Output cuối cho 1 skill là tối đa 30 câu hỏi:

```json
"recommendations": {
  "Grammar": [
    {"id": 123, "question": "..."},
    {"id": 456, "question": "..."}
  ]
}
```

### 6.3 Sau khi user làm bài xong thì chuyện gì xảy ra? (luồng code)

Trong backend hiện có **2 đường trigger** ML sau khi submit (đều chạy nền, không block response). Điều này giải thích vì sao đôi khi thấy log ML chạy 2 lần.

#### 6.3.1 Đường 1 — controller trigger ngay sau submit

File: `src/controllers/question_test_controller.js`
- Sau `SubmitTestResult()` hoặc `SubmitPracticeResult()`:
  - gọi `triggerMLPredictionAsync(userId)`.

Đặc điểm:
- “Fire-and-forget”: dùng `setImmediate` bên trong service.
- Luôn trigger (không kiểm tra đủ data hay chưa).

Service thực thi:
File: `src/services/mlPredictionService.js`
1) Spawn python: `ml/predict_hybrid_unified.py {userId} --quiet --out <tmp.json>`
2) Read file JSON output.
3) Extract `questionIds` từ `result.recommendations`.
4) Upsert `MLPrediction` + insert `MLPredictionHistory`.
5) Xoá file tmp.

#### 6.3.2 Đường 2 — service trigger có điều kiện (needsMLUpdate)

File: `src/services/question_test_service.js`
- Sau khi lưu `UserResults` và cập nhật `QuestionStats`, code chạy:
  - `setImmediate(async () => { if (await needsMLUpdate(userId)) await triggerMLUpdate(userId); })`

Điểm khác biệt:
- `needsMLUpdate(userId)` chỉ update khi user có đủ “newAttempts” (>=5 câu mới kể từ `MLPrediction.updatedAt`).
- `triggerMLUpdate(userId)` spawn cùng Python script, nhưng có thêm bước query `totalAttempts` và `overallAccuracy` để lưu metadata vào `MLPrediction`.

#### 6.3.3 Khi frontend cần hiển thị gợi ý

Có 2 endpoint chính:
1) `GET /api/ml/recommend/:userId`
   - Cache DB-first (`MLPrediction`) với TTL 2 phút.
   - Cache fresh + có data → trả ngay.
   - Nếu stale/empty hoặc `?force=true` → chạy Python, upsert cache, trả kết quả.
2) `GET /api/ml/recommend/details/:userId`
   - Gọi nội bộ `getRecommendations()` để lấy `questionIds`.
   - Query `Question` + `QuestionType` + `Part` + `MediaFiles`.
   - Sort theo thứ tự `questionIds` + dedupe content.

**Tóm lại**: Naive Bayes quyết định “yếu skill nào”, còn kNN (embeddings) quyết định “nên luyện câu nào tiếp theo”.

## 7) Manual commands (debug/ops)

### 6.1 Predict production (manual)

```bash
python predict_hybrid_unified.py 3
python predict_hybrid_unified.py 116 --quiet --out result_user_116.json
```

### 6.2 Train models (manual)

```bash
python train_model.py
python train_unified_model.py
```

### 6.3 Utility

```bash
python check_data_stats.py
python demo_scalability.py 10000
python predict_unified.py 3
```

## 8) Output & database tables

### 7.1 Python output (predict_hybrid_unified.py)

Dạng JSON (tóm tắt):
- `weak_skills`: list skill names
- `recommendations`: map `{ skillName: [{id, question}, ...] }`

### 7.2 Tables liên quan

Phần này được tổng hợp trực tiếp từ Sequelize models trong `src/models/`.

#### A) Tổng quan database (hệ thống thi/luyện)

Các bảng cốt lõi cho nghiệp vụ TOEIC:
- `Users`: thông tin user.
- `Tests`, `TestQuestion`: cấu trúc đề + mapping đề ↔ câu hỏi.
- `Questions`: nội dung câu hỏi (A/B/C/D, correctAnswer, explanation, typeId, partId).
- `QuestionType`, `Part`: phân loại câu hỏi.
- `UserTests`: 1 lần làm bài (test mode hoặc practice mode). `testId` có thể NULL (practice).
- `UserResults`: 1 câu trả lời của user (nguồn dữ liệu học máy).
- `Skills`, `QuestionSkills`: taxonomy skill và mapping câu hỏi ↔ skill (có `weight`).
- `MediaFiles`, `QuestionMediaMap`: gắn audio/video/image vào câu hỏi (phục vụ listening/reading có media).

Quan hệ quan trọng (để hình dung nhanh):
```
Users (1) --- (N) UserTests (1) --- (N) UserResults (N) --- (1) Questions

Questions (N) --- (N) Skills  thông qua QuestionSkills

Questions (1) --- (0/1) QuestionEmbeddings
Questions (1) --- (0/1) QuestionStats
Questions (1) --- (N) QuestionMediaMap (N) --- (1) MediaFiles
```

#### B) Các bảng liên quan hệ thống “thông minh” (ML + Embedding + Tracking)

Mục này chỉ tập trung vào các bảng “nuôi” ML và “phục vụ” recommendations.

1) `UserResults` (nguồn dữ liệu ML quan trọng nhất)
- Model: `src/models/UserResults.js`
- Ý nghĩa: log từng lần user trả lời 1 câu.
- Cột chính:
  - `userId` → user nào
  - `userTestId` → thuộc lần làm bài nào
  - `questionId` → câu nào
  - `isCorrect` → đúng/sai
  - `answeredAt` → thời điểm trả lời
  - `selectedOption` → user chọn đáp án nào
- Vai trò trong ML:
  - Global/Unified model đều query bảng này để tính `attempts/correct/accuracy` theo skill.
  - Unified còn dùng `answeredAt` để tính `days_active`, `first_30d_accuracy`, `recent_50_accuracy`.

2) `QuestionSkills` + `Skills` (mapping câu hỏi ↔ skill)
- Models: `src/models/QuestionSkills.js`, `src/models/skill.js`
- Ý nghĩa:
  - Cho biết câu hỏi thuộc skill nào để gom thống kê theo skill.
  - Có `weight` (hiện dùng default 1.0) để sau này có thể “độ quan trọng” khác nhau.
- Vai trò trong ML:
  - Toàn bộ feature `attempts/correct/skill_accuracy` theo skill đều dựa vào mapping này.

3) `QuestionEmbeddings` (vector embedding để tìm câu tương tự)
- Model: `src/models/QuestionEmbeddings.js`
- Cột chính:
  - `questionId` (PK)
  - `model` (vd: all-MiniLM-L6-v2)
  - `dim` (số chiều)
  - `vector` (TEXT, lưu dạng chuỗi "1.23,4.56,...")
  - `updatedAt`
- Vai trò trong “kNN recommendation”:
  - `findSimilar.js` lấy embedding anchor từ bảng này rồi tính cosine similarity với embeddings của các câu khác.
  - `embeddingService.js` là chỗ generate/upsert embeddings cho câu hỏi.

4) `QuestionStats` (thống kê toàn cục theo câu hỏi)
- Model: `src/models/QuestionStats.js`
- Cột chính:
  - `questionId` (PK)
  - `attempts`, `correct`
  - `globalCorrectRate` (có thể là computed column ở SQL Server; Sequelize map để đọc)
  - `medianTimeSeconds`
- Vai trò:
  - Được update sau mỗi lần submit (để có thống kê “độ khó”/tỉ lệ đúng toàn cục).
  - Hiện pipeline ML weak-skill chủ yếu dựa `UserResults`, nhưng `QuestionStats` là nền tảng tốt cho future features (difficulty-aware recommendation).

5) `MLPredictions` (cache kết quả ML hiện tại của 1 user)
- Model: `src/models/MLPrediction.js`
- Đặc điểm:
  - `userId` unique → mỗi user chỉ có 1 record “mới nhất”.
  - `weakSkills` và `questionIds` lưu dạng TEXT nhưng getter/setter parse/serialize JSON.
- Cột chính:
  - `weakSkills`: mảng tên skill yếu (JSON array)
  - `questionIds`: mảng id câu gợi ý (JSON array)
  - `confidence`, `totalAttempts`, `overallAccuracy`
  - `createdAt/updatedAt` (default GETDATE)
- Vai trò:
  - API `GET /api/ml/recommend/:userId` đọc bảng này trước để trả nhanh (cache DB-first).

6) `MLPredictionHistory` (lịch sử predictions — insert-only)
- Model: `src/models/MLPredictionHistory.js`
- Đặc điểm:
  - Insert-only: mỗi lần chạy ML có thể ghi thêm 1 record.
  - Dùng để phân tích trend, debug, và theo dõi model drift.
- Cột chính:
  - `userId`, `weakSkills`, `questionIds`, `confidence`, `createdAt`

7) Media liên quan đến recommendations hiển thị (không trực tiếp “ML”, nhưng trực tiếp “hệ thống thông minh” khi trả chi tiết)
- `QuestionMediaMap` + `MediaFiles`
- Vai trò:
  - Endpoint detail lấy câu hỏi gợi ý rồi join media để frontend render listening/reading đầy đủ.

## 9) Debugging checklist (các lỗi hay gặp)

### 8.1 Feature mismatch (đã gặp)

Triệu chứng:
- `ValueError: feature names should match those that were passed during fit`

Nguyên nhân:
- Model train với 10 features nhưng prediction chuẩn bị ít hơn.

Fix chuẩn:
- Đồng bộ features giữa:
  - `train_unified_model.py`
  - `predict_hybrid_unified.py` (prepare_unified_features)
  - `predict_unified.py`

### 8.2 Encoding/Unicode trên Windows

Triệu chứng:
- `UnicodeEncodeError: 'charmap' codec can't encode character ...`

Giải pháp:
- Ưu tiên in output ASCII trong Python (tránh emoji), hoặc
- Set env khi spawn python: `PYTHONIOENCODING=utf-8` (đã làm trong `mlRetrainCron.js`).

### 8.3 Warning pandas/pyodbc

Bạn có thể thấy warning:
- `pandas only supports SQLAlchemy connectable...`

Đây thường chỉ là warning (không làm hỏng pipeline). Nếu muốn “sạch” hoàn toàn, có thể chuyển qua SQLAlchemy engine.

### 8.4 Dự đoán “lạ” (gần như skill nào cũng WEAK/STRONG)

Triệu chứng thường gặp:
- User có skill accuracy rất cao nhưng vẫn bị dự đoán WEAK với xác suất gần 100%.
- Hoặc gần như tất cả skills đều ra cùng một nhãn.

Nguyên nhân hay gặp:
- Unified model được train trên **features đã scale** bằng `StandardScaler`, nhưng lúc predict lại đưa **unscaled features** vào model.
- Code đọc `predict_proba()` nhưng **giả định** cột `[1]` luôn là “weak” (thực tế phải map theo `model.classes_`).

Cách kiểm tra nhanh:
- Trong `ml/model/` phải có:
  - `unified_model_scaler.pkl`
  - `unified_model_info.pkl` (để lấy `feature_columns`)
- Predictor cần:
  - transform `X` bằng scaler trước khi `predict/predict_proba`.
  - lấy `weak_probability` theo index của class label `1` trong `model.classes_`.

Ghi chú: `skill_accuracy` không nằm trong features (tránh leakage), nên đôi lúc model có thể dự đoán khác “cảm giác nhìn accuracy” — đặc biệt khi tập train nhỏ.

## 10) Ghi chú chuẩn hóa (để tránh lẫn lộn về sau)

- Unified model hiện tại: **10 features**, không còn 7.
- `predict_adapter.py` được nhắc trong tài liệu cũ nhưng không tồn tại trong repo hiện tại.
- Trong repo có 2 service trigger ML (`mlPredictionService.js` và `ml_service.js`) cùng gọi `predict_hybrid_unified.py`.
- Có controller API cache-first (`ml_recommendation_controller.js`) và controller “detail” để trả full data câu hỏi (`ml_recommendation_detail_controller.js`).

## 11) Hướng dẫn & giải thích 2 file train model

### 10.1 `train_model.py` (Global model)

Mục tiêu: train **global weak-skill classifier** để dùng cho trường hợp ít dữ liệu (`attempts < 10`).

Luồng xử lý chính:
1) Load `.env` (DB_HOST/DB_PORT/DB_USERNAME/DB_PASS/DB_NAME) và kết nối MSSQL bằng `pyodbc`.
2) Query dữ liệu theo (userId, skillId):
  - `attempts = COUNT(*)`
  - `correct = SUM(isCorrect)`
  - `accuracy = correct/attempts`
  - `isWeak = 1 nếu accuracy < 0.6`
3) Train/test split 80/20.
4) Fit `GaussianNB()`.
5) In `classification_report`.
6) Lưu model: `ml/model/weak_skill_model.pkl`.

Chạy:
```bash
python train_model.py
```

Khi nào cần chạy lại:
- Khi dữ liệu mới tăng đáng kể.
- Khi thay đổi rule gán nhãn (vd threshold 0.6).

### 10.2 `train_unified_model.py` (Unified model)

Mục tiêu: train **1 model duy nhất** cho toàn bộ users (scalable), vẫn giữ personalization nhờ user-level features.

Luồng xử lý chính:
1) Query dữ liệu bằng CTE:
  - `UserStats`: total_tests, total_questions, overall_accuracy, days_active, first_30d_accuracy, recent_50_accuracy
  - `SkillStats`: attempts/correct/skill_accuracy theo (userId, skillId)
  - `UserConsistency`: `STDEV(skill_accuracy)` theo user
2) Feature engineering:
  - Tạo `user_level` từ `overall_accuracy` (0/1/2).
  - Tạo 3 feature mới:
    - `learning_velocity = overall_accuracy - first_30d_accuracy`
    - `consistency = STDEV(skill_accuracy)`
    - `recency_bias = recent_50_accuracy - overall_accuracy`
3) Labeling `isWeak` (dynamic per-user, có fallback 0.6):
  - Nếu đủ điều kiện (attempts >= 5, user có >= 3 skills, std > 0):
    - `dynamic_threshold = mean - 1.0*std`
    - yếu nếu `skill_accuracy < dynamic_threshold`
  - Nếu không đủ điều kiện: yếu nếu `skill_accuracy < 0.6`
4) Chuẩn hoá features bằng `StandardScaler()`.
5) Split train/test (có stratify nếu dataset đủ đa dạng class).
6) Train `GaussianNB()` và evaluate accuracy.
7) Lưu artifacts:
  - `ml/model/unified_model.pkl`
  - `ml/model/unified_model_scaler.pkl` (quan trọng cho predict)
  - `ml/model/unified_model_info.pkl` (feature_columns + metadata)

Chạy:
```bash
python train_unified_model.py
python train_unified_model.py --compare
```

Lưu ý nhỏ khi đọc code:
- Comment/header trong file có thể nhắc “7 features” (tài liệu cũ), nhưng **code hiện tại train theo 10 features** (đúng với `feature_columns`).

---

End of consolidated doc.

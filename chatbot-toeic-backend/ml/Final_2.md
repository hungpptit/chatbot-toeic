# BỘ CÂU HỎI VẤN ĐÁP  
## Hệ thống thông minh

---

## I. THIẾT KẾ (4 điểm)

### 1. CSDL + Lý thuyết (1.5 điểm)

**Câu 1.**  
Hệ thống sử dụng những loại dữ liệu nào? Dữ liệu được lưu trữ và tổ chức ra sao?

**Gợi ý trả lời:**
- Dữ liệu người dùng (user, hồ sơ, lịch sử tương tác)
- Dữ liệu nghiệp vụ (câu hỏi, kết quả, log hệ thống)
- Sử dụng CSDL quan hệ (MySQL / SQL Server / PostgreSQL)
- Có khóa chính – khóa ngoại, chuẩn hóa dữ liệu

**Trả lời chi tiết (theo code hiện tại của project):**

Hệ thống dùng **CSDL quan hệ SQL Server** (thấy rõ qua `GETDATE()` và ODBC Driver 17), và tổ chức dữ liệu theo các nhóm chính:

1) **Dữ liệu người dùng & lịch sử làm bài (learning history)**
- Bảng lõi là `UserResults`: mỗi dòng là **1 lần user trả lời 1 câu hỏi**, lưu `userId`, `userTestId`, `questionId`, `isCorrect`, `answeredAt`, `selectedOption`.
- Đây là dữ liệu “hành vi thật” để ML học và suy luận điểm yếu.

**Dẫn chứng code (Sequelize model cho bảng UserResults):**
```js
// src/models/UserResults.js
UserResult.init({
	userId: { type: DataTypes.INTEGER, allowNull: false },
	userTestId: { type: DataTypes.INTEGER, allowNull: false },
	questionId: { type: DataTypes.INTEGER, allowNull: false },
	isCorrect: { type: DataTypes.BOOLEAN, defaultValue: false },
	answeredAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
	selectedOption: { type: DataTypes.STRING(10), allowNull: true },
}, { tableName: 'UserResults', timestamps: false });
```
**Giải thích đoạn code:** Model này định nghĩa đúng các cột và quan hệ (FK) để backend lưu lịch sử làm bài. ML query trực tiếp từ bảng này để tính attempts/correct/accuracy theo skill.

2) **Dữ liệu nghiệp vụ câu hỏi + kỹ năng (question bank & skills taxonomy)**
- `Questions`: nội dung câu hỏi, đáp án, type/part…
- `Skills`: danh mục kỹ năng (có hỗ trợ phân cấp parent/children).
- `QuestionSkills`: bảng trung gian N-N map câu hỏi → skill (một câu có thể thuộc nhiều skill).

**Dẫn chứng code (quan hệ N-N Question ↔ Skill):**
```js
// src/models/QuestionSkills.js
QuestionSkill.init({
	questionId: { type: DataTypes.INTEGER, primaryKey: true },
	skillId: { type: DataTypes.INTEGER, primaryKey: true },
	weight: { type: DataTypes.DECIMAL(3,2), defaultValue: 1.0 },
}, { tableName: 'QuestionSkills', timestamps: false });
```
**Giải thích đoạn code:** Đây là “xương sống” để ML gom các câu user làm theo từng skill: ML join `UserResults` với `QuestionSkills` để tính thống kê theo skill.

3) **Dữ liệu embedding để gợi ý câu hỏi (semantic search / kNN retrieval)**
- `QuestionEmbeddings`: lưu vector embedding cho mỗi câu hỏi (dạng chuỗi CSV), kèm `model`, `dim`.

**Dẫn chứng code (model QuestionEmbeddings):**
```js
// src/models/QuestionEmbeddings.js
QuestionEmbedding.init({
	questionId: { type: DataTypes.INTEGER, primaryKey: true },
	model: { type: DataTypes.STRING(100), allowNull: false },
	dim: { type: DataTypes.INTEGER, allowNull: false },
	vector: { type: DataTypes.TEXT, allowNull: false },
}, { tableName: 'QuestionEmbeddings', timestamps: false });
```
**Giải thích đoạn code:** Bảng này cho phép hệ thống tìm “câu tương tự về ngữ nghĩa” bằng cosine similarity.

4) **Dữ liệu đầu ra của phần thông minh (ML cache + history)**
- `MLPredictions`: cache “kết quả mới nhất” cho mỗi user (1 user → 1 record, `userId` unique).
- `MLPredictionHistory`: lưu lịch sử dự đoán theo thời gian (append-only), phục vụ theo dõi thay đổi / drift.

**Dẫn chứng code (cache bảng MLPredictions):**
```js
// src/models/MLPrediction.js
userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
weakSkills: { type: DataTypes.TEXT, get(){...}, set(value){...} },
questionIds: { type: DataTypes.TEXT, get(){...}, set(value){...} },
// timestamps dùng SQL Server GETDATE()
createdAt: { defaultValue: sequelize.literal('GETDATE()') },
updatedAt: { defaultValue: sequelize.literal('GETDATE()') },
```
**Giải thích đoạn code:** `weakSkills`/`questionIds` được lưu dạng JSON string trong TEXT để linh hoạt. Cache DB giúp API trả nhanh và giảm chạy Python liên tục.

---

**Câu 2.**  
Cơ sở lý thuyết nào được sử dụng để xây dựng hệ thống thông minh?

**Gợi ý trả lời:**
- Trí tuệ nhân tạo / Machine Learning
- Thuật toán cụ thể (Naive Bayes, kNN, AutoEncoder, Rule-based, Hybrid)
- Lý do lựa chọn: phù hợp dữ liệu, dễ triển khai, dễ mở rộng

**Trả lời chi tiết:**

Phần “thông minh” của hệ thống dựa trên 2 trụ cột ML chính (đều đã hiện thực bằng code):

1) **Dự đoán skill yếu (Weak-skill prediction) bằng Gaussian Naive Bayes**
- Global model: dùng `GaussianNB()` với 3 feature đơn giản (attempts/correct/accuracy) để xử lý cold-start.
- Unified model: cũng dùng `GaussianNB()`, nhưng với **10 features** (bổ sung ngữ cảnh user: overall_accuracy, learning_velocity, recency_bias, consistency…).

**Dẫn chứng code (train unified model dùng GaussianNB + StandardScaler):**
```py
# ml/train_unified_model.py
from sklearn.naive_bayes import GaussianNB
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
X_scaled_df = pd.DataFrame(X_scaled, columns=feature_columns)

model = GaussianNB()
model.fit(X_train, y_train)
```
**Giải thích đoạn code:**
- `GaussianNB` phù hợp dữ liệu số, train/predict rất nhanh, dễ triển khai.
- `StandardScaler` giúp các feature có thang đo khác nhau (attempts có thể rất lớn, accuracy là 0..1) được chuẩn hoá, tránh model bị “lệch” theo thang đo.

2) **Gợi ý câu hỏi (Recommendation) theo kNN-style retrieval trên embedding + cosine similarity**
- Hệ thống tạo embedding câu hỏi bằng model MiniLM (`all-MiniLM-L6-v2`).
- Khi cần gợi ý câu tương tự, tính cosine similarity giữa vector input và vector các câu trong DB.

**Dẫn chứng code (cosine similarity + chọn top-k):**
```js
// findSimilar.js
function cosineSimilarity(vecA, vecB) {
	let dot = 0, normA = 0, normB = 0;
	for (let i = 0; i < vecA.length; i++) {
		dot += vecA[i] * vecB[i];
		normA += vecA[i] * vecA[i];
		normB += vecB[i] * vecB[i];
	}
	return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

similarities.sort((a, b) => b.score - a.score);
return unique.slice(0, k);
```
**Giải thích đoạn code:** Đây là “kNN retrieval” theo nghĩa: chọn k item gần nhất trong không gian vector (không phải kNN classifier). Nó giúp ra gợi ý “hành động được” (questionIds) chứ không chỉ chẩn đoán.

3) **Hybrid strategy (chiến lược lai) để xử lý thiếu dữ liệu**
- Nếu skill có ít attempts: dùng global model.
- Nếu đủ attempts: dùng unified model (giàu feature hơn).

**Dẫn chứng code (hybrid theo attempts):**
```py
# ml/predict_hybrid_unified.py
if attempts < 10:
	X_global = pd.DataFrame([[attempts, correct, accuracy]],
						   columns=['attempts', 'correct', 'accuracy'])
	y_pred = global_model.predict(X_global)[0]
else:
	X_unified_raw = prepare_unified_features(userId, skillId, attempts, correct, accuracy, conn)
	# (rút gọn) reorder cột theo lúc train + apply StandardScaler nếu có
	y_pred = int(unified_model.predict(X_for_model)[0])
```
**Giải thích:** Hybrid là quyết định kiến trúc quan trọng để hệ thống luôn “chạy được” kể cả user mới.

---

**Câu 3.**  
Nếu dữ liệu bị nhiễu hoặc thiếu thì hệ thống xử lý như thế nào?

**Gợi ý trả lời:**
- Tiền xử lý dữ liệu
- Kiểm tra dữ liệu đầu vào
- Áp dụng ngưỡng dữ liệu tối thiểu
- Fallback sang mô hình chung (global model) hoặc rule-based

**Trả lời chi tiết:**

Hệ thống có 3 lớp xử lý khi dữ liệu thiếu/nhiễu:

1) **Ngưỡng dữ liệu tối thiểu + fallback model (đúng theo hybrid strategy)**
- Nếu một skill có `attempts < 10` → không dùng unified model, vì chưa đủ tin cậy; fallback sang global model.

**Dẫn chứng code (hybrid chọn model):**
```py
# ml/predict_hybrid_unified.py
if attempts < 10:
	# Global Model
	...
else:
	# Unified Model
	...
```
**Giải thích:** Với user mới hoặc skill mới luyện ít, mô hình đơn giản (global) thường ổn định hơn.

2) **Xử lý null/thiếu trong feature engineering (ISNULL / default 0)**
- Khi tính `learning_velocity`, `consistency`, `recency_bias`, code dùng `ISNULL(..., 0)` để tránh null làm hỏng feature vector.

**Dẫn chứng code:**
```py
# ml/train_unified_model.py (query)
ISNULL(us.overall_accuracy - us.first_30d_accuracy, 0) AS learning_velocity,
ISNULL(uc.skill_consistency, 0) AS consistency,
ISNULL(us.recent_50_accuracy - us.overall_accuracy, 0) AS recency_bias,
```
**Giải thích:** Nếu user chưa đủ dữ liệu 30 ngày đầu, hoặc chưa đủ skill để tính STDEV, hệ thống vẫn tạo được feature vector hợp lệ.

3) **Điều kiện gán nhãn động có guard (tránh nhiễu khi dataset quá ít)**
- Với unified model, nhãn `isWeak` dùng ngưỡng động khi đủ điều kiện, nếu không đủ thì fallback về ngưỡng cố định 0.6.

**Dẫn chứng code (dynamic_ok + fallback):**
```py
# ml/train_unified_model.py
dynamic_ok = (
	(df['attempts'] >= min_attempts_for_dynamic)
	& (user_num_skills >= min_skills_for_dynamic)
	& (user_std_skill_acc.notna())
	& (user_std_skill_acc > 1e-12)
)

df['isWeak'] = ((df['skill_accuracy'] < dynamic_threshold) & dynamic_ok) | (
	(df['skill_accuracy'] < fallback_threshold) & (~dynamic_ok)
)
```
**Giải thích:** Khi user có quá ít skill hoặc std≈0, ngưỡng động không ổn định → hệ thống tự chuyển sang rule cứng 0.6.

---

### 2. Giao diện (0.5 điểm)

**Câu 4.**  
Giao diện hệ thống được thiết kế theo nguyên tắc nào?

**Gợi ý trả lời:**
- Đơn giản, trực quan
- Dễ sử dụng cho người dùng phổ thông
- Tối ưu trải nghiệm người dùng (UX)

**Trả lời chi tiết (gắn với “phần thông minh”):**

Nguyên tắc UI/UX chính ở đây là: **người dùng không cần hiểu ML** nhưng vẫn “cảm nhận được” hệ thống cá nhân hoá nhờ:
- Tự động hiển thị gợi ý theo user (gọi API theo `userId`).
- Có endpoint “details” trả về **đầy đủ câu hỏi + media** để render ngay.
- Tối ưu thời gian chờ bằng cache DB-first và background trigger.

**Dẫn chứng code (frontend gọi API ML):**
```ts
// chatbot-toeic-frontend/src/services/mlRecommendation_services.ts
export const getMLRecommendationsAPI = async (userId: number) => {
	const response = await axios.get(`${API_URL}/api/ml/recommend/${userId}`, {
		withCredentials: true
	});
	return response.data;
}

export const getMLRecommendationDetailsAPI = async (userId: number) => {
	const response = await axios.get(`${API_URL}/api/ml/recommend/details/${userId}`, {
		withCredentials: true
	});
	return response.data;
}
```
**Giải thích đoạn code:** UI chỉ cần gọi 2 API. Endpoint `/details` trả “questions” đã join media/type/part nên frontend giảm xử lý phức tạp.

---

### 3. Phần thông minh (1 điểm)

**Câu 5.**  
Yếu tố nào khiến hệ thống được gọi là “thông minh”?

**Gợi ý trả lời:**
- Không chỉ hiển thị dữ liệu
- Có khả năng phân tích và suy luận
- Kết quả phụ thuộc vào dữ liệu người dùng

**Trả lời chi tiết:**

Hệ thống được gọi là “thông minh” vì nó làm được 3 việc mà hệ CRUD thuần không có:

1) **Phân tích hành vi**: từ lịch sử trả lời (`UserResults`) hệ thống tính các đặc trưng hành vi (accuracy tổng, trend gần đây, độ ổn định theo skill…).

2) **Suy luận / dự đoán**: dùng ML (`GaussianNB`) để suy ra “skill nào yếu” (không phải do người dùng tự khai báo).

3) **Cá nhân hoá hành động**: trả về danh sách `questionIds` để luyện ngay, dựa trên embedding similarity (kNN retrieval).

**Dẫn chứng code (API trả cache + nếu stale thì tự chạy Python):**
```js
// src/controllers/ml_recommendation_controller.js
let prediction = await db.MLPrediction.findOne({ where: { userId } });
if (prediction && isFresh && hasData) {
	return res.status(200).json({
		data: { userId: prediction.userId, weakSkills, questionIds }
	});
}

// nếu không có cache usable -> spawn python
const pythonProcess = spawn('python', [mlScriptPath, userId.toString(), '--quiet', '--out', outPath]);
```
**Giải thích:** “Thông minh” ở chỗ hệ thống tự phân tích→tự tính toán→tự tạo đầu ra cá nhân hoá, và còn tối ưu hiệu năng bằng cache.

---

**Câu 6.**  
Hệ thống học từ dữ liệu như thế nào?

**Gợi ý trả lời:**
- Học từ lịch sử sử dụng của người dùng
- Cập nhật dữ liệu theo thời gian
- Cá nhân hóa kết quả theo từng người dùng

**Trả lời chi tiết:**

Có 2 cách “học từ dữ liệu” trong hệ thống:

1) **Offline learning (retrain định kỳ):**
- Cron job chạy `train_model.py` và `train_unified_model.py` để cập nhật model theo dữ liệu mới trong DB.

**Dẫn chứng code (cron retrain):**
```js
// src/cronJobs/mlRetrainCron.js
cron.schedule("*/10 * * * *", async () => {
	await runPythonScript(path.join(mlPath, 'train_model.py'), mlPath);
	await runPythonScript(path.join(mlPath, 'train_unified_model.py'), mlPath);
});
```
**Giải thích:** Retrain giúp model “cập nhật kiến thức” từ dữ liệu mới, tăng khả năng thích nghi lâu dài.

2) **Online adaptation (cập nhật kết quả dự đoán theo thời gian):**
- Mỗi lần user submit test/practice → hệ thống trigger chạy dự đoán lại và lưu vào DB.

**Dẫn chứng code (submit → trigger ML background):**
```js
// src/controllers/question_test_controller.js
const result = await SubmitTestResult({ userId, testId, answers });
triggerMLPredictionAsync(userId); // chạy nền, không chặn response
```
**Giải thích:** User càng làm nhiều, DB càng dày, dự đoán càng “đúng user hơn”.

---

### 4. Tương tác ứng dụng và phần thông minh (1 điểm)

**Câu 7.**  
Người dùng tương tác với phần thông minh ở những điểm nào trong hệ thống?

**Gợi ý trả lời:**
- Nhận gợi ý hoặc khuyến nghị
- Nhận cảnh báo hoặc đánh giá
- Nhận kết quả phân tích

**Trả lời chi tiết (điểm chạm thực tế trong code):**

Người dùng “chạm” phần thông minh ở 2 điểm chính:

1) **Khi hoàn thành bài (submit test/practice):**
- Backend tự động chạy dự đoán (background), chuẩn bị sẵn kết quả.

**Dẫn chứng code:**
```js
// src/controllers/question_test_controller.js
triggerMLPredictionAsync(userId);
```
**Giải thích:** User không phải bấm “tạo gợi ý” thủ công; hệ thống chủ động tính.

2) **Khi xem gợi ý luyện tập / bài luyện cá nhân hoá:**
- Frontend gọi API `/api/ml/recommend/:userId` hoặc `/api/ml/recommend/details/:userId`.

**Dẫn chứng code (frontend API calls):**
```ts
// chatbot-toeic-frontend/src/services/mlRecommendation_services.ts
axios.get(`${API_URL}/api/ml/recommend/${userId}`)
axios.get(`${API_URL}/api/ml/recommend/details/${userId}`)
```
**Giải thích:** Đây là nơi user “nhìn thấy” sự thông minh: kết quả khác nhau theo từng user.

---

**Câu 8.**  
Nếu người dùng không làm theo gợi ý của hệ thống thì có ảnh hưởng gì không?

**Gợi ý trả lời:**
- Không ảnh hưởng đến hệ thống
- Hệ thống tiếp tục thu thập dữ liệu
- Điều chỉnh mô hình dựa trên hành vi thực tế

**Trả lời chi tiết:**

Về mặt kỹ thuật, **không bắt buộc** user phải làm theo gợi ý.
- Hệ thống vẫn ghi lịch sử làm bài vào `UserResults` như bình thường.
- ML chỉ dựa trên hành vi thực tế (các câu user làm) → lần dự đoán sau sẽ phản ánh hành vi đó.

**Dẫn chứng code (ML dựa vào UserResults, không phụ thuộc việc user “click gợi ý”):**
```py
# ml/train_model.py (query)
FROM UserResults ur
JOIN QuestionSkills qs ON ur.questionId = qs.questionId
```
**Giải thích:** Dữ liệu đầu vào của ML là “kết quả làm bài”. User không cần làm theo gợi ý thì hệ thống vẫn học theo dữ liệu thực.

---

## II. CHỨC NĂNG (3 điểm)

### 5. Người dùng nhập liệu được (1 điểm)

**Câu 9.**  
Người dùng có thể nhập những loại dữ liệu nào vào hệ thống?

**Gợi ý trả lời:**
- Thông tin cá nhân
- Dữ liệu tương tác
- Kết quả bài làm / hành vi người dùng

**Trả lời chi tiết (nhìn theo luồng ML):**

Các dữ liệu người dùng “nhập” quan trọng nhất để tạo ra tính thông minh là:

1) **Câu trả lời khi làm bài (answers)**
- Khi submit, client gửi mảng `answers` lên backend.

**Dẫn chứng code (controller nhận answers):**
```js
// src/controllers/question_test_controller.js
const { answers } = req.body;
if (!userId || !testId || !Array.isArray(answers) || answers.length === 0) {
	return res.status(400).json({ message: 'Missing or invalid parameters' });
}
```
**Giải thích:** `answers` chính là đầu vào tạo ra `UserResults` (lịch sử làm bài) → ML dùng làm dữ liệu học/dự đoán.

2) **Thời gian làm bài (durationSeconds) khi practice**
- Là dữ liệu phụ, phục vụ thống kê/analytics; ML hiện tại tập trung chủ yếu vào đúng/sai + thời gian theo ngày.

**Dẫn chứng code:**
```js
// src/controllers/question_test_controller.js
const { answers, durationSeconds } = req.body;
const result = await SubmitPracticeResult({ userId, answers, durationSeconds });
```
**Giải thích:** Duration có thể dùng mở rộng trong tương lai làm feature về tốc độ/độ chắc.

---

**Câu 10.**  
Dữ liệu người dùng nhập vào được xử lý như thế nào trước khi đưa vào hệ thống thông minh?

**Gợi ý trả lời:**
- Kiểm tra hợp lệ (validation)
- Chuẩn hóa dữ liệu
- Lưu vào CSDL và đưa vào mô hình

**Trả lời chi tiết:**

Luồng xử lý dữ liệu trước khi “đi vào ML” gồm 3 bước:

1) **Validation ở controller**
- Kiểm tra `answers` là mảng và không rỗng, kiểm tra tham số cơ bản.

**Dẫn chứng code:**
```js
// src/controllers/question_test_controller.js
if (!userId || !testId || !Array.isArray(answers) || answers.length === 0) {
	return res.status(400).json({ message: 'Missing or invalid parameters' });
}
```
**Giải thích:** Chặn request lỗi để tránh ghi dữ liệu “rác” vào DB.

2) **Lưu dữ liệu vào DB (UserResults)**
- Sau khi lưu thành công, dữ liệu ở dạng chuẩn hoá theo schema, có FK rõ ràng.

**Dẫn chứng code (schema DB chốt dữ liệu):**
```js
// src/models/UserResults.js
tableName: 'UserResults',
userId / userTestId / questionId đều required (allowNull: false)
```
**Giải thích:** DB schema là “hàng rào” đảm bảo dữ liệu có cấu trúc.

3) **Trigger ML chạy nền và tự trích đặc trưng (feature extraction) từ DB**
- ML không dùng trực tiếp `answers` thô; nó đọc lại từ DB và tính feature.

**Dẫn chứng code (trigger ML + python đọc DB):**
```js
// src/services/mlPredictionService.js
const pythonProcess = spawn('python', [mlScriptPath, userId.toString(), '--quiet', '--out', outPath]);
```
```py
# ml/train_unified_model.py
df = pd.read_sql(query, conn)  # feature extraction từ DB
```
**Giải thích:** Thiết kế này giúp ML luôn dựa trên dữ liệu chuẩn trong DB (single source of truth).

---

### 6. Hiện thực giải thuật thông minh (1 điểm)

**Câu 11.**  
Giải thuật thông minh của hệ thống đã được hiện thực hóa hay chỉ dừng ở mức ý tưởng?

**Gợi ý trả lời:**
- Đã được hiện thực bằng code
- Có pipeline xử lý rõ ràng
- Có mô hình hoặc module chạy thực tế

**Trả lời chi tiết:**

Hệ thống đã **hiện thực hoá đầy đủ bằng code** và có thể chạy thực tế:

1) **Training scripts** (tạo model `.pkl`):
- `ml/train_model.py` (global model)
- `ml/train_unified_model.py` (unified model + scaler)

**Dẫn chứng code (train global model):**
```py
# ml/train_model.py
model = GaussianNB()
model.fit(X_train, y_train)
joblib.dump(model, model_path)
```
**Giải thích:** Đây là code train thật và lưu model thật.

2) **Prediction scripts** (đọc DB → predict → xuất JSON):
- `ml/predict_hybrid_unified.py`

3) **Backend integration** (API gọi python + cache DB):
- `src/controllers/ml_recommendation_controller.js`
- `src/services/mlPredictionService.js`

**Dẫn chứng code (API spawn python + lưu cache):**
```js
// src/controllers/ml_recommendation_controller.js
const pythonProcess = spawn('python', pythonArgs, { stdio: ['ignore', 'ignore', 'pipe'] });
const [savedPrediction] = await db.MLPrediction.upsert({ userId, weakSkills, questionIds });
```
**Giải thích:** Không chỉ “ý tưởng”; backend có endpoint chạy thật và lưu kết quả để phục vụ UI.

---

**Câu 12.**  
Thuật toán đang sử dụng có những điểm hạn chế hoặc nhược điểm nào?

**Gợi ý trả lời:**
- Phụ thuộc vào chất lượng dữ liệu
- Cần đủ số lượng mẫu để chính xác
- Có thể cải tiến bằng thuật toán khác

**Trả lời chi tiết (nêu đúng theo thiết kế hiện có):**

1) **Naive Bayes giả định độc lập điều kiện giữa các feature**
- GaussianNB thường giả định các feature “tương đối độc lập”. Trong thực tế, `overall_accuracy`, `correct`, `attempts` có thể liên quan nhau.

2) **Cold-start / thiếu dữ liệu vẫn là vấn đề**
- Hệ thống đã xử lý bằng hybrid (global cho attempts < 10), nhưng chất lượng dự đoán với user rất mới vẫn bị giới hạn.

**Dẫn chứng code (hybrid handle cold-start):**
```py
# ml/predict_hybrid_unified.py
if attempts < 10:
	# Global Model (cold-start)
	...
```

3) **Embedding retrieval phụ thuộc coverage embeddings**
- Nếu câu hỏi chưa có embedding trong `QuestionEmbeddings`, phần gợi ý tương tự sẽ thiếu dữ liệu.

**Dẫn chứng code (generate embeddings và lưu DB):**
```js
// src/services/embeddingService.js
await db.QuestionEmbedding.upsert({ questionId, model: "all-MiniLM-L6-v2", dim, vector: vector.join(",") });
```
**Giải thích:** Muốn recommendation tốt, cần pipeline tạo embedding đầy đủ.

4) **Tính ổn định khi chạy trên Windows/console encoding**
- Python scripts có đoạn “reconfigure UTF-8” để tránh lỗi encode.

**Dẫn chứng code:**
```py
# ml/predict_hybrid_unified.py
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')
```
**Giải thích:** Đây là nhược điểm triển khai (environment-specific), không phải thuật toán, nhưng ảnh hưởng vận hành.

---

### 7. Hoạt động đủ chức năng (1 điểm)

**Câu 13.**  
Hệ thống hiện tại đã đáp ứng đầy đủ các chức năng đề ra ban đầu chưa?

**Gợi ý trả lời:**
- Đã đáp ứng mục tiêu chính
- Một số chức năng nâng cao sẽ phát triển thêm

**Trả lời chi tiết (đánh giá theo code đang có):**

Các mục tiêu cốt lõi của “hệ thống thông minh” đã có đủ:
- **Thu thập dữ liệu hành vi** (UserResults).
- **Dự đoán skill yếu** (global + unified model).
- **Gợi ý câu hỏi** (questionIds + endpoint details).
- **Tự động hoá chạy sau submit** và **cache để trả nhanh**.

**Dẫn chứng code (tự động hoá sau submit + cache):**
```js
// src/controllers/question_test_controller.js
triggerMLPredictionAsync(userId);
```
```js
// src/controllers/ml_recommendation_controller.js
let prediction = await db.MLPrediction.findOne({ where: { userId } });
```

Những phần “nâng cao” có thể phát triển thêm (nhưng hiện chưa thấy triển khai đầy đủ trong code):
- Tính “confidence” thật từ model (hiện nhiều chỗ gán tạm `0.8`).

**Dẫn chứng code (TODO confidence):**
```js
// src/controllers/ml_recommendation_controller.js
confidence: 0.8, // TODO: Calculate from model
```

---

**Câu 14.**  
Hệ thống có hoạt động ổn định khi demo hoặc chạy thực tế không?

**Gợi ý trả lời:**
- Đã được kiểm thử
- Hoạt động ổn định
- Có log và kết quả thực tế

**Trả lời chi tiết (các cơ chế giúp ổn định):**

1) **DB-first caching** giảm độ trễ và giảm rủi ro “Python chết là API chết”
- Nếu cache còn fresh → trả ngay, không cần chạy Python.

**Dẫn chứng code (TTL cache):**
```js
// src/controllers/ml_recommendation_controller.js
const CACHE_TTL_MS = 2 * 60 * 1000;
if (prediction && isFresh && hasData) {
	return res.status(200).json({ message: "... (from cache)", data: { weakSkills, questionIds } });
}
```

2) **Background trigger sau submit** không chặn response

**Dẫn chứng code:**
```js
// src/services/mlPredictionService.js
setImmediate(async () => {
	try { await runPythonPrediction(userId); } catch (e) { /* only log */ }
});
```
**Giải thích:** Nếu ML lỗi, user vẫn nhận được kết quả submit, hệ thống chỉ log lỗi.

3) **Cron retrain có log + filter warnings**

**Dẫn chứng code:**
```js
// src/cronJobs/mlRetrainCron.js
if (!error.includes('FutureWarning') && !error.includes('DeprecationWarning')) {
	console.error('[ML Retrain Error]', error.trim());
}
```
**Giải thích:** Giảm nhiễu log, tập trung vào lỗi thật khi vận hành.

---

## III. THÔNG MINH (3 điểm)

### 8. Mang lại trải nghiệm thông minh cho người dùng (1 điểm)

**Câu 15.**  
Người dùng cảm nhận được sự “thông minh” của hệ thống ở những điểm nào?

**Gợi ý trả lời:**
- Gợi ý đúng trọng tâm
- Ít thao tác thủ công
- Phản hồi theo ngữ cảnh

**Trả lời chi tiết:**

User cảm nhận “thông minh” tại các điểm:

1) **Gợi ý đúng trọng tâm (theo skill yếu)**
- ML trả về `weakSkills` theo userId.

2) **Ít thao tác thủ công**
- Sau submit, hệ thống tự chạy ML (background) để “làm sẵn” kết quả.

3) **Phản hồi theo ngữ cảnh (có câu hỏi cụ thể + media)**
- Endpoint `/recommend/details` trả full question detail để user luyện ngay.

**Dẫn chứng code (details include media/type/part):**
```js
// src/controllers/ml_recommendation_detail_controller.js
const questions = await db.Question.findAll({
	where: { id: questionIds },
	include: [
		{ model: db.QuestionType, as: 'questionType' },
		{ model: db.Part, as: 'part' },
		{ model: db.QuestionMediaMap, as: 'mediaMappings', include: [{ model: db.MediaFiles, as: 'media' }] }
	]
});
```
**Giải thích:** Không chỉ trả ID; hệ thống trả data đủ để UI hiển thị bài luyện (kể cả listening có audio).

---

### 9. Khả năng cải thiện tính thông minh (1 điểm)

**Câu 16.**  
Khi có thêm dữ liệu, hệ thống có trở nên thông minh hơn không? Vì sao?

**Gợi ý trả lời:**
- Có
- Độ chính xác tăng
- Cá nhân hóa tốt hơn

**Trả lời chi tiết:**

Có, vì:

1) **Nhiều dữ liệu → feature ổn định hơn**
- Các feature như `consistency` (STDEV), `recency_bias` (50 câu gần nhất) cần đủ dữ liệu để đáng tin.

2) **Hybrid tự chuyển qua unified model khi attempts đủ lớn**
- User luyện nhiều → nhiều skill đạt `attempts >= 10` → unified model được dùng nhiều hơn.

3) **Retrain định kỳ**
- Model được học lại từ dữ liệu mới trong DB.

**Dẫn chứng code (feature phụ thuộc dữ liệu + retrain):**
```py
# ml/train_unified_model.py
ISNULL(uc.skill_consistency, 0) AS consistency,
ISNULL(us.recent_50_accuracy - us.overall_accuracy, 0) AS recency_bias,
```
```js
// src/cronJobs/mlRetrainCron.js
await runPythonScript(unifiedModelScript, mlPath);
```

---

**Câu 17.**  
Hệ thống có khả năng thay đổi hoặc nâng cấp thuật toán trong tương lai không?

**Gợi ý trả lời:**
- Có
- Thiết kế module độc lập
- Dễ thay thế hoặc nâng cấp mô hình

**Trả lời chi tiết:**

Có, vì thiết kế đang “module hoá” theo đúng 3 lớp:

1) **Training** là script riêng (`train_model.py`, `train_unified_model.py`) → có thể thay GaussianNB bằng model khác (LogReg, XGBoost, …) miễn vẫn output `.pkl` và thống nhất feature schema.

2) **Prediction** là script riêng (`predict_hybrid_unified.py`) → có thể thay logic hybrid/threshold hoặc thay cách chọn câu gợi ý.

3) **Backend integration** giao tiếp với ML qua “spawn python + đọc JSON output” → thay model không cần đổi frontend.

**Dẫn chứng code (backend tách biệt ML qua subprocess):**
```js
// src/services/mlPredictionService.js
const pythonProcess = spawn('python', [mlScriptPath, userId.toString(), '--quiet', '--out', outPath]);
```
**Giải thích:** Backend coi ML như “worker” độc lập. Nâng cấp thuật toán chủ yếu nằm trong Python scripts và model files.

---

### 10. Thể hiện sự thông minh cho người dùng trải nghiệm (1 điểm)

**Câu 18.**  
Nếu không nhìn vào code, làm sao người dùng biết đây là một hệ thống thông minh?

**Gợi ý trả lời:**
- Kết quả khác nhau cho mỗi người dùng
- Có dự đoán và gợi ý
- Có yếu tố cá nhân hóa rõ rệt

**Trả lời chi tiết (trải nghiệm quan sát được):**

Người dùng không cần xem code vẫn thấy “thông minh” vì:

1) **2 người khác nhau sẽ nhận gợi ý khác nhau**
- API được gọi theo `userId` và kết quả lấy từ DB cache theo `userId`.

**Dẫn chứng code (cache per-user):**
```js
// src/controllers/ml_recommendation_controller.js
await db.MLPrediction.findOne({ where: { userId } });
```

2) **Có “dự đoán + hành động”**
- Không chỉ nói “yếu skill”, mà trả câu hỏi cụ thể để luyện.

**Dẫn chứng code (details trả questions):**
```js
// src/controllers/ml_recommendation_detail_controller.js
return res.status(200).json({ data: { weak_skills: ..., questions: transformedQuestions } });
```

3) **Kết quả cập nhật theo thời gian**
- Sau mỗi lần submit, ML được chạy lại nền.

**Dẫn chứng code:**
```js
// src/controllers/question_test_controller.js
triggerMLPredictionAsync(userId);
```

---

## IV. TRÌNH BÀY (0.5 điểm)

**Câu 19.**  
Hãy mô tả ngắn gọn luồng hoạt động tổng thể của hệ thống.

**Gợi ý trả lời:**
1. Người dùng nhập dữ liệu  
2. Hệ thống xử lý  
3. Module thông minh phân tích  
4. Trả kết quả cho người dùng  

**Trả lời chi tiết (luồng đúng theo code):**

1) **User làm bài và submit**
- Controller nhận `answers` và lưu kết quả (service), sau đó trigger ML chạy nền.

**Dẫn chứng code:**
```js
// src/controllers/question_test_controller.js
const result = await SubmitTestResult({ userId, testId, answers });
triggerMLPredictionAsync(userId);
```

2) **ML chạy nền hoặc chạy khi user gọi API recommend**
- Nếu user gọi API và cache stale/missing → backend spawn Python `predict_hybrid_unified.py`.

**Dẫn chứng code:**
```js
// src/controllers/ml_recommendation_controller.js
const pythonProcess = spawn('python', [mlScriptPath, userId.toString(), '--quiet', '--out', outPath]);
```

3) **Python đọc DB → dự đoán skill yếu (global/unified) → gợi ý câu hỏi**
- Feature extraction từ `UserResults` + `QuestionSkills`.
- Recommendation dùng `findSimilar.js` (embedding cosine similarity).

4) **Lưu cache và trả kết quả cho UI**
- Lưu vào `MLPredictions` (upsert) và `MLPredictionHistory` (insert).
- UI gọi `/details` để lấy full question data + media.

**Dẫn chứng code (lưu cache + history):**
```js
// src/services/mlPredictionService.js
await db.MLPrediction.upsert({ userId, weakSkills, questionIds, ... });
await db.MLPredictionHistory.create({ userId, weakSkills, questionIds, ... });
```

---

**Câu 20.**  
Nếu phải giải thích hệ thống cho người không học CNTT, bạn sẽ mô tả như thế nào?

**Gợi ý trả lời:**
- Hệ thống giúp người dùng đưa ra quyết định tốt hơn
- Phân tích dữ liệu thay cho con người
- Đưa ra gợi ý thông minh, dễ hiểu

**Trả lời chi tiết (dễ hiểu, tránh thuật ngữ nặng):**

Hệ thống giống như một “gia sư tự động”:
- Mỗi lần bạn làm bài, hệ thống ghi lại bạn đúng/sai ở từng dạng câu.
- Từ lịch sử đó, hệ thống tự nhận ra bạn đang yếu phần nào.
- Sau đó, hệ thống chọn đúng những câu phù hợp để bạn luyện thêm (đưa ra luôn danh sách câu hỏi).
- Bạn làm càng nhiều, hệ thống càng hiểu bạn hơn và gợi ý càng sát hơn.

**Dẫn chứng code (1 câu “giải thích bằng code” ngắn gọn):**
```js
// src/controllers/question_test_controller.js
// 1) user submit -> 2) hệ thống tự chạy ML
triggerMLPredictionAsync(userId);
```
**Giải thích:** Chỉ cần người dùng học bình thường, hệ thống tự phân tích và tự gợi ý, người dùng không phải thao tác kỹ thuật.

---

## Ghi chú khi vấn đáp

- Ưu tiên dùng các từ khóa: **phân tích – dự đoán – cá nhân hóa – học từ dữ liệu**
- Tránh nói “em nghĩ”, nên dùng “hệ thống được thiết kế để…”
- Khi bí câu hỏi, quay lại **mục tiêu chính của hệ thống**

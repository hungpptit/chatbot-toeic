# Tài Liệu Phân Tích Hệ Thống Chatbot TOEIC

## 1. Giới Thiệu Chung

Tài liệu này nhằm mục đích giải thích các khía cạnh thông minh của hệ thống Chatbot TOEIC, cách thức hoạt động, tiềm năng phát triển và cấu trúc cơ sở dữ liệu liên quan đến các tính năng AI.

Hệ thống được xây dựng với mục tiêu không chỉ là một công cụ luyện thi TOEIC thông thường mà còn là một người bạn đồng hành thông minh, có khả năng hiểu và cá nhân hóa lộ trình học tập cho từng người dùng.

---

## 2. Hệ Thống Này Thông Minh Ở Chỗ Nào?

Sự thông minh của hệ thống thể hiện ở hai khía cạnh chính: **Dự đoán điểm yếu** của người dùng và **Tìm kiếm câu hỏi tương tự** để luyện tập chuyên sâu.

### 2.1. Dự Đoán Điểm Yếu và Gợi Ý Luyện Tập (Personalized Learning)

Đây là tính năng cốt lõi, giúp hệ thống "hiểu" được người dùng đang gặp khó khăn ở đâu.

#### a. Cách thức hoạt động:

1.  **Thu thập dữ liệu:** Sau mỗi lần người dùng làm bài kiểm tra, hệ thống sẽ lưu lại kết quả chi tiết của từng câu trả lời vào bảng `UserResults`. Dữ liệu này bao gồm `userId`, `questionId`, và quan trọng nhất là `isCorrect` (đúng hay sai).

2.  **Kích hoạt mô hình AI:** Khi có đủ dữ liệu, một tiến trình nền được kích hoạt để chạy mô hình Machine Learning.
    *   **Dẫn chứng code:** Trong file `chatbot-toeic-backend/src/services/ml_service.js`, hàm `triggerMLPrediction` sẽ được gọi sau khi người dùng hoàn thành một bài thi. Hàm này sử dụng `child_process.spawn` để thực thi một script Python.

    ```javascript
    // File: chatbot-toeic-backend/src/services/ml_service.js

    export const triggerMLPrediction = (userId) => {
        console.log(`🤖 [Background] Triggering ML prediction for user ${userId}...`);
        const pythonProcess = spawn('python', [
            './src/services/predict_adapter.py', // Script trung gian
            userId
        ]);
        // ... xử lý output từ script Python
    };
    ```

3.  **Phân tích và dự đoán:** Script Python (`predict_hybrid_unified.py`) sẽ:
    *   Tải dữ liệu lịch sử làm bài của người dùng.
    *   Sử dụng mô hình đã được huấn luyện trước (`weak_skill_model.pkl` và `unified_model.pkl`) để phân tích và xác định các **kỹ năng yếu nhất** (ví dụ: "Listening", "Grammar - Tense", "Vocabulary - Business").
    *   Tạo ra một danh sách các câu hỏi được đề xuất để người dùng luyện tập thêm nhằm cải thiện các kỹ năng yếu đó.
    *   **Dẫn chứng code:**

    ```python
    # File: chatbot-toeic-backend/ml/predict_hybrid_unified.py

    def predict_weak_skills(user_id, historical_data):
        # ... (logic tải mô hình và xử lý dữ liệu)
        predictions = model.predict_proba(user_features)
        # ... (xác định kỹ năng yếu dựa trên xác suất)
        return weak_skills

    def get_remedial_questions(weak_skills, historical_data, all_questions):
        # ... (logic chọn câu hỏi phù hợp để cải thiện kỹ năng yếu)
        return recommended_questions
    ```

4.  **Lưu kết quả:** Kết quả dự đoán (kỹ năng yếu, danh sách câu hỏi đề xuất) sẽ được lưu vào bảng `MLPredictions`. Điều này giúp hệ thống có thể nhanh chóng truy xuất và gợi ý cho người dùng trong các lần tương tác tiếp theo.

### 2.2. Tìm Kiếm Câu Hỏi Tương Tự (Semantic Search)

Khi người dùng gặp khó khăn với một câu hỏi cụ thể, hệ thống có thể tìm ra các câu hỏi khác **tương tự về mặt ngữ nghĩa** để họ luyện tập.

#### a. Cách thức hoạt động:

1.  **Vector hóa câu hỏi (Embeddings):** Hệ thống không chỉ lưu trữ nội dung text của câu hỏi. Thay vào đó, nó sử dụng một mô hình ngôn ngữ (thông qua thư viện `@xenova/transformers`) để chuyển đổi nội dung của mỗi câu hỏi thành một vector số học (gọi là embedding). Vector này đại diện cho ý nghĩa ngữ nghĩa của câu hỏi.
    *   **Dẫn chứng code:**

    ```javascript
    // File: chatbot-toeic-backend/src/services/embeddingService.js

    import { pipeline } from '@xenova/transformers';

    class EmbeddingService {
        static instance;
        static async getInstance() {
            if (!this.instance) {
                // Dùng mô hình 'glove-wiki-gigaword-50' để tạo vector
                this.instance = await pipeline('feature-extraction', 'Xenova/glove-wiki-gigaword-50');
            }
            return this.instance;
        }
        // ...
    }
    ```

2.  **Tìm kiếm dựa trên sự tương đồng vector:** Khi cần tìm câu hỏi tương tự, hệ thống sẽ:
    *   Lấy vector embedding của câu hỏi gốc.
    *   So sánh vector này với tất cả các vector của các câu hỏi khác trong cơ sở dữ liệu.
    *   Phép so sánh này thường dùng "cosine similarity" để đo lường khoảng cách/sự giống nhau về mặt ngữ nghĩa.
    *   Những câu hỏi có vector gần nhất với vector của câu hỏi gốc sẽ được xem là tương tự nhất.
    *   **Dẫn chứng code:** Logic này được xử lý trong `question_service.js` (hàm `findSimilarQuestions`).

    ```javascript
    // File: chatbot-toeic-backend/src/services/question_service.js

    async function findSimilarQuestions(questionId) {
        const originEmbedding = await db.QuestionEmbeddings.findOne({ where: { questionId } });
        // ...
        const allEmbeddings = await db.QuestionEmbeddings.findAll();

        const similarities = allEmbeddings.map(emb => {
            const similarity = cosineSimilarity(originEmbedding.embedding, emb.embedding);
            return { questionId: emb.questionId, similarity };
        });

        // Sắp xếp và lấy ra các câu hỏi có độ tương đồng cao nhất
        similarities.sort((a, b) => b.similarity - a.similarity);
        // ...
    }
    ```

---

## 3. Hệ Thống Có Thể Thông Minh Hơn Không?

**Câu trả lời là CÓ.** Hệ thống được thiết kế để có thể "học" và trở nên thông minh hơn theo thời gian.

### a. Học từ dữ liệu người dùng (Online Learning/Continuous Improvement):

Mô hình dự đoán điểm yếu không phải là một mô hình tĩnh. Nó có thể được cải thiện liên tục dựa trên chính dữ liệu mà người dùng tạo ra.

1.  **Lưu trữ lịch sử dự đoán:** Mỗi khi mô hình đưa ra một dự đoán về điểm yếu, kết quả này không chỉ được lưu ở `MLPredictions` (bảng trạng thái hiện tại) mà còn được ghi lại trong `MLPredictionHistory`.
    *   **Dẫn chứng:** Model `MLPredictionHistory.js` được thiết kế để lưu lại các snapshot của dự đoán theo thời gian.

2.  **Tái huấn luyện (Re-training):** Dữ liệu trong `UserResults` và `MLPredictionHistory` là nguồn tài nguyên quý giá. Định kỳ (ví dụ: hàng tuần, hàng tháng), chúng ta có thể sử dụng dữ liệu mới này để **huấn luyện lại** mô hình `weak_skill_model.pkl`.
    *   **Quy trình:**
        *   Trích xuất dữ liệu mới từ CSDL.
        *   Chạy lại script `train_model.py` hoặc `train_unified_model.py` với bộ dữ liệu đã được bổ sung.
        *   Mô hình mới sau khi huấn luyện sẽ có khả năng dự đoán chính xác hơn, vì nó đã "học" được từ các mẫu dữ liệu mới nhất của người dùng.

3.  **Vòng lặp cải tiến (Feedback Loop):**
    *   Người dùng làm bài -> Hệ thống dự đoán điểm yếu.
    *   Người dùng luyện tập theo gợi ý -> Hệ thống có thêm dữ liệu mới về sự tiến bộ của người dùng.
    *   Dữ liệu mới được dùng để tái huấn luyện mô hình.
    *   Mô hình mới đưa ra dự đoán tốt hơn.
    *   Đây là một vòng lặp liên tục, giúp hệ thống ngày càng hiểu rõ người dùng và đưa ra gợi ý ngày càng chính xác.

### b. Mở rộng mô hình:

*   **Phân tích sâu hơn:** Thay vì chỉ dự đoán "kỹ năng yếu", mô hình có thể được nâng cấp để dự đoán "xác suất trả lời đúng cho một câu hỏi cụ thể" hoặc "thời gian cần thiết để người dùng thành thạo một kỹ năng".
*   **Cập nhật mô hình embedding:** Sử dụng các mô hình embedding lớn và hiện đại hơn (ví dụ: các biến thể của BERT, GPT) sẽ giúp việc tìm kiếm câu hỏi tương tự trở nên chính xác hơn rất nhiều.

---

## 4. Cấu Trúc Cơ Sở Dữ Liệu (Phần Liên Quan AI)

Dưới đây là giải thích về các bảng (models) quan trọng phục vụ cho các tính năng thông minh.

*   **`Users`**: Lưu thông tin cơ bản của người dùng.
    *   `id`: Khóa chính, định danh người dùng.

*   **`Questions`**: Lưu trữ toàn bộ ngân hàng câu hỏi.
    *   `id`: Khóa chính, định danh câu hỏi.
    *   `content`: Nội dung câu hỏi.
    *   `skillId`: Liên kết tới kỹ năng mà câu hỏi này kiểm tra (ví dụ: Ngữ pháp, Từ vựng).

*   **`UserResults`**: **Bảng quan trọng nhất**, ghi lại chi tiết từng câu trả lời của người dùng. Đây là đầu vào chính cho mô hình AI.
    *   `userId`: Người dùng nào đã trả lời.
    *   `questionId`: Câu hỏi nào đã được trả lời.
    *   `isCorrect`: Câu trả lời đó là **Đúng (1)** hay **Sai (0)**.
    *   `answeredAt`: Thời điểm trả lời.

*   **`QuestionEmbeddings`**: Lưu trữ vector ngữ nghĩa của các câu hỏi.
    *   `questionId`: Liên kết tới câu hỏi.
    *   `embedding`: Một chuỗi/blob chứa vector số học đại diện cho ngữ nghĩa của câu hỏi.

*   **`MLPredictions`**: Lưu trữ **kết quả dự đoán mới nhất** về điểm yếu của người dùng.
    *   `userId`: Khóa chính, kết quả này là của người dùng nào.
    *   `weakSkills`: Một danh sách (JSON) các kỹ năng được mô hình xác định là yếu.
    *   `questionIds`: Một danh sách (JSON) các ID câu hỏi được gợi ý để luyện tập.
    *   `confidence`: Độ tin cậy của mô hình khi đưa ra dự đoán.
    *   `updatedAt`: Lần cuối cùng dự đoán được cập nhật.

*   **`MLPredictionHistory`**: Lưu lại lịch sử của các lần dự đoán.
    *   `predictionId`: Khóa chính.
    *   `userId`: Liên kết tới người dùng.
    *   `weakSkills`, `questionIds`: Dữ liệu dự đoán tại một thời điểm cụ thể.
    *   `createdAt`: Thời điểm mà dự đoán này được tạo ra. Bảng này giúp theo dõi sự tiến bộ của mô hình và cung cấp dữ liệu cho việc tái huấn luyện.

---

## 5. Các Tác Vụ Thủ Công (Dành cho Nhà phát triển)

Phần này giải thích về các script Python trong thư mục `ml` có thể được chạy thủ công để kiểm thử (test), huấn luyện lại (re-train) hoặc bảo trì các mô hình AI.

### 5.1. Chạy Dự Đoán Thủ Công

Bạn có thể chạy dự đoán cho một người dùng cụ thể để kiểm tra kết quả mà mô hình AI trả về.

**Lệnh:**
```bash
python predict_hybrid_unified.py <USER_ID>
```

**Ví dụ:**
```bash
# Chạy dự đoán cho người dùng có ID là 3
python predict_hybrid_unified.py 3
```

#### a. Cách thức hoạt động:

Khi chạy lệnh trên, script `predict_hybrid_unified.py` sẽ thực hiện các bước sau:

1.  **Kết nối CSDL và lấy dữ liệu:** Script kết nối tới SQL Server và thực hiện một câu lệnh SQL để lấy lịch sử làm bài của người dùng được chỉ định (`userId=3`). Dữ liệu bao gồm số lần làm bài (`attempts`) và số lần trả lời đúng (`correct`) cho mỗi kỹ năng.
    *   **Dẫn chứng code:**
    ```python
    # File: chatbot-toeic-backend/ml/predict_hybrid_unified.py

    query = f"""
    SELECT 
        qs.skillId,
        s.name AS skillName,
        COUNT(*) AS attempts,
        SUM(CASE WHEN ur.isCorrect = 1 THEN 1 ELSE 0 END) AS correct
    FROM UserResults ur
    JOIN QuestionSkills qs ON ur.questionId = qs.questionId
    JOIN Skills s ON qs.skillId = s.id
    WHERE ur.userId = {userId}
    GROUP BY qs.skillId, s.name
    """
    df = pd.read_sql(query, conn)
    ```

2.  **Tải các mô hình đã huấn luyện:** Script sẽ tải hai mô hình đã được huấn luyện trước đó từ thư mục `ml/model`:
    *   `weak_skill_model.pkl`: Mô hình global, dùng cho người dùng mới.
    *   `unified_model.pkl`: Mô hình hợp nhất, dùng cho người dùng có nhiều dữ liệu.

3.  **Áp dụng chiến lược "Hybrid":** Script lặp qua từng kỹ năng của người dùng và quyết định mô hình nào sẽ được sử dụng.
    *   **Nếu người dùng mới (ít hơn 10 attempts cho kỹ năng đó):** Script sẽ sử dụng **mô hình global**. Dữ liệu đầu vào cho mô hình này rất đơn giản, chỉ gồm 3 giá trị: `[attempts, correct, accuracy]`.
    *   **Nếu người dùng có đủ dữ liệu (>= 10 attempts):** Script sẽ sử dụng **mô hình hợp nhất**. Trước khi dự đoán, nó sẽ gọi hàm `prepare_unified_features` để chuẩn bị một vector đầu vào phức tạp hơn gồm 9 giá trị, bao gồm cả thông tin tổng quan về người dùng (như `user_level`, `total_tests`, `days_active`) và thông tin về kỹ năng hiện tại.
    *   **Dẫn chứng code:**
    ```python
    # File: chatbot-toeic-backend/ml/predict_hybrid_unified.py

    for index, row in df.iterrows():
        # ...
        if row['attempts'] < 10:
            # Dùng Global Model
            features = [[row['attempts'], row['correct'], accuracy]]
            prediction = global_model.predict(features)[0]
            results[skill_name] = "Weak (global)" if prediction == 1 else "Strong (global)"
        else:
            # Dùng Unified Model
            X_unified = prepare_unified_features(userId, row['skillId'], ...)
            prediction = unified_model.predict(X_unified)[0]
            results[skill_name] = "Weak (unified)" if prediction == 1 else "Strong (unified)"
    ```

4.  **Trả về kết quả:** Script sẽ in ra màn hình và tạo một file JSON chứa các thông tin dự đoán.

#### b. Công dụng:

*   **Debug:** Kiểm tra xem mô hình có đưa ra dự đoán hợp lý cho một người dùng cụ thể hay không.
*   **Kiểm thử:** Sau khi huấn luyện lại mô hình, chạy lệnh này để so sánh kết quả dự đoán trước và sau khi huấn luyện.

---

### 5.2. Huấn Luyện Lại Mô Hình (Re-training)

Đây là bước quan trọng để giúp hệ thống "thông minh hơn theo thời gian".

#### a. Huấn luyện Mô hình Global (`train_model.py`)

Mô hình này đơn giản, dùng cho các user mới chưa có nhiều dữ liệu.

**Lệnh:**
```bash
python train_model.py
```

*   **Cách thức hoạt động:**
    1.  **Query dữ liệu:** Script thực hiện một câu lệnh SQL để tổng hợp dữ liệu từ **tất cả người dùng**. Kết quả là một bảng lớn, mỗi dòng đại diện cho hiệu suất của một người dùng trên một kỹ năng, cùng với một cột `isWeak` (1 nếu `accuracy < 0.6`, ngược lại là 0).
        *   **Dẫn chứng code:**
        ```python
        # File: chatbot-toeic-backend/ml/train_model.py
        query = """
        SELECT 
            ...,
            CAST(...) AS accuracy,
            CASE 
                WHEN CAST(...) < 0.6 THEN 1 ELSE 0 
            END AS isWeak
        FROM UserResults ur ...
        """
        df = pd.read_sql(query, conn)
        ```
    2.  **Chuẩn bị dữ liệu:** Script chọn ra 3 cột `['attempts', 'correct', 'accuracy']` làm `X` (features - đặc trưng đầu vào) và cột `isWeak` làm `y` (target - kết quả cần dự đoán).
    3.  **Huấn luyện:** Dữ liệu được chia thành tập huấn luyện và tập kiểm thử. Mô hình `GaussianNB` (Naive Bayes) được huấn luyện trên tập huấn luyện.
    4.  **Lưu mô hình:** Mô hình sau khi huấn luyện xong sẽ được lưu lại thành file `ml/model/weak_skill_model.pkl`, ghi đè lên file cũ.

*   **Công dụng:** Cập nhật lại "kiến thức nền" tổng quan của hệ thống. Nên chạy định kỳ (ví dụ: hàng tháng).

#### b. Huấn luyện Mô hình Hợp nhất (`train_unified_model.py`)

Mô hình này phức tạp và mang tính cá nhân hóa cao hơn.

**Lệnh:**
```bash
python train_unified_model.py
```

*   **Cách thức hoạt động:**
    1.  **Query dữ liệu nâng cao:** Câu lệnh SQL trong script này phức tạp hơn. Nó không chỉ lấy `attempts` và `correct` cho từng kỹ năng, mà còn kết hợp (JOIN) để lấy thêm các thông tin tổng quan của người dùng như `total_tests`, `total_questions`, `overall_accuracy`, `days_active`.
        *   **Dẫn chứng code:**
        ```python
        # File: chatbot-toeic-backend/ml/train_unified_model.py
        query = """
        WITH UserStats AS (...), SkillStats AS (...)
        SELECT 
            ss.userId, us.total_tests, us.overall_accuracy, ..., ss.attempts, ss.isWeak
        FROM SkillStats ss JOIN UserStats us ON ss.userId = us.userId
        """
        df = pd.read_sql(query, conn)
        ```
    2.  **Kỹ thuật đặc trưng (Feature Engineering):** Script tạo thêm 2 feature mới là `userId_hash` (mã hóa ID người dùng để mô hình coi đó là một đặc trưng) và `user_level` (phân loại người dùng thành Beginner, Intermediate, Advanced dựa trên `overall_accuracy`).
    3.  **Chuẩn bị dữ liệu:** Script chọn ra 9 cột feature để làm `X` và `isWeak` làm `y`.
    4.  **Huấn luyện và Lưu:** Tương tự như mô hình global, mô hình `GaussianNB` được huấn luyện và lưu lại thành file `ml/model/unified_model.pkl`.

*   **Công dụng:** Cải thiện chất lượng dự đoán cá nhân hóa. Nên chạy thường xuyên hơn (ví dụ: hàng tuần) để mô hình luôn cập nhật với sự tiến bộ của người dùng.

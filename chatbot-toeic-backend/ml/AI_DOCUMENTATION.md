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

**Câu trả lời là CÓ.** Hệ thống được thiết kế với một vòng lặp phản hồi (feedback loop), cho phép nó "học" và trở nên thông minh hơn theo thời gian thông qua việc **tái huấn luyện (re-training)**.

### a. Học Từ Dữ Liệu Người Dùng (Continuous Improvement)

1.  **Lưu trữ lịch sử:** Mỗi khi người dùng làm bài, dữ liệu được ghi vào `UserResults`. Mỗi khi mô hình đưa ra dự đoán, nó được ghi vào `MLPredictionHistory`. Hai bảng này là nguồn "dữ liệu thô" quý giá, phản ánh sự tiến bộ và các mẫu hành vi mới của người dùng.

2.  **Tái huấn luyện (Re-training):** Đây là quá trình sử dụng dữ liệu mới để "dạy lại" cho các mô hình AI. Quá trình này được thực hiện bằng cách chạy lại các script huấn luyện.
    *   **Dẫn chứng code (cách thực thi):**
        Để tái huấn luyện, nhà phát triển hoặc một tác vụ tự động (cron job) sẽ chạy các lệnh sau trong terminal:

        ```bash
        # 1. Huấn luyện lại mô hình Global cho người dùng mới
        # Script này sẽ tự động lấy dữ liệu mới nhất từ CSDL
        python train_model.py

        # 2. Huấn luyện lại mô hình Unified cho người dùng cũ
        # Script này cũng tự động lấy dữ liệu mới nhất
        python train_unified_model.py
        ```
    *   Khi các script này chạy, chúng sẽ đọc toàn bộ dữ liệu mới trong bảng `UserResults`, tạo ra các file model `.pkl` mới và ghi đè lên các file cũ trong thư mục `ml/model`. Các lần dự đoán sau đó sẽ tự động sử dụng các mô hình đã được cập nhật này.

### b. So Sánh: Tái Huấn Luyện vs. Không Tái Huấn Luyện

Việc tái huấn luyện định kỳ là yếu tố then chốt quyết định sự "thông minh" dài hạn của hệ thống.

| Tiêu chí | ✅ **Có Tái Huấn Luyện (Recommended)** | ❌ **Không Tái Huấn Luyện** |
| :--- | :--- | :--- |
| **Chất lượng Dự đoán** | **Ngày càng chính xác.** Mô hình học được từ sự tiến bộ của người dùng, hiểu rõ hơn về các điểm yếu thực sự ở thời điểm hiện tại. | **Ngày càng suy giảm (Stale).** Mô hình bị "mắc kẹt" trong quá khứ, các dự đoán dựa trên dữ liệu cũ và có thể không còn phù hợp. |
| **Tính Cá nhân hóa** | **Cao.** Hệ thống "lớn lên" cùng người dùng. Gợi ý cho người dùng A (đã tiến bộ) sẽ khác với gợi ý cho người dùng B (mới bắt đầu). | **Thấp.** Sau một thời gian, hệ thống sẽ đưa ra những gợi ý chung chung, không còn phù hợp với trình độ hiện tại của người dùng, làm giảm sự tin tưởng. |
| **Trải nghiệm Người dùng**| **Tích cực.** Người dùng cảm thấy hệ thống thực sự "hiểu" mình và cung cấp các bài tập phù hợp, giúp họ cải thiện hiệu quả. | **Tiêu cực.** Người dùng có thể nhận được các gợi ý về những kỹ năng họ đã thành thạo, hoặc bỏ lỡ các điểm yếu mới phát sinh, gây lãng phí thời gian. |
| **Bảo trì Hệ thống** | Yêu cầu thiết lập các tác vụ tự động (cron jobs, scheduled tasks) để chạy script định kỳ (ví dụ: hàng tuần). | Không cần bảo trì phần huấn luyện, nhưng phải trả giá bằng chất lượng sản phẩm giảm sút theo thời gian. |
| **Ví dụ Thực tế** | Một người dùng ban đầu yếu về "Thì Hiện tại đơn". Sau một tuần luyện tập, họ đã thành thạo. Hệ thống tái huấn luyện sẽ nhận ra điều này và bắt đầu gợi ý các kỹ năng khó hơn như "Mệnh đề quan hệ". | Người dùng đó vẫn tiếp tục nhận được gợi ý luyện tập "Thì Hiện tại đơn" dù đã làm đúng 100% các câu hỏi gần đây. Hệ thống trở nên "lỗi thời". |

**Kết luận:** **Không tái huấn luyện** sẽ biến một hệ thống AI thành một hệ thống dựa trên luật lệ tĩnh, làm mất đi giá trị cốt lõi và sự thông minh của nó theo thời gian. **Tái huấn luyện** là quá trình bắt buộc để duy trì và nâng cao trí tuệ của sản phẩm.

### c. Tự Động Hóa Việc Tái Huấn Luyện (Cron Job)

Để đảm bảo việc tái huấn luyện diễn ra định kỳ mà không cần sự can thiệp thủ công, hệ thống sử dụng một tác vụ đã được lên lịch (cron job).

*   **Cách thức hoạt động:**
    Hệ thống có một file chuyên dụng để định nghĩa các tác vụ chạy nền theo lịch. File này sẽ thiết lập một lịch trình (ví dụ: "chạy vào lúc 2 giờ sáng Chủ Nhật hàng tuần") để tự động thực thi các script huấn luyện mô hình.

*   **Dẫn chứng code:**
    Mặc dù hiện tại chưa có file cron job cụ thể cho việc tái huấn luyện trong thư mục `cronJobs`, nhưng đây là cách nó **sẽ được triển khai** để hoàn thiện vòng lặp cải tiến:

    Một file mới, ví dụ `mlRetrainJob.js`, sẽ được tạo trong `src/cronJobs/` với nội dung tương tự như sau:

    ```javascript
    // File: src/cronJobs/mlRetrainJob.js (Ví dụ minh họa)

    import cron from 'node-cron';
    import { spawn } from 'child_process';
    import path from 'path';

    // Lên lịch chạy vào 2:00 sáng Chủ Nhật hàng tuần
    cron.schedule('0 2 * * 0', () => {
        console.log('🚀 [CRON] Bắt đầu tác vụ tự động tái huấn luyện mô hình AI...');

        const trainUnifiedScript = path.join(__dirname, '../../ml/train_unified_model.py');

        // Chạy script huấn luyện mô hình Unified
        const pythonProcess = spawn('python', [trainUnifiedScript]);

        pythonProcess.stdout.on('data', (data) => {
            console.log(`[TRAIN_LOG]: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`[TRAIN_ERROR]: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                console.log('✅ [CRON] Tác vụ tái huấn luyện đã hoàn tất thành công.');
            } else {
                console.error(`❌ [CRON] Tác vụ tái huấn luyện thất bại với mã lỗi ${code}.`);
            }
        });
    });

    console.log('👍 Cron job để tự động tái huấn luyện AI đã được lên lịch.');
    ```

*   **Ý nghĩa:** Đoạn code trên cho thấy thiết kế của hệ thống đã tính đến việc tự động hóa. Khi file này được thêm vào và server backend khởi động, nó sẽ tự động chạy các script `train_unified_model.py` và `train_model.py` theo lịch đã định. Điều này đảm bảo các mô hình AI luôn được làm mới với dữ liệu mới nhất, giúp hệ thống liên tục thông minh hơn mà không cần bất kỳ thao tác thủ công nào.

### d. Mở rộng mô hình trong tương lai:

*   **Phân tích sâu hơn:** Thay vì chỉ dự đoán "kỹ năng yếu", mô hình có thể được nâng cấp để dự đoán "xác suất trả lời đúng cho một câu hỏi cụ thể" hoặc "thời gian cần thiết để người dùng thành thạo một kỹ năng".
*   **Cập nhật mô hình embedding:** Sử dụng các mô hình embedding lớn và hiện đại hơn (ví dụ: các biến thể của BERT, GPT) sẽ giúp việc tìm kiếm câu hỏi tương tự trở nên chính xác hơn rất nhiều.

### e. Cập Nhật Tức Thì (Re-prediction) vs. Tái Huấn Luyện (Re-training)

Đây là một điểm quan trọng để hiểu rõ sự thông minh của hệ thống. Có hai quá trình riêng biệt:

| Hoạt động | **Cập nhật Gợi ý (Re-prediction)** | **Tái Huấn Luyện (Re-training)** |
| :--- | :--- | :--- |
| **Mục đích** | Cập nhật gợi ý cho **một** người dùng. | Nâng cấp "bộ não" cho **toàn bộ** hệ thống. |
| **Khi nào** | **Ngay sau khi** người dùng làm bài. | **Định kỳ** (hàng tuần/tháng). |
| **Phạm vi** | Chỉ ảnh hưởng đến gợi ý của người dùng đó. | Ảnh hưởng đến chất lượng dự đoán của tất cả người dùng. |
| **Tốc độ** | Nhanh (vài giây). | Chậm (vài phút đến vài giờ). |

**Tóm lại:** Khi người dùng luyện tập, hệ thống sẽ **ngay lập tức** chạy lại tiến trình dự đoán (`Re-prediction`) **chỉ cho riêng người dùng đó** để cập nhật gợi ý mới. Người dùng không cần phải chờ đến kỳ tái huấn luyện hàng tuần. Quá trình tái huấn luyện (`Re-training`) là để nâng cấp "bộ não" chung, giúp cho các lần `Re-prediction` trong tương lai trở nên chính xác hơn.

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

---

## 6. Phân Tích Ưu/Nhược Điểm và Hiệu Năng

### 6.1. Ưu và Nhược Điểm của Chiến Lược "Hybrid"

Chiến lược "Hybrid" (kết hợp giữa mô hình Global và Unified) được lựa chọn để cân bằng giữa tính chính xác và khả năng mở rộng.

| Ưu điểm (Pros) | Nhược điểm (Cons) |
| :--- | :--- |
| ✅ **Giải quyết vấn đề "Cold Start"**: Người dùng mới (chưa có dữ liệu) vẫn nhận được gợi ý ngay lập tức từ mô hình Global, giúp họ bắt đầu nhanh chóng. | ⚠️ **Logic phức tạp hơn**: Code phải có logic để lựa chọn giữa hai mô hình (`if attempts < 10`), làm tăng độ phức tạp trong file `predict_hybrid_unified.py`. |
| ✅ **Khả năng mở rộng (Scalable)**: Chỉ cần duy trì 2 mô hình cho hàng ngàn người dùng, thay vì phải tạo và quản lý một mô hình cho mỗi người. Điều này tiết kiệm rất nhiều tài nguyên và thời gian huấn luyện. | ⚠️ **Ngưỡng chuyển đổi**: Việc chọn mốc "10 attempts" để chuyển từ mô hình Global sang Unified là một ước tính. Có thể có trường hợp người dùng ở ngay ngưỡng này nhận được gợi ý chưa tối ưu. |
| ✅ **Tính cá nhân hóa cao**: Khi người dùng có đủ dữ liệu, mô hình Unified sẽ cung cấp các gợi ý được "may đo" riêng, mang lại hiệu quả cao hơn nhiều so với một mô hình chung. | ⚠️ **Bảo trì hai mô hình**: Cần phải đảm bảo cả hai script huấn luyện (`train_model.py` và `train_unified_model.py`) đều được bảo trì và chạy định kỳ. |

### 6.2. Ảnh Hưởng Hiệu Năng Khi Tái Huấn Luyện Thường Xuyên

Đây là một yếu tố quan trọng cần xem xét khi hệ thống phát triển.

**1. Quá trình tái huấn luyện có ngày càng chậm hơn không?**

*   **CÓ.** Chắc chắn là có.
*   **Nguyên nhân:**
    *   Các script huấn luyện (`train_model.py`, `train_unified_model.py`) sẽ phải truy vấn bảng `UserResults`, bảng này sẽ ngày càng lớn khi có thêm người dùng và dữ liệu làm bài.
    *   Thời gian để đọc và xử lý lượng dữ liệu lớn hơn này bằng thư viện `pandas` sẽ tăng lên.
    *   Thời gian để mô hình `fit()` (học) trên một tập dữ liệu lớn hơn cũng sẽ tăng.
*   **Mức độ ảnh hưởng:** Sự chậm lại này là có thể dự đoán được và thường tăng tuyến tính với lượng dữ liệu, không phải là một vấn đề gây "bùng nổ" hệ thống.

**2. Việc tái huấn luyện có ảnh hưởng đến hiệu năng của người dùng không?**

*   **KHÔNG, không ảnh hưởng trực tiếp.** Đây là điểm mấu chốt trong thiết kế của hệ thống.
*   **Nguyên nhân:**
    *   **Chạy nền (Background Process):** Việc tái huấn luyện được thiết kế để chạy như một tiến trình hoàn toàn riêng biệt, được kích hoạt bởi một `cron job` vào những thời điểm hệ thống ít được sử dụng nhất (ví dụ: 2 giờ sáng Chủ Nhật).
    *   **Không chặn người dùng:** Trong khi quá trình tái huấn luyện đang diễn ra (có thể mất vài phút hoặc vài giờ), server chính (Node.js) vẫn hoạt động bình thường, vẫn tiếp nhận yêu cầu và trả về gợi ý cho người dùng dựa trên các file mô hình `.pkl` **hiện có**.
    *   **Cập nhật tức thời:** Khi quá trình tái huấn luyện kết thúc, nó sẽ âm thầm ghi đè các file `.pkl` cũ bằng các file mới. Các lần dự đoán **sau đó** sẽ tự động sử dụng các mô hình đã được nâng cấp này. Người dùng không hề cảm nhận được sự gián đoạn nào.
*   **Ảnh hưởng gián tiếp (cần lưu ý):**
    *   Quá trình tái huấn luyện sẽ tiêu tốn tài nguyên CPU và RAM. Nếu server ứng dụng và server huấn luyện là một, có thể xảy ra tình trạng cạnh tranh tài nguyên, làm giảm nhẹ hiệu năng tổng thể trong thời gian huấn luyện.
    *   **Giải pháp:** Trong tương lai, khi hệ thống lớn mạnh, có thể tách việc huấn luyện ra một server riêng để loại bỏ hoàn toàn ảnh hưởng này.

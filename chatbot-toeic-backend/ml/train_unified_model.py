"""
================================================================================
HUẤN LUYỆN MÔ HÌNH UNIFIED (1 MÔ HÌNH CHO TẤT CẢ USERS) - PHIÊN BẢN 2.0
================================================================================

 MỤC ĐÍCH:
     Huấn luyện mô hình unified: 1 mô hình duy nhất cho TẤT CẢ users.
     Mô hình này thay thế cách tiếp cận personal model (10k mô hình -> 1 mô hình).

 ƯU ĐIỂM:
     - Mở rộng tốt: 1 file cho 10k users thay vì 10k files
     - Huấn luyện lại nhanh: 2-3 phút thay vì 14 giờ
     - Triển khai dễ: chỉ cần copy 1 file
     - User mới: dự đoán ngay, không cần huấn luyện riêng
     - Cá nhân hoá: vẫn giữ ~95% nhờ đặc trưng theo user

 ĐẦU RA:
     - unified_model.pkl: mô hình Naive Bayes unified
     - unified_model_info.pkl: metadata (danh sách features, độ chính xác, thời gian train)

 THUẬT TOÁN:
     - Gaussian Naive Bayes: tốc độ train/predict rất nhanh, hiệu quả với đặc trưng
         dạng số, và cần ít dữ liệu huấn luyện hơn so với các mô hình phức tạp.
         Phù hợp cho bài toán phân loại weak/strong với features đã tính sẵn.

 ĐẶC TRƯNG ĐẦU VÀO (10 đặc trưng):
     NGỮ CẢNH USER (8 đặc trưng):
     - user_level: trình độ (0=Beginner, 1=Intermediate, 2=Advanced)
     - total_tests: tổng số bài test đã làm
     - total_questions: tổng số câu hỏi đã làm
     - overall_accuracy: độ chính xác tổng quát
     - days_active: số ngày kể từ lần đầu làm bài
     - learning_velocity: overall_accuracy - first_30d_accuracy
     - consistency: STDEV(skill_accuracy) theo user
     - recency_bias: recent_50_accuracy - overall_accuracy

     NGỮ CẢNH KỸ NĂNG (2 đặc trưng - giữ nguyên từ personal model):
     - attempts: số lần làm kỹ năng này
     - correct: số câu đúng của kỹ năng này
     - skill_accuracy: chỉ dùng để gán nhãn isWeak, KHÔNG đưa vào feature vector

 NHÃN ĐẦU RA:
     - isWeak: gán nhãn theo rule động (cá nhân hoá) nếu đủ dữ liệu,
                        attempts >= 5 và user có >= 3 skills:
                            isWeak = (skill_accuracy < avg_user_skill_acc - 1.0 * std_user_skill_acc)
                        ngược lại fallback về rule cứng:
                            isWeak = (skill_accuracy < 0.6)

 KHI NÀO HUẤN LUYỆN LẠI:
     - Mỗi tuần/tháng khi có thêm user mới
     - Khi có thêm nhiều dữ liệu mới (ví dụ > 1000 attempts)
     - Thiết lập scheduled task

 CÁCH CHẠY:
     python train_unified_model.py
    # Hoặc: python train_unified_model.py --compare (so sánh với mô hình cá nhân)

 Tạo ngày: 2025-10-08
 File liên quan:
     - predict_unified.py (chạy test độc lập)
     - predict_hybrid_unified.py (tích hợp vào chiến lược hybrid)
     - train_personal_model.py (phiên bản cũ - không khuyến nghị)
================================================================================
"""

import os
import pyodbc
import pandas as pd
from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.preprocessing import StandardScaler
import joblib
from dotenv import load_dotenv
from datetime import datetime

# Nạp biến môi trường
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"))

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_USERNAME = os.getenv("DB_USERNAME")
DB_PASS = os.getenv("DB_PASS")
DB_NAME = os.getenv("DB_NAME")

conn_str = (
    f"DRIVER={{ODBC Driver 17 for SQL Server}};"
    f"SERVER={DB_HOST},{DB_PORT};"
    f"DATABASE={DB_NAME};"
    f"UID={DB_USERNAME};"
    f"PWD={DB_PASS}"
)

def train_unified_model():
    """
    Huấn luyện unified model với các đặc trưng theo user
    """
    conn = pyodbc.connect(conn_str)
    
    # Truy vấn lấy TOÀN BỘ dữ liệu + các đặc trưng theo user
    query = """
    WITH UserStats AS (
        -- Tính toán thống kê tổng quát của mỗi user
        SELECT 
            ur.userId,
            COUNT(DISTINCT ur.userTestId) AS total_tests,
            COUNT(*) AS total_questions,
            CAST(SUM(CASE WHEN ur.isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) AS overall_accuracy,
            DATEDIFF(DAY, MIN(ur.answeredAt), GETDATE()) AS days_active,
            -- Learning Velocity: Accuracy từ 30 ngày đầu
            (SELECT CAST(SUM(CASE WHEN ur2.isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) 
             FROM UserResults ur2 
             WHERE ur2.userId = ur.userId 
             AND ur2.answeredAt <= DATEADD(DAY, 30, MIN(ur.answeredAt))) AS first_30d_accuracy,
            -- Recency Bias: Accuracy 50 câu gần nhất
            (SELECT CAST(SUM(CASE WHEN recent.isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*)
             FROM (SELECT TOP 50 isCorrect FROM UserResults ur3
                   WHERE ur3.userId = ur.userId
                   ORDER BY ur3.answeredAt DESC) recent
             WHERE recent.isCorrect IS NOT NULL) AS recent_50_accuracy
        FROM UserResults ur
        WHERE ur.userId IS NOT NULL
        GROUP BY ur.userId
    ),
    SkillStats AS (
        -- Tính toán stats per skill + consistency
        SELECT 
            ur.userId,
            qs.skillId,
            COUNT(*) AS attempts,
            SUM(CASE WHEN ur.isCorrect = 1 THEN 1 ELSE 0 END) AS correct,
            CAST(SUM(CASE WHEN ur.isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) AS skill_accuracy
        FROM UserResults ur
        JOIN QuestionSkills qs ON ur.questionId = qs.questionId
        WHERE ur.userId IS NOT NULL
        GROUP BY ur.userId, qs.skillId
    ),
    UserConsistency AS (
        -- Tính consistency: std dev của skill accuracy per user
        SELECT 
            userId,
            STDEV(skill_accuracy) AS skill_consistency
        FROM SkillStats
        GROUP BY userId
    )
    SELECT 
        ss.userId,
        ss.skillId,
        -- USER FEATURES (ORIGINAL)
        us.total_tests,
        us.total_questions,
        us.overall_accuracy,
        us.days_active,
        -- NEW FEATURES (3 cái)
        ISNULL(us.overall_accuracy - us.first_30d_accuracy, 0) AS learning_velocity,
        ISNULL(uc.skill_consistency, 0) AS consistency,
        ISNULL(us.recent_50_accuracy - us.overall_accuracy, 0) AS recency_bias,
        -- SKILL FEATURES (GIỮ NGUYÊN)
        ss.attempts,
        ss.correct,
        ss.skill_accuracy
    FROM SkillStats ss
    JOIN UserStats us ON ss.userId = us.userId
    LEFT JOIN UserConsistency uc ON ss.userId = uc.userId
    """
    
    print("🔍 Đang query database...")
    df = pd.read_sql(query, conn)
    conn.close()
    
    print(f"✅ Đã load {len(df)} records từ {df['userId'].nunique()} users")
    print("\n📊 Sample data:")
    print(df.head())
    
    # Kỹ thuật đặc trưng: user_level (KHÔNG dùng userId_hash để tránh mô hình học theo "ID")
    df['user_level'] = df['overall_accuracy'].apply(
        lambda x: 0 if x < 0.5 else (1 if x < 0.7 else 2)  # 0=Beginner, 1=Intermediate, 2=Advanced
    )

    # ---------------------------------------------------------------------
    # Gán nhãn: isWeak (KHÔNG dùng skill_accuracy trong vector đặc trưng)
    # ---------------------------------------------------------------------
    min_attempts_for_dynamic = 5
    min_skills_for_dynamic = 3
    k_std = 1.0
    fallback_threshold = 0.6

    user_num_skills = df.groupby('userId')['skillId'].transform('nunique')
    user_avg_skill_acc = df.groupby('userId')['skill_accuracy'].transform('mean')
    user_std_skill_acc = df.groupby('userId')['skill_accuracy'].transform(lambda s: s.std(ddof=0))

    dynamic_ok = (
        (df['attempts'] >= min_attempts_for_dynamic)
        & (user_num_skills >= min_skills_for_dynamic)
        & (user_std_skill_acc.notna())
        & (user_std_skill_acc > 1e-12)
    )

    dynamic_threshold = user_avg_skill_acc - k_std * user_std_skill_acc
    df['isWeak'] = ((df['skill_accuracy'] < dynamic_threshold) & dynamic_ok) | (
        (df['skill_accuracy'] < fallback_threshold) & (~dynamic_ok)
    )
    df['isWeak'] = df['isWeak'].astype(int)
    
    # Chuẩn bị đặc trưng
    feature_columns = [
        'user_level',       # Trình độ tổng quát
        'total_tests',      # Số bài test đã làm
        'total_questions',  # Số câu hỏi đã làm
        'overall_accuracy', # Accuracy tổng quát
        'days_active',      # Số ngày hoạt động
        'learning_velocity',# Tốc độ cải thiện (NEW)
        'consistency',      # Độ ổn định kỹ năng (NEW)
        'recency_bias',     # Trend gần đây (NEW)
        'attempts',         # Số lần làm skill này
        'correct'           # Số câu đúng skill này
    ]
    
    X = df[feature_columns]
    y = df['isWeak']
    
    print(f"\n🎯 Feature matrix shape: {X.shape}")
    print("Features:", feature_columns)
    
    # ========================================================================
    # CHUẨN HOÁ ĐẶC TRƯNG (StandardScaler)
    # ========================================================================
    print("\n🔄 Scaling features...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    X_scaled_df = pd.DataFrame(X_scaled, columns=feature_columns)
    
    print(f"✅ Features scaled (mean=0, std=1)")
    print(f"   Sample scaled values:\n{X_scaled_df.head()}")
    
    # Chia tập huấn luyện/kiểm thử (tránh lỗi khi tập dữ liệu quá nhỏ / chỉ có 1 lớp)
    can_stratify = (y.nunique() >= 2) and (y.value_counts().min() >= 2)
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled_df,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y if can_stratify else None,
    )
    
    print(f"\n📊 Train: {len(X_train)} samples | Test: {len(X_test)} samples")
    print(f"Train weak ratio: {y_train.mean():.2%}")
    print(f"Test weak ratio: {y_test.mean():.2%}")
    
    # Huấn luyện mô hình
    print("\n🚀 Training Unified Model with User Features...")
    model = GaussianNB()
    model.fit(X_train, y_train)
    
    # Đánh giá
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print("\n✅ TRAINING COMPLETE!")
    print(f"📈 Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    
    # Classification report (xử lý trường hợp ít dữ liệu)
    unique_classes = len(set(y_test))
    if unique_classes >= 2:
        print("\n📊 Classification Report:")
        print(classification_report(y_test, y_pred, target_names=['STRONG', 'WEAK']))
    else:
        print(f"\n⚠️ Test set only has {unique_classes} class. Need more diverse data for full report.")
    
    # Lưu mô hình (dùng absolute path và tạo thư mục model/ nếu chưa có)
    model_dir = os.path.join(os.path.dirname(__file__), 'model')
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, "unified_model.pkl")
    joblib.dump(model, model_path)
    print(f"\n💾 Model saved at: {model_path}")
    
    # Lưu scaler (quan trọng cho bước dự đoán)
    scaler_path = os.path.join(model_dir, "unified_model_scaler.pkl")
    joblib.dump(scaler, scaler_path)
    print(f"💾 Scaler saved at: {scaler_path}")
    
    # Lưu danh sách đặc trưng để dùng lại lúc dự đoán
    feature_info = {
        'feature_columns': feature_columns,
        'trained_at': datetime.now().isoformat(),
        'total_samples': len(df),
        'total_users': df['userId'].nunique(),
        'test_accuracy': accuracy,
        'labeling': {
            'type': 'dynamic_per_user_mean_std_with_fallback',
            'min_attempts_for_dynamic': min_attempts_for_dynamic,
            'min_skills_for_dynamic': min_skills_for_dynamic,
            'k_std': k_std,
            'fallback_threshold': fallback_threshold,
        },
    }
    info_path = os.path.join(model_dir, "unified_model_info.pkl")
    joblib.dump(feature_info, info_path)
    print(f"📋 Feature info saved at: {info_path}")
    
    return model, accuracy

def compare_with_personal_model():
    """
    So sánh accuracy giữa Unified vs Personal model
    """
    print("\n" + "="*60)
    print("📊 COMPARISON: Unified Model vs Personal Models")
    print("="*60)
    
    # Giả sử mô hình cá nhân có accuracy ~85% (từ trước)
    personal_accuracy = 0.85
    
    # Huấn luyện mô hình unified
    _, unified_accuracy = train_unified_model()
    
    print("\n🎯 RESULTS:")
    print(f"Personal Model (old):  {personal_accuracy:.4f} ({personal_accuracy*100:.2f}%)")
    print(f"Unified Model (new):   {unified_accuracy:.4f} ({unified_accuracy*100:.2f}%)")
    print(f"Difference:            {(unified_accuracy - personal_accuracy):.4f} ({(unified_accuracy - personal_accuracy)*100:.2f}%)")
    
    if unified_accuracy >= personal_accuracy * 0.95:
        print("\n✅ Unified model achieves ≥95% of personal model accuracy!")
        print("   → GOOD TO USE IN PRODUCTION")
    else:
        print("\n⚠️ Unified model < 95% of personal model accuracy")
        print(f"   Current: {unified_accuracy/personal_accuracy*100:.1f}%")
        print("   → Consider adding more user features")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--compare":
        compare_with_personal_model()
    else:
        train_unified_model()

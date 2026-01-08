"""
================================================================================
DỰ ĐOÁN HYBRID VỚI MÔ HÌNH UNIFIED (PHIÊN BẢN 2.0)
================================================================================

 MỤC ĐÍCH:
   Dự đoán kỹ năng yếu của user và gợi ý câu hỏi bằng HYBRID STRATEGY mới:
   - Dùng GLOBAL MODEL khi user có ít data (<10 attempts)
   - Dùng UNIFIED MODEL khi user có đủ data (≥10 attempts)

 KHÁC BIỆT VỚI predict_hybrid.py (cũ):
   - predict_hybrid.py (cũ): Global + Personal (10k models cho 10k users)
   - predict_hybrid_unified.py (mới): Global + Unified (chỉ 1 model cho tất cả users)

 CHIẾN LƯỢC HYBRID:
    Nếu attempts < 10:
        → Dùng GLOBAL MODEL (weak_skill_model.pkl)
        → Đầu vào: [attempts, correct, accuracy] (3 đặc trưng)
    Ngược lại:
          → Dùng UNIFIED MODEL (unified_model.pkl)
          → Đầu vào (10 đặc trưng):
            [user_level, total_tests, total_questions,
             overall_accuracy, days_active, learning_velocity,
             consistency, recency_bias, attempts, correct]

 ƯU ĐIỂM:
     - Mở rộng tốt: 1 mô hình cho 10k users thay vì 10k mô hình
     - Huấn luyện lại nhanh: 2-3 phút thay vì 14 giờ
     - User mới: dự đoán ngay, không cần huấn luyện riêng
     - Vẫn giữ ~95% mức độ cá nhân hoá

 THUẬT TOÁN GỢI Ý (kNN):
   - Sau khi xác định skill yếu bằng Naive Bayes, hệ thống sử dụng
     thuật toán k-Nearest Neighbors (kNN) để gợi ý câu hỏi.
   - Logic: Script `findSimilar.js` tìm `k` câu hỏi có vector embedding
     gần nhất với câu hỏi "mẫu" (anchor question) trong không gian vector.
   - Đây là một dạng Item-based Recommendation, giúp tìm các câu hỏi "tương tự"
     về mặt ngữ nghĩa để user luyện tập thêm.
 CÁCH CHẠY:
   python predict_hybrid_unified.py

 Tạo ngày: 2025-10-08

 File liên quan:
     - train_unified_model.py (huấn luyện unified model)
     - predict_unified.py (chạy test độc lập)
     - predict_hybrid.py (phiên bản cũ với personal model)
================================================================================
"""

import os
import pyodbc
import pandas as pd
import joblib
import subprocess
import json
from sklearn.naive_bayes import GaussianNB
from dotenv import load_dotenv
import sys

# Đảm bảo stdout/stderr dùng UTF-8 trên terminal Windows để tránh lỗi encode "charmap"
try:
    # Python 3.7+: dùng reconfigure nếu có
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    # Phương án dự phòng: bọc lại stream (một số môi trường không có buffer)
    try:
        import io
        sys.stdout = io.TextIOWrapper(getattr(sys.stdout, 'buffer', sys.stdout), encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(getattr(sys.stderr, 'buffer', sys.stderr), encoding='utf-8', errors='replace')
    except Exception:
        # Cuối cùng: bỏ qua và tiếp tục; việc in ra có thể vẫn lỗi trên một số console
        pass
import argparse

# Nạp .env từ thư mục cha
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"))

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_USERNAME = os.getenv("DB_USERNAME")
DB_PASS = os.getenv("DB_PASS")
DB_NAME = os.getenv("DB_NAME")
FIND_SIMILAR_PATH = os.path.join(BASE_DIR, "findSimilar.js")

conn_str = (
    f"DRIVER={{ODBC Driver 17 for SQL Server}};"
    f"SERVER={DB_HOST},{DB_PORT};"
    f"DATABASE={DB_NAME};"
    f"UID={DB_USERNAME};"
    f"PWD={DB_PASS}"
)

# ============================================================================
# HÀM HỖ TRỢ: Chuẩn bị đặc trưng cho Unified Model
# ============================================================================
def prepare_unified_features(userId: int, skillId: int, attempts: int, correct: int, accuracy: float, conn):
    """
    Chuẩn bị features cho Unified Model
    
    Args:
        userId: ID của user
        skillId: ID của skill đang xét
        attempts: Số lần thử skill này
        correct: Số câu đúng skill này
        accuracy: Accuracy skill này
        conn: Database connection
    
    Returns:
        DataFrame với 10 features (giống như lúc train model):
        [user_level, total_tests, total_questions,
         overall_accuracy, days_active, learning_velocity, 
         consistency, recency_bias, attempts, correct]
    
    GHI CHÚ: Features này PHẢI GIỐNG HỆT với lúc train unified model.
    """
    # Truy vấn thống kê tổng quan của user + các đặc trưng bổ sung
    query = f"""
    WITH UserStats AS (
        SELECT 
            COUNT(DISTINCT userTestId) AS total_tests,
            COUNT(*) AS total_questions,
            CAST(SUM(CASE WHEN isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) AS overall_accuracy,
            DATEDIFF(DAY, MIN(answeredAt), GETDATE()) AS days_active,
            -- Learning Velocity: Accuracy từ 30 ngày đầu
            (SELECT CAST(SUM(CASE WHEN ur2.isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) 
             FROM UserResults ur2 
             WHERE ur2.userId = {userId}
             AND ur2.answeredAt <= DATEADD(DAY, 30, (SELECT MIN(answeredAt) FROM UserResults WHERE userId = {userId}))) AS first_30d_accuracy,
            -- Recency Bias: Accuracy 50 câu gần nhất
            (SELECT CAST(SUM(CASE WHEN recent.isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*)
             FROM (SELECT TOP 50 isCorrect FROM UserResults ur3
                   WHERE ur3.userId = {userId}
                   ORDER BY ur3.answeredAt DESC) recent) AS recent_50_accuracy
        FROM UserResults
        WHERE userId = {userId}
    ),
    SkillStats AS (
        SELECT 
            skillId,
            CAST(SUM(CASE WHEN isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) AS skill_accuracy
        FROM UserResults ur
        JOIN QuestionSkills qs ON ur.questionId = qs.questionId
        WHERE ur.userId = {userId}
        GROUP BY qs.skillId
    ),
    UserConsistency AS (
        SELECT 
            STDEV(skill_accuracy) AS skill_consistency
        FROM SkillStats
    )
    SELECT 
        us.total_tests,
        us.total_questions,
        us.overall_accuracy,
        us.days_active,
        ISNULL(us.overall_accuracy - us.first_30d_accuracy, 0) AS learning_velocity,
        ISNULL(uc.skill_consistency, 0) AS consistency,
        ISNULL(us.recent_50_accuracy - us.overall_accuracy, 0) AS recency_bias
    FROM UserStats us
    CROSS JOIN UserConsistency uc
    """
    user_stats = pd.read_sql(query, conn).iloc[0]
    
    # Kỹ thuật đặc trưng (giống train_unified_model.py)
    user_level = 0 if user_stats['overall_accuracy'] < 0.5 else (
        1 if user_stats['overall_accuracy'] < 0.7 else 2
    )  # 0=Beginner, 1=Intermediate, 2=Advanced
    
    # Tạo vector đặc trưng (10 đặc trưng)
    X = pd.DataFrame([[
        user_level,
        int(user_stats['total_tests']),
        int(user_stats['total_questions']),
        float(user_stats['overall_accuracy']),
        int(user_stats['days_active']),
        float(user_stats['learning_velocity']),
        float(user_stats['consistency']),
        float(user_stats['recency_bias']),
        attempts,
        correct
    ]], columns=[
        'user_level', 'total_tests', 'total_questions',
        'overall_accuracy', 'days_active', 'learning_velocity',
        'consistency', 'recency_bias', 'attempts', 'correct'
    ])
    
    return X

# ============================================================================
# HÀM CHÍNH: Dự đoán Hybrid với Unified Model
# ============================================================================
def predict_hybrid_unified(userId: int):
    """
    Dự đoán kỹ năng yếu cho user bằng Hybrid Strategy (Global + Unified)
    
    Args:
        userId: ID của user cần dự đoán
    
    Returns:
        dict: {skillName: "Weak (global)" hoặc "Strong (unified)", ...}
    
    Luồng xử lý:
        - Nếu attempts < 10: dùng Global Model (ít dữ liệu, chưa đủ tin cậy)
        - Nếu attempts ≥ 10: dùng Unified Model (đủ dữ liệu, cá nhân hoá)
    """
    conn = pyodbc.connect(conn_str)
    
    # Truy vấn thống kê theo kỹ năng của user
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

    if df.empty:
        print(f"⚠️ User {userId} chưa có dữ liệu")
        conn.close()
        return {}

    # Nạp mô hình (đọc từ thư mục model/)
    model_dir = os.path.join(os.path.dirname(__file__), 'model')
    global_model_path = os.path.join(model_dir, "weak_skill_model.pkl")
    unified_model_path = os.path.join(model_dir, "unified_model.pkl")
    
    if not os.path.exists(global_model_path):
        raise FileNotFoundError("❌ Global model (weak_skill_model.pkl) không tồn tại! Chạy train_model.py trước.")
    
    if not os.path.exists(unified_model_path):
        print("⚠️ Unified model chưa có, đang train...")
        from train_unified_model import train_unified_model
        train_unified_model()
    
    global_model = joblib.load(global_model_path)
    unified_model = joblib.load(unified_model_path)

    # Nạp scaler + thứ tự đặc trưng cho unified model (huấn luyện với StandardScaler)
    unified_info_path = os.path.join(model_dir, "unified_model_info.pkl")
    unified_scaler_path = os.path.join(model_dir, "unified_model_scaler.pkl")
    unified_feature_columns = None
    unified_scaler = None

    try:
        if os.path.exists(unified_info_path):
            unified_feature_columns = joblib.load(unified_info_path).get('feature_columns')
    except Exception:
        unified_feature_columns = None

    if os.path.exists(unified_scaler_path):
        try:
            unified_scaler = joblib.load(unified_scaler_path)
        except Exception:
            unified_scaler = None

    results = {}
    proba_by_skill = {}
    print("\n" + "="*80)
    print(f" DỰ ĐOÁN KỸ NĂNG CHO USER {userId} (HYBRID UNIFIED STRATEGY)")
    print("="*80)

    # ------------------------------------------------------------------
    # TỐI ƯU HIỆU NĂNG: tránh truy vấn lặp các đặc trưng mức user cho từng kỹ năng
    # (prepare_unified_features trước đây sẽ truy vấn DB mỗi lần).
    # Tính ngữ cảnh user một lần, sau đó dự đoán theo lô cho từng kỹ năng.
    # ------------------------------------------------------------------
    def _get_unified_user_context_once(_userId: int, _conn):
        query = f"""
        WITH UserStats AS (
            SELECT 
                COUNT(DISTINCT userTestId) AS total_tests,
                COUNT(*) AS total_questions,
                CAST(SUM(CASE WHEN isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) AS overall_accuracy,
                DATEDIFF(DAY, MIN(answeredAt), GETDATE()) AS days_active,
                (SELECT CAST(SUM(CASE WHEN ur2.isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) 
                 FROM UserResults ur2 
                 WHERE ur2.userId = {_userId}
                 AND ur2.answeredAt <= DATEADD(DAY, 30, (SELECT MIN(answeredAt) FROM UserResults WHERE userId = {_userId}))) AS first_30d_accuracy,
                (SELECT CAST(SUM(CASE WHEN recent.isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*)
                 FROM (SELECT TOP 50 isCorrect FROM UserResults ur3
                       WHERE ur3.userId = {_userId}
                       ORDER BY ur3.answeredAt DESC) recent) AS recent_50_accuracy
            FROM UserResults
            WHERE userId = {_userId}
        ),
        SkillStats AS (
            SELECT 
                qs.skillId,
                CAST(SUM(CASE WHEN ur.isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) AS skill_accuracy
            FROM UserResults ur
            JOIN QuestionSkills qs ON ur.questionId = qs.questionId
            WHERE ur.userId = {_userId}
            GROUP BY qs.skillId
        ),
        UserConsistency AS (
            SELECT 
                STDEV(skill_accuracy) AS skill_consistency
            FROM SkillStats
        )
        SELECT 
            us.total_tests,
            us.total_questions,
            us.overall_accuracy,
            us.days_active,
            ISNULL(us.overall_accuracy - us.first_30d_accuracy, 0) AS learning_velocity,
            ISNULL(uc.skill_consistency, 0) AS consistency,
            ISNULL(us.recent_50_accuracy - us.overall_accuracy, 0) AS recency_bias
        FROM UserStats us
        CROSS JOIN UserConsistency uc
        """

        user_stats = pd.read_sql(query, _conn).iloc[0]
        user_level = 0 if user_stats['overall_accuracy'] < 0.5 else (
            1 if user_stats['overall_accuracy'] < 0.7 else 2
        )

        return {
            'user_level': int(user_level),
            'total_tests': int(user_stats['total_tests']),
            'total_questions': int(user_stats['total_questions']),
            'overall_accuracy': float(user_stats['overall_accuracy']),
            'days_active': int(user_stats['days_active']),
            'learning_velocity': float(user_stats['learning_velocity']),
            'consistency': float(user_stats['consistency']),
            'recency_bias': float(user_stats['recency_bias']),
        }

    # Chia các skill theo chiến lược
    df = df.copy()
    df['attempts'] = df['attempts'].astype(int)
    df['correct'] = df['correct'].astype(int)
    df['accuracy'] = df.apply(lambda r: (r['correct'] / r['attempts']) if r['attempts'] > 0 else 0.0, axis=1)

    global_mask = df['attempts'] < 10
    df_global = df[global_mask]
    df_unified = df[~global_mask]

    # CHIẾN LƯỢC 1: dự đoán theo lô bằng mô hình toàn cục (global)
    if not df_global.empty:
        print(f"\n[GLOBAL] Predicting {len(df_global)} skills (attempts < 10)")
        X_global = df_global[['attempts', 'correct', 'accuracy']].copy()
        y_pred_global = global_model.predict(X_global)
        y_proba_global = global_model.predict_proba(X_global)
        global_classes = list(getattr(global_model, 'classes_', []))

        for idx, row in enumerate(df_global.itertuples(index=False)):
            skillName = row.skillName
            attempts = row.attempts
            correct = row.correct
            accuracy = row.accuracy

            print(f"\n🔍 Skill: {skillName}")
            print(f"   📈 Dữ liệu thực tế:")
            print(f"      - Số lần thử: {attempts}")
            print(f"      - Số câu đúng: {correct}")
            print(f"      - Accuracy: {accuracy:.2%}")
            print(f"    Model: GLOBAL (do attempts < 10)")
            print(f"     Xác suất dự đoán:")
            print(f"      - P(Strong) = {y_proba_global[idx][0]:.2%}")
            print(f"      - P(Weak) = {y_proba_global[idx][1]:.2%}")
            print(f"    Kết luận: {'WEAK' if y_pred_global[idx] == 1 else 'STRONG'}")
            print(f"     Lý do: Ít data, dùng pattern chung từ tất cả users")

            results[skillName] = "Weak (global)" if int(y_pred_global[idx]) == 1 else "Strong (global)"

            # Ánh xạ xác suất theo nhãn class_ một cách an toàn khi có sẵn
            try:
                if len(global_classes) >= 2:
                    p_by_label = {int(global_classes[i]): float(y_proba_global[idx][i]) for i in range(len(global_classes))}
                    p_strong = p_by_label.get(0, None)
                    p_weak = p_by_label.get(1, None)
                else:
                    p_strong = float(y_proba_global[idx][0]) if y_proba_global.shape[1] > 0 else None
                    p_weak = float(y_proba_global[idx][1]) if y_proba_global.shape[1] > 1 else None
            except Exception:
                p_strong = None
                p_weak = None

            proba_by_skill[skillName] = {
                "model": "global",
                "pStrong": p_strong,
                "pWeak": p_weak,
                "pred": int(y_pred_global[idx])
            }

    # CHIẾN LƯỢC 2: dự đoán theo lô bằng mô hình unified
    if not df_unified.empty:
        print(f"\n[UNIFIED] Predicting {len(df_unified)} skills (attempts >= 10)")
        user_ctx = _get_unified_user_context_once(userId, conn)

        X_unified_raw = pd.DataFrame({
            'user_level': [user_ctx['user_level']] * len(df_unified),
            'total_tests': [user_ctx['total_tests']] * len(df_unified),
            'total_questions': [user_ctx['total_questions']] * len(df_unified),
            'overall_accuracy': [user_ctx['overall_accuracy']] * len(df_unified),
            'days_active': [user_ctx['days_active']] * len(df_unified),
            'learning_velocity': [user_ctx['learning_velocity']] * len(df_unified),
            'consistency': [user_ctx['consistency']] * len(df_unified),
            'recency_bias': [user_ctx['recency_bias']] * len(df_unified),
            'attempts': df_unified['attempts'].astype(int).tolist(),
            'correct': df_unified['correct'].astype(int).tolist(),
        })

        X_for_model = X_unified_raw
        if unified_feature_columns:
            X_for_model = X_unified_raw[unified_feature_columns]
        if unified_scaler is not None:
            X_scaled = unified_scaler.transform(X_for_model)
            X_for_model = pd.DataFrame(X_scaled, columns=list(X_for_model.columns))

        y_pred_unified = unified_model.predict(X_for_model)
        y_proba_unified = unified_model.predict_proba(X_for_model)
        unified_classes = list(getattr(unified_model, 'classes_', []))

        for idx, row in enumerate(df_unified.itertuples(index=False)):
            skillName = row.skillName
            attempts = row.attempts
            correct = row.correct
            accuracy = row.accuracy
            y_pred = int(y_pred_unified[idx])
            y_proba = y_proba_unified[idx]

            print(f"\n🔍 Skill: {skillName}")
            print(f"   📈 Dữ liệu thực tế:")
            print(f"      - Số lần thử: {attempts}")
            print(f"      - Số câu đúng: {correct}")
            print(f"      - Accuracy: {accuracy:.2%}")
            print(f"    Model: UNIFIED (do attempts >= 10)")
            print(f"    User context:")
            print(f"      - User Level: {['Beginner', 'Intermediate', 'Advanced'][int(user_ctx['user_level'])]}")
            print(f"      - Total Tests: {int(user_ctx['total_tests'])}")
            print(f"      - Overall Accuracy: {float(user_ctx['overall_accuracy']):.2%}")
            print(f"      - Days Active: {int(user_ctx['days_active'])}")
            print(f"    Xác suất dự đoán:")
            try:
                classes = list(getattr(unified_model, 'classes_', []))
                if len(classes) >= 2:
                    p_by_label = {int(classes[i]): float(y_proba[i]) for i in range(len(classes))}
                    p_strong = p_by_label.get(0, None)
                    p_weak = p_by_label.get(1, None)
                    if p_strong is not None:
                        print(f"      - P(Strong) = {p_strong:.2%}")
                    if p_weak is not None:
                        print(f"      - P(Weak) = {p_weak:.2%}")
                else:
                    print(f"      - Model chỉ thấy 1 class = 100%")
            except Exception:
                if getattr(y_proba, 'shape', (0,))[0] >= 2:
                    print(f"      - P(Strong) = {y_proba[0]:.2%}")
                    print(f"      - P(Weak) = {y_proba[1]:.2%}")
                else:
                    print(f"      - Model chỉ thấy 1 class = 100%")
            print(f"    Kết luận: {'WEAK' if y_pred == 1 else 'STRONG'}")
            print(f"    Lý do: Model học từ context của user này + pattern chung")

            results[skillName] = "Weak (unified)" if y_pred == 1 else "Strong (unified)"

            # Lưu xác suất để tính confidence ở các bước sau
            try:
                if len(unified_classes) >= 2:
                    p_by_label2 = {int(unified_classes[i]): float(y_proba[i]) for i in range(len(unified_classes))}
                    p_strong2 = p_by_label2.get(0, None)
                    p_weak2 = p_by_label2.get(1, None)
                else:
                    p_strong2 = float(y_proba[0]) if getattr(y_proba, 'shape', (0,))[0] > 0 else None
                    p_weak2 = float(y_proba[1]) if getattr(y_proba, 'shape', (0,))[0] > 1 else None
            except Exception:
                p_strong2 = None
                p_weak2 = None

            proba_by_skill[skillName] = {
                "model": "unified",
                "pStrong": p_strong2,
                "pWeak": p_weak2,
                "pred": y_pred
            }
    
    print("\n" + "="*80)
    conn.close()
    return results, proba_by_skill

# ============================================================================
# GỢI Ý CÂU HỎI: Gợi ý câu hỏi theo kNN
# ============================================================================
def recommend_questions(anchor_id: int, k: int = 2):
    """
    Gọi Node.js findSimilar.js để tìm k câu hỏi tương tự
    
    Args:
        anchor_id: ID câu hỏi mẫu
        k: Số câu hỏi gợi ý
    
    Returns:
        str: JSON string chứa recommended questions
    """
    result = subprocess.run(
        ["node", FIND_SIMILAR_PATH, str(anchor_id), str(k)],
        capture_output=True, text=True
    )
    return result.stdout.strip() if result.stdout else None


def recommend_questions_batch(anchor_ids, k: int = 2):
    """Chế độ batch: gọi Node.js một lần với JSON array các anchor ids.

    Returns:
        str: Chuỗi JSON map anchorId -> list[{id, question, score}] hoặc None.
    """
    try:
        payload = json.dumps([int(x) for x in anchor_ids])
    except Exception:
        payload = json.dumps(list(anchor_ids))

    result = subprocess.run(
        ["node", FIND_SIMILAR_PATH, payload, str(k)],
        capture_output=True, text=True
    )
    return result.stdout.strip() if result.stdout else None

# ============================================================================
# PIPELINE ĐẦY ĐỦ: Dự đoán + Gợi ý
# ============================================================================
def full_pipeline(userId: int, k: int = 3):
    """
    Pipeline đầy đủ: Predict weak skills → Recommend questions
    
    Args:
        userId: ID của user
        k: Số câu hỏi gợi ý per skill
    
    Returns:
        dict: {
            "weak_skills": [...],
            "recommendations": {skillName: [questions], ...}
        }
    """
    # Bước 1: Dự đoán kỹ năng yếu
    results, proba_by_skill = predict_hybrid_unified(userId)
    weak_skills = [skill for skill, status in results.items() if "Weak" in status]

    # Tính confidence tổng.
    # Ưu tiên trung bình P(Weak) trên các skill bị dự đoán WEAK; nếu không có thì lấy
    # trung bình max(P(Weak), P(Strong)) trên tất cả skills.
    confidence = None
    try:
        if weak_skills:
            vals = []
            for s in weak_skills:
                p = (proba_by_skill.get(s) or {}).get('pWeak')
                if isinstance(p, (int, float)):
                    vals.append(float(p))
            if vals:
                confidence = float(sum(vals) / len(vals))
        if confidence is None:
            vals = []
            for v in (proba_by_skill or {}).values():
                pS = v.get('pStrong')
                pW = v.get('pWeak')
                if isinstance(pS, (int, float)) or isinstance(pW, (int, float)):
                    candidates = [x for x in [pS, pW] if isinstance(x, (int, float))]
                    if candidates:
                        vals.append(float(max(candidates)))
            if vals:
                confidence = float(sum(vals) / len(vals))
    except Exception:
        confidence = None

    if not weak_skills:
        # Phương án dự phòng: vẫn trả gợi ý luyện tập cho user mới / ít dữ liệu.
        # Lý do: với tập dữ liệu nhỏ hoặc mô hình thiên lệch về STRONG, có thể không có kỹ năng nào bị gắn nhãn WEAK.
        # Khi đó, chọn skill có accuracy thấp nhất trong lịch sử user để gợi ý luyện tập.
        try:
            conn_fb = pyodbc.connect(conn_str)
            fb_query = f"""
            SELECT TOP 1
                s.name AS skillName,
                CAST(SUM(CASE WHEN ur.isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) AS skill_accuracy,
                COUNT(*) AS attempts
            FROM UserResults ur
            JOIN QuestionSkills qs ON ur.questionId = qs.questionId
            JOIN Skills s ON qs.skillId = s.id
            WHERE ur.userId = {userId}
            GROUP BY s.name
            ORDER BY skill_accuracy ASC, attempts DESC
            """
            fb_df = pd.read_sql(fb_query, conn_fb)
            conn_fb.close()

            if not fb_df.empty:
                fallback_skill = str(fb_df.iloc[0]['skillName'])
                fallback_acc = float(fb_df.iloc[0]['skill_accuracy'])
                print(
                    f"✅ User không có skill bị gắn nhãn WEAK; fallback gợi ý luyện tập theo skill thấp nhất: "
                    f"{fallback_skill} (acc={fallback_acc:.2%})"
                )
                weak_skills = [fallback_skill]
            else:
                print("✅ User không có skill yếu và cũng không đủ mapping skill để gợi ý.")
                return {"weak_skills": [], "recommendations": {}, "confidence": confidence, "skill_predictions": []}
        except Exception as e:
            print(f"⚠️ Fallback recommendation failed: {e}")
            return {"weak_skills": [], "recommendations": {}, "confidence": confidence, "skill_predictions": []}

    print(f"\n🎯 Weak Skills: {weak_skills}")
    
    # Bước 2: Gợi ý câu hỏi cho từng kỹ năng yếu
    conn = pyodbc.connect(conn_str)
    recommendations = {}
    
    for skill in weak_skills:
        print(f"\n📚 Đang tìm câu hỏi gợi ý cho skill: {skill}...")
        safe_skill = str(skill).replace("'", "''")

        # 1) Ưu tiên anchor từ các câu user làm SAI trong kỹ năng này (cá nhân hoá hơn)
        wrong_query = f"""
        SELECT TOP 50
            ur.questionId AS id,
            q.question AS question
        FROM UserResults ur
        JOIN Questions q ON ur.questionId = q.id
        JOIN QuestionSkills qs ON ur.questionId = qs.questionId
        JOIN Skills s ON qs.skillId = s.id
        WHERE ur.userId = {userId}
          AND ur.isCorrect = 0
          AND s.name = '{safe_skill}'
        GROUP BY ur.questionId, q.question
        ORDER BY MAX(CAST(ur.answeredAt AS datetime2)) DESC
        """
        wrong_df = pd.read_sql(wrong_query, conn)

        # 2) Pool dự phòng: lấy ngẫu nhiên câu hỏi theo kỹ năng này
        pool_query = f"""
        SELECT TOP 50 q.id, q.question
        FROM Questions q
        JOIN QuestionSkills qs ON q.id = qs.questionId
        JOIN Skills s ON qs.skillId = s.id
        WHERE s.name = '{safe_skill}'
        ORDER BY NEWID()
        """
        pool_df = pd.read_sql(pool_query, conn)

        if wrong_df.empty and pool_df.empty:
            print(f"   ⚠️ Không tìm thấy câu hỏi cho skill {skill}")
            continue

        # Tạo danh sách anchor: ưu tiên câu sai, sau đó bù bằng câu ngẫu nhiên (loại trùng theo questionId)
        anchor_ids = []
        seen_anchor_ids = set()

        for _, qrow in wrong_df.iterrows():
            qid = int(qrow['id'])
            if qid not in seen_anchor_ids:
                anchor_ids.append(qid)
                seen_anchor_ids.add(qid)
            if len(anchor_ids) >= 20:
                break

        if len(anchor_ids) < 20:
            for _, qrow in pool_df.iterrows():
                qid = int(qrow['id'])
                if qid not in seen_anchor_ids:
                    anchor_ids.append(qid)
                    seen_anchor_ids.add(qid)
                if len(anchor_ids) >= 20:
                    break
        
        # Gợi ý câu hỏi tương tự
        all_suggestions = {}  # Key: question ID
        seen_content = set()  # Track unique content

        # Tối ưu hiệu năng: gọi Node.js một lần cho mỗi skill với nhiều anchors.
        # Giữ hành vi cũ bằng cách xử lý anchors theo đúng thứ tự và áp dụng cùng
        # quy tắc loại trùng + dừng sớm.
        batch_map = None
        try:
            batch_json = recommend_questions_batch(anchor_ids, k=k)
            if batch_json:
                batch_map = json.loads(batch_json)
        except Exception as e:
            print(f"⚠️ Batch recommend failed; fallback per-anchor. Error: {e}")
            batch_map = None

        for anchor_id in anchor_ids:  # up to 20 anchors
            similar = None

            if isinstance(batch_map, dict):
                # Node xuất key dưới dạng string trong JSON
                similar = batch_map.get(str(anchor_id)) or batch_map.get(anchor_id)

            if similar is None:
                similar_json = recommend_questions(anchor_id, k=k)
                if similar_json:
                    try:
                        similar = json.loads(similar_json)
                    except Exception as e:
                        print(f"⚠️ Parse error: {e}")
                        similar = None

            if isinstance(similar, list):
                for s in similar:
                    # Loại trùng lặp: bỏ qua nếu nội dung đã tồn tại
                    content_normalized = s['question'].strip() if s.get('question') else ''
                    if content_normalized and content_normalized not in seen_content:
                        all_suggestions[s['id']] = {
                            "id": s['id'],
                            "question": s['question']
                        }
                        seen_content.add(content_normalized)

            # Dừng sớm nếu đã đủ 30 câu hỏi duy nhất
            if len(all_suggestions) >= 30:
                break

        
        recommendations[skill] = list(all_suggestions.values())[:30]  # Top 30 questions
        print(f"   ✅ Tìm được {len(recommendations[skill])} câu hỏi unique (deduplicated)")
    
    conn.close()

    skill_predictions = []
    for skill, status in results.items():
        p = proba_by_skill.get(skill, {})
        skill_predictions.append({
            "skill": skill,
            "status": status,
            "model": p.get('model'),
            "pStrong": p.get('pStrong'),
            "pWeak": p.get('pWeak')
        })
    
    return {
        "weak_skills": weak_skills,
        "recommendations": recommendations,
        "confidence": confidence,
        "skill_predictions": skill_predictions
    }

# ============================================================================
# MAIN: Chạy thử script
# ============================================================================
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Predict weak skills and recommend questions (Hybrid Unified)')
    parser.add_argument('userId', nargs='?', type=int, default=3, help='User ID to predict')
    parser.add_argument('--out', '-o', help='Output JSON file path (default: ml/results/result_user_<userId>.json)')
    parser.add_argument('--quiet', action='store_true', help='Suppress verbose console output')
    parser.add_argument('--k', type=int, default=3, help='Number of recommendations per anchor (default 3)')

    args = parser.parse_args()

    userId = args.userId

    # Nếu có --quiet, tắt stdout để tránh đầu ra quá lớn.
    # Giữ stderr để bên gọi (Node.js) có thể bắt traceback khi lỗi.
    if args.quiet:
        try:
            devnull = open(os.devnull, 'w', encoding='utf-8')
            sys.stdout.flush()
            sys.stdout = devnull
        except Exception:
            pass

    # Chạy full pipeline
    result = full_pipeline(userId, k=args.k)

    # Xác định đường dẫn đầu ra (lưu dưới ml/results/)
    results_dir = os.path.join(os.path.dirname(__file__), "results")
    os.makedirs(results_dir, exist_ok=True)
    default_out = os.path.join(results_dir, f"result_user_{userId}.json")
    out_path = args.out if args.out else default_out

    # Ghi JSON kết quả ra file (UTF-8)
    try:
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        # Chỉ in xác nhận khi không bật quiet
        if not args.quiet:
            try:
                sys.__stdout__.write(f"JSON result written to: {out_path}\n")
            except Exception:
                print(f"JSON result written to: {out_path}")
    except Exception as e:
        # Nếu ghi file lỗi, chuyển sang phương án dự phòng: in JSON ra stdout gốc
        try:
            sys.__stdout__.write(f"Failed to write file: {e}\n")
            sys.__stdout__.write(json.dumps(result, ensure_ascii=False))
        except Exception:
            pass

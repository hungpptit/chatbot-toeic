"""
================================================================================
PREDICT HYBRID WITH UNIFIED MODEL (VERSION 2.0)
================================================================================

📌 MỤC ĐÍCH:
   Dự đoán kỹ năng yếu của user và gợi ý câu hỏi bằng HYBRID STRATEGY mới:
   - Dùng GLOBAL MODEL khi user có ít data (<10 attempts)
   - Dùng UNIFIED MODEL khi user có đủ data (≥10 attempts)

🔄 KHÁC BIỆT VỚI predict_hybrid.py (cũ):
   - predict_hybrid.py (cũ): Global + Personal (10k models cho 10k users)
   - predict_hybrid_unified.py (mới): Global + Unified (chỉ 1 model cho tất cả users)

⚙️ HYBRID STRATEGY:
   IF attempts < 10:
      → Dùng GLOBAL MODEL (weak_skill_model.pkl)
      → Input: [attempts, correct, accuracy] (3 features)
   ELSE:
      → Dùng UNIFIED MODEL (unified_model.pkl)
      → Input: [userId_hash, user_level, total_tests, total_questions, 
                overall_accuracy, days_active, attempts, correct, skill_accuracy] (9 features)

✅ ƯU ĐIỂM:
   - Scalable: 1 model cho 10k users thay vì 10k models
   - Fast retrain: 2-3 phút thay vì 14 giờ
   - User mới: Predict ngay, không cần train
   - Vẫn giữ 95% personalization

📝 SỬ DỤNG:
   python predict_hybrid_unified.py

📅 Created: 2025-10-08
👤 Author: AI Assistant
🔗 Related files: 
   - train_unified_model.py (train unified model)
   - predict_unified.py (standalone test)
   - predict_hybrid.py (version cũ với personal model)
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

# Ensure stdout/stderr use UTF-8 on Windows terminals to avoid "charmap" encode errors
try:
    # Python 3.7+: reconfigure if available
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    # Fallback: wrap streams (some environments may not expose buffer)
    try:
        import io
        sys.stdout = io.TextIOWrapper(getattr(sys.stdout, 'buffer', sys.stdout), encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(getattr(sys.stderr, 'buffer', sys.stderr), encoding='utf-8', errors='replace')
    except Exception:
        # Last resort: ignore and continue — prints may still fail on some consoles
        pass
import argparse

# Load .env từ parent directory
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
# HELPER FUNCTION: Chuẩn bị features cho Unified Model
# ============================================================================
def prepare_unified_features(userId: int, skillId: int, attempts: int, correct: int, accuracy: float, conn):
    """
    Chuẩn bị 9 features cho Unified Model
    
    Args:
        userId: ID của user
        skillId: ID của skill đang xét
        attempts: Số lần thử skill này
        correct: Số câu đúng skill này
        accuracy: Accuracy skill này
        conn: Database connection
    
    Returns:
        DataFrame với 9 features:
        [userId_hash, user_level, total_tests, total_questions, 
         overall_accuracy, days_active, attempts, correct, skill_accuracy]
    
    📝 NOTE: Features này PHẢI GIỐNG HỆT với lúc train unified model!
    """
    # Query user stats (tổng quan về user)
    query = f"""
    SELECT 
        COUNT(DISTINCT userTestId) AS total_tests,
        COUNT(*) AS total_questions,
        CAST(SUM(CASE WHEN isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) AS overall_accuracy,
        DATEDIFF(DAY, MIN(answeredAt), GETDATE()) AS days_active
    FROM UserResults
    WHERE userId = {userId}
    """
    user_stats = pd.read_sql(query, conn).iloc[0]
    
    # Feature Engineering (giống train_unified_model.py)
    userId_hash = hash(userId) % 10000  # Mã hóa user ID
    user_level = 0 if user_stats['overall_accuracy'] < 0.5 else (
        1 if user_stats['overall_accuracy'] < 0.7 else 2
    )  # 0=Beginner, 1=Intermediate, 2=Advanced
    
    # Tạo feature vector (9 features)
    X = pd.DataFrame([[
        userId_hash,
        user_level,
        int(user_stats['total_tests']),
        int(user_stats['total_questions']),
        float(user_stats['overall_accuracy']),
        int(user_stats['days_active']),
        attempts,
        correct,
        accuracy
    ]], columns=[
        'userId_hash', 'user_level', 'total_tests', 'total_questions',
        'overall_accuracy', 'days_active', 'attempts', 'correct', 'skill_accuracy'
    ])
    
    return X

# ============================================================================
# MAIN FUNCTION: Predict Hybrid với Unified Model
# ============================================================================
def predict_hybrid_unified(userId: int):
    """
    Dự đoán kỹ năng yếu cho user bằng Hybrid Strategy (Global + Unified)
    
    Args:
        userId: ID của user cần dự đoán
    
    Returns:
        dict: {skillName: "Weak (global)" hoặc "Strong (unified)", ...}
    
    Logic:
        - Nếu attempts < 10: Dùng Global Model (ít data, chưa đủ tin cậy)
        - Nếu attempts ≥ 10: Dùng Unified Model (đủ data, personalized)
    """
    conn = pyodbc.connect(conn_str)
    
    # Query skill stats của user
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

    # Load models (đọc từ thư mục model/)
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

    results = {}
    print("\n" + "="*80)
    print(f"📊 DỰ ĐOÁN KỸ NĂNG CHO USER {userId} (HYBRID UNIFIED STRATEGY)")
    print("="*80)
    
    # Predict cho từng skill
    for _, row in df.iterrows():
        skillName = row['skillName']
        skillId = row['skillId']
        attempts = row['attempts']
        correct = row['correct']
        accuracy = correct / attempts if attempts > 0 else 0

        print(f"\n🔍 Skill: {skillName}")
        print(f"   📈 Dữ liệu thực tế:")
        print(f"      - Số lần thử: {attempts}")
        print(f"      - Số câu đúng: {correct}")
        print(f"      - Accuracy: {accuracy:.2%}")
        
        # STRATEGY 1: Dùng Global Model (ít data)
        if attempts < 10:
            X_global = pd.DataFrame([[attempts, correct, accuracy]],
                                   columns=['attempts', 'correct', 'accuracy'])
            y_pred = global_model.predict(X_global)[0]
            y_proba = global_model.predict_proba(X_global)[0]
            
            print(f"   🤖 Model: GLOBAL (do attempts < 10)")
            print(f"   📊 Xác suất dự đoán:")
            print(f"      - P(Strong) = {y_proba[0]:.2%}")
            print(f"      - P(Weak) = {y_proba[1]:.2%}")
            print(f"   ✅ Kết luận: {'WEAK' if y_pred == 1 else 'STRONG'}")
            print(f"   💡 Lý do: Ít data, dùng pattern chung từ tất cả users")
            
            results[skillName] = "Weak (global)" if y_pred == 1 else "Strong (global)"
        
        # STRATEGY 2: Dùng Unified Model (đủ data)
        else:
            X_unified = prepare_unified_features(userId, skillId, attempts, correct, accuracy, conn)
            y_pred = unified_model.predict(X_unified)[0]
            y_proba = unified_model.predict_proba(X_unified)[0]
            
            print(f"   🤖 Model: UNIFIED (do attempts >= 10)")
            print(f"   📊 User context:")
            print(f"      - User Level: {['Beginner', 'Intermediate', 'Advanced'][int(X_unified['user_level'].iloc[0])]}")
            print(f"      - Total Tests: {int(X_unified['total_tests'].iloc[0])}")
            print(f"      - Overall Accuracy: {X_unified['overall_accuracy'].iloc[0]:.2%}")
            print(f"      - Days Active: {int(X_unified['days_active'].iloc[0])}")
            
            print(f"   📊 Xác suất dự đoán:")
            if y_proba.shape[0] >= 2:
                print(f"      - P(Strong) = {y_proba[0]:.2%}")
                print(f"      - P(Weak) = {y_proba[1]:.2%}")
            else:
                print(f"      - Model chỉ thấy 1 class = 100%")
            
            print(f"   ✅ Kết luận: {'WEAK' if y_pred == 1 else 'STRONG'}")
            print(f"   💡 Lý do: Model học từ context của user này + pattern chung")
            
            results[skillName] = "Weak (unified)" if y_pred == 1 else "Strong (unified)"
    
    print("\n" + "="*80)
    conn.close()
    return results

# ============================================================================
# QUESTION RECOMMENDATION: Gợi ý câu hỏi từ kNN
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

# ============================================================================
# FULL PIPELINE: Predict + Recommend
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
    # Step 1: Predict weak skills
    results = predict_hybrid_unified(userId)
    weak_skills = [skill for skill, status in results.items() if "Weak" in status]

    if not weak_skills:
        print("✅ User không có skill yếu!")
        return {"weak_skills": [], "recommendations": {}}

    print(f"\n🎯 Weak Skills: {weak_skills}")
    
    # Step 2: Recommend questions cho từng weak skill
    conn = pyodbc.connect(conn_str)
    recommendations = {}
    
    for skill in weak_skills:
        print(f"\n📚 Đang tìm câu hỏi gợi ý cho skill: {skill}...")
        
        # Query questions thuộc skill này
        query = f"""
        SELECT TOP 50 q.id, q.question
        FROM Questions q
        JOIN QuestionSkills qs ON q.id = qs.questionId
        JOIN Skills s ON qs.skillId = s.id
        WHERE s.name = '{skill}'
        ORDER BY NEWID()
        """
        questions_df = pd.read_sql(query, conn)
        
        if questions_df.empty:
            print(f"   ⚠️ Không tìm thấy câu hỏi cho skill {skill}")
            continue
        
        # Recommend similar questions
        all_suggestions = {}  # Key: question ID
        seen_content = set()  # Track unique content
        
        for _, q in questions_df.head(20).iterrows():  # Tăng lên 20 anchor để đảm bảo đủ 30 unique
            similar_json = recommend_questions(q['id'], k=k)
            if similar_json:
                try:
                    similar = json.loads(similar_json)
                    for s in similar:
                        # ✅ DEDUPLICATE: Skip nếu content đã tồn tại
                        content_normalized = s['question'].strip() if s.get('question') else ''
                        if content_normalized and content_normalized not in seen_content:
                            all_suggestions[s['id']] = {
                                "id": s['id'],
                                "question": s['question']
                            }
                            seen_content.add(content_normalized)
                except Exception as e:
                    print(f"⚠️ Parse error: {e}")
                    pass
            
            # Early exit nếu đã đủ 30 unique questions
            if len(all_suggestions) >= 30:
                break

        
        recommendations[skill] = list(all_suggestions.values())[:30]  # Top 30 questions
        print(f"   ✅ Tìm được {len(recommendations[skill])} câu hỏi unique (deduplicated)")
    
    conn.close()
    
    return {
        "weak_skills": weak_skills,
        "recommendations": recommendations
    }

# ============================================================================
# MAIN: Test script
# ============================================================================
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Predict weak skills and recommend questions (Hybrid Unified)')
    parser.add_argument('userId', nargs='?', type=int, default=3, help='User ID to predict')
    parser.add_argument('--out', '-o', help='Output JSON file path (default: ml/result_user_<userId>.json)')
    parser.add_argument('--quiet', action='store_true', help='Suppress verbose console output')
    parser.add_argument('--k', type=int, default=3, help='Number of recommendations per anchor (default 3)')

    args = parser.parse_args()

    userId = args.userId

    # If quiet, suppress stdout/stderr to avoid huge console output
    if args.quiet:
        try:
            devnull = open(os.devnull, 'w', encoding='utf-8')
            sys.stdout.flush()
            sys.stderr.flush()
            sys.stdout = devnull
            sys.stderr = devnull
        except Exception:
            pass

    # Run full pipeline
    result = full_pipeline(userId, k=args.k)

    # Determine output path
    default_out = os.path.join(os.path.dirname(__file__), f"result_user_{userId}.json")
    out_path = args.out if args.out else default_out

    # Write JSON result to file (UTF-8)
    try:
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        # Always print a short confirmation to original stdout
        try:
            sys.__stdout__.write(f"JSON result written to: {out_path}\n")
        except Exception:
            print(f"JSON result written to: {out_path}")
    except Exception as e:
        # If writing fails, fallback to printing JSON to original stdout
        try:
            sys.__stdout__.write(f"Failed to write file: {e}\n")
            sys.__stdout__.write(json.dumps(result, ensure_ascii=False))
        except Exception:
            pass

"""
================================================================================
PREDICT HYBRID (GLOBAL + PERSONAL MODEL) - VERSION 1.0
================================================================================

📌 MỤC ĐÍCH:
   Dự đoán kỹ năng yếu của user và gợi ý câu hỏi bằng HYBRID STRATEGY cũ:
   - Dùng GLOBAL MODEL khi user có ít data (<10 attempts)
   - Dùng PERSONAL MODEL khi user có đủ data (≥10 attempts)

⚠️ VERSION CŨ: Sử dụng Personal Model (1 model/user)
   → 10,000 users = 10,000 files .pkl
   → Không scale tốt với nhiều users
   → Khuyến nghị: Dùng predict_hybrid_unified.py (version mới)

⚙️ HYBRID STRATEGY:
   IF attempts < 10:
      → Dùng GLOBAL MODEL (weak_skill_model.pkl)
   ELSE:
      → Dùng PERSONAL MODEL (user_{userId}_model.pkl)

📊 FLOW:
   1. Query skills của user từ database
   2. Với mỗi skill:
      - Nếu attempts < 10 → global model
      - Nếu attempts >= 10 → personal model (train nếu chưa có)
   3. Detect weak skills
   4. Recommend questions cho weak skills (dùng kNN)
   5. Filter duplicates by question ID

📝 SỬ DỤNG:
   python predict_hybrid.py
   # Test với userId=3 (hardcoded)

📅 Created: Original
👤 Author: Backend Team
🔗 Related files:
   - train_model.py (train global model)
   - train_personal_model.py (train personal model)
   - predict_hybrid_unified.py (version mới với unified model)
   - findSimilar.js (kNN recommendation)
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

# Load .env từ parent directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # chatbot-toeic-backend
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

# -----------------------------
# Train model cá nhân cho 1 user
# -----------------------------
def train_personal_model(userId: int):
    conn = pyodbc.connect(conn_str)
    query = f"""
    SELECT 
        ur.userId,
        qs.skillId,
        COUNT(*) AS attempts,
        SUM(CASE WHEN ur.isCorrect = 1 THEN 1 ELSE 0 END) AS correct,
        CAST(SUM(CASE WHEN ur.isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) AS accuracy,
        CASE 
            WHEN CAST(SUM(CASE WHEN ur.isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) < 0.6 
            THEN 1 ELSE 0 
        END AS isWeak
    FROM UserResults ur
    JOIN QuestionSkills qs ON ur.questionId = qs.questionId
    WHERE ur.userId = {userId}
    GROUP BY ur.userId, qs.skillId
    """
    df = pd.read_sql(query, conn)

    if df.empty:
        print(f"⚠️ User {userId} chưa có dữ liệu để train")
        return None

    X = df[['attempts', 'correct', 'accuracy']]
    y = df['isWeak']

    model = GaussianNB()
    model.fit(X, y)

    path = os.path.join(os.path.dirname(__file__), f"user_{userId}_model.pkl")
    joblib.dump(model, path)
    return path

# -----------------------------
# Dự đoán hybrid cho 1 user
# -----------------------------
def predict_hybrid(userId: int):
    conn = pyodbc.connect(conn_str)
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
        return {}

    results = {}
    global_model_path = os.path.join(os.path.dirname(__file__), "weak_skill_model.pkl")
    global_model = joblib.load(global_model_path)

    print("\n" + "="*80)
    print(f"📊 DỰ ĐOÁN KỸ NĂNG CHO USER {userId}")
    print("="*80)
    
    for _, row in df.iterrows():
        skillName = row['skillName']
        attempts = row['attempts']
        correct = row['correct']
        accuracy = correct / attempts if attempts > 0 else 0

        print(f"\n🔍 Skill: {skillName}")
        print(f"   📈 Dữ liệu thực tế:")
        print(f"      - Số lần thử: {attempts}")
        print(f"      - Số câu đúng: {correct}")
        print(f"      - Accuracy: {accuracy:.2%}")
        
        X_new = pd.DataFrame([[attempts, correct, accuracy]],
                             columns=['attempts', 'correct', 'accuracy'])

        if attempts < 10:
            y_pred = global_model.predict(X_new)[0]
            y_proba = global_model.predict_proba(X_new)[0]
            
            print(f"   🤖 Model: GLOBAL (do attempts < 10)")
            print(f"   📊 Xác suất dự đoán:")
            print(f"      - P(Strong) = {y_proba[0]:.2%}")
            print(f"      - P(Weak) = {y_proba[1]:.2%}")
            print(f"   ✅ Kết luận: {'WEAK' if y_pred == 1 else 'STRONG'}")
            print(f"   💡 Lý do: Accuracy {accuracy:.2%} {'<' if y_pred == 1 else '>='} 60% threshold")
            
            results[skillName] = "Weak (global)" if y_pred == 1 else "Strong (global)"
        else:
            model_path = os.path.join(os.path.dirname(__file__), f"user_{userId}_model.pkl")
            if not os.path.exists(model_path):
                print(f"   ⚙️ Training personal model cho user {userId}...")
                train_personal_model(userId)
            personal_model = joblib.load(model_path)
            y_pred = personal_model.predict(X_new)[0]
            y_proba = personal_model.predict_proba(X_new)[0]
            
            print(f"   🤖 Model: PERSONAL (do attempts >= 10)")
            print(f"   📊 Xác suất dự đoán:")
            if len(y_proba) == 2:
                print(f"      - P(Strong) = {y_proba[0]:.2%}")
                print(f"      - P(Weak) = {y_proba[1]:.2%}")
            else:
                # Model chỉ học 1 class (tất cả đều Weak hoặc Strong)
                print(f"      - Model chỉ thấy 1 loại: {'Weak' if y_pred == 1 else 'Strong'} = 100%")
            print(f"   ✅ Kết luận: {'WEAK' if y_pred == 1 else 'STRONG'}")
            print(f"   💡 Lý do: Model cá nhân học từ {attempts} lần thử của user này")
            
            results[skillName] = "Weak (personal)" if y_pred == 1 else "Strong (personal)"
    
    print("\n" + "="*80)

    return results

# -----------------------------
# Gọi NodeJS để gợi ý câu hỏi
# -----------------------------
def recommend_questions(anchor_id: int, k: int = 2):
    result = subprocess.run(
        ["node", FIND_SIMILAR_PATH, str(anchor_id), str(k)],
        capture_output=True, text=True
    )
    return result.stdout.strip() if result.stdout else None

# -----------------------------
# 🧪 Test với userId
# -----------------------------
if __name__ == "__main__":
    userId = 3
    results = predict_hybrid(userId)
    print("🔎 Weak/Strong:", results)

    weak_skills = [skill for skill, status in results.items() if "Weak" in status]

    if not weak_skills:
        print("✅ User không có skill yếu")
    else:
        conn = pyodbc.connect(conn_str)
        for skill in weak_skills:
            query = f"""
            SELECT TOP 10 q.id, q.question
            FROM UserResults ur
            JOIN Questions q ON ur.questionId = q.id
            JOIN QuestionSkills qs ON q.id = qs.questionId
            JOIN Skills s ON qs.skillId = s.id
            WHERE ur.userId = {userId}
              AND ur.isCorrect = 0
              AND s.name = '{skill}'
            ORDER BY ur.answeredAt DESC
            """
            mistakes = pd.read_sql(query, conn)
            if mistakes.empty:
                print(f"⚠️ User {userId} chưa có câu sai trong skill {skill}")
                continue

           # all_suggestions = {}  # giữ unique theo id
            all_suggestions = {}

            for _, row in mistakes.iterrows():
                anchor_id = row['id']
                anchor_text = row['question']

                # luôn giữ anchor
                all_suggestions[anchor_id] = anchor_text

                # lấy 2 câu tương tự
                raw_json = recommend_questions(anchor_id, 2)
                if raw_json:
                    try:
                        print("DEBUG raw_json:", raw_json)   # để debug
                        suggestions = json.loads(raw_json)
                        for s in suggestions:
                            all_suggestions[s['id']] = s['question']  # overwrite nếu trùng id
                    except Exception as e:
                        print("❌ Parse error:", e)

            # ✅ lọc unique bằng dict
            unique_suggestions = list(all_suggestions.items())

            print("\n🔮 Final Suggested Questions (unique, including mistakes):")
            for qid, qtext in unique_suggestions:
                print(f"- ({qid}) {qtext}")

            print(f"\n📊 Tổng số câu gợi ý: {len(unique_suggestions)} (mong đợi ~30 nếu đủ 10 mistakes)")

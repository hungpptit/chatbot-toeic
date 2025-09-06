import os
import pyodbc
import pandas as pd
import joblib
import subprocess
import json
from sklearn.naive_bayes import GaussianNB
from dotenv import load_dotenv

# Load .env
load_dotenv(dotenv_path="./.env")

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_USERNAME = os.getenv("DB_USERNAME")
DB_PASS = os.getenv("DB_PASS")
DB_NAME = os.getenv("DB_NAME")
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # chatbot-toeic-backend
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

    path = f"ml/user_{userId}_model.pkl"
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
    global_model = joblib.load("ml/weak_skill_model.pkl")

    for _, row in df.iterrows():
        skillName = row['skillName']
        attempts = row['attempts']
        correct = row['correct']
        accuracy = correct / attempts if attempts > 0 else 0

        X_new = pd.DataFrame([[attempts, correct, accuracy]],
                             columns=['attempts', 'correct', 'accuracy'])

        if attempts < 10:
            y_pred = global_model.predict(X_new)[0]
            results[skillName] = "Weak (global)" if y_pred == 1 else "Strong (global)"
        else:
            model_path = f"ml/user_{userId}_model.pkl"
            if not os.path.exists(model_path):
                train_personal_model(userId)
            personal_model = joblib.load(model_path)
            y_pred = personal_model.predict(X_new)[0]
            results[skillName] = "Weak (personal)" if y_pred == 1 else "Strong (personal)"

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
    userId = 6
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

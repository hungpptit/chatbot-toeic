"""
================================================================================
TRAIN PERSONAL MODEL (1 MODEL PER USER)
================================================================================

📌 MỤC ĐÍCH:
   Train model riêng cho TỪNG USER cụ thể.
   Model cá nhân hóa 100% dựa trên data của chính user đó.

⚠️ DEPRECATED: File này dùng cho PERSONAL MODEL approach (cũ)
   → Với 10,000 users = 10,000 files model
   → Không scale tốt, khó maintain
   → KHUYẾN NGHỊ: Dùng train_unified_model.py thay thế!

🎯 OUTPUT:
   - user_{userId}_model.pkl: Personal Naive Bayes model cho user cụ thể

📊 INPUT FEATURES (3 features):
   - attempts: Số lần thử skill
   - correct: Số câu đúng
   - accuracy: Tỷ lệ đúng (correct/attempts)

📈 TARGET:
   - isWeak: 1 nếu accuracy < 60%, 0 nếu accuracy >= 60%

📝 SỬ DỤNG:
   python train_personal_model.py
   # Sẽ train cho userId=3 (hardcoded ở cuối file)

📅 Created: Original
👤 Author: Backend Team
🔗 Related files:
   - predict_hybrid.py (version cũ, sử dụng personal model)
   - train_unified_model.py (version mới, thay thế file này)
================================================================================
"""

import os
import pyodbc
import pandas as pd
from sklearn.naive_bayes import GaussianNB
import joblib
from dotenv import load_dotenv

# Load biến môi trường từ parent directory
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

    # Lưu model riêng theo userId
    path = os.path.join(os.path.dirname(__file__), f"user_{userId}_model.pkl")
    joblib.dump(model, path)
    print(f"✅ Đã train và lưu model cho user {userId} tại {path}")
    return path

# 🧪 Test thử
if __name__ == "__main__":
    train_personal_model(3)  # ví dụ userId = 3

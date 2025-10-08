"""
================================================================================
TRAIN GLOBAL MODEL (WEAK SKILL DETECTION)
================================================================================

📌 MỤC ĐÍCH:
   Train GLOBAL MODEL để detect weak skills từ TẤT CẢ users trong database.
   Model này dùng cho users có ÍT DATA (<10 attempts per skill).

🎯 OUTPUT:
   - weak_skill_model.pkl: Global Naive Bayes model

📊 INPUT FEATURES (3 features):
   - attempts: Số lần thử skill
   - correct: Số câu đúng
   - accuracy: Tỷ lệ đúng (correct/attempts)

📈 TARGET:
   - isWeak: 1 nếu accuracy < 60%, 0 nếu accuracy >= 60%

🔄 KHI NÀO RETRAIN:
   - Định kỳ (mỗi tuần/tháng) khi có thêm users mới
   - Setup cron job hoặc scheduled task
   - Hoặc manual khi thấy accuracy giảm

📝 SỬ DỤNG:
   python train_model.py

📅 Created: Original
👤 Author: Backend Team
🔗 Related files:
   - predict_hybrid.py (sử dụng model này cho attempts < 10)
   - predict_hybrid_unified.py (sử dụng model này cho attempts < 10)
================================================================================
"""

import os
import pyodbc
import pandas as pd
from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
from dotenv import load_dotenv

# Load biến môi trường từ file .env (ở thư mục gốc backend)
load_dotenv(dotenv_path="./.env")

# Lấy biến môi trường
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_USERNAME = os.getenv("DB_USERNAME")
DB_PASS = os.getenv("DB_PASS")
DB_NAME = os.getenv("DB_NAME")

# Kết nối SQL Server
conn_str = (
    f"DRIVER={{ODBC Driver 17 for SQL Server}};"
    f"SERVER={DB_HOST},{DB_PORT};"
    f"DATABASE={DB_NAME};"
    f"UID={DB_USERNAME};"
    f"PWD={DB_PASS}"
)

conn = pyodbc.connect(conn_str)

# Query dữ liệu
query = """
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
WHERE ur.userId IS NOT NULL
GROUP BY ur.userId, qs.skillId
"""
df = pd.read_sql(query, conn)
print("✅ Dữ liệu từ DB:")
print(df.head())

# Train model
X = df[['attempts', 'correct', 'accuracy']]
y = df['isWeak']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = GaussianNB()
model.fit(X_train, y_train)

print("\n📊 Đánh giá model:")
print(classification_report(y_test, model.predict(X_test)))

# Lưu model
joblib.dump(model, "ml/weak_skill_model.pkl")
print("\n💾 Model saved at ml/weak_skill_model.pkl")

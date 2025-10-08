"""
================================================================================
CHECK USER SKILLS (UTILITY - DEBUG)
================================================================================

📌 MỤC ĐÍCH:
   Kiểm tra kỹ năng (skills) của 1 user cụ thể trong database.
   Dùng để DEBUG và verify data trước khi train/predict.

🔍 CHỨC NĂNG:
   - Query tất cả skills mà user đã làm
   - Hiển thị số lần thử, số câu đúng, accuracy cho từng skill
   - Giúp hiểu rõ data distribution của user

📝 SỬ DỤNG:
   python check_user_skills.py
   # Mặc định check userId=3 (hardcoded)

💡 KHI NÀO DÙNG:
   - Debug: User không có weak skills → check xem user có data không
   - Verify: Sau khi user làm bài test mới
   - Analysis: Hiểu user behavior

📅 Created: 2025-10-08
👤 Author: AI Assistant
🔗 Related files:
   - find_best_user.py (tìm user có nhiều skills)
   - check_skills_distribution.py (xem tất cả skills trong DB)
================================================================================
"""

import os
import pyodbc
from dotenv import load_dotenv

# Load .env
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

conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

userId = 6

query = f"""
SELECT 
    s.name,
    COUNT(*) as attempts,
    SUM(CASE WHEN ur.isCorrect = 1 THEN 1 ELSE 0 END) as correct,
    CAST(SUM(CASE WHEN ur.isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) as accuracy
FROM UserResults ur
JOIN QuestionSkills qs ON ur.questionId = qs.questionId
JOIN Skills s ON qs.skillId = s.id
WHERE ur.userId = {userId}
GROUP BY s.name
ORDER BY accuracy ASC
"""

cursor.execute(query)
rows = cursor.fetchall()

print(f"\n📊 User {userId} - All Skills:")
print("="*70)
for row in rows:
    skill_name = row[0]
    attempts = row[1]
    correct = row[2]
    accuracy = row[3]
    status = "❌ WEAK" if accuracy < 0.6 else "✅ STRONG"
    print(f"{status} | {skill_name:15s} | {attempts:3d} attempts | {correct:3d} correct | {accuracy:6.1%}")
print("="*70)

"""
================================================================================
FIND BEST USER (UTILITY - TEST DATA FINDER)
================================================================================

📌 MỤC ĐÍCH:
   Tìm user "tốt nhất" để test - user có nhiều skills và nhiều attempts.
   Giúp tìm user suitable cho việc demo và test model.

🔍 CHỨC NĂNG:
   - Query tất cả users trong database
   - Đếm số skills và total attempts của mỗi user
   - Rank users theo số skills (nhiều → ít)
   - Tìm user có đủ data để test personal/unified model

📝 SỬ DỤNG:
   python find_best_user.py

💡 KHI NÀO DÙNG:
   - Setup: Tìm user để demo
   - Testing: Cần user có đủ data (>= 10 attempts/skill)
   - Debug: User nào có nhiều weak skills để test recommendation

📊 OUTPUT EXAMPLE:
   User 3: 3 skills, 96 total attempts ← BEST
   User 6: 1 skill, 160 attempts
   User 7: 2 skills, 50 attempts

📅 Created: 2025-10-08
👤 Author: AI Assistant
🔗 Related files:
   - check_user_skills.py (check specific user details)
   - check_skills_distribution.py (check database overview)
================================================================================
"""

import os
import pyodbc
from dotenv import load_dotenv

# Load .env
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"))

conn_str = (
    f"DRIVER={{ODBC Driver 17 for SQL Server}};"
    f"SERVER={os.getenv('DB_HOST')},{os.getenv('DB_PORT')};"
    f"DATABASE={os.getenv('DB_NAME')};"
    f"UID={os.getenv('DB_USERNAME')};"
    f"PWD={os.getenv('DB_PASS')}"
)

conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

# Tìm users có đủ nhiều skills
query = """
SELECT 
    ur.userId,
    COUNT(DISTINCT s.name) as skill_count,
    COUNT(*) as total_attempts
FROM UserResults ur
JOIN QuestionSkills qs ON ur.questionId = qs.questionId
JOIN Skills s ON qs.skillId = s.id
GROUP BY ur.userId
HAVING COUNT(DISTINCT s.name) >= 2
ORDER BY skill_count DESC, total_attempts DESC
"""

cursor.execute(query)
rows = cursor.fetchall()

print("\n🔍 Users có nhiều skills:")
print("="*80)
print(f"{'UserID':<10} {'Skills Count':<15} {'Total Attempts'}")
print("="*80)

for row in rows[:10]:  # Top 10 users
    userId = row[0]
    skill_count = row[1]
    attempts = row[2]
    print(f"{userId:<10} {skill_count:<15} {attempts}")

print("="*80)

# Lấy detail của user tốt nhất
if rows:
    best_user = rows[0][0]
    print(f"\n📊 Chi tiết User {best_user}:")
    print("="*70)
    
    detail_query = f"""
    SELECT 
        s.name,
        COUNT(*) as attempts,
        SUM(CASE WHEN ur.isCorrect = 1 THEN 1 ELSE 0 END) as correct,
        CAST(SUM(CASE WHEN ur.isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) as accuracy
    FROM UserResults ur
    JOIN QuestionSkills qs ON ur.questionId = qs.questionId
    JOIN Skills s ON qs.skillId = s.id
    WHERE ur.userId = {best_user}
    GROUP BY s.name
    ORDER BY accuracy ASC
    """
    
    cursor.execute(detail_query)
    detail_rows = cursor.fetchall()
    
    for row in detail_rows:
        skill_name = row[0]
        attempts = row[1]
        correct = row[2]
        accuracy = row[3]
        status = "❌ WEAK" if accuracy < 0.6 else "✅ STRONG"
        print(f"{status} | {skill_name:15s} | {attempts:3d} attempts | {correct:3d} correct | {accuracy:6.1%}")
    print("="*70)
    print(f"\n💡 Suggestion: Dùng userId = {best_user} để test predict_hybrid.py")

"""
================================================================================
CHECK SKILLS DISTRIBUTION (UTILITY - DATABASE OVERVIEW)
================================================================================

📌 MỤC ĐÍCH:
   Xem tất cả skills có trong database và số lượng questions của từng skill.
   Dùng để hiểu cấu trúc data và phân bố skills.

🔍 CHỨC NĂNG:
   - List tất cả skills từ bảng Skills
   - Đếm số questions thuộc mỗi skill
   - Hiển thị distribution để phát hiện data imbalance

📝 SỬ DỤNG:
   python check_skills_distribution.py

💡 KHI NÀO DÙNG:
   - Setup ban đầu: Hiểu có những skills nào
   - Data quality check: Skill nào có ít questions
   - Planning: Quyết định threshold cho hybrid strategy

📊 OUTPUT EXAMPLE:
   Skill 1 (Vocabulary): 500 questions
   Skill 2 (Grammar): 450 questions
   Skill 3 (Reading): 300 questions
   ...

📅 Created: 2025-10-08
👤 Author: AI Assistant
🔗 Related files:
   - check_user_skills.py (check specific user)
   - find_best_user.py (find users with multiple skills)
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

# Check Skills distribution trong toàn bộ database
query = """
SELECT 
    s.name,
    COUNT(DISTINCT qs.questionId) as question_count
FROM Skills s
LEFT JOIN QuestionSkills qs ON s.id = qs.skillId
GROUP BY s.name
ORDER BY question_count DESC
"""

cursor.execute(query)
rows = cursor.fetchall()

print("\n📚 Skills trong database (toàn bộ câu hỏi):")
print("="*50)
for row in rows:
    print(f"{row[0]:20s} | {row[1]:5d} câu hỏi")
print("="*50)

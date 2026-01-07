"""
================================================================================
STATISTICS: UserResults DATA
================================================================================

MỤC ĐÍCH:
   Thống kê dữ liệu UserResults hiện tại

SỬ DỤNG:
   python check_data_stats.py
   
================================================================================
"""

import os
import pyodbc
import pandas as pd
from dotenv import load_dotenv
import sys

# Fix UTF-8 encoding
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except:
    pass

# Load env từ parent directory (backend folder)
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

print("📊 STATISTICS: UserResults DATA")
print("=" * 70)

# ============================================================================
# 1. TỔNG RECORDS
# ============================================================================
query = "SELECT COUNT(*) FROM UserResults"
total_records = pd.read_sql(query, conn).iloc[0, 0]
print(f"\n1️⃣  Total UserResults records: {total_records}")

# ============================================================================
# 2. SỐ USERS
# ============================================================================
query = "SELECT COUNT(DISTINCT userId) FROM UserResults"
total_users = pd.read_sql(query, conn).iloc[0, 0]
print(f"2️⃣  Total unique users: {total_users}")

# ============================================================================
# 3. RECORDS PER USER
# ============================================================================
print(f"\n3️⃣  Records per user:")
query = """
SELECT userId, COUNT(*) AS total_results
FROM UserResults
GROUP BY userId
ORDER BY userId
"""
records_per_user = pd.read_sql(query, conn)
print(records_per_user.to_string(index=False))

# ============================================================================
# 4. TRAINING DATA (Aggregated by userId + skillId)
# ============================================================================
print(f"\n4️⃣  Training data (userId + skillId aggregation):")
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
ORDER BY ur.userId, qs.skillId
"""
training_data = pd.read_sql(query, conn)
print(f"   Total training records: {len(training_data)}")
print("\n   Sample (first 20 rows):")
print(training_data.head(20).to_string(index=False))

# ============================================================================
# 5. SUMMARY
# ============================================================================
print(f"\n5️⃣  SUMMARY:")
print(f"   {'Raw records':<20} {total_records:>10}")
print(f"   {'Unique users':<20} {total_users:>10}")
print(f"   {'Training records':<20} {len(training_data):>10}")
print(f"   {'Avg records/user':<20} {total_records//total_users:>10}")
print(f"   {'Skills per user':<20} {len(training_data)//total_users:>10}")

# ============================================================================
# 6. WEAK SKILLS DISTRIBUTION
# ============================================================================
weak_count = len(training_data[training_data['isWeak'] == 1])
strong_count = len(training_data[training_data['isWeak'] == 0])

print(f"\n6️⃣  Weak vs Strong skills:")
print(f"   Strong (accuracy >= 60%): {strong_count} ({strong_count/(weak_count+strong_count)*100:.1f}%)")
print(f"   Weak (accuracy < 60%):    {weak_count} ({weak_count/(weak_count+strong_count)*100:.1f}%)")

conn.close()

print("\n" + "=" * 70)
print("✅ DONE!")

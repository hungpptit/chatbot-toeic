"""
================================================================================
GENERATE FAKE DATA FOR ML TRAINING
================================================================================

MỤC ĐÍCH:
   Tạo fake users và copy UserResults từ users thật để có nhiều dữ liệu train

SỬ DỤNG:
   python generate_fake_data.py
   
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
cursor = conn.cursor()

print("📊 GENERATE FAKE DATA FOR ML TRAINING")
print("=" * 60)

# ============================================================================
# 1. TẠO FAKE USERS
# ============================================================================
print("\n1️⃣  Creating fake users (ID: 100-129)...")

FAKE_USER_IDS = list(range(100, 130))  # 30 users

for user_id in FAKE_USER_IDS:
    try:
        cursor.execute("""
            INSERT INTO Users (userId, email, fullName, level)
            VALUES (?, ?, ?, ?)
        """, (user_id, f"fakeuser{user_id}@test.com", f"Fake User {user_id}", "A1"))
    except Exception as e:
        # User might already exist
        pass

conn.commit()
print(f"✅ Created/checked {len(FAKE_USER_IDS)} fake users")

# ============================================================================
# 2. COPY UserResults TỪ USERS THẬT SANG USERS FAKE
# ============================================================================
print("\n2️⃣  Copying UserResults from real users to fake users...")

# Users thật
REAL_USER_IDS = [3, 6, 12, 15]

# Query UserResults từ users thật
query = """
SELECT userId, questionId, isCorrect, timestamp, isTest
FROM UserResults
WHERE userId IN (3, 6, 12, 15)
"""

real_results = pd.read_sql(query, conn)
print(f"   Found {len(real_results)} UserResults from real users")

# Copy sang fake users
total_inserted = 0
for fake_user_id in FAKE_USER_IDS:
    for _, row in real_results.iterrows():
        try:
            cursor.execute("""
                INSERT INTO UserResults (userId, questionId, isCorrect, timestamp, isTest)
                VALUES (?, ?, ?, ?, ?)
            """, (fake_user_id, row['questionId'], row['isCorrect'], row['timestamp'], row['isTest']))
            total_inserted += 1
        except Exception as e:
            # Skip if duplicate
            pass

conn.commit()
print(f"✅ Inserted {total_inserted} UserResults for fake users")

# ============================================================================
# 3. VERIFY DATA
# ============================================================================
print("\n3️⃣  Verifying data...")

query = """
SELECT 
    COUNT(DISTINCT userId) AS total_users,
    COUNT(*) AS total_results
FROM UserResults
WHERE userId >= 100 AND userId < 130
"""

result = cursor.execute(query).fetchall()
fake_users_count, fake_results_count = result[0]

print(f"   Fake users with results: {fake_users_count}")
print(f"   Total fake results: {fake_results_count}")

# Check tổng data
query_all = """
SELECT COUNT(DISTINCT userId) AS total_users, COUNT(*) AS total_results
FROM UserResults
"""

result_all = cursor.execute(query_all).fetchall()
all_users, all_results = result_all[0]

print(f"\n📊 SUMMARY:")
print(f"   Total users in DB: {all_users}")
print(f"   Total UserResults: {all_results}")

conn.close()

print("\n✅ DONE! Now run cron job to retrain models:")
print("   python train_model.py")
print("   python train_unified_model.py")

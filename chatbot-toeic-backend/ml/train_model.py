"""
================================================================================
HUẤN LUYỆN MÔ HÌNH TOÀN CỤC (PHÁT HIỆN KỸ NĂNG YẾU)
================================================================================

 MỤC ĐÍCH:
   Huấn luyện mô hình toàn cục để phát hiện kỹ năng yếu từ TẤT CẢ users trong
   cơ sở dữ liệu.
   Mô hình này dùng cho user có ÍT dữ liệu (dưới 10 lần làm cho mỗi kỹ năng).

 ĐẦU RA:
   - weak_skill_model.pkl: mô hình Naive Bayes toàn cục

 THUẬT TOÁN:
   - Gaussian Naive Bayes: được chọn vì tốc độ, đơn giản và hiệu quả trên các
     đặc trưng dạng số; phù hợp làm mô hình baseline toàn cục.

 ĐẶC TRƯNG ĐẦU VÀO (3 đặc trưng):
   - attempts: số lần làm của kỹ năng
   - correct: số câu đúng
   - accuracy: tỷ lệ đúng (correct/attempts)

 NHÃN ĐẦU RA:
   - isWeak: 1 nếu accuracy < 60%, 0 nếu accuracy >= 60%

 KHI NÀO HUẤN LUYỆN LẠI:
   - Định kỳ (tuần/tháng) khi có thêm user mới
   - Thiết lập cron job / scheduled task
   - Hoặc chạy thủ công khi thấy chất lượng giảm

 CÁCH CHẠY:
   python train_model.py

 Tác giả: Backend Team
 File liên quan:
   - predict_hybrid.py (dùng mô hình này khi attempts < 10)
   - predict_hybrid_unified.py (dùng mô hình này khi attempts < 10)
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
import sys

# Sửa encoding UTF-8 cho console Windows
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    try:
        import io
        sys.stdout = io.TextIOWrapper(getattr(sys.stdout, 'buffer', sys.stdout), encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(getattr(sys.stderr, 'buffer', sys.stderr), encoding='utf-8', errors='replace')
    except Exception:
        pass

# Nạp biến môi trường từ file .env (ở thư mục gốc backend)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"))

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

# Truy vấn dữ liệu
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

# Huấn luyện mô hình
X = df[['attempts', 'correct', 'accuracy']]
y = df['isWeak']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = GaussianNB()
model.fit(X_train, y_train)

print("\nĐánh giá model:")
print(classification_report(y_test, model.predict(X_test)))

# Lưu mô hình (dùng absolute path để tránh lỗi khi chạy từ cron)
model_dir = os.path.join(os.path.dirname(__file__), 'model')
os.makedirs(model_dir, exist_ok=True)  # Tạo thư mục nếu chưa có

model_path = os.path.join(model_dir, 'weak_skill_model.pkl')
joblib.dump(model, model_path)
print(f"\n Model saved at {model_path}")

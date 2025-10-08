"""
================================================================================
PREDICT (DEPRECATED - KHÔNG DÙNG)
================================================================================

📌 MỤC ĐÍCH:
   Load global model và predict weak skill đơn giản.
   Dự định để Node.js gọi, nhưng KHÔNG DÙNG NỮA.

⚠️ DEPRECATED: File này KHÔNG còn được sử dụng!
   → Đã được thay thế bởi predict_hybrid.py hoặc predict_hybrid_unified.py
   → Giữ lại chỉ để tham khảo

🎯 CHỨC NĂNG (cũ):
   - Load weak_skill_model.pkl
   - Predict từ attempts, correct
   - Return "Weak" hoặc "Strong"

📝 THAY THẾ BỞI:
   - predict_hybrid.py (version 1.0 với personal model)
   - predict_hybrid_unified.py (version 2.0 với unified model)

📅 Created: Original
👤 Author: Backend Team
🔗 Status: DEPRECATED - DO NOT USE
================================================================================
"""

# script để load model và dự đoán (cho Node.js gọi).
# ko dùng tới

import joblib
import pandas as pd

# Load model đã train
model = joblib.load("ml/weak_skill_model.pkl")

def predict_weak_skill(attempts, correct):
    accuracy = correct / attempts if attempts > 0 else 0
    # Dữ liệu mới đưa vào DataFrame với tên cột giống khi train
    X_new = pd.DataFrame([[attempts, correct, accuracy]], 
                         columns=['attempts', 'correct', 'accuracy'])
    y_pred = model.predict(X_new)
    return "Weak" if y_pred[0] == 1 else "Strong"

# --------------------------
# 🧪 Test thử
# --------------------------
print("Case 1: attempts=20, correct=5  =>", predict_weak_skill(20, 5))
print("Case 2: attempts=15, correct=13 =>", predict_weak_skill(15, 13))
print("Case 3: attempts=8, correct=2   =>", predict_weak_skill(8, 2))
print("Case 4: attempts=30, correct=25 =>", predict_weak_skill(30, 25))

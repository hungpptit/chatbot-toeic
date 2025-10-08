"""
================================================================================
PREDICT PERSONAL (STANDALONE - DEPRECATED)
================================================================================

📌 MỤC ĐÍCH:
   Predict weak skill cho 1 user cụ thể bằng personal model của user đó.
   Standalone function, không có hybrid logic.

⚠️ DEPRECATED: File này dùng cho Personal Model approach (cũ)
   → Với 10,000 users = 10,000 files model
   → Không scale tốt
   → KHUYẾN NGHỊ: Dùng predict_unified.py hoặc predict_hybrid_unified.py

🎯 CHỨC NĂNG:
   - Load user_{userId}_model.pkl
   - Predict từ attempts, correct, accuracy
   - Return "Weak" hoặc "Strong"

📝 SỬ DỤNG:
   python predict_personal.py
   # Test với userId=3 (hardcoded)

📅 Created: Original
👤 Author: Backend Team
🔗 Related files:
   - train_personal_model.py (train personal model)
   - predict_hybrid.py (hybrid version)
   - predict_unified.py (unified model replacement)
================================================================================
"""

# có thể dùng để train riêng cập nhật cho user 
import os
import joblib
import pandas as pd

def predict_weak_skill_for_user(userId, attempts, correct):
    model_path = os.path.join(os.path.dirname(__file__), f"user_{userId}_model.pkl")
    try:
        model = joblib.load(model_path)
    except FileNotFoundError:
        return f"⚠️ Model cho user {userId} chưa được train"

    accuracy = correct / attempts if attempts > 0 else 0
    X_new = pd.DataFrame([[attempts, correct, accuracy]],
                         columns=['attempts', 'correct', 'accuracy'])
    y_pred = model.predict(X_new)
    return "Weak" if y_pred[0] == 1 else "Strong"

# 🧪 Test thử
if __name__ == "__main__":
    print(predict_weak_skill_for_user(3, 20, 5))
    print(predict_weak_skill_for_user(3, 15, 13))

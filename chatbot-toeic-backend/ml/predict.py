# script để load model và dự đoán (cho Node.js gọi).

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

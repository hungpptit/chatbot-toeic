# có thể dùng để train riêng cập nhật cho user 
import joblib
import pandas as pd

def predict_weak_skill_for_user(userId, attempts, correct):
    model_path = f"ml/user_{userId}_model.pkl"
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

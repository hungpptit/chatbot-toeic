"""
================================================================================
PREDICT WITH UNIFIED MODEL (STANDALONE TEST)
================================================================================

📌 MỤC ĐÍCH:
   Predict weak skills cho user bằng UNIFIED MODEL (standalone - không hybrid).
   File này dùng để TEST unified model độc lập, KHÔNG dùng trong production.

⚙️ PRODUCTION: Dùng predict_hybrid_unified.py thay thế!

🎯 CHỨC NĂNG:
   - Predict weak skills cho 1 user cụ thể
   - Compare với personal model (optional)
   - Show chi tiết user profile và probability

📊 INPUT:
   - userId: ID của user cần predict
   - --compare flag (optional): So sánh với personal model

📝 SỬ DỤNG:
   python predict_unified.py 3
   # Hoặc: python predict_unified.py 3 --compare (so sánh với personal)

🔍 OUTPUT:
   - User profile (level, total tests, accuracy, days active)
   - Weak skills với probability
   - Agreement rate (nếu dùng --compare)

📅 Created: 2025-10-08
👤 Author: AI Assistant
🔗 Related files:
   - train_unified_model.py (train model này)
   - predict_hybrid_unified.py (production version)
================================================================================
"""

import os
import pyodbc
import pandas as pd
import joblib
from dotenv import load_dotenv
from datetime import datetime
import numpy as np

# Load environment
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

def predict_unified(userId: int):
    """
    Predict weak skills cho user với unified model
    """
    # Load model và feature info
    model_path = os.path.join(os.path.dirname(__file__), "unified_model.pkl")
    info_path = os.path.join(os.path.dirname(__file__), "unified_model_info.pkl")
    
    if not os.path.exists(model_path):
        print("❌ Unified model chưa được train!")
        print("   → Chạy: python train_unified_model.py")
        return None
    
    model = joblib.load(model_path)
    feature_info = joblib.load(info_path)
    feature_columns = feature_info['feature_columns']
    
    print(f"📂 Loaded unified model (trained: {feature_info['trained_at']})")
    print(f"   Total users in training: {feature_info['total_users']}")
    print(f"   Training accuracy: {feature_info['test_accuracy']:.4f}")
    
    # Query user data
    conn = pyodbc.connect(conn_str)
    
    # Query giống hệt lúc train
    query = f"""
    WITH UserStats AS (
        SELECT 
            ur.userId,
            COUNT(DISTINCT ur.userTestId) AS total_tests,
            COUNT(*) AS total_questions,
            CAST(SUM(CASE WHEN ur.isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) AS overall_accuracy,
            DATEDIFF(DAY, MIN(ur.answeredAt), GETDATE()) AS days_active
        FROM UserResults ur
        WHERE ur.userId = {userId}
        GROUP BY ur.userId
    ),
    SkillStats AS (
        SELECT 
            ur.userId,
            qs.skillId,
            COUNT(*) AS attempts,
            SUM(CASE WHEN ur.isCorrect = 1 THEN 1 ELSE 0 END) AS correct,
            CAST(SUM(CASE WHEN ur.isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) AS skill_accuracy
        FROM UserResults ur
        JOIN QuestionSkills qs ON ur.questionId = qs.questionId
        WHERE ur.userId = {userId}
        GROUP BY ur.userId, qs.skillId
    )
    SELECT 
        ss.userId,
        ss.skillId,
        us.total_tests,
        us.total_questions,
        us.overall_accuracy,
        us.days_active,
        ss.attempts,
        ss.correct,
        ss.skill_accuracy
    FROM SkillStats ss
    JOIN UserStats us ON ss.userId = us.userId
    """
    
    df = pd.read_sql(query, conn)
    conn.close()
    
    if df.empty:
        print(f"⚠️ User {userId} chưa có dữ liệu")
        return []
    
    # Feature engineering (giống lúc train)
    df['userId_hash'] = df['userId'].apply(lambda x: hash(x) % 10000)
    df['user_level'] = df['overall_accuracy'].apply(
        lambda x: 0 if x < 0.5 else (1 if x < 0.7 else 2)
    )
    
    # Prepare features theo đúng thứ tự
    X = df[feature_columns]
    
    print(f"\n👤 User {userId} Profile:")
    print(f"   Total Tests: {df['total_tests'].iloc[0]}")
    print(f"   Total Questions: {df['total_questions'].iloc[0]}")
    print(f"   Overall Accuracy: {df['overall_accuracy'].iloc[0]:.2%}")
    print(f"   Days Active: {df['days_active'].iloc[0]} days")
    level_map = {0: 'Beginner', 1: 'Intermediate', 2: 'Advanced'}
    print(f"   Level: {level_map[df['user_level'].iloc[0]]}")
    
    # Predict
    predictions = model.predict(X)
    probabilities = model.predict_proba(X)
    
    # Get weak skills
    weak_skills = []
    print(f"\n🎯 Weak Skill Detection Results:")
    print("-" * 70)
    
    for idx, row in df.iterrows():
        is_weak = predictions[idx]
        
        # Handle edge case: model chỉ học 1 class
        if probabilities.shape[1] == 1:
            weak_prob = 1.0 if is_weak else 0.0
        else:
            weak_prob = probabilities[idx][1]  # Probability of being weak
        
        status = "❌ WEAK" if is_weak else "✅ STRONG"
        print(f"Skill {row['skillId']}: {status}")
        print(f"   Attempts: {row['attempts']}, Correct: {row['correct']}, Accuracy: {row['skill_accuracy']:.2%}")
        print(f"   Weak Probability: {weak_prob:.2%}")
        
        if is_weak:
            weak_skills.append({
                'skillId': int(row['skillId']),
                'attempts': int(row['attempts']),
                'correct': int(row['correct']),
                'accuracy': float(row['skill_accuracy']),
                'weak_probability': float(weak_prob)
            })
    
    print("-" * 70)
    print(f"\n📊 Summary: {len(weak_skills)}/{len(df)} skills are WEAK")
    
    return weak_skills

def compare_unified_vs_personal(userId: int):
    """
    So sánh kết quả predict giữa unified model vs personal model
    """
    print("="*70)
    print(f"📊 COMPARISON: Unified vs Personal Model for User {userId}")
    print("="*70)
    
    # Predict with unified model
    print("\n🔹 UNIFIED MODEL:")
    weak_unified = predict_unified(userId)
    
    # Predict with personal model (if exists)
    print("\n\n🔹 PERSONAL MODEL:")
    personal_model_path = os.path.join(os.path.dirname(__file__), f"user_{userId}_model.pkl")
    
    if not os.path.exists(personal_model_path):
        print(f"⚠️ Personal model for user {userId} doesn't exist")
        print("   → Train it first: python train_personal_model.py")
        return
    
    # Load personal model và predict
    personal_model = joblib.load(personal_model_path)
    
    conn = pyodbc.connect(conn_str)
    query = f"""
    SELECT 
        ur.userId,
        qs.skillId,
        COUNT(*) AS attempts,
        SUM(CASE WHEN ur.isCorrect = 1 THEN 1 ELSE 0 END) AS correct,
        CAST(SUM(CASE WHEN ur.isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) AS accuracy
    FROM UserResults ur
    JOIN QuestionSkills qs ON ur.questionId = qs.questionId
    WHERE ur.userId = {userId}
    GROUP BY ur.userId, qs.skillId
    """
    df = pd.read_sql(query, conn)
    conn.close()
    
    X = df[['attempts', 'correct', 'accuracy']]
    predictions = personal_model.predict(X)
    
    weak_personal = []
    print(f"\n🎯 Personal Model Results:")
    print("-" * 70)
    for idx, row in df.iterrows():
        is_weak = predictions[idx]
        status = "❌ WEAK" if is_weak else "✅ STRONG"
        print(f"Skill {row['skillId']}: {status}")
        if is_weak:
            weak_personal.append(int(row['skillId']))
    print("-" * 70)
    
    # Compare
    print("\n📊 COMPARISON SUMMARY:")
    print("-" * 70)
    unified_ids = {s['skillId'] for s in weak_unified}
    personal_ids = set(weak_personal)
    
    same = unified_ids & personal_ids
    only_unified = unified_ids - personal_ids
    only_personal = personal_ids - unified_ids
    
    print(f"✅ Same prediction:     {len(same)} skills {list(same)}")
    print(f"🔹 Only Unified weak:   {len(only_unified)} skills {list(only_unified)}")
    print(f"🔸 Only Personal weak:  {len(only_personal)} skills {list(only_personal)}")
    
    agreement = len(same) / max(len(unified_ids | personal_ids), 1)
    print(f"\n🎯 Agreement Rate: {agreement:.2%}")
    
    if agreement >= 0.9:
        print("   ✅ Excellent! Unified model agrees 90%+ with personal model")
    elif agreement >= 0.8:
        print("   ⚠️ Good. Unified model agrees 80%+ with personal model")
    else:
        print("   ❌ Low agreement. Consider tuning unified model features")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python predict_unified.py <userId> [--compare]")
        print("Example: python predict_unified.py 3")
        print("Example: python predict_unified.py 3 --compare")
        sys.exit(1)
    
    userId = int(sys.argv[1])
    
    if len(sys.argv) > 2 and sys.argv[2] == "--compare":
        compare_unified_vs_personal(userId)
    else:
        weak_skills = predict_unified(userId)
        print(f"\n🎯 Final Result: {weak_skills}")

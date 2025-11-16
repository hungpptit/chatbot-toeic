// Force update ML prediction from Python result to database
import db from './src/models/index.js';
import fs from 'fs/promises';

const userId = parseInt(process.argv[2]) || 3;

async function forceUpdateML() {
  try {
    const resultFile = `./ml/result_user_${userId}.json`;
    const raw = await fs.readFile(resultFile, 'utf-8');
    const result = JSON.parse(raw);

    console.log('📊 Python result:');
    console.log('  - weak_skills:', result.weak_skills);

    // Extract question IDs
    const questionIds = [];
    const recommendations = result.recommendations || {};
    Object.values(recommendations).forEach(questions => {
      questions.forEach(q => {
        if (q.id && !questionIds.includes(q.id)) {
          questionIds.push(q.id);
        }
      });
    });

    // Delete old prediction
    await db.MLPrediction.destroy({ where: { userId } });
    console.log('🗑️  Deleted old prediction');

    // Insert new prediction
    await db.MLPrediction.create({
      userId: userId,
      weakSkills: result.weak_skills || [],
      questionIds: questionIds,
      confidence: 0.8,
      totalAttempts: 0,
      overallAccuracy: null
    });

    console.log('✅ Updated MLPredictions table:');
    console.log('  - weakSkills:', result.weak_skills);
    console.log('  - questionIds count:', questionIds.length);

    // Verify
    const check = await db.MLPrediction.findOne({ where: { userId } });
    console.log('\n🔍 Verified from database:');
    console.log('  - weakSkills:', check.weakSkills);
    console.log('  - updatedAt:', check.updatedAt);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

forceUpdateML();

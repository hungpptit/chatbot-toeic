// Check user 13 actual performance
import db from './src/models/index.js';

async function checkUserPerformance() {
  try {
    const userId = 13;
    
    // Get skill stats
    const stats = await db.sequelize.query(`
      SELECT 
        s.name AS skillName,
        COUNT(*) AS attempts,
        SUM(CASE WHEN ur.isCorrect = 1 THEN 1 ELSE 0 END) AS correct,
        CAST(SUM(CASE WHEN ur.isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) AS accuracy
      FROM UserResults ur
      JOIN QuestionSkills qs ON ur.questionId = qs.questionId
      JOIN Skills s ON qs.skillId = s.id
      WHERE ur.userId = ${userId}
      GROUP BY s.name
      ORDER BY accuracy ASC
    `, { type: db.sequelize.QueryTypes.SELECT });

    console.log(`\n📊 Performance của User ${userId}:\n`);
    console.table(stats);

    // Overall stats
    const overall = await db.sequelize.query(`
      SELECT 
        COUNT(DISTINCT userTestId) AS total_tests,
        COUNT(*) AS total_questions,
        SUM(CASE WHEN isCorrect = 1 THEN 1 ELSE 0 END) AS correct_answers,
        CAST(SUM(CASE WHEN isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) AS overall_accuracy
      FROM UserResults
      WHERE userId = ${userId}
    `, { type: db.sequelize.QueryTypes.SELECT });

    console.log('\n📈 Overall Stats:');
    console.log(`  - Tests: ${overall[0].total_tests}`);
    console.log(`  - Questions: ${overall[0].total_questions}`);
    console.log(`  - Accuracy: ${(overall[0].overall_accuracy * 100).toFixed(2)}%`);

    console.log('\n💡 ML Model định nghĩa WEAK khi accuracy < 60%');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUserPerformance();

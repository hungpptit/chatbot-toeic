// Check embeddings in database
import db from './src/models/index.js';

async function checkEmbeddings() {
  try {
    const count = await db.sequelize.query(
      'SELECT COUNT(*) as count FROM QuestionEmbeddings',
      { type: db.sequelize.QueryTypes.SELECT }
    );

    console.log('📊 Total embeddings:', count[0].count);

    if (count[0].count > 0) {
      const sample = await db.sequelize.query(
        'SELECT TOP 5 questionId FROM QuestionEmbeddings',
        { type: db.sequelize.QueryTypes.SELECT }
      );

      console.log('📝 Sample questionIds:', sample.map(x => x.questionId));
      console.log('\n✅ Test findSimilar.js với một trong các ID trên');
    } else {
      console.log('⚠️  Không có embeddings trong database!');
      console.log('💡 Cần chạy: node seedEmbeddings.js để tạo embeddings');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkEmbeddings();

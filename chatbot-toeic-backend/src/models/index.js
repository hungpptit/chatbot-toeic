// models/index.js
import dotenv from 'dotenv';
dotenv.config();

import Sequelize from 'sequelize';

// ✅ Khởi tạo Sequelize với pool tối ưu hơn
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '1433'),
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: true,
      },
    },
    pool: {
      max: 50,            // ✅ Tăng để xử lý nhiều kết nối
      min: 5,
      acquire: 30000,
      idle: 10000
    },
    define: {
      freezeTableName: true,
      timestamps: true,
    },
    logging: false
  }
);

const connectToDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to SQL Server successfully.');
  } catch (err) {
    console.error('❌ Connection failed:', err);
    process.exit(1); // ⚠️ Nếu không kết nối được thì thoát app
  }
};

const initDb = async () => {
  const db = {
    sequelize,
    Sequelize,
    connectToDB,
  };

  // ✅ Load models
  db.Vocabulary = (await import('./Vocabulary.js')).default(sequelize, Sequelize.DataTypes);
  db.Question = (await import('./Questions.js')).default(sequelize, Sequelize.DataTypes);
  db.User = (await import('./Users.js')).default(sequelize, Sequelize.DataTypes);
  db.UserVocabulary = (await import('./UserVocabulary.js')).default(sequelize, Sequelize.DataTypes);
  db.UserResult = (await import('./UserResults.js')).default(sequelize, Sequelize.DataTypes);
  db.Log = (await import('./Logs.js')).default(sequelize, Sequelize.DataTypes);
  db.Pronunciation = (await import('./Pronunciations.js')).default(sequelize, Sequelize.DataTypes);
  db.Synonym = (await import('./synonym.js')).default(sequelize, Sequelize.DataTypes);
  db.Antonym = (await import('./antonym.js')).default(sequelize, Sequelize.DataTypes);
  db.Meaning = (await import('./meaning.js')).default(sequelize, Sequelize.DataTypes);
  db.Conversation = (await import('./Conversation.js')).default(sequelize, Sequelize.DataTypes);
  db.Message = (await import('./Message.js')).default(sequelize, Sequelize.DataTypes);
  db.Test = (await import('./Tests.js')).default(sequelize, Sequelize.DataTypes);
  db.Course = (await import('./Courses.js')).default(sequelize, Sequelize.DataTypes);
  db.QuestionType = (await import('./QuestionType.js')).default(sequelize, Sequelize.DataTypes);
  db.Part = (await import('./Part.js')).default(sequelize, Sequelize.DataTypes);
  db.TestQuestion = (await import('./TestQuestion.js')).default(sequelize, Sequelize.DataTypes);
  db.UserTest = (await import('./UserTests.js')).default(sequelize, Sequelize.DataTypes);
  db.Test_Courses = (await import('./TestCourse.js')).default(sequelize, Sequelize.DataTypes);

  // ✅ Gắn associations (nếu có)
  Object.keys(db).forEach(modelName => {
    if (db[modelName]?.associate) {
      db[modelName].associate(db);
    }
  });

  return db;
};

const db = await initDb();

export default db;
export { initDb };

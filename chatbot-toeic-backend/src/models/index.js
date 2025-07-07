import dotenv from 'dotenv';
dotenv.config();

import Sequelize from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT),
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: true
      }
    },
    freezeTableName: true,
    timestamps: true,
    logging: false // hoặc true nếu bạn muốn xem câu lệnh SQL
  }
);

const connectToDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to SQL Server successfully.');
  } catch (err) {
    console.error('❌ Connection failed:', err);
  }
};

const initDb = async () => {
  const db = {
    sequelize,
    Sequelize,
    connectToDB,
  };

  // Load models
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
  db.Conversation = (await import('./conversation.js')).default(sequelize, Sequelize.DataTypes);
  db.Message = (await import('./message.js')).default(sequelize, Sequelize.DataTypes);

  // Tạo associations nếu có
  Object.keys(db).forEach(modelName => {
    if (db[modelName]?.associate) {
      db[modelName].associate(db);
    }
  });

  return db;
};

const db = await initDb();
export default db;

// ✅ THÊM DÒNG NÀY
export { initDb };

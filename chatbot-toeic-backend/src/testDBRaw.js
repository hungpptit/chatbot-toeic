const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  server: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

(async () => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT DB_NAME() AS currentDb; SELECT * FROM Vocabulary;');
    console.log('✅ Connected to DB:', result.recordsets[0][0].currentDb);
    console.table(result.recordsets[1]); // kết quả từ Vocabulary
  } catch (err) {
    console.error('❌ Query failed:', err);
  }
})();

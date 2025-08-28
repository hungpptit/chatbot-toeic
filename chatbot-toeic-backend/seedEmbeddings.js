import 'dotenv/config';
import sql from "mssql";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Config DB từ .env
const dbConfig = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: true
  }
};

// 2. Lấy Gemini API key (lấy cái đầu tiên trong danh sách .env)
const GEMINI_KEYS = process.env.GEMINI_API_KEYS.split(",");
const GOOGLE_API_KEY = GEMINI_KEYS[0].trim();

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "embedding-001" });

// 3. Hàm tạo embedding
async function createEmbedding(text) {
  const result = await model.embedContent(text);
  return result.embedding.values; // mảng float
}

// 4. Hàm lưu vào DB
async function upsertEmbedding(pool, questionId, vector) {
  const dim = vector.length;
  const vectorString = vector.join(",");

  await pool.request()
    .input("questionId", sql.Int, questionId)
    .input("model", sql.NVarChar, "gemini-embedding-001")
    .input("dim", sql.Int, dim)
    .input("vector", sql.NVarChar(sql.MAX), vectorString)
    .query(`
      MERGE QuestionEmbeddings AS target
      USING (SELECT @questionId AS questionId) AS src
      ON target.questionId = src.questionId
      WHEN MATCHED THEN
        UPDATE SET model = @model,
                   dim = @dim,
                   vector = @vector,
                   updatedAt = GETDATE()
      WHEN NOT MATCHED THEN
        INSERT (questionId, model, dim, vector, updatedAt)
        VALUES (@questionId, @model, @dim, @vector, GETDATE());
    `);
}

// 5. Seed toàn bộ Questions
async function seedEmbeddings() {
  const pool = await sql.connect(dbConfig);

  const result = await pool.request().query("SELECT id, question FROM Questions");

  console.log(`Found ${result.recordset.length} questions`);

  for (const row of result.recordset) {
    console.log(`➡️  Processing Question ${row.id}`);
    const embedding = await createEmbedding(row.question);
    await upsertEmbedding(pool, row.id, embedding);
  }

  console.log("✅ Done seeding embeddings");
  pool.close();
}

// Chạy script
seedEmbeddings().catch(err => console.error("❌ Error:", err));

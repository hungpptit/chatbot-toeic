import 'dotenv/config';
import sql from "mssql";
import { pipeline } from "@xenova/transformers"; // Dùng local model all-MiniLM-L6-v2

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

// 2. Load mô hình all-MiniLM-L6-v2 một lần duy nhất
let miniLMPipeline = null;
async function getMiniLMModel() {
  if (!miniLMPipeline) {
    // Dùng bản onnx chính thức
    miniLMPipeline = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return miniLMPipeline;
}


// 3. Hàm tạo embedding bằng all-MiniLM-L6-v2
async function createEmbedding(text) {
  const miniLM = await getMiniLMModel();
  const output = await miniLM(text, { pooling: "mean", normalize: true });
  return Array.from(output.data); // mảng float
}

// 4. Hàm lưu vào DB
async function upsertEmbedding(pool, questionId, vector) {
  const dim = vector.length;
  const vectorString = vector.join(",");

  await pool.request()
    .input("questionId", sql.Int, questionId)
    .input("model", sql.NVarChar, "all-MiniLM-L6-v2") // đổi tên model
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
    console.log(`Processing Question ${row.id}`);
    const embedding = await createEmbedding(row.question);
    await upsertEmbedding(pool, row.id, embedding);
  }

  console.log("Done seeding embeddings");
  pool.close();
}

// Chạy script
seedEmbeddings().catch(err => console.error("Error:", err));

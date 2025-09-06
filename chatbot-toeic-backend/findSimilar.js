import 'dotenv/config';
import sql from "mssql";
import { GoogleGenerativeAI } from "@google/generative-ai";

// DB config
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

// Gemini API key
const GEMINI_KEYS = process.env.GEMINI_API_KEYS.split(",");
const GOOGLE_API_KEY = GEMINI_KEYS[0].trim();

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "embedding-001" });

// --- Hàm cosine similarity ---
function cosineSimilarity(vecA, vecB) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// --- Hàm tạo embedding ---
async function createEmbedding(text) {
  const result = await model.embedContent(text);
  return result.embedding.values;
}

// --- Hàm tìm k câu hỏi gần nhất ---
async function findSimilar(inputText, k = 20) {
  const pool = await sql.connect(dbConfig);

  // 1. Tạo embedding cho input
  const inputEmbedding = await createEmbedding(inputText);

  // 2. Lấy tất cả embeddings từ DB
  const result = await pool.request().query(`
    SELECT q.id, q.question, e.vector
    FROM Questions q
    JOIN QuestionEmbeddings e ON q.id = e.questionId
  `);

  const similarities = [];

// knn ============================
  for (const row of result.recordset) {
    const vec = row.vector.split(",").map(Number);
    const sim = cosineSimilarity(inputEmbedding, vec);
    similarities.push({ id: row.id, question: row.question, score: sim });
  }

  // 3. Sắp xếp theo similarity giảm dần
  similarities.sort((a, b) => b.score - a.score);

  // 4. Lọc bỏ duplicate theo id
  const seen = new Set();
  const unique = similarities.filter(r => {
    if (!r.id || !r.question) return false; // bỏ object thiếu field
    if (seen.has(r.id)) return false;       // bỏ duplicate id
    seen.add(r.id);
    return true;
  });

  return unique.slice(0, k);
}
// =========================================

// --- CLI mode (nhận input từ Python) ---
if (process.argv.length > 2) {
  const query = process.argv[2];
  const k = process.argv[3] ? parseInt(process.argv[3]) : 5;

  findSimilar(query, k).then(results => {
    console.log(JSON.stringify(results, null, 2)); // in JSON
    process.exit(0);
  }).catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
}

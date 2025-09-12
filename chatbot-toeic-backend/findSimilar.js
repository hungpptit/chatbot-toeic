import "dotenv/config";
import sql from "mssql";
import { pipeline } from "@xenova/transformers"; // model all-MiniLM-L6-v2

// DB config
const dbConfig = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: true,
  },
};

// Load mô hình all-MiniLM-L6-v2 một lần
let miniLMPipeline = null;
async function getMiniLMModel() {
  if (!miniLMPipeline) {
    miniLMPipeline = await pipeline("feature-extraction", "sentence-transformers/all-MiniLM-L6-v2");
  }
  return miniLMPipeline;
}

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

// --- Hàm tạo embedding mới bằng all-MiniLM-L6-v2 ---
async function createEmbedding(text) {
  const miniLM = await getMiniLMModel();
  const output = await miniLM(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

// --- Hàm lấy embedding cho input ---
async function getInputEmbedding(pool, input) {
  // Nếu input là số (questionId) thì thử lấy vector từ DB
  if (!isNaN(input)) {
    const qId = parseInt(input, 10);
    const result = await pool
      .request()
      .input("questionId", sql.Int, qId)
      .query("SELECT vector FROM QuestionEmbeddings WHERE questionId = @questionId");

    if (result.recordset.length > 0) {
      console.error("Lấy embedding từ DB cho questionId =", qId);
      return result.recordset[0].vector.split(",").map(Number);
    } else {
      throw new Error(`Không tìm thấy embedding trong DB cho questionId=${qId}`);
    }
  }

  // Nếu input là text → tạo embedding mới bằng MiniLM
  console.error("Tạo embedding mới từ all-MiniLM-L6-v2 cho input text");
  return await createEmbedding(input);
}

// --- Hàm tìm k câu hỏi gần nhất ---
async function findSimilar(input, k = 5) {
  const pool = await sql.connect(dbConfig);

  // 1. Lấy embedding cho input (DB hoặc MiniLM)
  const inputEmbedding = await getInputEmbedding(pool, input);

  // 2. Lấy toàn bộ embeddings từ DB
  const result = await pool.request().query(`
    SELECT q.id, q.question, e.vector
    FROM Questions q
    JOIN QuestionEmbeddings e ON q.id = e.questionId
  `);

  const similarities = [];

  // 3. Tính cosine similarity
  for (const row of result.recordset) {
    const vec = row.vector.split(",").map(Number);
    const sim = cosineSimilarity(inputEmbedding, vec);
    similarities.push({ id: row.id, question: row.question, score: sim });
  }

  // 4. Sắp xếp theo similarity giảm dần
  similarities.sort((a, b) => b.score - a.score);

  // 5. Lọc bỏ duplicate theo id
  const seen = new Set();
  const unique = similarities.filter((r) => {
    if (!r.id || !r.question) return false;
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  return unique.slice(0, k);
}

// --- CLI mode ---
if (process.argv.length > 2) {
  const query = process.argv[2]; // có thể là questionId hoặc text
  const k = process.argv[3] ? parseInt(process.argv[3]) : 5;

  findSimilar(query, k)
    .then((results) => {
      console.log(JSON.stringify(results, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error:", err);
      process.exit(1);
    });
}

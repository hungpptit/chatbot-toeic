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

function parseVectorCsv(csv) {
  // DB stores vectors like "0.1,0.2,...". Keep it simple and fast.
  // Float32Array reduces memory and speeds math.
  const parts = String(csv).split(",");
  const vec = new Float32Array(parts.length);
  for (let i = 0; i < parts.length; i++) vec[i] = Number(parts[i]);
  return vec;
}

function vectorNorm(vec) {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) sum += vec[i] * vec[i];
  return Math.sqrt(sum);
}

function cosineSimilarityWithNorms(vecA, normA, vecB, normB) {
  let dot = 0;
  for (let i = 0; i < vecA.length; i++) dot += vecA[i] * vecB[i];
  const denom = normA * normB;
  return denom === 0 ? 0 : dot / denom;
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

async function loadAllEmbeddings(pool) {
  // Only load what we need for similarity math (id + vector).
  const result = await pool.request().query(`
    SELECT questionId AS id, vector
    FROM QuestionEmbeddings
  `);

  const items = [];
  for (const row of result.recordset) {
    if (!row.id || !row.vector) continue;
    const vec = parseVectorCsv(row.vector);
    items.push({ id: row.id, vec, norm: vectorNorm(vec) });
  }
  return items;
}

async function loadQuestionsByIds(pool, ids) {
  if (!ids || ids.length === 0) return new Map();
  // Chunk to avoid SQL Server parameter limits.
  const CHUNK = 800;
  const map = new Map();
  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK);
    const request = pool.request();
    const params = chunk
      .map((id, idx) => {
        const name = `id${idx}`;
        request.input(name, sql.Int, id);
        return `@${name}`;
      })
      .join(", ");
    const res = await request.query(`
      SELECT id, question
      FROM Questions
      WHERE id IN (${params})
    `);
    for (const row of res.recordset) {
      map.set(row.id, row.question);
    }
  }
  return map;
}

function topKSimilaritiesForEmbedding(allEmbeddings, inputVec, k) {
  const inputNorm = vectorNorm(inputVec);
  const sims = [];
  for (const item of allEmbeddings) {
    const score = cosineSimilarityWithNorms(inputVec, inputNorm, item.vec, item.norm);
    sims.push({ id: item.id, score });
  }
  sims.sort((a, b) => b.score - a.score);

  const seen = new Set();
  const unique = [];
  for (const r of sims) {
    if (!r.id) continue;
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    unique.push(r);
    if (unique.length >= k) break;
  }
  return unique;
}

async function getEmbeddingsByQuestionIds(pool, questionIds) {
  const request = pool.request();
  const params = questionIds
    .map((id, idx) => {
      const name = `qid${idx}`;
      request.input(name, sql.Int, id);
      return `@${name}`;
    })
    .join(", ");

  const res = await request.query(`
    SELECT questionId AS id, vector
    FROM QuestionEmbeddings
    WHERE questionId IN (${params})
  `);

  const map = new Map();
  for (const row of res.recordset) {
    if (!row.id || !row.vector) continue;
    map.set(row.id, parseVectorCsv(row.vector));
  }
  return map;
}

// --- Hàm tìm k câu hỏi gần nhất ---
async function findSimilar(input, k = 5) {
  const pool = await sql.connect(dbConfig);
  const allEmbeddings = await loadAllEmbeddings(pool);

  // Batch mode: input is JSON array of questionIds
  if (typeof input === "string" && input.trim().startsWith("[")) {
    let ids;
    try {
      ids = JSON.parse(input);
    } catch (e) {
      throw new Error(`Invalid JSON array input: ${e?.message || e}`);
    }
    if (!Array.isArray(ids) || ids.length === 0) return {};

    const questionIds = ids.map((x) => parseInt(x, 10)).filter((x) => Number.isFinite(x));
    const inputEmbeddings = await getEmbeddingsByQuestionIds(pool, questionIds);

    // Ensure all requested ids exist
    for (const qid of questionIds) {
      if (!inputEmbeddings.has(qid)) {
        throw new Error(`Không tìm thấy embedding trong DB cho questionId=${qid}`);
      }
    }

    const perAnchorTop = new Map();
    const neededQuestionIds = new Set();

    for (const qid of questionIds) {
      const top = topKSimilaritiesForEmbedding(allEmbeddings, inputEmbeddings.get(qid), k);
      perAnchorTop.set(qid, top);
      for (const r of top) neededQuestionIds.add(r.id);
    }

    const questionTextById = await loadQuestionsByIds(pool, Array.from(neededQuestionIds));
    const out = {};
    for (const qid of questionIds) {
      out[qid] = (perAnchorTop.get(qid) || []).map((r) => ({
        id: r.id,
        question: questionTextById.get(r.id) || null,
        score: r.score,
      })).filter((r) => r.id && r.question);
    }
    return out;
  }

  // Single mode (questionId or free text)
  const inputEmbeddingRaw = await getInputEmbedding(pool, input);
  const inputVec = inputEmbeddingRaw instanceof Float32Array ? inputEmbeddingRaw : new Float32Array(inputEmbeddingRaw);
  const top = topKSimilaritiesForEmbedding(allEmbeddings, inputVec, k);
  const questionTextById = await loadQuestionsByIds(pool, top.map((r) => r.id));
  return top
    .map((r) => ({ id: r.id, question: questionTextById.get(r.id) || null, score: r.score }))
    .filter((r) => r.id && r.question);
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

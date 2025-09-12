// services/embeddingService.js

import db from "../models/index.js";
import { pipeline } from "@xenova/transformers"; // Dùng transformers để load all-MiniLM-L6-v2

// Load mô hình all-MiniLM-L6-v2 một lần duy nhất
let miniLMPipeline = null;
async function getMiniLMModel() {
  if (!miniLMPipeline) {
    // Dùng bản ONNX chính thức từ Xenova
    miniLMPipeline = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return miniLMPipeline;
}

// Sinh embedding cho 1 câu hỏi bằng all-MiniLM-L6-v2
async function generateEmbeddingForQuestion(questionInstance) {
  const miniLM = await getMiniLMModel();
  const output = await miniLM(questionInstance.question, { pooling: "mean", normalize: true });
  const vector = Array.from(output.data);
  const dim = vector.length;

  // Lưu vào DB
  await db.QuestionEmbedding.upsert({
    questionId: questionInstance.id,
    model: "all-MiniLM-L6-v2", // ghi rõ model
    dim,
    vector: vector.join(","),
  });

  console.log(`Embedding generated for questionId ${questionInstance.id} using all-MiniLM-L6-v2`);
}

// Chế độ 1: Regenerate toàn bộ (tất cả câu hỏi, kể cả đã có embedding)
async function regenerateAllEmbeddings() {
  const questions = await db.Question.findAll();
  let count = 0;

  for (const q of questions) {
    if (q.question) {
      console.log(`Regenerating embedding for questionId ${q.id}`);
      await generateEmbeddingForQuestion(q);
      count++;
    }
  }

  console.log(`Done. Regenerated embeddings for ${count} questions`);
}

// Chế độ 2: Generate cho những câu bị miss (chưa có embedding)
async function generateMissingEmbeddings() {
  const questions = await db.Question.findAll({
    include: [{ model: db.QuestionEmbedding, as: "embedding", required: false }],
  });

  let count = 0;
  for (const q of questions) {
    if (!q.embedding && q.question) {
      console.log(`Generating embedding for questionId ${q.id}`);
      await generateEmbeddingForQuestion(q);
      count++;
    }
  }

  console.log(`Done. Generated embeddings for ${count} missing questions`);
}

export default {
  generateEmbeddingForQuestion,
  regenerateAllEmbeddings,
  generateMissingEmbeddings,
};

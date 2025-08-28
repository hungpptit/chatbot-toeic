import { GoogleGenerativeAI } from "@google/generative-ai";
import db from "../models/index.js";

const GEMINI_KEYS = process.env.GEMINI_API_KEYS.split(",");
const GOOGLE_API_KEY = GEMINI_KEYS[0].trim();

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "embedding-001" });

// Sinh embedding cho 1 câu hỏi
async function generateEmbeddingForQuestion(questionInstance) {
  const result = await model.embedContent(questionInstance.question);
  const vector = result.embedding.values;
  const dim = vector.length;

  await db.QuestionEmbedding.upsert({
    questionId: questionInstance.id,
    model: "gemini-embedding-001",
    dim,
    vector: vector.join(","),
  });
}

// Sinh embedding cho tất cả câu hỏi chưa có
async function generateMissingEmbeddings() {
  const questions = await db.Question.findAll({
    include: [
      { model: db.QuestionEmbedding, as: "embedding", required: false },
    ],
  });

  let count = 0;
  for (const q of questions) {
    if (!q.embedding && q.question) {
      console.log(`➡️ Generating embedding for questionId ${q.id}`);
      await generateEmbeddingForQuestion(q);
      count++;
    }
  }
  console.log(`✅ Done. Generated embeddings for ${count} questions`);
}

export default {
  generateEmbeddingForQuestion,
  generateMissingEmbeddings,
};

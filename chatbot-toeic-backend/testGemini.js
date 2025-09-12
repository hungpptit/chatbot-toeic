import { GoogleGenerativeAI } from "@google/generative-ai";

const key = "AIzaSyAU-QS4tuiVTWRLpXxHwVp1uQZyeE4HUDM"; // key mới bạn vừa tạo

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(key);

    // Test với embedding
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent("Hello Gemini");

    console.log("✅ Key OK. Vector length:", result.embedding.values.length);
  } catch (err) {
    console.error("❌ Lỗi:", err.message);
  }
}

run();

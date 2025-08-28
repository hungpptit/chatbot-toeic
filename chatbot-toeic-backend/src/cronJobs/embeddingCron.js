import cron from "node-cron";
import embeddingService from "../services/embeddingService.js";

// Chạy mỗi ngày lúc 2 giờ sáng
cron.schedule("0 2 * * *", async () => {
  console.log("⏰ Cron Job: Checking for missing embeddings...");
  try {
    await embeddingService.generateMissingEmbeddings();
    console.log("✅ Cron Job: Done filling missing embeddings");
  } catch (err) {
    console.error("❌ Cron Job: Failed to generate embeddings:", err);
  }
});
// testUpload.js
import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";

// Config Cloudinary từ .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadTestAudio() {
  try {
    // đổi đường dẫn file audio trên máy bạn
    const filePath = "D:/web_html/gop/cnpm/Final/grapfity/backend/src/public/assets/track_audio/audio-1747581053096-787515233.mp3";

    // upload audio
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "toeic-media/audio",
      resource_type: "video", // Cloudinary coi audio là "video"
    });

    console.log("✅ Upload audio success!");
    console.log("URL:", result.secure_url);
    console.log("Public ID:", result.public_id);
  } catch (err) {
    console.error("❌ Upload failed:", err);
  }
}

uploadTestAudio();

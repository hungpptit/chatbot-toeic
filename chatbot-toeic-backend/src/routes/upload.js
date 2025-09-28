// chatbot-toeic-backend/src/routes/upload.js
// Route upload file lên Cloudinary (tách ảnh và audio)

import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// Storage cho ảnh
const storageImage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "toeic-media/images",  // ảnh nằm trong folder này
    resource_type: "image",        // chỉ cho ảnh
  },
});

// Storage cho audio
const storageAudio = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "toeic-media/audio",   // audio nằm trong folder này
    resource_type: "video",        // Cloudinary dùng "video" cho audio/mp3
  },
});

const uploadImage = multer({ storage: storageImage });
const uploadAudio = multer({ storage: storageAudio });

// API upload ảnh
router.post("/upload/image", uploadImage.single("file"), (req, res) => {
  try {
    res.json({
      success: true,
      type: "image",
      url: req.file.path,
      public_id: req.file.filename,
    });
  } catch (err) {
    console.error("❌ Upload image failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API upload audio
router.post("/upload/audio", uploadAudio.single("file"), (req, res) => {
  try {
    res.json({
      success: true,
      type: "audio",
      url: req.file.path,
      public_id: req.file.filename,
    });
  } catch (err) {
    console.error("❌ Upload audio failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

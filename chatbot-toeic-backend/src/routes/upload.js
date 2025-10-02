// chatbot-toeic-backend/src/routes/upload.js
// Route upload file lên Cloudinary (tách ảnh và audio)

import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";
import { 
  batchUploadFromPathsController, 
  validatePathsController 
} from "../controllers/batchUpload_controller.js";

const router = express.Router();

// ✅ File size limits
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB

// ✅ Allowed file types
const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"];

// Storage cho ảnh
const storageImage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "toeic-media/images",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ quality: "auto", fetch_format: "auto" }], // Auto optimize
  },
});

// Storage cho audio
const storageAudio = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "toeic-media/audio",
    resource_type: "video", // Cloudinary uses "video" for audio files
    allowed_formats: ["mp3", "wav", "ogg"],
  },
});

// ✅ File filter for images
const imageFileFilter = (req, file, cb) => {
  if (IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid image type. Allowed: ${IMAGE_TYPES.join(", ")}`), false);
  }
};

// ✅ File filter for audio
const audioFileFilter = (req, file, cb) => {
  if (AUDIO_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid audio type. Allowed: ${AUDIO_TYPES.join(", ")}`), false);
  }
};

const uploadImage = multer({
  storage: storageImage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: imageFileFilter,
});

const uploadAudio = multer({
  storage: storageAudio,
  limits: { fileSize: MAX_AUDIO_SIZE },
  fileFilter: audioFileFilter,
});

// ✅ API upload ảnh (protected by auth)
router.post("/upload/image", authMiddleware, uploadImage.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    console.log("✅ Image uploaded:", req.file.path);

    res.json({
      success: true,
      type: "image",
      url: req.file.path, // Cloudinary URL
      publicId: req.file.filename, // Cloudinary public_id for deletion
      size: req.file.size,
      format: req.file.format,
    });
  } catch (err) {
    console.error("❌ Upload image failed:", err);
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: err.message,
    });
  }
});

// ✅ API upload audio (protected by auth)
router.post("/upload/audio", authMiddleware, uploadAudio.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    console.log("✅ Audio uploaded:", req.file.path);

    res.json({
      success: true,
      type: "audio",
      url: req.file.path, // Cloudinary URL
      publicId: req.file.filename, // Cloudinary public_id for deletion
      size: req.file.size,
      format: req.file.format,
      duration: req.file.duration || null, // Cloudinary auto-detects duration
    });
  } catch (err) {
    console.error("❌ Upload audio failed:", err);
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: err.message,
    });
  }
});

// ✅ API xóa file từ Cloudinary (cleanup unused files)
router.delete("/upload/delete/:publicId", authMiddleware, async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType } = req.query; // 'image' or 'video' (for audio)

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "Public ID is required",
      });
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType || "image",
    });

    if (result.result === "ok") {
      console.log("✅ File deleted from Cloudinary:", publicId);
      res.json({
        success: true,
        message: "File deleted successfully",
        publicId,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "File not found or already deleted",
      });
    }
  } catch (err) {
    console.error("❌ Delete file failed:", err);
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: err.message,
    });
  }
});

// ✅ API batch upload từ local paths (cho server-side batch processing)
router.post("/upload/batch-from-paths", authMiddleware, batchUploadFromPathsController);

// ✅ API validate paths trước khi upload
router.post("/upload/validate-paths", authMiddleware, validatePathsController);

// ✅ Error handling middleware for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large",
        maxSize: err.field === "image" ? "5MB" : "50MB",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  
  next();
});

export default router;

const express = require('express');
const router = express.Router();
const {
  batchUploadFromPathsController,
  validatePathsController,
} = require('../controllers/batchUpload_controller');
const verifyToken = require('../Middleware/verifyToken');

/**
 * POST /api/upload/batch-from-paths
 * Upload nhiều files từ local paths lên Cloudinary
 * Body: Test data JSON với audioPath và imagePath
 */
router.post('/batch-from-paths', verifyToken, batchUploadFromPathsController);

/**
 * POST /api/upload/validate-paths
 * Validate paths trước khi upload
 */
router.post('/validate-paths', verifyToken, validatePathsController);

module.exports = router;

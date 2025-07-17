// chatbot-toeic-backend\src\routes\AdminTest_router.js
import express from 'express';
import { getTestList } from '../controllers/AdminTest_xontroller.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';

const router = express.Router();

// Lấy tất cả bài test kèm thông tin khóa học
router.get('/',authMiddleware, getTestList);

export default router;
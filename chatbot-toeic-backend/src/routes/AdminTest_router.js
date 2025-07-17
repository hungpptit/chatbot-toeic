// chatbot-toeic-backend\src\routes\AdminTest_router.js
import express from 'express';
import { getTestList,
  getQuestionTypes,
  getParts } from '../controllers/AdminTest_controller.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';

const router = express.Router();

// Lấy tất cả bài test kèm thông tin khóa học
router.get('/',authMiddleware, getTestList);

router.get('/question-types', authMiddleware, getQuestionTypes);
// Lấy tất cả các phần
router.get('/parts', authMiddleware, getParts);

export default router;
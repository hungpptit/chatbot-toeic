// routes/questions_router.js
import express from 'express';
import { authMiddleware } from '../Middleware/authMiddleware.js';
import { getQuestionsByTest, updateQuestionController,submitTest, startTest, checkUserTestDetailed, getUserTestDetailId,checkHistoryUserTestDetailed,
  createQuestionController
 } from '../controllers/question_test_controller.js';

const router = express.Router();

router.get('/Detail/:testId', authMiddleware, getQuestionsByTest);

// ✅ No multer needed - frontend uploads files first, then sends URLs
router.put('/update-question', authMiddleware, updateQuestionController);

router.post('/create-question', authMiddleware, createQuestionController);

router.post('/Submit/:testId', authMiddleware, submitTest);

router.post('/StartTest/:testId', authMiddleware, startTest);

router.get('/Check/:testId', authMiddleware, checkUserTestDetailed);

router.get('/DetailResult/:userTestId', authMiddleware, getUserTestDetailId);

router.get('/HistoryTest/:testId', authMiddleware, checkHistoryUserTestDetailed)
export default router;

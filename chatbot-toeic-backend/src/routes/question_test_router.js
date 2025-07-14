// routes/questions_router.js
import express from 'express';
import { authMiddleware } from '../Middleware/authMiddleware.js';
  checkUserTestDetailed
import { getQuestionsByTest, submitTest, checkUserTestDetailed, getUserTestDetailId } from '../controllers/question_test_controller.js';

const router = express.Router();

router.get('/Detail/:testId', authMiddleware, getQuestionsByTest);

router.post('/Submit/:testId', authMiddleware, submitTest);

router.get('/Check/:testId', authMiddleware, checkUserTestDetailed);

router.get('/DetailResult/:userTestId', authMiddleware, getUserTestDetailId);
export default router;

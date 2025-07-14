// routes/questions_router.js
import express from 'express';
import { authMiddleware } from '../Middleware/authMiddleware.js';
import { getQuestionsByTest, submitTest } from '../controllers/question_test_controller.js';

const router = express.Router();

router.get('/Detail/:testId', authMiddleware, getQuestionsByTest);

router.post('/Submit/:testId', authMiddleware, submitTest);

export default router;

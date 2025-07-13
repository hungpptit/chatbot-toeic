// routes/questions_router.js
import express from 'express';
import { authMiddleware } from '../Middleware/authMiddleware.js';
import { getQuestionsByTest } from '../controllers/question_test_controller.js';

const router = express.Router();

router.get('/Detail/:testId', authMiddleware, getQuestionsByTest);

export default router;

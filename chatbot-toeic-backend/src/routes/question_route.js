// routes/question_route.js
import express from 'express';
import { handleQuestionRequest } from '../controllers/question_controller.js';

const router = express.Router();

// Chỉ định POST '/' vì '/api/question' đã được gắn trong api.js
router.post('/:conversationId', handleQuestionRequest);

export default router;

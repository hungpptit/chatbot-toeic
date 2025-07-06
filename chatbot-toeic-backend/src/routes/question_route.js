// routes/question_route.js
import express from 'express';
import { handleQuestionRequest } from '../controllers/question_controller.js';
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Chỉ định POST '/' vì '/api/question' đã được gắn trong api.js
router.post('/', authMiddleware, handleQuestionRequest);

export default router;

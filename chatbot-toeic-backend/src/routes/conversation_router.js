// routes/conversation_router.js
import express from 'express';
import {authMiddleware} from '../Middleware/authMiddleware.js';
import {
  createConversationController,
  getConversationsByUserController,
  getConversationByIdController,
} from '../controllers/conversation_controller.js';

const router = express.Router();

router.post('/',authMiddleware, createConversationController);
router.get('/user',authMiddleware, getConversationsByUserController);
router.get('/:id',authMiddleware ,getConversationByIdController);

export default router;

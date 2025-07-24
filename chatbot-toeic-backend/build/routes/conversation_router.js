// routes/conversation_router.js
import express from 'express';
import { authMiddleware } from '../Middleware/authMiddleware.js';
import { createConversationController, getConversationsByUserController, getConversationByIdController, deleteConversationController, updateConversationTitleController } from '../controllers/conversation_controller.js';
const router = express.Router();
router.post('/', authMiddleware, createConversationController);
router.get('/user', authMiddleware, getConversationsByUserController);
router.get('/:id', authMiddleware, getConversationByIdController);
router.delete('/deleteConverssation/:id', authMiddleware, deleteConversationController);
router.put('/updateConverssation/:id', authMiddleware, updateConversationTitleController);
export default router;
import express from 'express';
import { authMiddleware } from '../Middleware/authMiddleware.js';
import { handleCreateMessage, handleGetMessagesByConversation, handleGetMessagesForGemini } from '../controllers/message_controller.js';
const router = express.Router();

// Tạo tin nhắn mới
router.post('/', authMiddleware, handleCreateMessage);

// Lấy tất cả tin nhắn theo conversationId
router.get('/:conversationId', authMiddleware, handleGetMessagesByConversation);

// Lấy tin nhắn theo conversationId, format cho Gemini API
router.get('/:conversationId/gemini', authMiddleware, handleGetMessagesForGemini);
export default router;
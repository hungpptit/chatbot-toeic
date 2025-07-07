import {
  createMessage,
  getMessagesByConversation,
  getMessagesForGemini,
} from '../services/message_service.js';

/**
 * Controller: Tạo tin nhắn mới
 * Body: { conversationId, role, content }
 */
const handleCreateMessage = async (req, res) => {
  const { conversationId, role, content } = req.body;

  if (!conversationId || !role || !content) {
    return res.status(400).json({ message: "Thiếu dữ liệu: conversationId, role, content" });
  }

  const result = await createMessage({ conversationId, role, content });
  return res.status(result.code).json({ message: result.message, data: result.data });
};

/**
 * Controller: Lấy tất cả tin nhắn theo conversationId
 */
const handleGetMessagesByConversation = async (req, res) => {
  const { conversationId } = req.params;

  if (!conversationId) {
    return res.status(400).json({ message: "Thiếu conversationId trong URL" });
  }

  const result = await getMessagesByConversation(conversationId);
  return res.status(result.code).json({ message: result.message, data: result.data });
};

/**
 * Controller: Lấy messages đã format để gửi Gemini API
 */
const handleGetMessagesForGemini = async (req, res) => {
  const { conversationId } = req.params;

  if (!conversationId) {
    return res.status(400).json({ message: "Thiếu conversationId trong URL" });
  }

  const result = await getMessagesForGemini(conversationId);
  return res.status(result.code).json({ message: result.message, data: result.data });
};

export {
  handleCreateMessage,
  handleGetMessagesByConversation,
  handleGetMessagesForGemini,
};

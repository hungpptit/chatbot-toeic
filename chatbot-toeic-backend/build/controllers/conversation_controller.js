import { createConversation, getConversationsByUser, getConversationById, deleteConversation, updateConversationTitle } from '../services/conversation_service.js';
const createConversationController = async (req, res) => {
  // console.log("✅ [POST /api/conversations] user:", req.user);
  // console.log("✅ [POST /api/conversations] body:", req.body);
  const userId = req.user.id;
  const {
    title
  } = req.body;
  const result = await createConversation({
    userId,
    title
  });
  res.status(result.code).json(result);
};
const getConversationsByUserController = async (req, res) => {
  const userId = req.user.id;
  const result = await getConversationsByUser(userId);
  res.status(result.code).json(result);
};
const getConversationByIdController = async (req, res) => {
  const {
    id
  } = req.params;
  const userId = req.user.id;
  const result = await getConversationById(id, userId);
  res.status(result.code).json(result);
};
const deleteConversationController = async (req, res) => {
  const {
    id
  } = req.params;
  const userId = req.user.id;
  const result = await deleteConversation(id, userId);
  res.status(result.code).json(result);
};
const updateConversationTitleController = async (req, res) => {
  const {
    id
  } = req.params;
  const {
    title
  } = req.body;
  const userId = req.user.id;
  if (!title || typeof title !== 'string') {
    return res.status(400).json({
      code: 400,
      message: "Tiêu đề không hợp lệ"
    });
  }
  const result = await updateConversationTitle(id, title, userId);
  res.status(result.code).json(result);
};
export { createConversationController, getConversationsByUserController, getConversationByIdController, deleteConversationController, updateConversationTitleController };
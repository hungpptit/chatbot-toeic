import {
  createConversation,
  getConversationsByUser,
  getConversationById,
} from '../services/conversation_service.js';

const createConversationController = async (req, res) => {
  console.log("✅ [POST /api/conversations] user:", req.user);
  console.log("✅ [POST /api/conversations] body:", req.body);
  const userId = req.user.id;
  const { title } = req.body;

  const result = await createConversation({ userId, title });
  res.status(result.code).json(result);
};

const getConversationsByUserController = async (req, res) => {
  const userId = req.user.id;

  const result = await getConversationsByUser(userId);
  res.status(result.code).json(result);
};

const getConversationByIdController = async (req, res) => {
  const { id } = req.params;

  const result = await getConversationById(id);
  res.status(result.code).json(result);
};

export {
  createConversationController,
  getConversationsByUserController,
  getConversationByIdController,
};

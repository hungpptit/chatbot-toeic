import { initDb } from '../models/index.js';

let db;
try {
  db = await initDb(); // Khởi tạo DB
} catch (err) {
  console.error("❌ Không thể khởi tạo DB:", err);
}

const Message = db?.Message;

/**
 * Thêm tin nhắn mới vào một conversation
 * @param {Object} data - { conversationId, role, content }
 */
const createMessage = async ({ conversationId, role, content }) => {
  try {
    if (!Message || typeof Message.create !== 'function') {
      throw new Error('Model Message chưa được khởi tạo đúng');
    }

    const newMessage = await Message.create({
      conversationId,
      role,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      code: 201,
      message: "Tạo tin nhắn thành công",
      data: newMessage,
    };
  } catch (error) {
    console.error("Lỗi tạo message:", error);
    return { code: 500, message: "Lỗi server khi tạo tin nhắn" };
  }
};

/**
 * Lấy danh sách tin nhắn theo conversationId
 */
const getMessagesByConversation = async (conversationId) => {
  try {
    const messages = await Message.findAll({
      where: { conversationId },
      order: [['createdAt', 'ASC']],
    });

    return {
      code: 200,
      message: "Lấy tin nhắn thành công",
      data: messages,
    };
  } catch (error) {
    console.error("Lỗi lấy danh sách message:", error);
    return { code: 500, message: "Lỗi server khi lấy tin nhắn" };
  }
};

/**
 * Lấy danh sách tin nhắn và format theo chuẩn Gemini API
 * Gemini format: [{ role: 'user' | 'model', parts: [{ text }] }]
 */
const getMessagesForGemini = async (conversationId) => {
  try {
    const { data: messages } = await getMessagesByConversation(conversationId);

    const contents = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    return {
      code: 200,
      message: "Chuẩn bị input Gemini thành công",
      data: contents,
    };
  } catch (error) {
    console.error("Lỗi chuẩn bị Gemini content:", error);
    return { code: 500, message: "Lỗi server khi chuẩn bị Gemini input" };
  }
};

export {
  createMessage,
  getMessagesByConversation,
  getMessagesForGemini,
};

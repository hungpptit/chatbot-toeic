import { initDb } from '../models/index.js'; // dùng initDb đúng cách

let db;
try {
  db = await initDb(); // đảm bảo DB đã khởi tạo
} catch (err) {
  console.error("❌ Không thể khởi tạo DB:", err);
}
const Conversation = db?.Conversation;
const Message = db?.Message;

/**
 * Tạo cuộc trò chuyện mới
 * @param {Object} data - { userId, title }
 */
const createConversation = async ({
  userId,
  title
}) => {
  try {
    console.log("🛠 Creating conversation with:", {
      userId,
      title
    });
    if (!Conversation || typeof Conversation.create !== 'function') {
      throw new Error('Model Conversation chưa được khởi tạo đúng');
    }
    const newConversation = await Conversation.create({
      userId,
      title,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return {
      code: 201,
      message: "Tạo cuộc trò chuyện thành công",
      data: newConversation
    };
  } catch (error) {
    console.error("Lỗi tạo conversation:", error);
    return {
      code: 500,
      message: "Lỗi server khi tạo cuộc trò chuyện"
    };
  }
};

/**
 * Lấy danh sách conversation theo userId
 */
const getConversationsByUser = async userId => {
  try {
    const conversations = await Conversation.findAll({
      where: {
        userId
      },
      order: [['updatedAt', 'DESC']]
    });
    return {
      code: 200,
      message: "Lấy danh sách conversation thành công",
      data: conversations
    };
  } catch (error) {
    console.error("Lỗi lấy danh sách conversation:", error);
    return {
      code: 500,
      message: "Lỗi server khi lấy danh sách"
    };
  }
};

/**
 * Lấy 1 conversation theo id, chỉ nếu user là chủ sở hữu
 * @param {number} id - ID của conversation
 * @param {number} userId - ID của user đang đăng nhập
 */
const getConversationById = async (id, userId) => {
  try {
    const conversation = await Conversation.findByPk(id, {
      include: [{
        model: Message,
        as: 'messages',
        // alias phải khớp với association trong model
        attributes: ['id', 'role', 'content', 'createdAt'],
        order: [['createdAt', 'ASC']]
      }]
    });
    if (!conversation) {
      return {
        code: 404,
        message: "Không tìm thấy cuộc trò chuyện"
      };
    }

    // Kiểm tra quyền sở hữu
    if (conversation.userId !== userId) {
      return {
        code: 403,
        message: "Bạn không có quyền xem cuộc trò chuyện này"
      };
    }
    return {
      code: 200,
      message: "Lấy cuộc trò chuyện thành công",
      data: conversation
    };
  } catch (error) {
    console.error("Lỗi lấy conversation:", error);
    return {
      code: 500,
      message: "Lỗi server khi lấy cuộc trò chuyện"
    };
  }
};

/**
 * Xóa một conversation theo id
 * @param {number} id - ID của cuộc trò chuyện cần xóa
 */
const deleteConversation = async (id, userId) => {
  try {
    const conversation = await Conversation.findByPk(id);
    if (!conversation) {
      return {
        code: 404,
        message: "Không tìm thấy cuộc trò chuyện"
      };
    }
    if (conversation.userId !== userId) {
      return {
        code: 403,
        message: "Bạn không có quyền xóa cuộc trò chuyện này"
      };
    }
    await Conversation.destroy({
      where: {
        id
      }
    });
    return {
      code: 200,
      message: "Xóa cuộc trò chuyện thành công"
    };
  } catch (error) {
    console.error("Lỗi xóa conversation:", error);
    return {
      code: 500,
      message: "Lỗi server khi xóa cuộc trò chuyện"
    };
  }
};

/**
 * Cập nhật tên (title) của conversation theo id
 * @param {number} id - ID của cuộc trò chuyện
 * @param {string} newTitle - Tiêu đề mới
 */
const updateConversationTitle = async (id, newTitle, userId) => {
  try {
    const conversation = await Conversation.findByPk(id);
    if (!conversation) {
      return {
        code: 404,
        message: "Không tìm thấy cuộc trò chuyện"
      };
    }
    if (conversation.userId !== userId) {
      return {
        code: 403,
        message: "Bạn không có quyền sửa cuộc trò chuyện này"
      };
    }
    conversation.title = newTitle;
    conversation.updatedAt = new Date();
    await conversation.save();
    return {
      code: 200,
      message: "Cập nhật tiêu đề thành công",
      data: conversation
    };
  } catch (error) {
    console.error("Lỗi cập nhật title conversation:", error);
    return {
      code: 500,
      message: "Lỗi server khi cập nhật tiêu đề"
    };
  }
};
export { createConversation, getConversationsByUser, getConversationById, deleteConversation, updateConversationTitle };
import { getAllUser, updateUserRole, deleteUser, lockUser } from "../services/AdminUser_service.js";
const getAllUserController = async (req, res) => {
  try {
    const callerId = req.user.id;
    // console.log("callerId: ",callerId);
    if (!callerId) {
      return res.status(401).json({
        message: "Unauthorized: Missing user id"
      });
    }
    const data = await getAllUser(callerId);
    res.status(200).json(data);
  } catch (error) {
    console.error("error fetching all users", error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};
const updateUserRoleController = async (req, res) => {
  try {
    const callerId = req.user?.id;
    const {
      userId,
      newRoleId
    } = req.body;
    if (!callerId) {
      return res.status(401).json({
        message: "Unauthorized: Missing user id"
      });
    }
    const data = await updateUserRole(callerId, userId, newRoleId);
    return res.status(200).json(data);
  } catch (error) {
    console.error("❌ Error updating user role:", error);
    if (error.message.includes('không tồn tại')) {
      return res.status(404).json({
        message: error.message
      });
    }
    if (error.message.includes('quyền') || error.message.includes('admin')) {
      return res.status(403).json({
        message: error.message
      });
    }
    return res.status(400).json({
      message: error.message || 'Yêu cầu không hợp lệ'
    });
  }
};
const deleteUserController = async (req, res) => {
  try {
    const callerId = req.user?.id;
    const {
      userId
    } = req.body;
    if (!callerId) {
      return res.status(401).json({
        message: "Unauthorized: Missing user id"
      });
    }
    const data = await deleteUser(callerId, userId);
    return res.status(200).json(data);
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    if (error.message.includes('không tồn tại')) {
      return res.status(404).json({
        message: error.message
      });
    }
    if (error.message.includes('quyền') || error.message.includes('admin')) {
      return res.status(403).json({
        message: error.message
      });
    }
    return res.status(400).json({
      message: error.message || 'Yêu cầu không hợp lệ'
    });
  }
};
const lockUserController = async (req, res) => {
  try {
    const callerId = req.user?.id;
    const {
      userId,
      newStatus
    } = req.body;
    if (!callerId) {
      return res.status(401).json({
        message: "Unauthorized: Missing user id"
      });
    }
    const data = await lockUser(callerId, userId, newStatus);
    return res.status(200).json(data);
  } catch (error) {
    console.error("❌ Error updating user status:", error);
    if (error.message.includes('không tồn tại')) {
      return res.status(404).json({
        message: error.message
      });
    }
    if (error.message.includes('quyền') || error.message.includes('khoá admin')) {
      return res.status(403).json({
        message: error.message
      });
    }
    return res.status(400).json({
      message: error.message || 'Yêu cầu không hợp lệ'
    });
  }
};
export { getAllUserController, updateUserRoleController, deleteUserController, lockUserController };
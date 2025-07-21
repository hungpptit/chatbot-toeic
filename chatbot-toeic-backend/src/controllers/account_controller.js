// chatbot-toeic-backend\src\controllers\account_controller.js
import accountService from '../services/account_service.js';

const { getUserById, updateUser } = accountService;

// Controller: Lấy thông tin user theo ID (chỉ cho role_id = 1)
const getUserByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found or not authorized.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller: Cập nhật thông tin user theo ID (chỉ cho role_id = 1)
const updateUserController = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const user = await updateUser(id, data);
    if (!user) {
      return res.status(404).json({ message: 'User not found or not authorized.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  getUserByIdController,
  updateUserController
};

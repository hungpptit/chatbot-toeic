// chatbot-toeic-backend\src\controllers\account_controller.js
import accountService from '../services/account_service.js';

const { getUserById, updateUser, verifyEmailUpdateOtp } = accountService;


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
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user:', error);

    if (error.code === 'INVALID_CURRENT_PASSWORD') {
      return res.status(401).json({ message: 'Current password is incorrect.', code: error.code });
    }

    if (error.message?.includes('not found')) {
      return res.status(404).json({ message: error.message, code: 'USER_NOT_FOUND' });
    }

    if (error.message?.includes('Unauthorized')) {
      return res.status(403).json({ message: error.message, code: 'NOT_AUTHORIZED' });
    }

    // fallback: lỗi không rõ
    res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
};

const verifyEmailOtpController = async (req, res) => {
  const { userId, email, otp } = req.body;

  try {
    const result = await verifyEmailUpdateOtp(userId, email, otp);
    res.status(result.code).json(result);
  } catch (error) {
    console.error('Error verifying email OTP:', error);
    res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
};


export {
  getUserByIdController,
  updateUserController,
  verifyEmailOtpController
};

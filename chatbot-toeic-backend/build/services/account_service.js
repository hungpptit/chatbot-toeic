import db from '../models/index.js';
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;
import { generateOTP, sendOTP, otpStore } from './login_signup_service.js'; // Import the helper function

/**
 * Check if a user with the given ID exists and has role_id === 1.
 * @param id - User ID
 * @returns true if valid regular user, false otherwise
 */
const isRegularUser = async id => {
  try {
    const user = await db.User.findOne({
      where: {
        id
      }
    });
    const isValid = !!user && (user.role_id === 1 || user.role_id === 2);
    if (!isValid) {
      console.warn(`[isRegularUser] User with ID ${id} is invalid or not a regular user.`);
    }
    return isValid;
  } catch (error) {
    console.error(`[isRegularUser] Failed to check user with ID ${id}:`, error);
    return false;
  }
};

/**
 * Get user by ID if the user is a regular user.
 * @param id - User ID
 * @returns User object or null
 */
const getUserById = async id => {
  try {
    if (!(await isRegularUser(id))) return null;
    const user = await db.User.findOne({
      where: {
        id
      }
    });
    return user;
  } catch (error) {
    console.error(`[getUserById] Error retrieving user with ID ${id}:`, error);
    return null;
  }
};

/**
 * Update user data if user is a regular user.
 * @param id - User ID
 * @param data - Fields to update
 * @returns Updated user object or null
 */
const updateUser = async (id, data) => {
  try {
    if (!(await isRegularUser(id))) {
      throw new Error('Unauthorized: Only regular users can update their info.');
    }
    const user = await db.User.findOne({
      where: {
        id
      }
    });
    if (!user) {
      throw new Error(`User with ID ${id} not found.`);
    }
    if (data.password && data.password.trim() !== '') {
      const isMatch = await bcrypt.compare(data.currentPassword || '', user.password);
      if (!isMatch) {
        const error = new Error('Current password is incorrect.');
        error.code = 'INVALID_CURRENT_PASSWORD';
        throw error;
      }
    }
    if (data.email && data.email !== user.email) {
      const otp = generateOTP();
      const key = `${id}:${data.email}`;
      otpStore.set(key, {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000
      });
      await sendOTP(data.email, 'Xác minh thay đổi email', `Mã OTP xác minh email mới của bạn là: ${otp} (hết hạn sau 5 phút).`);
      return {
        requireEmailVerify: true,
        message: 'Vui lòng xác minh mã OTP được gửi đến email mới.',
        pendingEmail: data.email
      };
    }

    // Chỉ lấy các field cho phép cập nhật
    const allowedFields = ['username', 'email', 'password'];
    const filteredData = Object.fromEntries(Object.entries(data).filter(([key]) => allowedFields.includes(key)));
    if (filteredData.password && filteredData.password.trim() !== '') {
      filteredData.password = await bcrypt.hash(filteredData.password, SALT_ROUNDS);
    } else {
      delete filteredData.password; // Không update nếu password rỗng
    }
    await user.update(filteredData);
    return user;
  } catch (error) {
    console.error(`[updateUser] Failed to update user with ID ${id}:`, error);
    throw error; // Ném lỗi để middleware hoặc controller xử lý gửi về client
  }
};
const verifyEmailUpdateOtp = async (userId, email, otp) => {
  const key = `${userId}:${email}`;
  const entry = otpStore.get(key);
  if (!entry) {
    return {
      code: 400,
      message: 'Không tìm thấy yêu cầu xác minh email.'
    };
  }
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(key);
    return {
      code: 400,
      message: 'Mã OTP đã hết hạn.'
    };
  }
  if (entry.otp !== otp) {
    return {
      code: 400,
      message: 'Mã OTP không chính xác.'
    };
  }
  const user = await db.User.findByPk(userId);
  if (!user) return {
    code: 404,
    message: 'Người dùng không tồn tại.'
  };
  await user.update({
    email
  });
  otpStore.delete(key);
  return {
    code: 200,
    message: '✅ Cập nhật email thành công.',
    data: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  };
};
export default {
  getUserById,
  updateUser,
  verifyEmailUpdateOtp
};
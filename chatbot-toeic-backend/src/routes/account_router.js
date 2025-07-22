// chatbot-toeic-backend\src\routes\account_router.js
import express from 'express';
import { getUserByIdController,
  updateUserController,
verifyEmailOtpController } from '../controllers/account_controller.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';

const router = express.Router();

// Lấy thông tin user theo ID (chỉ cho role_id = 1)
router.get('/detail/:id',authMiddleware, getUserByIdController);

// Cập nhật thông tin user theo ID (chỉ cho role_id = 1)
router.put('/update/:id', authMiddleware, updateUserController);
router.post('/verify-email-otp',authMiddleware , verifyEmailOtpController);

export default router;

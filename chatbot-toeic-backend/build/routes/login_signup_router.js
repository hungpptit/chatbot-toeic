import express from 'express';
import { registerController, loginController, getUserController, forgotPasswordController, resetPasswordController, sendRegisterOtpController, verifyRegisterOtpController } from '../controllers/login_signup_controller.js';
const router = express.Router();

// Đăng ký tài khoản mới
router.post("/register", registerController);

// Gửi OTP để xác thực email khi đăng ký
router.post("/send-register-otp", sendRegisterOtpController);

// Xác minh OTP và hoàn tất đăng ký
router.post("/verify-register-otp", verifyRegisterOtpController);

// Đăng nhập
router.post("/login", loginController);

// Quên mật khẩu → Gửi OTP qua email
router.post("/forgot-password", forgotPasswordController);

// Đặt lại mật khẩu với OTP
router.post("/reset-password", resetPasswordController);

// Lấy thông tin người dùng từ token
router.get("/me", getUserController);
export default router;
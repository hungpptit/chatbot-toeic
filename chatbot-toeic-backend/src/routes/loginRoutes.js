import express from 'express';
import * as loginController from '../controllers/loginController.js'; // lưu ý thêm .js nếu dùng ESM

const router = express.Router();

// Đăng ký tài khoản mới
router.post("/register", loginController.register);

// Gửi OTP để xác thực email khi đăng ký
router.post("/send-register-otp", loginController.sendRegisterOtp);

// Xác minh OTP và hoàn tất đăng ký
router.post("/verify-register-otp", loginController.verifyRegisterOtp);

// Đăng nhập
router.post("/login", loginController.login);

// Quên mật khẩu → Gửi OTP qua email
router.post("/forgot-password", loginController.forgotPassword);

// Đặt lại mật khẩu với OTP
router.post("/reset-password", loginController.resetPassword);

// Lấy thông tin người dùng từ token
router.get("/me", loginController.getUser);

export default router; // ✅ Dùng export default thay vì module.exports

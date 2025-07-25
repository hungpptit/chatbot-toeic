import {
  register,
  login,
  getUserFromToken,
  sendForgotPasswordOtp,
  resetPassword,
  sendRegisterOtp,
  verifyRegisterOtp,
  googleLogin ,
} from '../services/login_signup_service.js';
import jwt from 'jsonwebtoken'; 
// Đăng ký
const registerController = async (req, res) => {
  const result = await register(req.body);
  res.status(result.code).json(result);
};

// Đăng nhập
const loginController = async (req, res) => {
  const result = await login(req.body);

  if (result.code !== 200) {
    return res.status(result.code).json({ message: result.message });
  }

  const { token, data: user } = result;

  // ✅ Gửi token vào cookie
  res.cookie('token', token, {
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'Lax', // hoặc 'None' nếu frontend và backend khác domain và dùng HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 1 ngày
  });

  // ✅ Trả về dữ liệu user (KHÔNG chứa token)
  res.status(200).json({
    message: 'Đăng nhập thành công',
    data: user, // frontend sẽ lấy từ res.data.data
  });
};

// Lấy thông tin người dùng từ token
const getUserController = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ code: 401, message: "Không có token" });

  const result = await getUserFromToken(token);
  res.status(result.code).json(result);
};

// Gửi OTP để đặt lại mật khẩu
const forgotPasswordController = async (req, res) => {
  const { email } = req.body;
  const result = await sendForgotPasswordOtp(email);
  res.status(result.code).json(result);
};

// Đặt lại mật khẩu
const resetPasswordController = async (req, res) => {
  const result = await resetPassword(req.body);
  res.status(result.code).json(result);
};

// Gửi OTP xác thực đăng ký
const sendRegisterOtpController = async (req, res) => {
  const { email } = req.body;
  const result = await sendRegisterOtp(email);
  res.status(result.code).json(result);
};

// Xác thực OTP và tạo tài khoản
const verifyRegisterOtpController = async (req, res) => {
  const result = await verifyRegisterOtp(req.body);
  res.status(result.code).json(result);
};

const googleLoginController = async (req, res) => {
  const result = await googleLogin(req.body);

  if (result.code !== 200) {
    return res.status(result.code).json({ message: result.message });
  }

  const { token, data } = result;

  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ message: result.message, data });
};


export {
  registerController,
  loginController,
  getUserController,
  forgotPasswordController,
  resetPasswordController,
  sendRegisterOtpController,
  verifyRegisterOtpController,
  googleLoginController,
};

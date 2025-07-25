import db from '../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';

const User = db.User;
const SECRET_KEY = process.env.JWT_SECRET_KEY;
export const otpStore = new Map(); // Có thể thay bằng Redis

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTP(email, subject, message) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text: message,
  });
}

// ====== AUTH SERVICE ======

 const register = async ({ username, email, password }) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) return { code: 400, message: "Tài khoản đã tồn tại" };

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    role_id: 1,
  });

  return {
    code: 201,
    message: "Đăng ký thành công",
    data: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role_id: newUser.role_id,
    },
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return { code: 404, message: "Tài khoản không tồn tại" };
  }

  if (user.status === false) {
    console.log(`Tài khoản bị khóa: email=${email}`);
    return { code: 403, message: "Tài khoản đang bị khóa. Vui lòng liên hệ quản trị viên." };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { code: 401, message: "Sai mật khẩu" };
  }

  const token = jwt.sign(
    { id: user.id, name: user.username, email: user.email, role_id: user.role_id },
    SECRET_KEY,
    { expiresIn: '1d' }
  );

  return {
    code: 200,
    message: "Đăng nhập thành công",
    token, // <-- chỉ để controller dùng
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      role_id: user.role_id,
    },
  };
};

 const getUserFromToken = async (token) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findByPk(decoded.id);
    if (!user) return { code: 404, message: "Không tìm thấy người dùng" };

    return {
      code: 200,
      message: "Lấy thông tin người dùng thành công",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role_id: user.role_id,
      },
    };
  } catch {
    return { code: 401, message: "Token không hợp lệ" };
  }
};

 const sendForgotPasswordOtp = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) return { code: 404, message: "Email không tồn tại" };

  const otp = generateOTP();
  otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  await sendOTP(email, "OTP - Đặt lại mật khẩu", `Mã OTP của bạn là: ${otp} (hết hạn sau 5 phút).`);
  return { code: 200, message: "✅ Đã gửi mã OTP đến email" };
};

 const resetPassword = async ({ email, otp, newPassword }) => {
  const entry = otpStore.get(email);
  if (!entry || entry.otp !== otp) return { code: 400, message: "OTP không hợp lệ" };
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email);
    return { code: 400, message: "OTP đã hết hạn" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.update({ password: hashedPassword }, { where: { email } });
  otpStore.delete(email);

  return { code: 200, message: "✅ Đặt lại mật khẩu thành công" };
};

 const sendRegisterOtp = async (email) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) return { code: 400, message: "Email đã được đăng ký" };

  const otp = generateOTP();
  otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  await sendOTP(email, "Xác thực đăng ký tài khoản", `Mã OTP xác thực đăng ký của bạn là: ${otp} (hết hạn sau 5 phút).`);
  return { code: 200, message: "📩 OTP đã được gửi đến email" };
};

const verifyRegisterOtp = async ({ email, otp, name, password }) => {
  const entry = otpStore.get(email);
  if (!entry || entry.otp !== otp) return { code: 400, message: "OTP không hợp lệ" };
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email);
    return { code: 400, message: "OTP đã hết hạn" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ username: name, email, password: hashedPassword, role_id: 1 });

  otpStore.delete(email);

  return {
    code: 201,
    message: "✅ Đăng ký thành công",
    data: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role_id: newUser.role_id,
    },
  };
};


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async ({ token }) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log("🔑 GOOGLE PAYLOAD:", payload);
    const email = payload.email;
    const name = payload.name;

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        username: name,
        email,
        password: 'google_login', // Dummy password
        role_id: 1,
      });
    }

    if (user.status === false) {
      return { code: 403, message: "Tài khoản bị khóa" };
    }

    const jwtToken = jwt.sign(
      { id: user.id, name: user.username, email: user.email, role_id: user.role_id },
      SECRET_KEY,
      { expiresIn: '1d' }
    );

    return {
      code: 200,
      message: "Đăng nhập Google thành công",
      token: jwtToken,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role_id: user.role_id,
      },
    };
  } catch (error) {
    console.error("[googleLogin]", error);
    return { code: 400, message: "Google token không hợp lệ" };
  }
};

export {
  register,
  login,
  getUserFromToken,
  sendForgotPasswordOtp,
  resetPassword,
  sendRegisterOtp,
  verifyRegisterOtp,
   googleLogin,
};
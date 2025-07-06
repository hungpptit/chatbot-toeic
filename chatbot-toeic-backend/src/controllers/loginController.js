import db from '../models/index.js';
const User = db.User;
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const SECRET_KEY = "your_secret_key"; // 👉 Nên lưu trong .env

// Đăng ký tài khoản
const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    console.log(existingUser);
    if (existingUser) {
      return res.status(400).json({ code: 400, message: "Tài khoản đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: username, // ✅ map đúng với model
      email,
      password: hashedPassword,
      role_id: 1,
    });

    res.status(201).json({
      code: 201,
      message: "Đăng ký thành công",
      data: {
        id: newUser.id,
        username: newUser.name, // ✅ trả về đúng biến
        email: newUser.email,
        role_id: newUser.role_id,
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    res.status(500).json({ code: 500, message: "Lỗi server khi đăng ký", data: null });
  }
};

// Đăng nhập
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ code: 404, message: "Tài khoản không tồn tại" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ code: 401, message: "Sai mật khẩu" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role_id: user.role_id, // 👈 Thêm vào token
      },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      code: 200,
      message: "Đăng nhập thành công",
      token,
      data: {
        id: user.id,
        username: user.name,
        email: user.email,
        role_id: user.role_id, // 👈 Thêm vào FE luôn
      },
    });

  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    res.status(500).json({ code: 500, message: "Lỗi server khi đăng nhập", data: null });
  }
};

// Lấy thông tin người dùng từ token
const getUser = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ code: 401, message: "Không có token" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy người dùng" });
    }

    res.status(200).json({
      code: 200,
      message: "Lấy thông tin người dùng thành công",
      data: {
        id: user.id,
        username: user.name, // ✅ đổi thành name
        email: user.email,
      },
    });
  } catch (err) {
    res.status(401).json({ code: 401, message: "Token không hợp lệ" });
  }
};
import nodemailer from "nodemailer";


const otpStore = new Map(); // Có thể dùng Redis nếu production

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ code: 404, message: "Email không tồn tại" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // OTP 6 chữ số

    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // 5 phút

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP - Đặt lại mật khẩu",
      text: `Mã OTP của bạn là: ${otp} (hết hạn sau 5 phút).`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ code: 200, message: "✅ Đã gửi mã OTP đến email" });
  } catch (error) {
    console.error("Lỗi gửi OTP:", error);
    res.status(500).json({ code: 500, message: "Lỗi server khi gửi OTP" });
  }
};
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const entry = otpStore.get(email);
    if (!entry || entry.otp !== otp) {
      return res.status(400).json({ code: 400, message: "OTP không hợp lệ" });
    }

    if (Date.now() > entry.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ code: 400, message: "OTP đã hết hạn" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update({ password: hashedPassword }, { where: { email } });

    otpStore.delete(email); // Xóa OTP sau khi dùng

    res.status(200).json({ code: 200, message: "✅ Đặt lại mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi reset mật khẩu:", error);
    res.status(500).json({ code: 500, message: "Lỗi server khi đặt lại mật khẩu" });
  }
};


const sendRegisterOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ code: 400, message: "Email đã được đăng ký" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 phút
    });

    
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
      subject: "Xác thực đăng ký tài khoản",
      text: `Mã OTP xác thực đăng ký của bạn là: ${otp} (hết hạn sau 5 phút).`,
    });

    res.status(200).json({ code: 200, message: "📩 OTP đã được gửi đến email" });
  } catch (error) {
    console.error("Lỗi gửi OTP đăng ký:", error);
    res.status(500).json({ code: 500, message: "Lỗi server khi gửi OTP" });
  }
};
const verifyRegisterOtp = async (req, res) => {
  const { email, otp, name, password } = req.body;

  try {
    const entry = otpStore.get(email);

    if (!entry || entry.otp !== otp) {
      return res.status(400).json({ code: 400, message: "OTP không hợp lệ" });
    }

    if (Date.now() > entry.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ code: 400, message: "OTP đã hết hạn" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
       username: name,
      email,
      password: hashedPassword,
      role_id: 1,
    });

    otpStore.delete(email);

    res.status(201).json({
      code: 201,
      message: "✅ Đăng ký thành công",
      data: {
        id: newUser.id,
        username: newUser.name,
        email: newUser.email,
        role_id: newUser.role_id,
      },
    });
  } catch (error) {
    console.error("Lỗi xác thực OTP đăng ký:", error);
    res.status(500).json({ code: 500, message: "Lỗi server khi xác thực OTP" });
  }
};

export {
  register,
  login,
  getUser,
  forgotPassword,
  resetPassword,
  sendRegisterOtp,
  verifyRegisterOtp,
};

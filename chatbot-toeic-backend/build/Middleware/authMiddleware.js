// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
const SECRET_KEY = process.env.JWT_SECRET_KEY;
export const authMiddleware = (req, res, next) => {
  const token = req.cookies.token; // 👈 LẤY TỪ COOKIE

  if (!token) {
    return res.status(401).json({
      message: "Thiếu token xác thực (cookie)"
    });
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Gắn thông tin người dùng vào request
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Token không hợp lệ"
    });
  }
};
// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key"; // 👈 nên dùng biến môi trường

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Thiếu token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // 👈 gắn thông tin người dùng
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

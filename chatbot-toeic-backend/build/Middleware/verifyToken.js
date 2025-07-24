import jwt from 'jsonwebtoken';
const SECRET_KEY = process.env.JWT_SECRET_KEY;
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      code: 401,
      message: "Không có token"
    });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // gắn user info vào req.user
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: "Token không hợp lệ"
    });
  }
};
export default verifyToken;
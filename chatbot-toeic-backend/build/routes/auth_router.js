// routes/auth_router.js
import express from 'express';
import { authMiddleware } from '../Middleware/authMiddleware.js';
const authRouter = express.Router();

// ✅ API cho frontend React gọi để kiểm tra đăng nhập
authRouter.get('/me', authMiddleware, (req, res) => {
  const user = req.user;
  // console.log("User info:", user);

  res.json({
    id: user.id || user.userId || null,
    name: user.name || 'Người dùng',
    email: user.email || '',
    avatar: user.avatar || '',
    role_id: user.role_id || null
  });
});
// routes/auth_router.js
authRouter.post('/logout', (req, res) => {
  res.clearCookie('token', {
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'Lax'
  });
  res.status(200).json({
    message: 'Đã đăng xuất'
  });
});
export default authRouter;
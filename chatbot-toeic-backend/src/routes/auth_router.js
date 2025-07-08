// routes/auth_router.js
import express from 'express';

import { authMiddleware } from '../Middleware/authMiddleware.js';

const authRouter = express.Router();


// ✅ API cho frontend React gọi để kiểm tra đăng nhập
authRouter.get('/me', authMiddleware, (req, res) => {
  console.log("👋 [GET /api/me] Gọi tới API");
  console.log("📦 [GET /api/me] req.user =", req.user);
  const user = req.user;

  res.json({
    id: user.id || user.userId || null,
    name: user.name || 'Người dùng',
    email: user.email || '',
  });
});
// routes/auth_router.js
authRouter.post('/logout', (req, res) => {
  res.clearCookie('token', {
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
  });

  res.status(200).json({ message: 'Đã đăng xuất' });
});


export default authRouter;

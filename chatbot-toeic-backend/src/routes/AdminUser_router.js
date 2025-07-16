import express from 'express';
import {   getAllUserController,
  updateUserRoleController,
  deleteUserController,
  lockUserController } from '../controllers/AdminUser_controller.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';

const router = express.Router();

// Lấy danh sách user
router.get('/all', authMiddleware, getAllUserController);

// Cập nhật role user
router.put('/role', authMiddleware, updateUserRoleController);

// Xoá user
router.delete('/', authMiddleware, deleteUserController);

// Khoá / mở user
router.put('/lock', authMiddleware, lockUserController);

export default router;
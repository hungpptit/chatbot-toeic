import {getUserTestStatsController,
    getPartStatisticsByUserController,
    getAccuracyOverTimeController,
    getUserTestHistoryController
} from "../controllers/statistical_controller.js";
import express from 'express';
import { authMiddleware } from '../Middleware/authMiddleware.js';
const router = express.Router();
// Lấy thống kê bài kiểm tra của người dùng
router.get('/user-tests', authMiddleware, getUserTestStatsController);

router.get('/parts/statistics', authMiddleware, getPartStatisticsByUserController);

// Lấy độ chính xác theo thời gian
router.get('/accuracy-over-time', authMiddleware, getAccuracyOverTimeController);

// Lấy lịch sử bài kiểm tra của người dùng
router.get('/user-test-history', authMiddleware, getUserTestHistoryController);

export default router;
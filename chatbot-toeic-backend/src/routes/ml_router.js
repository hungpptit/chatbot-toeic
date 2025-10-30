import express from 'express';
import verifyToken from '../Middleware/verifyToken.js';
import { getRecommendations, retrainModels } from '../controllers/ml_recommendation_controller.js';
import { getRecommendationDetails } from '../controllers/ml_recommendation_detail_controller.js';

const router = express.Router();

/**
 * @route GET /api/ml/recommend/:userId
 * @desc Chạy Python ML để dự đoán kỹ năng yếu và gợi ý ID câu hỏi
 */
router.get('/recommend/:userId', verifyToken, getRecommendations);

/**
 * @route GET /api/ml/recommend/details/:userId
 * @desc Gọi ML + lấy chi tiết câu hỏi từ DB
 */
router.get('/recommend/details/:userId', verifyToken, getRecommendationDetails);

/**
 * @route POST /api/ml/retrain
 * @desc Retrain model (admin)
 */
router.post('/retrain', verifyToken, retrainModels);

export default router;

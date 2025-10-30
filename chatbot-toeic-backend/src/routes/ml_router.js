// ========================================
// FILE: src/routes/ml_router.js
// MỤC ĐÍCH: Routes cho ML recommendations
// ========================================

import express from 'express';
import { getRecommendations, retrainModels } from '../controllers/ml_recommendation_controller.js';
import verifyToken from '../Middleware/verifyToken.js';

const router = express.Router();

/**
 * @route GET /api/ml/recommend/:userId
 * @desc Get weak skills and question recommendations
 * @access Private (requires login)
 */
router.get('/recommend/:userId', verifyToken, getRecommendations);

/**
 * @route POST /api/ml/retrain
 * @desc Trigger ML model retraining (Admin only)
 * @access Private (Admin only)
 */
router.post('/retrain', verifyToken, retrainModels);

export default router;

// ========================================
// FILE: src/controllers/ml_recommendation_controller.js
// MỤC ĐÍCH: API endpoint để gọi ML prediction với database caching
// ========================================

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import db from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get weak skills and question recommendations for a user
 * @route GET /api/ml/recommend/:userId
 * 
 * ✅ NEW STRATEGY: Database-first caching
 * 1. Check MLPredictions table first (instant)
 * 2. If missing/old → Run Python (async if possible)
 * 3. Save to MLPredictions for next time
 */
export const getRecommendations = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                code: 400,
                message: "userId is required"
            });
        }

        // ✅ 1. Check database first (instant read)
        let prediction = await db.MLPrediction.findOne({
            where: { userId }
        });

        if (prediction) {
            console.log(`✅ Returning cached ML result for user ${userId} (from database)`);
            return res.status(200).json({
                code: 200,
                message: "Recommendations retrieved successfully (from cache)",
                data: {
                    userId: prediction.userId,
                    weakSkills: prediction.weakSkills,
                    questionIds: prediction.questionIds,
                    confidence: prediction.confidence,
                    updatedAt: prediction.updatedAt
                }
            });
        }

        console.log(`🔄 No cached prediction for user ${userId}, running Python script...`);

        // ✅ 2. Run Python script to generate prediction
        const mlScriptPath = path.join(__dirname, '../../ml/predict_hybrid_unified.py');
        const outFileName = `result_user_${userId}_${Date.now()}.json`;
        const outPath = path.join(os.tmpdir(), outFileName);

        const pythonArgs = [mlScriptPath, userId.toString(), '--quiet', '--out', outPath];
        
        const pythonProcess = spawn('python', pythonArgs, {
            stdio: ['ignore', 'ignore', 'pipe']
        });

        let errorString = '';
        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('close', async (code) => {
            if (code !== 0) {
                console.error('Python script error:', errorString);
                return res.status(500).json({
                    code: 500,
                    message: "Failed to get recommendations",
                    error: errorString
                });
            }

            try {
                const raw = await fs.readFile(outPath, { encoding: 'utf-8' });
                const result = JSON.parse(raw);

                // ✅ 3. Extract question IDs from recommendations
                const questionIds = [];
                const recommendations = result.recommendations || {};
                Object.values(recommendations).forEach(questions => {
                    questions.forEach(q => {
                        if (q.id && !questionIds.includes(q.id)) {
                            questionIds.push(q.id);
                        }
                    });
                });

                // ✅ 4. Save to database (upsert) - Let Sequelize handle timestamps
                const [savedPrediction] = await db.MLPrediction.upsert({
                    userId: userId,
                    weakSkills: result.weak_skills || [],
                    questionIds: questionIds,
                    confidence: 0.8, // TODO: Calculate from model
                    totalAttempts: 0, // TODO: Query from UserResults
                    overallAccuracy: null
                    // Don't manually set createdAt/updatedAt - Sequelize handles it
                });

                console.log(`✅ Saved ML prediction to database for user ${userId}`);

                // Clean up temp file
                try { await fs.unlink(outPath); } catch (e) { /* ignore */ }

                return res.status(200).json({
                    code: 200,
                    message: "Recommendations retrieved successfully",
                    data: {
                        userId: userId,
                        weakSkills: result.weak_skills || [],
                        questionIds: questionIds,
                        updatedAt: new Date()
                    }
                });
            } catch (parseError) {
                console.error('Failed to read/parse Python output file:', parseError);
                return res.status(500).json({
                    code: 500,
                    message: "Failed to read/parse ML output file",
                    error: parseError.message,
                    stderr: errorString
                });
            }
        });

    } catch (error) {
        console.error('Error in getRecommendations:', error);
        return res.status(500).json({
            code: 500,
            message: "Server error",
            error: error.message
        });
    }
};

/**
 * Trigger model retraining
 * @route POST /api/ml/retrain
 */
export const retrainModels = async (req, res) => {
    try {
        const mlDir = path.join(__dirname, '../../ml');

        // Train global model
        const trainGlobal = spawn('python', [
            path.join(mlDir, 'train_model.py')
        ]);

        trainGlobal.on('close', (code1) => {
            if (code1 !== 0) {
                return res.status(500).json({
                    code: 500,
                    message: "Failed to train global model"
                });
            }

            // Train unified model
            const trainUnified = spawn('python', [
                path.join(mlDir, 'train_unified_model.py')
            ]);

            trainUnified.on('close', (code2) => {
                if (code2 !== 0) {
                    return res.status(500).json({
                        code: 500,
                        message: "Failed to train unified model"
                    });
                }

                return res.status(200).json({
                    code: 200,
                    message: "Models retrained successfully"
                });
            });
        });

    } catch (error) {
        console.error('Error in retrainModels:', error);
        return res.status(500).json({
            code: 500,
            message: "Server error",
            error: error.message
        });
    }
};

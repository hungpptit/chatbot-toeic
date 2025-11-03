// ========================================
// FILE: src/services/ml_service.js
// MỤC ĐÍCH: Trigger ML prediction update (real-time)
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
 * Trigger ML prediction update for a user (async, non-blocking)
 * Called after user submits a test/practice
 * 
 * @param {number} userId - User ID to update prediction for
 * @returns {Promise<void>} - Fire and forget
 */
export const triggerMLUpdate = async (userId) => {
    try {
        console.log(`🔄 Triggering ML update for user ${userId}...`);

        const mlScriptPath = path.join(__dirname, '../../ml/predict_hybrid_unified.py');
        const outFileName = `result_user_${userId}_${Date.now()}.json`;
        const outPath = path.join(os.tmpdir(), outFileName);

        const pythonArgs = [mlScriptPath, userId.toString(), '--quiet', '--out', outPath];
        
        const pythonProcess = spawn('python', pythonArgs, {
            stdio: ['ignore', 'ignore', 'pipe'],
            detached: false // Keep as child process
        });

        let errorString = '';
        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('close', async (code) => {
            if (code !== 0) {
                console.error(`❌ ML update failed for user ${userId}:`, errorString);
                return;
            }

            try {
                const raw = await fs.readFile(outPath, { encoding: 'utf-8' });
                const result = JSON.parse(raw);

                // Extract question IDs
                const questionIds = [];
                const recommendations = result.recommendations || {};
                Object.values(recommendations).forEach(questions => {
                    questions.forEach(q => {
                        if (q.id && !questionIds.includes(q.id)) {
                            questionIds.push(q.id);
                        }
                    });
                });

                // Get user stats for metadata
                const userStats = await db.sequelize.query(`
                    SELECT 
                        COUNT(*) AS totalAttempts,
                        CAST(SUM(CASE WHEN isCorrect = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) AS overallAccuracy
                    FROM UserResults
                    WHERE userId = ${userId}
                `, { type: db.sequelize.QueryTypes.SELECT });

                const stats = userStats[0] || { totalAttempts: 0, overallAccuracy: 0 };

                // Upsert to database
                await db.MLPrediction.upsert({
                    userId: userId,
                    weakSkills: result.weak_skills || [],
                    questionIds: questionIds,
                    confidence: 0.8, // TODO: Calculate from model probabilities
                    totalAttempts: parseInt(stats.totalAttempts) || 0,
                    overallAccuracy: parseFloat(stats.overallAccuracy) || null,
                    updatedAt: new Date()
                });

                console.log(`✅ ML prediction updated for user ${userId}`);

                // Clean up temp file
                try { await fs.unlink(outPath); } catch (e) { /* ignore */ }

            } catch (parseError) {
                console.error(`❌ Failed to parse ML output for user ${userId}:`, parseError);
            }
        });

    } catch (error) {
        console.error(`❌ Error triggering ML update for user ${userId}:`, error);
    }
};

/**
 * Check if user needs ML update
 * Returns true if:
 * - No prediction exists
 * - User has answered new questions since last prediction
 * 
 * @param {number} userId 
 * @returns {Promise<boolean>}
 */
export const needsMLUpdate = async (userId) => {
    try {
        const prediction = await db.MLPrediction.findOne({
            where: { userId },
            attributes: ['updatedAt', 'totalAttempts']
        });

        if (!prediction) {
            return true; // No prediction exists
        }

        // Check if user has new attempts since last prediction
        const recentAttempts = await db.sequelize.query(`
            SELECT COUNT(*) AS newAttempts
            FROM UserResults
            WHERE userId = ${userId}
            AND answeredAt > '${prediction.updatedAt.toISOString()}'
        `, { type: db.sequelize.QueryTypes.SELECT });

        const newAttempts = recentAttempts[0]?.newAttempts || 0;

        // Update if user answered at least 5 new questions
        return newAttempts >= 5;

    } catch (error) {
        console.error('Error checking ML update need:', error);
        return false;
    }
};

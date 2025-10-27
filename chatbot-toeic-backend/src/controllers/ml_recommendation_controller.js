// ========================================
// FILE: src/controllers/ml_recommendation_controller.js
// MỤC ĐÍCH: API endpoint để gọi ML prediction
// ========================================

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get weak skills and question recommendations for a user
 * @route GET /api/ml/recommend/:userId
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

        // Path to ML script
        const mlScriptPath = path.join(__dirname, '../../ml/predict_hybrid_unified.py');

        // Spawn Python process
        const pythonProcess = spawn('python', [mlScriptPath, userId]);

        let dataString = '';
        let errorString = '';

        // Collect stdout
        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        // Collect stderr
        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        // Handle process completion
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error('Python script error:', errorString);
                return res.status(500).json({
                    code: 500,
                    message: "Failed to get recommendations",
                    error: errorString
                });
            }

            try {
                // Parse JSON output from Python
                const result = JSON.parse(dataString);

                return res.status(200).json({
                    code: 200,
                    message: "Recommendations retrieved successfully",
                    data: result
                });
            } catch (parseError) {
                console.error('Failed to parse Python output:', parseError);
                return res.status(500).json({
                    code: 500,
                    message: "Failed to parse ML output",
                    error: parseError.message,
                    raw: dataString
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

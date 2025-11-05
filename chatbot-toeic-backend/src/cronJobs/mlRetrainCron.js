import cron from "node-cron";
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⚠️ TEST MODE: Auto-retrain ML models every 3 minutes (for testing)
// Production: "0 */6 * * *" = At minute 0 past every 6th hour
// Test mode: "*/3 * * * *" = Every 3 minutes
cron.schedule("*/3 * * * *", async () => {
  console.log("⏰ Cron Job: ML Model Retraining started at:", new Date().toLocaleString('vi-VN'));
  
  try {
    await retrainModels();
    console.log("✅ Cron Job: ML Models retrained successfully");
  } catch (err) {
    console.error("❌ Cron Job: Failed to retrain ML models:", err);
  }
});

console.log("🤖 [TEST MODE] ML Retrain Cron Job initialized - Running every 3 minutes");

// Retrain all ML models by running Python script
async function retrainModels() {
  return new Promise((resolve, reject) => {
    const mlPath = path.resolve(__dirname, '../../ml');
    const scriptPath = path.join(mlPath, 'train_model.py');
    
    console.log('🐍 Running Python script:', scriptPath);
    
    const pythonProcess = spawn('python', [scriptPath], {
      cwd: mlPath,
      stdio: 'pipe'
    });
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      console.log('[ML Retrain]', output.trim());
    });
    
    pythonProcess.stderr.on('data', (data) => {
      const error = data.toString();
      stderr += error;
      // Only log if it's an actual error (not just warnings)
      if (!error.includes('FutureWarning') && 
          !error.includes('DeprecationWarning') && 
          !error.includes('UserWarning') && 
          !error.includes('UndefinedMetricWarning')) {
        console.error('[ML Retrain Error]', error.trim());
      }
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Model retraining completed successfully');
        resolve({ success: true, stdout, stderr });
      } else {
        console.error('❌ Model retraining failed with exit code:', code);
        reject(new Error(`Python process exited with code ${code}\n${stderr}`));
      }
    });
    
    pythonProcess.on('error', (error) => {
      console.error('❌ Failed to spawn Python process:', error);
      reject(error);
    });
  });
}

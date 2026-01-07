import cron from "node-cron";
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Production: "0 */6 * * *" = At minute 0 past every 6th hour (0h, 6h, 12h, 18h)
// Test mode: "*/3 * * * *" = Every 3 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("⏰ Cron Job: ML Model Retraining started at:", new Date().toLocaleString('vi-VN'));
  
  try {
    await retrainModels();
    console.log("✅ Cron Job: ML Models retrained successfully");
  } catch (err) {
    console.error("❌ Cron Job: Failed to retrain ML models:", err);
  }
});

console.log("🤖 [PRODUCTION MODE] ML Retrain Cron Job initialized - Running every 6 hours (0h, 6h, 12h, 18h)");

// Retrain all ML models by running Python scripts sequentially
async function retrainModels() {
  const mlPath = path.resolve(__dirname, '../../ml');
  const globalModelScript = path.join(mlPath, 'train_model.py');
  const unifiedModelScript = path.join(mlPath, 'train_unified_model.py');
  
  try {
    // Train global model first
    console.log('🐍 Training global model...');
    await runPythonScript(globalModelScript, mlPath);
    console.log('✅ Global model trained successfully');
    
    // Then train unified model
    console.log('🐍 Training unified model...');
    await runPythonScript(unifiedModelScript, mlPath);
    console.log('✅ Unified model trained successfully');
    
    return { success: true };
  } catch (error) {
    throw error;
  }
}

// Helper function to run Python script
function runPythonScript(scriptPath, workingDir) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [scriptPath], {
      cwd: workingDir,
      stdio: 'pipe',
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8'  // Fix UTF-8 encoding for emoji/Unicode in Python
      }
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
        resolve({ success: true, stdout, stderr });
      } else {
        reject(new Error(`Python process exited with code ${code}\n${stderr}`));
      }
    });
    
    pythonProcess.on('error', (error) => {
      console.error('❌ Failed to spawn Python process:', error);
      reject(error);
    });
  });
}

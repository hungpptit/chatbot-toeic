import fs from 'fs/promises';
import path from 'path';
import cloudinary from '../config/cloudinary.js';

/**
 * Upload file từ local path lên Cloudinary
 * @param {string} filePath - Đường dẫn file trong máy
 * @param {string} type - 'image' hoặc 'audio'
 * @returns {Promise<string>} URL của file đã upload
 */
export const uploadFileFromPath = async (filePath, type = 'auto') => {
  try {
    // Kiểm tra file có tồn tại không
    await fs.access(filePath);

    // Xác định resource_type
    let resourceType = 'auto';
    if (type === 'audio') {
      resourceType = 'video'; // Cloudinary dùng 'video' cho audio
    } else if (type === 'image') {
      resourceType = 'image';
    }

    // Upload lên Cloudinary
    console.log(`📤 Uploading ${filePath} to Cloudinary...`);
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: resourceType,
      folder: 'toeic-test',
    });

    console.log(`✅ Uploaded successfully: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Error uploading ${filePath}:`, error.message);
    throw new Error(`Failed to upload ${filePath}: ${error.message}`);
  }
};

/**
 * Batch upload từ test data JSON
 * @param {Object} testData - Test data với audioPath và imagePath trong questions
 * @returns {Promise<Object>} Test data với URLs thay cho paths
 */
export const batchUploadFromPaths = async (testData) => {
  try {
    console.log('🚀 Starting batch upload from local paths...');

    // Upload global audio nếu có
    if (testData.audioPath) {
      console.log(`🎵 Uploading global audio: ${testData.audioPath}`);
      testData.audioUrl = await uploadFileFromPath(testData.audioPath, 'audio');
      delete testData.audioPath; // Remove path sau khi upload
    }

    // ✅ Helper function to process questions array
    const processQuestionsArray = async (questions, label) => {
      if (!questions || !Array.isArray(questions)) return;
      
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        console.log(`\n📝 Processing ${label} question ${i + 1}/${questions.length}...`);

        // Upload image nếu có
        if (question.imagePath) {
          console.log(`🖼️  Uploading image: ${question.imagePath}`);
          question.imageUrl = await uploadFileFromPath(question.imagePath, 'image');
          delete question.imagePath;
        }

        // Upload audio riêng cho câu hỏi (nếu có)
        if (question.audioPath) {
          console.log(`🎵 Uploading audio: ${question.audioPath}`);
          question.audioUrl = await uploadFileFromPath(question.audioPath, 'audio');
          delete question.audioPath;
        }
      }
    };

    // ✅ Support Mixed Test format (readingQuestions + listeningQuestions)
    if (testData.readingQuestions || testData.listeningQuestions) {
      console.log('📚 Detected Mixed Test format');
      
      // Process reading questions
      if (testData.readingQuestions) {
        await processQuestionsArray(testData.readingQuestions, 'Reading');
      }
      
      // Process listening questions
      if (testData.listeningQuestions) {
        await processQuestionsArray(testData.listeningQuestions, 'Listening');
      }
    }
    // ✅ Support Regular Test format (questions)
    else if (testData.questions && Array.isArray(testData.questions)) {
      console.log('📝 Detected Regular Test format');
      await processQuestionsArray(testData.questions, 'Regular');
    }

    console.log('✅ Batch upload completed successfully!');
    return testData;
  } catch (error) {
    console.error('❌ Batch upload failed:', error);
    throw error;
  }
};

/**
 * Validate paths trong test data
 */
export const validatePaths = async (testData) => {
  const invalidPaths = [];

  // Check global audio
  if (testData.audioPath) {
    try {
      await fs.access(testData.audioPath);
    } catch {
      invalidPaths.push(testData.audioPath);
    }
  }

  // ✅ Helper function to validate questions array
  const validateQuestionsArray = async (questions) => {
    if (!questions || !Array.isArray(questions)) return;
    
    for (const question of questions) {
      if (question.imagePath) {
        try {
          await fs.access(question.imagePath);
        } catch {
          invalidPaths.push(question.imagePath);
        }
      }
      if (question.audioPath) {
        try {
          await fs.access(question.audioPath);
        } catch {
          invalidPaths.push(question.audioPath);
        }
      }
    }
  };

  // ✅ Support Mixed Test format
  if (testData.readingQuestions || testData.listeningQuestions) {
    if (testData.readingQuestions) {
      await validateQuestionsArray(testData.readingQuestions);
    }
    if (testData.listeningQuestions) {
      await validateQuestionsArray(testData.listeningQuestions);
    }
  }
  // ✅ Support Regular Test format
  else if (testData.questions) {
    await validateQuestionsArray(testData.questions);
  }

  return invalidPaths;
};

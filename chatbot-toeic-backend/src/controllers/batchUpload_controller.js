import { batchUploadFromPaths, validatePaths } from '../services/batchUploadService.js';

/**
 * POST /api/upload/batch-from-paths
 * Upload nhiều files từ local paths lên Cloudinary
 */
export const batchUploadFromPathsController = async (req, res) => {
  try {
    const testData = req.body;

    // ✅ Validate input - Support both formats
    if (!testData) {
      return res.status(400).json({
        success: false,
        message: '❌ No test data provided',
      });
    }

    // Check if it's Mixed Test format or Regular Test format
    const isMixedTest = testData.readingQuestions || testData.listeningQuestions;
    const isRegularTest = testData.questions && Array.isArray(testData.questions);

    if (!isMixedTest && !isRegularTest) {
      return res.status(400).json({
        success: false,
        message: '❌ Invalid test data format. Must have either "questions" or "readingQuestions/listeningQuestions"',
      });
    }

    console.log('📥 Received test data with paths');
    
    if (isMixedTest) {
      const readingCount = testData.readingQuestions?.length || 0;
      const listeningCount = testData.listeningQuestions?.length || 0;
      console.log(`📊 Mixed Test - Reading: ${readingCount}, Listening: ${listeningCount}`);
    } else {
      console.log(`📊 Regular Test - Total questions: ${testData.questions.length}`);
    }

    // Validate tất cả paths trước khi upload
    console.log('🔍 Validating file paths...');
    const invalidPaths = await validatePaths(testData);
    
    if (invalidPaths.length > 0) {
      return res.status(400).json({
        success: false,
        message: '❌ Some file paths are invalid or inaccessible',
        invalidPaths,
      });
    }

    console.log('✅ All paths validated successfully');

    // Upload tất cả files
    const uploadedTestData = await batchUploadFromPaths(testData);

    // Return data với URLs
    return res.status(200).json({
      success: true,
      message: '✅ Batch upload completed successfully',
      data: uploadedTestData,
    });
  } catch (error) {
    console.error('❌ Batch upload error:', error);
    return res.status(500).json({
      success: false,
      message: '❌ Batch upload failed',
      error: error.message,
    });
  }
};

/**
 * POST /api/upload/validate-paths
 * Validate paths trước khi upload
 */
export const validatePathsController = async (req, res) => {
  try {
    const testData = req.body;

    if (!testData) {
      return res.status(400).json({
        success: false,
        message: '❌ No test data provided',
      });
    }

    const invalidPaths = await validatePaths(testData);

    if (invalidPaths.length > 0) {
      return res.status(400).json({
        success: false,
        message: '❌ Some paths are invalid',
        invalidPaths,
        validPathsCount: (testData.questions?.length || 0) - invalidPaths.length,
      });
    }

    return res.status(200).json({
      success: true,
      message: '✅ All paths are valid',
      totalPaths: testData.questions?.length || 0,
    });
  } catch (error) {
    console.error('❌ Path validation error:', error);
    return res.status(500).json({
      success: false,
      message: '❌ Path validation failed',
      error: error.message,
    });
  }
};

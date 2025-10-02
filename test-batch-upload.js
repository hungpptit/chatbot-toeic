/**
 * Script để test batch upload files từ local paths
 * 
 * Cách dùng:
 * 1. Đảm bảo backend đang chạy (http://localhost:8080)
 * 2. Đảm bảo đã login (có cookie auth)
 * 3. Chỉnh sửa paths trong example-test-with-paths.json
 * 4. Chạy: node test-batch-upload.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:8080/api';

// Cookie auth từ browser (copy từ DevTools)
// Hoặc login programmatically trước
const AUTH_COOKIE = 'your-auth-cookie-here';

async function testBatchUpload() {
  try {
    console.log('🚀 Starting batch upload test...\n');

    // 1. Đọc JSON file
    console.log('📖 Reading test data...');
    const jsonPath = path.join(__dirname, 'example-test-with-paths.json');
    const testData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(`✅ Loaded test: "${testData.title}"`);
    console.log(`📊 Questions: ${testData.questions.length}`);
    console.log(`🎵 Audio path: ${testData.audioPath || 'None'}`);
    console.log(`🖼️  Image paths: ${testData.questions.filter(q => q.imagePath).length}`);
    console.log('');

    // 2. Validate paths
    console.log('🔍 Step 1: Validating file paths...');
    const validateRes = await axios.post(
      `${API_BASE_URL}/upload/validate-paths`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': AUTH_COOKIE,
        },
        withCredentials: true,
      }
    );

    if (!validateRes.data.success) {
      console.error('❌ Validation failed!');
      console.error('Invalid paths:', validateRes.data.invalidPaths);
      return;
    }

    console.log('✅ All paths are valid!');
    console.log('');

    // 3. Upload files
    console.log('📤 Step 2: Uploading files to Cloudinary...');
    console.log('⏳ This may take a while...');
    console.log('');
    
    const uploadRes = await axios.post(
      `${API_BASE_URL}/upload/batch-from-paths`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': AUTH_COOKIE,
        },
        withCredentials: true,
      }
    );

    if (!uploadRes.data.success) {
      console.error('❌ Upload failed!');
      console.error('Error:', uploadRes.data.message);
      return;
    }

    console.log('✅ Upload completed successfully!');
    console.log('');

    // 4. Save result
    const resultData = uploadRes.data.data;
    const outputPath = path.join(__dirname, 'example-test-with-urls.json');
    fs.writeFileSync(outputPath, JSON.stringify(resultData, null, 2));

    console.log('💾 Results saved to: example-test-with-urls.json');
    console.log('');

    // 5. Display URLs
    console.log('📋 Uploaded URLs:');
    console.log('─────────────────────────────────────');
    if (resultData.audioUrl) {
      console.log(`🎵 Audio: ${resultData.audioUrl}`);
    }
    if (resultData.questions) {
      resultData.questions.forEach((q, i) => {
        if (q.imageUrl) {
          console.log(`🖼️  Q${i + 1} Image: ${q.imageUrl}`);
        }
      });
    }
    console.log('─────────────────────────────────────');
    console.log('');

    console.log('🎉 Batch upload test completed successfully!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Check example-test-with-urls.json');
    console.log('2. Use this data to create test in AddTestForm');
    console.log('3. Or call createNewTestAPI directly with this data');

  } catch (error) {
    console.error('❌ Error during batch upload test:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
      
      if (error.response.data.invalidPaths) {
        console.error('Invalid paths:');
        error.response.data.invalidPaths.forEach(p => {
          console.error(`  - ${p}`);
        });
      }
    } else {
      console.error(error.message);
    }
    
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('1. Make sure backend is running on http://localhost:8080');
    console.log('2. Check if you have valid auth cookie');
    console.log('3. Verify file paths in example-test-with-paths.json');
    console.log('4. Ensure files exist at those paths');
    console.log('5. Check Cloudinary configuration in backend');
  }
}

// Run the test
testBatchUpload();

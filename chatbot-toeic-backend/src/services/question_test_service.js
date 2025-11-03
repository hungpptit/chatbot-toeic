import db from '../models/index.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { triggerMLUpdate, needsMLUpdate } from './ml_service.js';


export const RandomQuestionsByTestId = async (testId, limit = null) => {
  try {
    // Bước 1: Lấy tất cả questionId và sortOrder từ TestQuestion
    const testQuestionRows = await db.TestQuestion.findAll({
      where: { testId },
      attributes: ['questionId', 'sortOrder'],
    });

    // Bước 2: Shuffle toàn bộ danh sách và áp dụng limit nếu có
    let shuffled = testQuestionRows.sort(() => Math.random() - 0.5);
    
    // ✅ Chỉ slice nếu có limit được specify
    if (limit && limit > 0) {
      shuffled = shuffled.slice(0, limit);
      console.log(`📊 Applied limit: ${limit} questions out of ${testQuestionRows.length} total`);
    } else {
      console.log(`📊 No limit applied: using all ${testQuestionRows.length} questions`);
    }

    // Bước 3: Lấy danh sách questionId được chọn và ánh xạ sortOrder
    const selectedIds = shuffled.map(row => row.questionId);
    const sortOrderMap = new Map(shuffled.map(row => [row.questionId, row.sortOrder]));

    // Bước 4: Truy vấn các câu hỏi với media (cho listening parts 1,2,3,4)
    const questions = await db.Question.findAll({
      where: { id: selectedIds },
      include: [
        { model: db.QuestionType, as: 'questionType' },
        { model: db.Part, as: 'part' },
        // ✅ Include media mappings và media files
        {
          model: db.QuestionMediaMap,
          as: 'mediaMappings',
          include: [{
            model: db.MediaFiles,
            as: 'media',
            attributes: ['id', 'mediaType', 'mediaUrl', 'description', 'duration']
          }],
          attributes: ['id', 'mediaId', 'startSecond', 'endSecond', 'sortOrder']
        }
      ],
    });

    // Bước 5: Sắp xếp lại theo sortOrder đã ánh xạ
    const orderedQuestions = questions.sort((a, b) => {
      return sortOrderMap.get(a.id) - sortOrderMap.get(b.id);
    });

    // ✅ LOG: Check media data
    console.log('📊 RandomQuestionsByTestId - Sample question with media:');
    if (orderedQuestions.length > 0) {
      const sample = orderedQuestions[0];
      console.log({
        id: sample.id,
        partId: sample.partId,
        hasMedia: sample.mediaMappings?.length > 0,
        mediaCount: sample.mediaMappings?.length || 0,
        mediaTypes: sample.mediaMappings?.map(m => m.media?.mediaType) || []
      });
    }

    // ✅ Transform response to match frontend interface
    const transformedQuestions = orderedQuestions.map(question => {
      const questionData = question.toJSON();
      
      // Transform media mappings to match frontend interface
      if (questionData.mediaMappings) {
        questionData.mediaMappings = questionData.mediaMappings.map(mapping => ({
          ...mapping,
          media: mapping.media ? {
            id: mapping.media.id,
            type: mapping.media.mediaType, // ✅ mediaType → type
            url: mapping.media.mediaUrl,   // ✅ mediaUrl → url
            description: mapping.media.description,
            duration: mapping.media.duration // ✅ Include duration
          } : null
        }));
      }
      
  return questionData;
    });

    console.log('📤 Sending transformed questions with correct field names');
    return transformedQuestions;
  } catch (error) {
    console.error("❌ Error in RandomQuestionsByTestId:", error);
    throw error;
  }
};


// update câu hỏi with retry logic for deadlocks
export const updateQuestion = async (id, updatedData, retryCount = 0) => {
  const maxRetries = 3;
  
  try {
    return await db.sequelize.transaction(async (transaction) => {
      try {
        // Tìm câu hỏi theo ID
        const question = await db.Question.findByPk(id, { transaction });
        if (!question) {
          throw new Error("Question not found");
        }

        // Cập nhật các trường text
        await question.update({
          question: updatedData.question,
          optionA: updatedData.optionA,
          optionB: updatedData.optionB,
          optionC: updatedData.optionC,
          optionD: updatedData.optionD,
          correctAnswer: updatedData.correctAnswer,
          explanation: updatedData.explanation,
          typeId: updatedData.typeId,
          partId: updatedData.partId,
        }, { transaction });
        
        // ✅ Handle skill update if provided
        if (updatedData.skillId !== undefined) {
          // Remove existing skill mappings
          await db.QuestionSkill.destroy({ where: { questionId: id }, transaction });
          // Create new mapping if skillId is not null
          if (updatedData.skillId) {
            await db.QuestionSkill.create({
              questionId: id,
              skillId: updatedData.skillId,
              weight: 1
            }, { transaction });
          }
        }

        // ✅ Handle media updates if provided (URLs only, files already uploaded by frontend)
        if (updatedData.mediaFiles && Array.isArray(updatedData.mediaFiles)) {
          console.log(`🔄 Updating media for question ${id}:`, updatedData.mediaFiles.length, 'media items');
          
          // Get existing media mappings
          const existingMappings = await db.QuestionMediaMap.findAll({
            where: { questionId: id },
            include: [{
              model: db.MediaFiles, // ✅ Fixed: MediaFiles not MediaFile
              as: 'media'
            }],
            transaction
          });

          // Process each media URL update
          for (const mediaInput of updatedData.mediaFiles) {
            console.log(`🔍 Processing media input:`, {
              type: mediaInput.type,
              url: mediaInput.url?.substring(0, 50) + '...',
              duration: mediaInput.duration,
              description: mediaInput.description
            });
            
            if (mediaInput.url) {
              // Direct URL provided (already uploaded by frontend)
              console.log(`📎 Updating ${mediaInput.type} with URL:`, mediaInput.url);
              
              // Find existing media of same type
              const existingMapping = existingMappings.find(mapping => 
                mapping.media && mapping.media.mediaType === mediaInput.type
              );

              if (existingMapping) {
                // Update existing media file
                await existingMapping.media.update({
                  mediaUrl: mediaInput.url,
                  description: mediaInput.description || 'Updated media',
                  duration: mediaInput.duration || null
                }, { transaction });
                
                // Also update mapping timing for audio
                if (mediaInput.type === 'audio') {
                  await existingMapping.update({
                    startSecond: mediaInput.startSecond ?? null,
                    endSecond: mediaInput.endSecond ?? null
                  }, { transaction });
                  console.log(`✅ Updated existing ${mediaInput.type} media and timing:`, mediaInput.startSecond, mediaInput.endSecond);
                } else {
                  console.log(`✅ Updated existing ${mediaInput.type} media with duration:`, mediaInput.duration);
                }
              } else {
                // Create new media
                const newMedia = await db.MediaFiles.create({ // ✅ Fixed: MediaFiles not MediaFile
                  mediaType: mediaInput.type,
                  mediaUrl: mediaInput.url,
                  description: mediaInput.description || 'New media',
                  duration: mediaInput.duration || null // ✅ Save duration if provided
                }, { transaction });

                await db.QuestionMediaMap.create({
                  questionId: id,
                  mediaId: newMedia.id,
                  startSecond: mediaInput.startSecond || null,
                  endSecond: mediaInput.endSecond || null
                }, { transaction });
                console.log(`✅ Created new ${mediaInput.type} media`);
              }
            }
          }
        }

        // ✅ Return updated question with media
        const updatedQuestion = await db.Question.findByPk(id, {
          include: [{
            model: db.QuestionMediaMap,
            as: 'mediaMappings',
            include: [{
              model: db.MediaFiles, // ✅ Fixed: MediaFiles not MediaFile
              as: 'media',
              attributes: ['id', 'mediaType', 'mediaUrl', 'description', 'duration'] // ✅ Include duration
            }]
          }],
          transaction
        });

        return updatedQuestion;
      } catch (error) {
        console.error('❌ Error updating question:', error);
        throw error;
      }
    });
  } catch (error) {
    // ✅ Retry logic for deadlocks
    if (error.name === 'SequelizeDatabaseError' && 
        error.original?.number === 1205 && // SQL Server deadlock error code
        retryCount < maxRetries) {
      
      console.warn(`⚠️ Deadlock detected for question ${id}, retrying... (${retryCount + 1}/${maxRetries})`);
      
      // Wait a random amount before retry to reduce collision probability
      const delay = Math.random() * 1000 + 500; // 500-1500ms
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return updateQuestion(id, updatedData, retryCount + 1);
    }
    
    // If not a deadlock or max retries reached, throw the error
    throw error;
  }
};

export const createQuestion = async (questionData, testId = null, sortOrder = null) => {
  try {
    // 1. Tạo câu hỏi mới
    const newQuestion = await db.Question.create({
      question: questionData.question,
      optionA: questionData.optionA,
      optionB: questionData.optionB,
      optionC: questionData.optionC,
      optionD: questionData.optionD,
      correctAnswer: questionData.correctAnswer,
      explanation: questionData.explanation,
      typeId: questionData.typeId,
      partId: questionData.partId,
    });

    // 2. Nếu có testId => thêm vào TestQuestion
    if (testId) {
      await db.TestQuestion.create({
        testId: testId,
        questionId: newQuestion.id,
        sortOrder: sortOrder, // có thể để null nếu không cần sắp thứ tự
      });
    }

    return newQuestion;
  } catch (error) {
    console.error("❌ Error creating question:", error);
    throw error;
  }
};
// nộp bài 
export const SubmitTestResult = async ({ userId, testId, answers }) => {
  return await db.sequelize.transaction(async (transaction) => {
    let correctCount = 0;
    const incorrectAnswers = [];

    // 1. Lấy UserTest đã được tạo khi bắt đầu làm bài
    let userTest = await db.UserTest.findOne({
      where: { userId, testId, status: 'in_progress' },
      order: [['startedAt', 'DESC']], // lấy lần làm mới nhất
      transaction
    });

    // Nếu chưa có (trường hợp cũ), thì tạo mới
    if (!userTest) {
      userTest = await db.UserTest.create({
        userId,
        testId,
        status: 'in_progress',
        startedAt: new Date(), // fallback
        score: 0
      }, { transaction });
    }

    // 2. Lấy danh sách questionId hợp lệ
    const validQuestions = await db.TestQuestion.findAll({
      where: { testId },
      attributes: ['questionId'],
      transaction,
    });

    const validQuestionIds = validQuestions.map(q => q.questionId);
    const filteredAnswers = answers.filter(a => validQuestionIds.includes(a.questionId));

    console.log(`📊 SubmitTestResult Debug:`, {
      testId,
      totalQuestionsInTest: validQuestionIds.length,
      answersReceived: answers.length,
      validAnswersAfterFilter: filteredAnswers.length,
      skippedAnswers: validQuestionIds.length - filteredAnswers.length
    });

    // 3. Xử lý từng câu trả lời
    const resultsToSave = [];

    for (const { questionId, selectedAnswer } of filteredAnswers) {
      const question = await db.Question.findByPk(questionId, { transaction });
      if (!question) continue;

      const isCorrect = question.correctAnswer === selectedAnswer;

      resultsToSave.push({
        userId,
        userTestId: userTest.id,
        questionId,
        selectedOption: selectedAnswer || null,
        isCorrect,
        answeredAt: new Date(),
      });

      if (isCorrect) {
        correctCount++;
      } else {
        incorrectAnswers.push({
          questionId,
          correctAnswer: question.correctAnswer,
          selectedAnswer,
          explanation: question.explanation,
        });
      }
    }

    // 4. Lưu UserResults
    if (resultsToSave.length > 0) {
      await db.UserResult.bulkCreate(resultsToSave, { transaction });
    }

    // 5. Tính score thang điểm 10
    // ✅ Dùng tổng số câu hỏi trong test, không phải số câu được trả lời
    const totalQuestions = validQuestionIds.length || 1;
    const score = Math.round((correctCount / totalQuestions) * 10 * 10) / 10;

    console.log("📊 Score Calculation:", { 
      correctCount, 
      totalQuestionsInTest: totalQuestions,
      answeredQuestions: filteredAnswers.length,
      unansweredQuestions: totalQuestions - filteredAnswers.length,
      score 
    });

    // 6. Update UserTest: chỉ cập nhật completedAt + score + status
    await userTest.update({
      score,
      completedAt: new Date(),
      status: 'completed'
    }, { transaction });

    // 7. ✅ Cập nhật QuestionStats để ML học
    await db.sequelize.query(`
      MERGE QuestionStats AS target
      USING (
        SELECT questionId,
              COUNT(*) AS attempts,
              SUM(CASE WHEN isCorrect = 1 THEN 1 ELSE 0 END) AS correct
        FROM UserResults
        GROUP BY questionId
      ) AS src
      ON target.questionId = src.questionId
      WHEN MATCHED THEN
        UPDATE SET attempts = src.attempts, correct = src.correct
      WHEN NOT MATCHED THEN
        INSERT (questionId, attempts, correct)
        VALUES (src.questionId, src.attempts, src.correct);
    `, { transaction });

    // ✅ Trigger ML update (async, non-blocking)
    setImmediate(async () => {
      const shouldUpdate = await needsMLUpdate(userId);
      if (shouldUpdate) {
        console.log(`🎯 Triggering ML update for user ${userId} after exam`);
        await triggerMLUpdate(userId);
      } else {
        console.log(`⏭️ Skipping ML update for user ${userId} (not enough new data)`);
      }
    });

    return {
      userTestId: userTest.id,
      correctCount,
      total: totalQuestions, // ✅ Tổng số câu hỏi trong test
      score,
      incorrectAnswers,
    };
  });
};

// ✅ NEW: Submit practice results (không cần testId, nhưng vẫn track trong UserTest)
export const SubmitPracticeResult = async ({ userId, answers }) => {
  return await db.sequelize.transaction(async (transaction) => {
    let correctCount = 0;
    const incorrectAnswers = [];

    console.log(`📊 SubmitPracticeResult Debug:`, {
      userId,
      answersReceived: answers.length
    });

    // 1️⃣ Tạo UserTest để track lịch sử luyện tập (testId = null cho practice mode)
    const userTest = await db.UserTest.create({
      userId,
      testId: null, // ✅ NULL indicates practice mode
      status: 'in_progress',
      startedAt: new Date(),
      score: 0
    }, { transaction });

    console.log(`✅ Created UserTest for practice mode:`, userTest.id);

    // 2️⃣ Lấy question IDs để validate
    const questionIds = answers.map(a => a.questionId);
    const questions = await db.Question.findAll({
      where: { id: questionIds },
      attributes: ['id', 'correctAnswer', 'explanation'],
      transaction
    });

    const questionMap = new Map(questions.map(q => [q.id, q]));

    // 3️⃣ Xử lý từng câu trả lời và lưu UserResults
    const resultsToSave = [];

    for (const { questionId, selectedAnswer } of answers) {
      const question = questionMap.get(questionId);
      if (!question) continue;

      const isCorrect = question.correctAnswer === selectedAnswer;

      // Prepare UserResult record
      resultsToSave.push({
        userId,
        userTestId: userTest.id, // ✅ Link to practice UserTest
        questionId,
        selectedOption: selectedAnswer || null,
        isCorrect,
        answeredAt: new Date(),
      });

      if (isCorrect) {
        correctCount++;
      } else {
        incorrectAnswers.push({
          questionId,
          correctAnswer: question.correctAnswer,
          selectedAnswer,
          explanation: question.explanation,
        });
      }

      // ✅ Cập nhật QuestionStats để ML học
      const [stat] = await db.QuestionStat.findOrCreate({
        where: { questionId },
        defaults: { attempts: 0, correct: 0 },
        transaction
      });

      await stat.increment({
        attempts: 1,
        correct: isCorrect ? 1 : 0
      }, { transaction });
    }

    // 4️⃣ Lưu tất cả UserResults
    if (resultsToSave.length > 0) {
      await db.UserResult.bulkCreate(resultsToSave, { transaction });
      console.log(`✅ Saved ${resultsToSave.length} UserResults for practice`);
    }

    // 5️⃣ Tính score và update UserTest
    const totalQuestions = answers.length || 1;
    const score = Math.round((correctCount / totalQuestions) * 10 * 10) / 10;

    await userTest.update({
      score,
      completedAt: new Date(),
      status: 'completed'
    }, { transaction });

    console.log("📊 Practice Score:", { 
      userTestId: userTest.id,
      correctCount, 
      totalQuestions,
      score 
    });

    // ✅ Trigger ML update (async, non-blocking)
    setImmediate(async () => {
      const shouldUpdate = await needsMLUpdate(userId);
      if (shouldUpdate) {
        console.log(`🎯 Triggering ML update for user ${userId} after practice`);
        await triggerMLUpdate(userId);
      } else {
        console.log(`⏭️ Skipping ML update for user ${userId} (not enough new data)`);
      }
    });

    return {
      userTestId: userTest.id, // ✅ Return userTestId để frontend có thể dùng
      correctCount,
      total: totalQuestions,
      score,
      incorrectAnswers,
    };
  });
};

export const StartUserTest = async ({ userId, testId }) => {
  return await db.sequelize.transaction(async (t) => {
    // 1. Tạo bản ghi user làm bài
    const userTest = await db.UserTest.create({
      userId,
      testId,
      status: 'in_progress',
      startedAt: new Date(),
      score: 0,
    }, { transaction: t });

    // 2. Tăng số lượng participants của bài test
    await db.Test.increment('participants', {
      by: 1,
      where: { id: testId },
      transaction: t,
    });

    // 3. Trả kết quả
    return {
      userTestId: userTest.id,
      message: 'Test started successfully',
    };
  });
};

export const CheckUserHasDoneTestDetailed = async ({ userId, testId }) => {
  try {
    const userTestRecord = await db.UserTest.findOne({
      where: { userId, testId },
      attributes: ['id', 'startedAt', 'completedAt', 'status', 'score'],
    });

    if (!userTestRecord) {
      return {
        done: false,
        message: 'User has not started this test yet.'
      };
    }

    return {
      done: true,
      startedAt: userTestRecord.startedAt,
      completedAt: userTestRecord.completedAt,
      status: userTestRecord.status,
      score: userTestRecord.score,
      message: userTestRecord.status === 'completed'
        ? 'User has completed this test.'
        : 'User has started but not completed this test.'
    };
  } catch (error) {
    console.error('Error checking user test:', error);
    throw error;
  }
};

// lấy chi tiết lịch sử làm bài của user với 1 bài test cụ thể
export const GetUserTestDetailById = async (userTestId) => {
  try {
    // ✅ Lấy thông tin UserTest để có score
    const userTest = await db.UserTest.findByPk(userTestId, {
      attributes: ['id', 'userId', 'testId', 'score', 'startedAt', 'completedAt', 'status'],
    });

    if (!userTest) {
      return { message: 'UserTest not found', details: [] };
    }

    // Lấy tất cả kết quả user theo userTestId
    const userResults = await db.UserResult.findAll({
      where: { userTestId },
      attributes: ['questionId', 'selectedOption', 'isCorrect', 'answeredAt'],
      include: [{
        model: db.Question,
        attributes: ['question','optionA','optionB','optionC', 'optionD','correctAnswer', 'explanation','typeId','partId'],
        // ✅ Include media cho listening questions
        include: [{
          model: db.QuestionMediaMap,
          as: 'mediaMappings',
          include: [{
            model: db.MediaFiles,
            as: 'media',
            attributes: ['id', 'mediaType', 'mediaUrl', 'description']
          }],
          attributes: ['id', 'mediaId', 'startSecond', 'endSecond', 'sortOrder']
        }]
      }]
    });

    if (!userResults || userResults.length === 0) {
      return { message: 'Not found', details: [] };
    }

    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    const details = [];

    for (const result of userResults) {
      const isSkipped = !result.selectedOption;
      if (isSkipped) skippedCount++;
      else if (result.isCorrect) correctCount++;
      else incorrectCount++;

      details.push({
        questionId: result.questionId,
        question: result.Question.question,
        optionA: result.Question.optionA,
        optionB: result.Question.optionB,
        optionC: result.Question.optionC,
        optionD: result.Question.optionD,
        typeId : result.Question.typeId,
        partId : result.Question.partId,
        selectedOption: result.selectedOption,
        isCorrect: result.isCorrect,
        correctAnswer: result.Question.correctAnswer,
        explanation: result.Question.explanation,
        answeredAt: result.answeredAt,
        // ✅ Include media files (for listening parts 1,2,3,4)
        mediaFiles: result.Question.mediaMappings?.map(mapping => ({
          id: mapping.media?.id,
          mediaType: mapping.media?.mediaType,
          mediaUrl: mapping.media?.mediaUrl,
          description: mapping.media?.description,
          startSecond: mapping.startSecond,
          endSecond: mapping.endSecond,
          sortOrder: mapping.sortOrder
        })) || []
      });
    }

    console.log(`📊 GetUserTestDetailById result:`, {
      userTestId: userTest.id,
      score: userTest.score,
      totalQuestions: userResults.length,
      correctCount,
      incorrectCount,
      skippedCount
    });

    return {
      // ✅ Thêm thông tin UserTest
      userTestId: userTest.id,
      userId: userTest.userId,
      testId: userTest.testId,
      score: userTest.score, // ✅ Score từ UserTest table
      startedAt: userTest.startedAt,
      completedAt: userTest.completedAt,
      status: userTest.status,
      // ✅ Thống kê từ UserResults
      totalQuestions: userResults.length,
      correctCount,
      incorrectCount,
      skippedCount,
      details
    };
  } catch (err) {
    console.error('Error fetching user test detail by id:', err);
    throw err;
  }
};




dayjs.extend(utc);
dayjs.extend(timezone);

//convert về giờ VN (UTC+7)
const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';
export const GetUserTestHistoryByTestId = async ({ userId, testId }) => {
  try {
    const userTests = await db.UserTest.findAll({
      where: { userId, testId },
      attributes: ['id', 'startedAt', 'completedAt'],
      order: [['startedAt', 'DESC']]
    });

    if (!userTests || userTests.length === 0) {
      return { message: 'No history found', data: [] };
    }

    //  Lấy tất cả kết quả UserResult một lần
    const userTestIds = userTests.map(t => t.id);
    const allResults = await db.UserResult.findAll({
      where: { userTestId: userTestIds },
      attributes: ['userTestId', 'isCorrect']
    });

    //  Gom kết quả theo userTestId
    const resultMap = {};
    for (const r of allResults) {
      if (!resultMap[r.userTestId]) {
        resultMap[r.userTestId] = { total: 0, correct: 0 };
      }
      resultMap[r.userTestId].total++;
      if (r.isCorrect) resultMap[r.userTestId].correct++;
    }

    const data = [];
    for (const test of userTests) {
      const started = dayjs(test.startedAt).tz(VN_TIMEZONE);
      const completed = test.completedAt
        ? dayjs(test.completedAt).tz(VN_TIMEZONE)
        : started; // Nếu chưa có completedAt thì để bằng started để tránh sai lệch

      const durationInSec = completed.diff(started, 'second');
      const formattedDuration = new Date(durationInSec * 1000)
        .toISOString()
        .substr(11, 8); // HH:mm:ss

      const totalQuestions = resultMap[test.id]?.total || 0;
      const correctCount = resultMap[test.id]?.correct || 0;

      data.push({
        date: started.format('DD/MM/YYYY'),
        score: `${correctCount}/${totalQuestions}`,
        duration: formattedDuration,
        userTestId: test.id
      });
    }

    return {
      message: 'Success',
      data
    };
  } catch (error) {
    console.error('Error fetching user test history:', error);
    throw error;
  }
};





// export default {
//   RandomQuestionsByTestId,
// };

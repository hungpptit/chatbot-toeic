import db from '../models/index.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';


export const RandomQuestionsByTestId = async (testId, limit = 40) => {
  try {
    // Bước 1: Lấy tất cả questionId và sortOrder từ TestQuestion
    const testQuestionRows = await db.TestQuestion.findAll({
      where: { testId },
      attributes: ['questionId', 'sortOrder'],
    });

    // Bước 2: Shuffle toàn bộ danh sách
    const shuffled = testQuestionRows
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    // Bước 3: Lấy danh sách questionId được chọn và ánh xạ sortOrder
    const selectedIds = shuffled.map(row => row.questionId);
    const sortOrderMap = new Map(shuffled.map(row => [row.questionId, row.sortOrder]));

    // Bước 4: Truy vấn các câu hỏi
    const questions = await db.Question.findAll({
      where: { id: selectedIds },
      include: [
        { model: db.QuestionType, as: 'questionType' },
        { model: db.Part, as: 'part' }
      ],
    });

    // Bước 5: Sắp xếp lại theo sortOrder đã ánh xạ
    const orderedQuestions = questions.sort((a, b) => {
      return sortOrderMap.get(a.id) - sortOrderMap.get(b.id);
    });

    return orderedQuestions;
  } catch (error) {
    console.error("❌ Error in RandomQuestionsByTestId:", error);
    throw error;
  }
};


// update câu hỏi
export const updateQuestion = async (id, updatedData) => {
  try {
    // Tìm câu hỏi theo ID
    const question = await db.Question.findByPk(id);
    if (!question) {
      throw new Error("Question not found");
    }

    // Cập nhật các trường
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
    });

    return question; // Trả về câu hỏi đã update
  } catch (error) {
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
    const totalQuestions = filteredAnswers.length || 1;
    const score = Math.round((correctCount / totalQuestions) * 10 * 10) / 10;

    console.log("DEBUG:", { correctCount, totalQuestions, score });

    // 6. Update UserTest: chỉ cập nhật completedAt + score + status
    await userTest.update({
      score,
      completedAt: new Date(),
      status: 'completed'
    }, { transaction });

    return {
      userTestId: userTest.id,
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


export const GetUserTestDetailById = async (userTestId) => {
  try {
    // Lấy tất cả kết quả user theo userTestId
    const userResults = await db.UserResult.findAll({
      where: { userTestId },
      attributes: ['questionId', 'selectedOption', 'isCorrect', 'answeredAt'],
      include: [{
        model: db.Question,
        attributes: ['question','optionA','optionB','optionC', 'optionD','correctAnswer', 'explanation','typeId','partId']
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
        answeredAt: result.answeredAt
      });
    }

    return {
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

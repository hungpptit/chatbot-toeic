import db from '../models/index.js';


export const RandomQuestionsByTestId = async (testId, limit = 40) => {
  try {
    // Bước 1: Lấy tất cả questionId từ bảng TestQuestions
    const testQuestionRows = await db.TestQuestion.findAll({
      where: { testId },
      attributes: ['questionId'],
    });

    const allQuestionIds = testQuestionRows.map(row => row.questionId);

    // Bước 2: Shuffle và lấy limit
    const shuffledIds = allQuestionIds
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    // Bước 3: Truy vấn lại câu hỏi theo id đã shuffle
    // console.log("test trong console backend: ",db.Question.rawAttributes)
    const questions = await db.Question.findAll({
      where: { id: shuffledIds },
      include: [
        { model: db.QuestionType, as: 'questionType' },
        { model: db.Part, as: 'part' }
      ],
    });

    return questions;
  } catch (error) {
    throw error;
  }
};

// nộp bài 
export const SubmitTestResult = async ({ userId, testId, answers }) => {
  return await db.sequelize.transaction(async (transaction) => {
    let correctCount = 0;
    const incorrectAnswers = [];

    // 1. Tạo UserTest
    const userTest = await db.UserTest.create({
      userId,
      testId,
      status: 'completed',
      startedAt: new Date(),
      completedAt: new Date(),
      score: 0
    }, { transaction });

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
    const totalQuestions = filteredAnswers.length || 1; // tránh chia 0
    const score = Math.round((correctCount / totalQuestions) * 10 * 10) / 10; // làm tròn 1 chữ số


    console.log("DEBUG:", {
      correctCount,
      totalQuestions,
      score
    });
    // 6. Update UserTest
    await userTest.update({
      score
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
        attributes: ['correctAnswer', 'explanation']
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






// export default {
//   RandomQuestionsByTestId,
// };

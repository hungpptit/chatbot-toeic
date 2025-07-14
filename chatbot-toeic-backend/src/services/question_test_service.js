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

    const validQuestions = await db.TestQuestion.findAll({
      where: { testId },
      attributes: ['questionId'],
      transaction,
    });

    const validQuestionIds = validQuestions.map(q => q.questionId);
    const filteredAnswers = answers.filter(a => validQuestionIds.includes(a.questionId));

    const resultsToSave = [];

    for (const { questionId, selectedAnswer } of filteredAnswers) {
      const question = await db.Question.findByPk(questionId, { transaction });

      if (!question) continue;

      const isCorrect = question.correctAnswer === selectedAnswer;

      resultsToSave.push({
        userId,
        questionId,
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

    if (resultsToSave.length > 0) {
      await db.UserResult.bulkCreate(resultsToSave, { transaction });
    }

    return {
      correctCount,
      total: filteredAnswers.length,
      incorrectAnswers,
    };
  });
};






// export default {
//   RandomQuestionsByTestId,
// };

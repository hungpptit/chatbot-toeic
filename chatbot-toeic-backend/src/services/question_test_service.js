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



// export default {
//   RandomQuestionsByTestId,
// };

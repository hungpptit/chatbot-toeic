import db from '../models/index.js';


export const RandomQuestionsByTestId = async (testId, limit = 40) => {
  try {
    const allQuestions = await db.Question.findAll({
      where: { testId },
      attributes: ['id'], // chỉ lấy id
    });

    const shuffledIds = allQuestions
      .map(q => q.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

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

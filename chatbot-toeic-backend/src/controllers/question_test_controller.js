
import { RandomQuestionsByTestId}  from '../services/question_test_service.js';

// Controller: Lấy danh sách câu hỏi ngẫu nhiên theo testId
const getQuestionsByTest = async (req, res) => {
  try {
    const { testId } = req.params;
    if (isNaN(Number(testId))) {
      return res.status(400).json({ message: 'Invalid testId parameter' });
    }
    const questions = await RandomQuestionsByTestId(testId);
    res.status(200).json(questions);
  } catch (err) {
    console.error('Error fetching questions by testId:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  getQuestionsByTest
};

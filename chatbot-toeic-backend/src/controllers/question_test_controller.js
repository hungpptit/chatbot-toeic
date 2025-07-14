
import { RandomQuestionsByTestId, SubmitTestResult}  from '../services/question_test_service.js';

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

const submitTest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { testId } = req.params;
    const { answers } = req.body;

    if (!userId || !testId || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Missing or invalid parameters' });
    }

    const result = await SubmitTestResult({ userId, testId, answers });

    res.status(200).json({
      message: 'Submit successful',
      correctCount: result.correctCount,
      total: result.total,
      incorrectAnswers: result.incorrectAnswers, // Danh sách câu sai
    });
  } catch (err) {
    console.error('Error submitting test result:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export {
  getQuestionsByTest,
  submitTest
};

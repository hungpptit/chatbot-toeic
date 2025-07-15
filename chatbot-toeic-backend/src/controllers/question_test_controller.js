
import { RandomQuestionsByTestId, SubmitTestResult, CheckUserHasDoneTestDetailed, GetUserTestDetailById, GetUserTestHistoryByTestId,StartUserTest}  from '../services/question_test_service.js';

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
      userTestId: result.userTestId,  
      correctCount: result.correctCount,
      total: result.total,
      score: result.score,            
      incorrectAnswers: result.incorrectAnswers 
    });
  } catch (err) {
    console.error('Error submitting test result:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const startTest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { testId } = req.params;

    const result = await StartUserTest({ userId, testId });

    res.status(200).json(result);
  } catch (err) {
    console.error('Error starting test:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const checkUserTestDetailed = async (req, res) => {
  try {
    const userId = req.user.id;
    const { testId } = req.params;

    const result = await CheckUserHasDoneTestDetailed({ userId, testId });

    res.status(200).json(result);
  } catch (err) {
    console.error('Error checking user test:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserTestDetailId = async (req, res) => {
  try {
    // const userId = req.user.id;
    const { userTestId } = req.params;
    console.log("test userTestId: ", userTestId);
    if (!userTestId) {
      return res.status(400).json({ message: 'Missing userTestId' });
    }

    const result = await GetUserTestDetailById( userTestId );

    return res.status(200).json({
      message: 'Fetched test details successfully',
      data: result
    });
  } catch (err) {
    console.error('Error fetching user test detail:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const checkHistoryUserTestDetailed = async (req, res) => {
  try {
    const userId = req.user.id; // lấy từ token
    const { testId } = req.params;

    if (!testId) {
      return res.status(400).json({ message: 'Missing testId' });
    }

    const result = await GetUserTestHistoryByTestId({ userId, testId });

    return res.status(200).json(result);
  } catch (err) {
    console.error('Error checking user test:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export {
  getQuestionsByTest,
  submitTest,
  checkUserTestDetailed,
  getUserTestDetailId,
  checkHistoryUserTestDetailed,
  startTest
};

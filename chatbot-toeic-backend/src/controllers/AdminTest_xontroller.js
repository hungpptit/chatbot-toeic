// chatbot-toeic-backend\src\controllers\AdminTest_xontroller.js

import {getAllTestsWithCourses} from '../services/AdminTest_service.js';

const getTestList = async (req, res) => {
  try {
    const data = await getAllTestsWithCourses();
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching test list:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  getTestList
};
// chatbot-toeic-backend\src\controllers\courses_controller.js
import { getAllCourses } from '../services/course_service.js';

// Controller: Lấy danh sách tất cả khóa học
const getCourseList = async (req, res) => {
  try {
    const data = await getAllCourses();
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching course list:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  getCourseList
};

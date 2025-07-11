// chatbot-toeic-backend\src\routes\course_router.js
import express from 'express';
import { getCourseList } from '../controllers/courses_controller.js';

const router = express.Router();

// Lấy tất cả khóa học
router.get('/', getCourseList);

export default router;

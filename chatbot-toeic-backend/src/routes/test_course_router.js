import express from 'express';
import { getAllTestsWithCoursesController, getAllCourseNamesController } from '../controllers/test_course_controller.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';

const router = express.Router();
router.get('/all', getAllTestsWithCoursesController);
router.get('/courses', authMiddleware,getAllCourseNamesController);

export default router;
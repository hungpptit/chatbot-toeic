import express from 'express';
import { getAllTestsWithCoursesController } from '../controllers/test_course_controller.js';

const router = express.Router();
router.get('/all', getAllTestsWithCoursesController);

export default router;
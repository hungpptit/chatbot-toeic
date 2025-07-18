import express from 'express';
import { getAllTestsWithCoursesController, getAllCourseNamesController, getCoursesNameWithTests,updateCourseNameController,
    deleteCourseByIdController
 } from '../controllers/test_course_controller.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';

const router = express.Router();
router.get('/all', getAllTestsWithCoursesController);
router.get('/courses', authMiddleware,getAllCourseNamesController);
router.get('/with-tests', authMiddleware, getCoursesNameWithTests);
router.put('/update/:id', authMiddleware, updateCourseNameController);
router.delete('/delete/:id', authMiddleware, deleteCourseByIdController);

export default router;
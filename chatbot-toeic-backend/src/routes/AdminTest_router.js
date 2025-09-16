import express from 'express';
import {
  getTestList,
  getQuestionTypes,
  getParts,
  createPartController,
  deletePartController,
  createQuestionTypeController,
  deleteQuestionTypeController,
  createNewTestController,
  updatePartNameController,
  updateQuestionTypeController,
  deleteTestByIdController,
  generateMissingEmbeddingsController,
  getSkillsController,
  getSkillByIdController,
  createSkillController,
  updateSkillController,
  deleteSkillController,
} from '../controllers/AdminTest_controller.js';

import { authMiddleware } from '../Middleware/authMiddleware.js';

const router = express.Router();

// Lấy tất cả bài test kèm thông tin khóa học
router.get('/', authMiddleware, getTestList);

// Lấy danh sách question types và parts
router.get('/question-types', authMiddleware, getQuestionTypes);
router.get('/parts', authMiddleware, getParts);
// Cập nhật tên Part và Question Type
router.put('/parts/update', authMiddleware, updatePartNameController);
router.put('/question-types/update', authMiddleware, updateQuestionTypeController);

// Tạo / Xóa Part
router.post('/parts', authMiddleware, createPartController);
router.delete('/parts/:id', authMiddleware, deletePartController);

// Tạo / Xóa QuestionType
router.post('/question-types', authMiddleware, createQuestionTypeController);
router.delete('/question-types/:id', authMiddleware, deleteQuestionTypeController);
// Tạo bài test mới
router.post('/createTestNew', authMiddleware, createNewTestController);
// Xóa bài test theo ID
router.delete('/deleteTest/:testId', authMiddleware, deleteTestByIdController);


router.post('/tests/generate-missing-embeddings', generateMissingEmbeddingsController);
// Skill routes
router.get('/skills', authMiddleware, getSkillsController);// Lấy tất cả skill
router.get('/skills/:id', authMiddleware, getSkillByIdController);// Lấy skill theo ID
router.post('/skills', authMiddleware, createSkillController);// Tạo skill mới
router.put('/skills/:id', authMiddleware, updateSkillController);// Cập nhật skill
router.delete('/skills/:id', authMiddleware, deleteSkillController);// Xóa skill
export default router;

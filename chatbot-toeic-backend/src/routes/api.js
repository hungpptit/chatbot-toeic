import express from 'express';
import vocabularyRouter from './vocabulary_route.js';
import loginRouter from './login_signup_router.js';
import questionRouter from './question_route.js';
import conversationRouter from './conversation_router.js';
import messageRouter from './message_routes.js';
import authRouter from './auth_router.js';
import coursesRouter from './course_router.js';
import testcourseRouter from './test_course_router.js';
import questiontestRouter from './question_test_router.js';
import AdminUserRouter from './AdminUser_router.js';
import AminTestRouter from  './AdminTest_router.js';
import accountRouter from './account_router.js';
import statisticalRouter from './statistical_router.js';
// import userRouter from './user.route.js';
// import questionRouter from './question.route.js';

const router = express.Router();

// Gắn các router con
router.use('/vocabulary', vocabularyRouter);
// router.use('/user', userRouter);
router.use('/question', questionRouter);
router.use('/auth', loginRouter);
router.use('/conversations', conversationRouter);
router.use('/messages', messageRouter);
router.use('/', authRouter);
router.use('/courses', coursesRouter);
router.use('/testcourses', testcourseRouter);
router.use('/questionTest', questiontestRouter);
router.use('/adminUser', AdminUserRouter);
router.use('/adminTest', AminTestRouter);
router.use('/account', accountRouter);
router.use('/statistical', statisticalRouter);

export default router;
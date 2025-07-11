import express from 'express';
import vocabularyRouter from './vocabulary_route.js';
import loginRouter from './login_signup_router.js';
import questionRouter from './question_route.js';
import conversationRouter from './conversation_router.js';
import messageRouter from './message_routes.js';
import authRouter from './auth_router.js';
import coursesRouter from './course_router.js';
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

export default router;
import express from 'express';
import vocabularyRouter from './vocabulary_route.js';

import questionRouter from './question_route.js';
// import userRouter from './user.route.js';
// import questionRouter from './question.route.js';

const router = express.Router();

// Gắn các router con
router.use('/vocabulary', vocabularyRouter);
// router.use('/user', userRouter);
router.use('/question', questionRouter);

export default router;
import express from 'express';
import {
  getVocabularyList,
  getVocabularyDetail,
  findOrFetchVocabulary
} from '../controllers/vocabulary_controller.js';

const router = express.Router();

router.get('/', getVocabularyList);
router.get('/:id', getVocabularyDetail);
router.get('/word/:word', findOrFetchVocabulary);
export default router;

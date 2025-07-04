import {
  getAllVocabulary,
  getVocabularyById,
  getVocabularyByWord
} from '../services/vocabulary_service.js';

// Controller: Lấy danh sách từ vựng
const getVocabularyList = async (req, res) => {
  try {
    const data = await getAllVocabulary();
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching vocabulary list:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller: Lấy chi tiết từ vựng theo ID
const getVocabularyDetail = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid vocabulary ID' });
    }
    const word = await getVocabularyById(id);

    if (!word) {
      return res.status(404).json({ message: 'Vocabulary not found' });
    }

    res.status(200).json(word);
  } catch (err) {
    console.error('Error fetching vocabulary detail:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Tìm hoặc tạo từ theo `word`
const findOrFetchVocabulary = async (req, res) => {
  try {
    const { word } = req.params;

    if (!word || typeof word !== 'string') {
      return res.status(400).json({ message: 'Invalid word parameter' });
    }

    const data = await getVocabularyByWord(word.toLowerCase());
    if (!data) {
      return res.status(404).json({ message: 'Word not found' });
    }

    res.status(200).json(data);
  } catch (err) {
     console.error('❌ Error fetching word from API:', err); // 👈 in full object
  res.status(500).json({ message: 'Failed to fetch word definition', error: err.message || err });
  }
};
export{
    getVocabularyList,
    getVocabularyDetail,
    findOrFetchVocabulary,
};

import { getItemWithAI } from '../services/question_service.js';

const handleQuestionRequest = async (req, res) => {
  try {
    const { type, questionText, options, word } = req.body;

    // Gọi service xử lý logic bên trong
    let result;
    try {
      result = await getItemWithAI({ type, questionText, options, word });
      // console.log('🔎 AI result:', result);  // kiểm tra ở đây
    } catch (err) {
      console.error('❌ Error in getItemWithAI:', err.message);
      return res.status(400).json({ error: 'Không xử lý được yêu cầu', detail: err.message });
    }

    // Trả về theo loại kết quả
    if (result.question) {
      // Câu hỏi trắc nghiệm
      return res.json({
        type: result.question.type,
        source: result.source,
        question: result.question.question,
        options: {
          A: result.question.optionA,
          B: result.question.optionB,
          C: result.question.optionC,
          D: result.question.optionD,
        },
        answer: result.question.correctAnswer,
        explanation: result.question.explanation,
      });
    }

    if (result.vocab) {
      // Từ vựng
      return res.json({
        type: 'Vocabulary-Lookup',
        source: result.source,
        word: result.vocab.word,
        definition: result.vocab.definition,
        example: result.vocab.example,
        synonyms: result.vocab.synonyms?.map(s => s.synonym) || [],
        antonyms: result.vocab.antonyms?.map(a => a.antonym) || [],
         viExplanation: result.viExplanation || '', 
      });
    }

    if (result.type === 'Free') {
      // Câu hỏi tự do
      return res.json({
        type: 'Free',
        source: 'ai',
        answer: result.answer,
      });
    }

    // Nếu không rơi vào trường hợp nào
    return res.status(400).json({ error: 'Không nhận diện được loại câu hỏi.' });

  } catch (err) {
    console.error('❌ Error in handleQuestionRequest:', err.message);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

export { handleQuestionRequest };

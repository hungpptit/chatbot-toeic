import { getSmartItem } from '../services/question_service.js';
const handleQuestionRequest = async (req, res) => {
  try {
    const {
      rawText
    } = req.body;
    const conversationId = req.params.conversationId || "default";
    console.log("📝 Conversation ID:", conversationId);
    console.log("📝 Raw text:", rawText);
    if (!rawText?.trim()) {
      return res.status(400).json({
        error: 'Thiếu dữ liệu đầu vào (rawText)'
      });
    }

    // Nếu không có conversationId, có thể gán mặc định (ví dụ: "default" hoặc để null)
    const convId = conversationId || "default"; // Điều chỉnh logic nếu cần

    let result;
    try {
      result = await getSmartItem(rawText, convId); // Truyền conversationId vào getSmartItem
    } catch (err) {
      console.error('❌ Error in getSmartItem:', err.message);
      return res.status(400).json({
        error: 'Không xử lý được yêu cầu',
        detail: err.message
      });
    }

    // 🟥 Trắc nghiệm
    if (result.question) {
      return res.json({
        type: result.question.type,
        source: result.source,
        question: result.question.question,
        options: {
          A: result.question.optionA,
          B: result.question.optionB,
          C: result.question.optionC,
          D: result.question.optionD
        },
        answer: result.question.correctAnswer,
        explanation: result.question.explanation
      });
    }

    // 🟨 Từ vựng
    if (result.vocab) {
      return res.json({
        type: 'Vocabulary-Lookup',
        source: result.source,
        word: result.vocab.word,
        definition: result.vocab.definition,
        example: result.vocab.example,
        synonyms: result.vocab.synonyms?.map(s => s.synonym) || [],
        antonyms: result.vocab.antonyms?.map(a => a.antonym) || [],
        viExplanation: result.viExplanation || ''
      });
    }

    // 🟩 Câu hỏi tự do
    if (result.type === 'Free') {
      return res.json({
        type: 'Free',
        source: 'ai',
        answer: result.answer
      });
    }
    return res.status(400).json({
      error: 'Không nhận diện được loại câu hỏi.'
    });
  } catch (err) {
    console.error('❌ Error in handleQuestionRequest:', err.message);
    res.status(500).json({
      error: 'Server error',
      detail: err.message
    });
  }
};
export { handleQuestionRequest };
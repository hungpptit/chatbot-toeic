import { getSmartItem } from '../services/question_service.js';



const handleQuestionRequest = async (req, res) => {
  try {
    const { rawText } = req.body;
    const conversationId = req.params.conversationId || "default";
    console.log("📝 Conversation ID:", conversationId);
    console.log("📝 Raw text:", rawText);

    if (!rawText?.trim()) {
      return res.status(400).json({ error: 'Thiếu dữ liệu đầu vào (rawText)' });
    }

    const items = await getSmartItem(rawText, conversationId); // xử lý nhiều câu
    if (!items.length) {
      return res.status(400).json({ error: 'Không có câu hỏi hợp lệ' });
    }

    return res.json({
      count: items.length,
      results: items.map((r) => {
        if (r.question) {
          return {
            type: r.question.type,
            source: r.source,
            question: r.question.question,
            options: {
              A: r.question.optionA,
              B: r.question.optionB,
              C: r.question.optionC,
              D: r.question.optionD,
            },
            answer: r.question.correctAnswer,
            explanation: r.question.explanation,
          };
        }

        if (r.vocab) {
          return {
            type: 'Vocabulary-Lookup',
            source: r.source,
            word: r.vocab.word,
            definition: r.vocab.definition,
            example: r.vocab.example,
            synonyms: r.vocab.synonyms?.map(s => s.synonym) || [],
            antonyms: r.vocab.antonyms?.map(a => a.antonym) || [],
            viExplanation: r.viExplanation || '',
          };
        }

        return {
          type: 'Free',
          source: r.source,
          answer: r.answer,
        };
      }),
    });

  } catch (err) {
    console.error('❌ Lỗi trong batch handler:', err.message);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
};


export { handleQuestionRequest };
import { getQuestionWithAnswer } from '../services/question_service.js';

const handleQuestionRequest = async (req, res) => {
  try {
    const { questionText, options } = req.body;

    if (!questionText || !options?.A || !options?.B || !options?.C || !options?.D) {
      return res.status(400).json({ error: 'Thiếu dữ liệu đầu vào' });
    }

    const result = await getQuestionWithAnswer({ questionText, options });

    res.json({
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
  } catch (err) {
    console.error('❌ Error in handleQuestionRequest:', err.message);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

export {
  handleQuestionRequest,
};

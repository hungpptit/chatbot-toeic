import db from '../models/index.js';
import axios from 'axios';

const Question = db.Question;

// 🎯 Đổi từ OpenAI SDK → dùng Colab API trực tiếp
const COLAB_API_URL = 'https://4629-35-245-7-89.ngrok-free.app';


// 🧠 Gọi AI server do bạn host (Colab/Local/Ngrok)
const askWithLocalAI = async (questionText, options) => {
  const prompt = `Bạn là trợ lý tiếng Anh. Với câu hỏi sau, hãy chọn đáp án đúng và giải thích bằng tiếng Việt.

Câu hỏi: ${questionText}
A. ${options.A}
B. ${options.B}
C. ${options.C}
D. ${options.D}

⚠️ Bắt buộc đúng định dạng sau:
Đáp án: A/B/C/D
Giải thích: <giải thích ngắn bằng tiếng Việt>

Chỉ in kết quả, không thêm gì khác.`;

  try {
    const response = await axios.post(`${COLAB_API_URL}/generate`, {
      prompt,
      max_tokens: 200
    });

    const reply = response.data.result || '';
    console.log('💬 AI reply:', reply);

    const answerMatch = reply.match(/Đáp án[:：]?\s*([A-D])/i);
    const explanationMatch = reply.match(/Giải thích[:：]?\s*([\s\S]*)/i);

    const answer = answerMatch?.[1]?.toUpperCase() || 'D';
    const explanation = explanationMatch?.[1]?.trim() || reply.trim();

    return {
      answer,
      explanation,
    };
  } catch (err) {
    console.error('❌ Local AI API error:', {
    message: err.message,
    code: err.code,
    response: err.response?.data,
    status: err.response?.status,
    url: `${COLAB_API_URL}/generate`
  });
    throw new Error('Lỗi khi gọi AI server nội bộ');
  }
};

// 🔁 Hàm chính: lấy từ DB hoặc hỏi AI nếu chưa có
const getQuestionWithAnswer = async ({ questionText, options }) => {
  try {
    const existing = await Question.findOne({ where: { question: questionText } });

    if (existing) {
      return {
        source: 'database',
        question: existing,
      };
    }

    const aiResult = await askWithLocalAI(questionText, options);

    const newQuestion = await Question.create({
      question: questionText,
      optionA: options.A,
      optionB: options.B,
      optionC: options.C,
      optionD: options.D,
      correctAnswer: aiResult.answer,
      explanation: aiResult.explanation,
      type: 'Part 5',
      topic: 'General',
    });

    return {
      source: 'ai',
      question: newQuestion,
    };
  } catch (err) {
    console.error('❌ Error in getQuestionWithAnswer:', err.message);
    throw err;
  }
};

export {
  getQuestionWithAnswer,
};

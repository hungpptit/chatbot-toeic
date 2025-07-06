import db from '../models/index.js';
import { GEMINI_API_KEYS, GEMINI_API_URL } from '../config.js';
import axios from 'axios';

const { Question, Vocabulary, Synonym, Antonym } = db;

// 🔁 Gọi Gemini với fallback API key
const callGemini = async (prompt) => {
  for (const apiKey of GEMINI_API_KEYS) {
    try {
      const res = await axios.post(GEMINI_API_URL, {
        contents: [{ parts: [{ text: prompt }] }],
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
      });

      const text = res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) return text;
    } catch (err) {
      console.warn(`⚠️ Gemini key failed (${apiKey}):`, err.response?.status || err.message);
    }
  }

  throw new Error('❌ All Gemini API keys failed');
};

// 🎯 Phân loại câu hỏi
const detectQuestionType = async (questionText, options) => {
  const prompt = `Bạn là trợ lý phân loại câu hỏi tiếng Anh. Hãy xác định loại câu hỏi sau:
- "Vocabulary" nếu là về từ vựng.
- "Grammar" nếu là về ngữ pháp.
- "Free" nếu là câu hỏi tự do không trắc nghiệm.

Câu hỏi: ${questionText}
A. ${options?.A || '...'}
B. ${options?.B || '...'}
C. ${options?.C || '...'}
D. ${options?.D || '...'}

Chỉ trả lời đúng một từ: Vocabulary / Grammar / Free`;

  const reply = await callGemini(prompt);
  const lower = reply.toLowerCase();

  if (lower.includes('vocabulary')) return 'Vocabulary';
  if (lower.includes('grammar')) return 'Part 5';
  return 'Free';
};

// 📌 Tự do
const askFreeQuestion = async (questionText) => {
  const prompt = `Bạn là trợ lý tiếng Anh. Trả lời ngắn gọn và rõ ràng bằng tiếng Việt cho câu hỏi sau:\n"${questionText}"`;
  return await callGemini(prompt);
};

// 🧠 Trắc nghiệm
const askWithLocalAI = async (questionText, options, type = 'Part 5') => {
  const intro =
    type === 'Vocabulary'
      ? 'Bạn là trợ lý luyện từ vựng tiếng Anh. Hãy chọn đáp án đúng và giải thích bằng tiếng Việt.'
      : 'Bạn là trợ lý tiếng Anh. Hãy chọn đáp án đúng và giải thích bằng tiếng Việt.';

  const prompt = `${intro}

Câu hỏi: ${questionText}
A. ${options.A}
B. ${options.B}
C. ${options.C}
D. ${options.D}

⚠️ Bắt buộc đúng định dạng sau:
Đáp án: A/B/C/D
Giải thích: <giải thích ngắn bằng tiếng Việt>

Chỉ in kết quả, không thêm gì khác.`;

  const reply = await callGemini(prompt);
  const answerMatch = reply.match(/Đáp án[:：]?\s*([A-D])/i);
  const explanationMatch = reply.match(/Giải thích[:：]?\s*([\s\S]*)/i);

  return {
    answer: answerMatch?.[1]?.toUpperCase() || 'D',
    explanation: explanationMatch?.[1]?.trim() || reply.trim(),
  };
};

// 📘 Từ vựng
const askVocabularyAI = async (word) => {
  const prompt = `Bạn là trợ lý từ vựng tiếng Anh. Với từ "${word}", hãy trả lời với định dạng sau:

Định nghĩa: <giải thích bằng tiếng Anh>
Ví dụ: <câu tiếng Anh sử dụng từ đó>
Đồng nghĩa: <3 từ cách nhau bởi dấu phẩy>
Trái nghĩa: <3 từ cách nhau bởi dấu phẩy>

Chỉ trả lời đúng định dạng trên, không thêm gì khác.`;

  const reply = await callGemini(prompt);
  console.log('🧪 Gemini AI raw reply:', reply);

  return {
    definition: reply.match(/Định nghĩa[:：]?\s*(.+)/i)?.[1]?.trim() || null,
    example: reply.match(/Ví dụ[:：]?\s*(.+)/i)?.[1]?.trim() || null,
    synonyms: reply.match(/Đồng nghĩa[:：]?\s*(.+)/i)?.[1]?.split(/,\s*/).filter(Boolean) || [],
    antonyms: reply.match(/Trái nghĩa[:：]?\s*(.+)/i)?.[1]?.split(/,\s*/).filter(Boolean) || [],
  };
};

// 🇻🇳 Giải thích tiếng Việt (dùng luôn AI)
const askVietnameseExplanation = async (word) => {
  const prompt = `Bạn là trợ lý tiếng Anh. Hãy giải thích nghĩa của từ "${word}" bằng tiếng Việt một cách đơn giản và dễ hiểu.`;
  return await callGemini(prompt);
};

// 🔁 Hàm chính
const getItemWithAI = async ({ type, questionText, options, word }) => {
  // 🟩 Tự do
  if (!type && questionText && !options && !word) {
    return {
      type: 'Free',
      source: 'ai',
      answer: await askFreeQuestion(questionText),
    };
  }

  // 🟨 Từ vựng
  if (type === 'Vocabulary-Lookup') {
    let vocab = await Vocabulary.findOne({ where: { word } });
    let source = 'database';

    if (!vocab) {
      source = 'ai';
      const aiData = await askVocabularyAI(word);
      if (!aiData?.definition) throw new Error('Không lấy được dữ liệu từ AI');

      vocab = await Vocabulary.create({
        word,
        definition: aiData.definition,
        example: aiData.example,
        topic: 'general',
      });

      for (const s of aiData.synonyms) await Synonym.create({ vocabId: vocab.id, synonym: s });
      for (const a of aiData.antonyms) await Antonym.create({ vocabId: vocab.id, antonym: a });
    }

    const full = await Vocabulary.findOne({
      where: { id: vocab.id },
      include: [
        { model: Synonym, as: 'synonyms' },
        { model: Antonym, as: 'antonyms' },
      ],
    });

    const viExplanation = await askVietnameseExplanation(word);

    return { source, vocab: full, viExplanation };
  }

  // 🟥 Trắc nghiệm
  if (!type && questionText && options) {
    type = await detectQuestionType(questionText, options);
  }

  if (type === 'Free') {
    return {
      type: 'Free',
      source: 'ai',
      answer: await askFreeQuestion(questionText),
    };
  }

  const existing = await Question.findOne({ where: { question: questionText } });
  if (existing) return { source: 'database', question: existing };

  const aiResult = await askWithLocalAI(questionText, options, type);

  const newQuestion = await Question.create({
    question: questionText,
    optionA: options.A,
    optionB: options.B,
    optionC: options.C,
    optionD: options.D,
    correctAnswer: aiResult.answer,
    explanation: aiResult.explanation,
    type,
    topic: type === 'Vocabulary' ? 'Vocabulary' : 'General',
  });

  return { source: 'ai', question: newQuestion };
};

export { getItemWithAI };

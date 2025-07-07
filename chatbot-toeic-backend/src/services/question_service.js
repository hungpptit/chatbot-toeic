import db from '../models/index.js';
import { GEMINI_API_KEYS, GEMINI_API_URL } from '../config.js';
import axios from 'axios';
import {getMessagesForGemini } from './message_service.js';

const { Question, Vocabulary, Synonym, Antonym } = db;

// 🔁 Gọi Gemini với fallback API key
const callGemini = async (contents) => {
  for (const apiKey of GEMINI_API_KEYS) {
    try {
      const res = await axios.post(GEMINI_API_URL, {
        contents, // Gửi trực tiếp mảng contents
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

// 📥 Phân tích input thô thành object
// 📥 Phân tích input thô thành object
const parseUserInput = async (rawText, conversationId) => {
  const { data: history } = await getMessagesForGemini(conversationId); // Lấy lịch sử 15 cặp
  const prompt = `Bạn là trợ lý trích xuất dữ liệu câu hỏi tiếng Anh. Dưới đây là lịch sử hội thoại và chuỗi đầu vào thô mới, hãy phân tích và trả về một object JSON với định dạng:

{
  "type": "Vocabulary-Lookup" | "Free" | "MultipleChoice",
  "questionText": "nếu có",
  "options": {
    "A": "...",
    "B": "...",
    "C": "...",
    "D": "..."
  },
  "word": "nếu là từ vựng đơn"
}

Nếu là từ vựng thì chỉ trả lại type = "Vocabulary-Lookup" và word.
Nếu là câu hỏi trắc nghiệm thì có questionText và options.
Nếu là tự do thì chỉ có type = "Free" và questionText.

❗Không bao quanh JSON bằng \`\`\` hoặc ghi chú. Trả về đúng JSON thuần túy.

Lịch sử:
${JSON.stringify(history)}
Chuỗi mới:
"""${rawText}"""`;

  const reply = await callGemini(history.concat({ role: "user", parts: [{ text: prompt }] }));

  // ✅ Loại bỏ markdown code block nếu có
  const cleaned = reply.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (err) {
    console.warn('❌ Không phân tích được JSON từ AI:', reply);
    throw new Error('Không thể trích xuất dữ liệu từ chuỗi đầu vào');
  }
};

// 🎯 Phân loại câu hỏi trắc nghiệm
const detectQuestionType = async (questionText, options, conversationId) => {
  const { data: history } = await getMessagesForGemini(conversationId);
  const prompt = `Bạn là trợ lý phân loại câu hỏi tiếng Anh. Dưới đây là lịch sử hội thoại và câu hỏi mới, hãy xác định loại câu hỏi:
- "Vocabulary" nếu là về từ vựng.
- "Grammar" nếu là về ngữ pháp.
- "Free" nếu là câu hỏi tự do không trắc nghiệm.

Lịch sử:
${JSON.stringify(history)}
Câu hỏi mới: ${questionText}
A. ${options?.A || '...'}
B. ${options?.B || '...'}
C. ${options?.C || '...'}
D. ${options?.D || '...'}

Chỉ trả lời đúng một từ: Vocabulary / Grammar / Free`;

  const reply = await callGemini(history.concat({ role: "user", parts: [{ text: prompt }] }));
  const lower = reply.toLowerCase();

  if (lower.includes('vocabulary')) return 'Vocabulary';
  if (lower.includes('grammar')) return 'Part 5';
  return 'Free';
};

// 📌 Tự do
const askFreeQuestion = async (questionText, conversationId) => {
  const { data: history } = await getMessagesForGemini(conversationId);
  const prompt = `Bạn là trợ lý tiếng Anh. Dưới đây là lịch sử hội thoại và câu hỏi mới, trả lời ngắn gọn và rõ ràng bằng tiếng Việt:\nLịch sử:\n${JSON.stringify(history)}\nCâu hỏi mới:\n"${questionText}"`;
  return await callGemini(history.concat({ role: "user", parts: [{ text: prompt }] }));
};

// 🧠 Trắc nghiệm
const askWithLocalAI = async (questionText, options, type = 'Part 5', conversationId) => {
  const { data: history } = await getMessagesForGemini(conversationId);
  const intro =
    type === 'Vocabulary'
      ? 'Bạn là trợ lý luyện từ vựng tiếng Anh. Hãy chọn đáp án đúng và giải thích bằng tiếng Việt.'
      : 'Bạn là trợ lý tiếng Anh. Hãy chọn đáp án đúng và giải thích bằng tiếng Việt.';

  const prompt = `${intro}

Lịch sử:
${JSON.stringify(history)}
Câu hỏi: ${questionText}
A. ${options.A}
B. ${options.B}
C. ${options.C}
D. ${options.D}

⚠️ Bắt buộc đúng định dạng sau:
Đáp án: A/B/C/D
Giải thích: <giải thích ngắn bằng tiếng Việt>

Chỉ in kết quả, không thêm gì khác.`;

  const reply = await callGemini(history.concat({ role: "user", parts: [{ text: prompt }] }));
  const answerMatch = reply.match(/Đáp án[:：]?\s*([A-D])/i);
  const explanationMatch = reply.match(/Giải thích[:：]?\s*([\s\S]*)/i);

  return {
    answer: answerMatch?.[1]?.toUpperCase() || 'D',
    explanation: explanationMatch?.[1]?.trim() || reply.trim(),
  };
};

// 📘 Từ vựng
const askVocabularyAI = async (word, conversationId) => {
  const { data: history } = await getMessagesForGemini(conversationId);
  const prompt = `Bạn là trợ lý từ vựng tiếng Anh. Dưới đây là lịch sử hội thoại và từ cần phân tích:\nLịch sử:\n${JSON.stringify(history)}\nTừ: "${word}", hãy trả lời với định dạng sau:

Định nghĩa: <giải thích bằng tiếng Anh>
Ví dụ: <câu tiếng Anh sử dụng từ đó>
Đồng nghĩa: <3 từ cách nhau bởi dấu phẩy>
Trái nghĩa: <3 từ cách nhau bởi dấu phẩy>

Chỉ trả lời đúng định dạng trên, không thêm gì khác.`;

  const reply = await callGemini(history.concat({ role: "user", parts: [{ text: prompt }] }));
  console.log('🧪 Gemini AI raw reply:', reply);

  return {
    definition: reply.match(/Định nghĩa[:：]?\s*(.+)/i)?.[1]?.trim() || null,
    example: reply.match(/Ví dụ[:：]?\s*(.+)/i)?.[1]?.trim() || null,
    synonyms: reply.match(/Đồng nghĩa[:：]?\s*(.+)/i)?.[1]?.split(/,\s*/).filter(Boolean) || [],
    antonyms: reply.match(/Trái nghĩa[:：]?\s*(.+)/i)?.[1]?.split(/,\s*/).filter(Boolean) || [],
  };
};

// 🇻🇳 Giải thích nghĩa tiếng Việt
const askVietnameseExplanation = async (word, conversationId) => {
  const { data: history } = await getMessagesForGemini(conversationId);
  const prompt = `Bạn là trợ lý tiếng Anh. Dưới đây là lịch sử hội thoại và từ cần giải thích:\nLịch sử:\n${JSON.stringify(history)}\nTừ: "${word}", hãy giải thích nghĩa bằng tiếng Việt một cách đơn giản và dễ hiểu.`;
  return await callGemini(history.concat({ role: "user", parts: [{ text: prompt }] }));
};

// 🔁 Hàm chính gốc
const getItemWithAI = async ({ type, questionText, options, word }, conversationId) => {
  if (!type && questionText && !options && !word) {
    return {
      type: 'Free',
      source: 'ai',
      answer: await askFreeQuestion(questionText, conversationId),
    };
  }

  if (type === 'Vocabulary-Lookup') {
    let vocab = await Vocabulary.findOne({ where: { word } });
    let source = 'database';

    if (!vocab) {
      source = 'ai';
      const aiData = await askVocabularyAI(word, conversationId);
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

    const viExplanation = await askVietnameseExplanation(word, conversationId);
    return { source, vocab: full, viExplanation };
  }

  if (!type && questionText && options) {
    type = await detectQuestionType(questionText, options, conversationId);
  }

  if (type === 'Free') {
    return {
      type: 'Free',
      source: 'ai',
      answer: await askFreeQuestion(questionText, conversationId),
    };
  }

  const existing = await Question.findOne({ where: { question: questionText } });
  if (existing) return { source: 'database', question: existing };

  const aiResult = await askWithLocalAI(questionText, options, type, conversationId);

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

// 💡 Hàm mới: xử lý từ chuỗi thô bất kỳ
const getSmartItem = async (rawText, conversationId) => {
  const parsed = await parseUserInput(rawText, conversationId);
  return await getItemWithAI(parsed, conversationId);
};

export { getItemWithAI, getSmartItem };
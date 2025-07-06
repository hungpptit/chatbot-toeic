'use strict';
import db from '../models/index.js';
import { GEMINI_API_KEYS, GEMINI_API_URL } from '../config.js';
import axios from 'axios';

const { Question, Vocabulary, Synonym, Antonym, Conversation, Message } = db;

// 🔁 Gọi Gemini với history + fallback API key
const callGeminiWithHistory = async (userId, prompt, conversationId = null, resetHistory = false) => {
  let conversation;

  if (conversationId && !isNaN(Number(conversationId))) {
    conversation = await Conversation.findByPk(conversationId);
  }

  if (!conversation) {
    conversation = await Conversation.create({ userId, title: 'Hội thoại AI' });
  }

  const messages = resetHistory ? [] : await Message.findAll({
    where: { conversationId: conversation.id },
    order: [['createdAt', 'ASC']],
  });

  const history = messages.map(m => ({
    role: m.role,
    parts: [{ text: m.content }]
  }));

  const contents = [...history, { role: 'user', parts: [{ text: prompt }] }];

  for (const apiKey of GEMINI_API_KEYS) {
    try {
      const res = await axios.post(GEMINI_API_URL, { contents }, {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
      });

      const reply = res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (reply) {
        await Message.create({ conversationId: conversation.id, role: 'user', content: prompt });
        await Message.create({ conversationId: conversation.id, role: 'model', content: reply });
        return { reply, conversationId: conversation.id };
      }
    } catch (err) {
      console.warn(`⚠️ Gemini key failed (${apiKey}):`, err.response?.status || err.message);
    }
  }

  throw new Error('❌ All Gemini API keys failed');
};


const parseUserInput = async (userId, rawText, conversationId) => {
  const prompt = `Bạn là trợ lý trích xuất dữ liệu câu hỏi tiếng Anh...\nChuỗi:\n\"\"\"${rawText}\"\"\"`;
  const { reply } = await callGeminiWithHistory(userId, prompt, conversationId, true);;
  const cleaned = reply.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('❌ Không phân tích được JSON từ AI:', reply);
    throw new Error('Không thể trích xuất dữ liệu từ chuỗi đầu vào');
  }
};

const detectQuestionType = async (userId, questionText, options, conversationId) => {
  const prompt = `Bạn là trợ lý phân loại câu hỏi tiếng Anh...\nCâu hỏi: ${questionText}\nA. ${options?.A || '...'}\n...`;
  const { reply } = await callGeminiWithHistory(userId, prompt, conversationId, true);
  const lower = reply.toLowerCase();
  if (lower.includes('vocabulary')) return 'Vocabulary';
  if (lower.includes('grammar')) return 'Part 5';
  return 'Free';
};

const askFreeQuestion = async (userId, questionText, conversationId) => {
  const prompt = `Bạn là trợ lý tiếng Anh. Trả lời ngắn gọn và rõ ràng bằng tiếng Việt cho câu hỏi sau:\n\"${questionText}\"`;
  const { reply } = await callGeminiWithHistory(userId, prompt, conversationId, true);
  return reply;
};

const askWithLocalAI = async (userId, questionText, options, type = 'Part 5', conversationId) => {
  const intro = type === 'Vocabulary'
    ? 'Bạn là trợ lý luyện từ vựng tiếng Anh...'
    : 'Bạn là trợ lý tiếng Anh...';

  const prompt = `${intro}\nCâu hỏi: ${questionText}\nA. ${options.A}\nB. ${options.B}\nC. ${options.C}\nD. ${options.D}\n\n⚠️ Bắt buộc đúng định dạng sau:\nĐáp án: A/B/C/D\nGiải thích: <giải thích ngắn bằng tiếng Việt>`;

  const { reply } = await callGeminiWithHistory(userId, prompt, conversationId, true);
  const answerMatch = reply.match(/Đáp án[:：]?\s*([A-D])/i);
  const explanationMatch = reply.match(/Giải thích[:：]?\s*([\s\S]*)/i);
  return {
    answer: answerMatch?.[1]?.toUpperCase() || 'D',
    explanation: explanationMatch?.[1]?.trim() || reply.trim(),
  };
};

const askVocabularyAI = async (userId, word, conversationId) => {
  const prompt = `Bạn là trợ lý từ vựng tiếng Anh. Với từ \"${word}\"...`;
  const { reply } = await callGeminiWithHistory(userId, prompt, conversationId, true);
  return {
    definition: reply.match(/Định nghĩa[:：]?\s*(.+)/i)?.[1]?.trim() || null,
    example: reply.match(/Ví dụ[:：]?\s*(.+)/i)?.[1]?.trim() || null,
    synonyms: reply.match(/Đồng nghĩa[:：]?\s*(.+)/i)?.[1]?.split(/,\s*/).filter(Boolean) || [],
    antonyms: reply.match(/Trái nghĩa[:：]?\s*(.+)/i)?.[1]?.split(/,\s*/).filter(Boolean) || [],
  };
};

const askVietnameseExplanation = async (userId, word, conversationId) => {
  const prompt = `Bạn là trợ lý tiếng Anh. Hãy giải thích nghĩa của từ \"${word}\" bằng tiếng Việt một cách đơn giản.`;
  const { reply } = await callGeminiWithHistory(userId, prompt, conversationId, true);
  return reply;
};

const getItemWithAI = async ({ type, questionText, options, word }, userId, conversationId = null) => {
  if (!type && questionText && !options && !word) {
    return {
      type: 'Free',
      source: 'ai',
      answer: await askFreeQuestion(userId, questionText, conversationId),
    };
  }

  if (type === 'Vocabulary-Lookup') {
    let vocab = await Vocabulary.findOne({ where: { word } });
    let source = 'database';

    if (!vocab) {
      source = 'ai';
      const aiData = await askVocabularyAI(userId, word, conversationId);
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

    const viExplanation = await askVietnameseExplanation(userId, word, conversationId);
    return { source, vocab: full, viExplanation,conversationId };
  }

  if (!type && questionText && options) {
    type = await detectQuestionType(userId, questionText, options, conversationId);
  }

  if (type === 'Free') {
    return {
      type: 'Free',
      source: 'ai',
      answer: await askFreeQuestion(userId, questionText, conversationId),
    };
  }

  const existing = await Question.findOne({ where: { question: questionText } });
  if (existing) return { source: 'database', question: existing,conversationId };

  const aiResult = await askWithLocalAI(userId, questionText, options, type, conversationId);

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

  return { source: 'ai', question: newQuestion,conversationId };
};

const getSmartItem = async (rawText, userId, conversationId = null) => {
  const parsed = await parseUserInput(userId, rawText, conversationId);
  return await getItemWithAI(parsed, userId, conversationId);
};

export { getItemWithAI, getSmartItem };
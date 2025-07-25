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
  const { data: history } = await getMessagesForGemini(conversationId);

  const prompt = `
Bạn là trợ lý trích xuất dữ liệu luyện thi TOEIC. Chuỗi đầu vào bên dưới có thể chứa một hoặc nhiều câu hỏi. Nhiệm vụ:
✅ Nếu có nhiều câu hỏi → hãy tách và phân tích từng câu, trả về mảng JSON gồm các object có dạng:

{
  "type": "MultipleChoice",
  "questionText": "With the help of ...",
  "options": {
    "A": "recover",
    "B": "recovers",
    "C": "recovering",
    "D": "recovered"
  }
}

✅ Nếu là từ vựng → type = "Vocabulary-Lookup" và word = "..."

✅ Nếu là câu hỏi tự do → type = "Free" và questionText = "..."

❗Không bao quanh kết quả bằng \`\`\` hoặc chú thích gì cả. Trả về JSON thuần.

Lịch sử hội thoại:
${JSON.stringify(history)}

Dữ liệu mới:
"""${rawText}"""
`;

  const reply = await callGemini(history.concat({ role: "user", parts: [{ text: prompt }] }));
  const cleaned = reply.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [parsed]; // luôn trả về mảng
  } catch (err) {
    console.warn("❌ Không phân tích được JSON từ AI:", reply);
    throw new Error("Không thể trích xuất dữ liệu");
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

  // 🪓 Cắt reply thành nhiều block nếu Gemini trả về nhiều phần
  const blocks = reply.split(/(?:❓|Câu hỏi[:：]?)/).map(b => b.trim()).filter(Boolean);

  for (const block of blocks) {
    const answerMatch = block.match(/Đáp án[:：]?\s*([A-D])/i);
    const explanationMatch = block.match(/Giải thích[:：]?\s*([\s\S]*?)(?:\nĐáp án:|\n?$)/i);

    if (answerMatch) {
      return {
        answer: answerMatch[1].toUpperCase(),
        explanation: explanationMatch?.[1]?.trim() || '',
      };
    }
  }

  // ❌ Fallback nếu không tìm được đáp án đúng
  console.warn('❌ Không tìm được định dạng đúng từ reply:', reply);
  return {
    answer: 'D',
    explanation: reply.trim(),
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
  const { questionType, part } = await classifyTypeAndPart(questionText, options, conversationId);
  const { typeId, partId } = await findOrCreateTypeAndPart(questionType, part);

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
    typeId,
    partId,
  });

  // 🔍 Lấy hoặc tạo course "AI-Test"
  const [aiCourse] = await db.Course.findOrCreate({
    where: { name: 'AI-Test' },
  });

  // 📚 Lấy test gần nhất trong AI-Test course
  const tests = await db.Test.findAll({
    include: [{
      model: db.Course,
      where: { id: aiCourse.id },
      through: { attributes: [] }
    }],
    order: [['id', 'DESC']]
  });

  let testToUse = null;
  let currentCount = 0;

  for (const test of tests) {
    const count = await db.TestQuestion.count({ where: { testId: test.id } });
    if (count < 40) {
      testToUse = test;
      currentCount = count;
      break;
    }
  }

  // 📦 Nếu không còn test phù hợp thì tạo mới
  if (!testToUse) {
    testToUse = await db.Test.create({
      title: `AI Test - ${new Date().toLocaleString('en-GB').replace(/[/,:\s]/g, '-')}`,
      duration: 600,
      participants: 0,
      comments: 0,
    });

    await db.Test_Courses.create({
      testId: testToUse.id,
      courseId: aiCourse.id,
    });
  }

  // ➕ Thêm câu hỏi vào Test
  await db.TestQuestion.create({
    testId: testToUse.id,
    questionId: newQuestion.id,
    sortOrder: currentCount + 1,
  });


  return {
    source: 'ai',
    questionId: newQuestion.id,
    testId: testToUse.id,
    courseId: aiCourse.id,
    typeId,
    partId,
    question: newQuestion,
  };
};

const parseUserInputMulti = async (rawText, conversationId) => {
  const { data: history } = await getMessagesForGemini(conversationId);

  const prompt = `Bạn là trợ lý trích xuất dữ liệu câu hỏi tiếng Anh. Dưới đây là chuỗi đầu vào chứa nhiều câu hỏi, hãy phân tích và trả về một mảng JSON gồm các object có định dạng như sau:

[
  {
    "type": "MultipleChoice",
    "questionText": "...",
    "options": {
      "A": "...",
      "B": "...",
      "C": "...",
      "D": "..."
    }
  },
  {
    "type": "MultipleChoice",
    "questionText": "...",
    "options": { ... }
  }
]

Chỉ trả về JSON thuần túy, không markdown hay giải thích. Nếu một dòng không đủ dữ liệu thì bỏ qua.

Lịch sử hội thoại: ${JSON.stringify(history)}
Chuỗi mới:
"""${rawText}"""`;

  const reply = await callGemini(history.concat({ role: "user", parts: [{ text: prompt }] }));
  const cleaned = reply.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) throw new Error("Không phải mảng");
    return parsed;
  } catch (err) {
    console.warn("❌ Không phân tích được mảng JSON từ AI:", reply);
    throw new Error("Không thể trích xuất danh sách câu hỏi");
  }
};


// 💡 Hàm mới: xử lý từ chuỗi thô bất kỳ
const getSmartItem = async (rawText, conversationId) => {
  const items = await parseUserInputMulti(rawText, conversationId);
  const results = [];

  for (const item of items) {
    try {
      const result = await getItemWithAI(item, conversationId);
      results.push(result);
    } catch (err) {
      console.warn(`❌ Lỗi khi xử lý item:\n${JSON.stringify(item)}\n`, err.message);
    }
  }

  return results;
};


const classifyTypeAndPart = async (questionText, options, conversationId) => {
  const { data: history } = await getMessagesForGemini(conversationId);

  const prompt = `
Bạn là trợ lý phân loại câu hỏi tiếng Anh. Dưới đây là một câu hỏi mới.
Hãy xác định:
- "questionType": Một trong các loại sau: Multiple Choice, Fill in the Blank, Matching, Rearrangement, True/False, Short Answer
- "part": Một phần trong bài thi TOEIC như Part 1, Part 2, Part 5, v.v.

Trả về JSON đúng định dạng sau (không ghi chú hoặc markdown):
{
  "questionType": "Multiple Choice",
  "part": "Part 5"
}

Lịch sử hội thoại: ${JSON.stringify(history)}
Câu hỏi: ${questionText}
A. ${options?.A || ''}
B. ${options?.B || ''}
C. ${options?.C || ''}
D. ${options?.D || ''}
`;

  const reply = await callGemini(history.concat({ role: "user", parts: [{ text: prompt }] }));
  const cleaned = reply.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn("❌ Không phân tích được JSON từ AI:", reply);
    throw new Error("Không thể phân loại câu hỏi");
  }
};

const findOrCreateTypeAndPart = async (questionTypeName, partName) => {
  const [type] = await db.QuestionType.findOrCreate({
    where: { name: questionTypeName },
    defaults: { description: '' },
  });

  const [part] = await db.Part.findOrCreate({
    where: { name: partName },
  });

  return { typeId: type.id, partId: part.id };
};




export { getItemWithAI, getSmartItem };
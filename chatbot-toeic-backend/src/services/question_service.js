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
  // const askWithLocalAI = async (questionText, options, type = 'Part 5', conversationId) => {
  //   const { data: history } = await getMessagesForGemini(conversationId);
  //   const intro =
  //     type === 'Vocabulary'
  //       ? 'Bạn là trợ lý luyện từ vựng tiếng Anh. Hãy chọn đáp án đúng và giải thích bằng tiếng Việt.'
  //       : 'Bạn là trợ lý tiếng Anh. Hãy chọn đáp án đúng và giải thích bằng tiếng Việt.';

  //   const prompt = `${intro}

  // Lịch sử:
  // ${JSON.stringify(history)}
  // Câu hỏi: ${questionText}
  // A. ${options.A}
  // B. ${options.B}
  // C. ${options.C}
  // D. ${options.D}

  // ⚠️ Bắt buộc đúng định dạng sau:
  // Đáp án: A/B/C/D
  // Giải thích: <giải thích ngắn bằng tiếng Việt>

  // Chỉ in kết quả, không thêm gì khác.`;

  //   const reply = await callGemini(history.concat({ role: "user", parts: [{ text: prompt }] }));

  //   // 🪓 Cắt reply thành nhiều block nếu Gemini trả về nhiều phần
  //   const blocks = reply.split(/(?:❓|Câu hỏi[:：]?)/).map(b => b.trim()).filter(Boolean);

  //   for (const block of blocks) {
  //     const answerMatch = block.match(/Đáp án[:：]?\s*([A-D])/i);
  //     const explanationMatch = block.match(/Giải thích[:：]?\s*([\s\S]*?)(?:\nĐáp án:|\n?$)/i);

  //     if (answerMatch) {
  //       return {
  //         answer: answerMatch[1].toUpperCase(),
  //         explanation: explanationMatch?.[1]?.trim() || '',
  //       };
  //     }
  //   }

  //   // ❌ Fallback nếu không tìm được đáp án đúng
  //   console.warn('❌ Không tìm được định dạng đúng từ reply:', reply);
  //   return {
  //     answer: 'D',
  //     explanation: reply.trim(),
  //   };
  // };
  const askWithLocalAI = async (questionText, rawOptions, type='Part 5', conversationId) => {
    const options = normalizeOptions(rawOptions);
    if (!options) {
      // không đủ lựa chọn -> coi là Free
      return { answer: null, explanation: null, _fallbackFree: true };
    }

    const { data: history } = await getMessagesForGemini(conversationId);

    const letters = Object.keys(options);              // ['A','B','C'] hoặc nhiều hơn
    const optionsText = letters.map(l => `${l}. ${options[l]}`).join('\n');
    const allowed = letters.join('/');                 // "A/B/C" hoặc "A/B/C/D"

    const intro = type === 'Vocabulary'
      ? 'Bạn là trợ lý luyện từ vựng tiếng Anh. Hãy chọn đáp án đúng và giải thích bằng tiếng Việt.'
      : 'Bạn là trợ lý tiếng Anh. Hãy chọn đáp án đúng và giải thích bằng tiếng Việt.';

    const prompt = `${intro}

  Lịch sử:
  ${JSON.stringify(history)}
  Câu hỏi: ${questionText}
  ${optionsText}

  ⚠️ Chỉ trả lời đúng định dạng sau:
  Đáp án: ${allowed}
  Giải thích: <giải thích ngắn bằng tiếng Việt>

  Chỉ in kết quả, không thêm gì khác.`;

    const reply = await callGemini(history.concat({ role: "user", parts: [{ text: prompt }] }));

    // Bắt đáp án theo tập chữ hiện có
    const re = new RegExp(`Đáp án[:：]?\\s*(${letters.join('|')})\\b`, 'i');
    const answerMatch = reply.match(re);
    const expMatch = reply.match(/Giải thích[:：]?\s*([\s\S]*?)$/i);

    if (answerMatch) {
      return {
        answer: answerMatch[1].toUpperCase(),
        explanation: expMatch?.[1]?.trim() || ''
      };
    }

    // fallback nếu không parse được
    return { answer: letters[0], explanation: reply.trim() };
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
  // const getItemWithAI = async ({ type, questionText, options, word }, conversationId) => {
  //   if (!type && questionText && !options && !word) {
  //     return {
  //       type: 'Free',
  //       source: 'ai',
  //       answer: await askFreeQuestion(questionText, conversationId),
  //     };
  //   }

  //   if (type === 'Vocabulary-Lookup') {
  //     let vocab = await Vocabulary.findOne({ where: { word } });
  //     let source = 'database';

  //     if (!vocab) {
  //       source = 'ai';
  //       const aiData = await askVocabularyAI(word, conversationId);
  //       if (!aiData?.definition) throw new Error('Không lấy được dữ liệu từ AI');

  //       vocab = await Vocabulary.create({
  //         word,
  //         definition: aiData.definition,
  //         example: aiData.example,
  //         topic: 'general',
  //       });

  //       for (const s of aiData.synonyms) await Synonym.create({ vocabId: vocab.id, synonym: s });
  //       for (const a of aiData.antonyms) await Antonym.create({ vocabId: vocab.id, antonym: a });
  //     }

  //     const full = await Vocabulary.findOne({
  //       where: { id: vocab.id },
  //       include: [
  //         { model: Synonym, as: 'synonyms' },
  //         { model: Antonym, as: 'antonyms' },
  //       ],
  //     });

  //     const viExplanation = await askVietnameseExplanation(word, conversationId);
  //     return { source, vocab: full, viExplanation };
  //   }

  //   if (!type && questionText && options) {
  //     type = await detectQuestionType(questionText, options, conversationId);
  //   }

  //   if (type === 'Free') {
  //     return {
  //       type: 'Free',
  //       source: 'ai',
  //       answer: await askFreeQuestion(questionText, conversationId),
  //     };
  //   }

  //   const existing = await Question.findOne({ where: { question: questionText } });
  //   if (existing) return { source: 'database', question: existing };

  //   const aiResult = await askWithLocalAI(questionText, options, type, conversationId);
  //   const { questionType, part } = await classifyTypeAndPart(questionText, options, conversationId);
  //   const { typeId, partId } = await findOrCreateTypeAndPart(questionType, part);

  //   const newQuestion = await Question.create({
  //     question: questionText,
  //     optionA: options.A,
  //     optionB: options.B,
  //     optionC: options.C,
  //     optionD: options.D,
  //     correctAnswer: aiResult.answer,
  //     explanation: aiResult.explanation,
  //     type,
  //     topic: type === 'Vocabulary' ? 'Vocabulary' : 'General',
  //     typeId,
  //     partId,
  //   });

  //   // 🔍 Lấy hoặc tạo course "AI-Test"
  //   const [aiCourse] = await db.Course.findOrCreate({
  //     where: { name: 'AI-Test' },
  //   });

  //   // 📚 Lấy test gần nhất trong AI-Test course
  //   const tests = await db.Test.findAll({
  //     include: [{
  //       model: db.Course,
  //       where: { id: aiCourse.id },
  //       through: { attributes: [] }
  //     }],
  //     order: [['id', 'DESC']]
  //   });

  //   let testToUse = null;
  //   let currentCount = 0;

  //   for (const test of tests) {
  //     const count = await db.TestQuestion.count({ where: { testId: test.id } });
  //     if (count < 40) {
  //       testToUse = test;
  //       currentCount = count;
  //       break;
  //     }
  //   }

  //   // 📦 Nếu không còn test phù hợp thì tạo mới
  //   if (!testToUse) {
  //     testToUse = await db.Test.create({
  //       title: `AI Test - ${new Date().toLocaleString('en-GB').replace(/[/,:\s]/g, '-')}`,
  //       duration: 600,
  //       participants: 0,
  //       comments: 0,
  //     });

  //     await db.Test_Courses.create({
  //       testId: testToUse.id,
  //       courseId: aiCourse.id,
  //     });
  //   }

  //   // ➕ Thêm câu hỏi vào Test
  //   await db.TestQuestion.create({
  //     testId: testToUse.id,
  //     questionId: newQuestion.id,
  //     sortOrder: currentCount + 1,
  //   });


  //   return {
  //     source: 'ai',
  //     questionId: newQuestion.id,
  //     testId: testToUse.id,
  //     courseId: aiCourse.id,
  //     typeId,
  //     partId,
  //     question: newQuestion,
  //   };
  // };

  // === Helpers ===============================================================

// Chuẩn hóa options: nhận object {A:"..", B:"..", ...} hoặc array ["..",".."]
// Trả về object có key là A..F (tối đa 6 lựa chọn). <2 lựa chọn => null
const normalizeOptions = (raw) => {
  if (!raw) return null;

  let arr;
  if (Array.isArray(raw)) {
    arr = raw;
  } else if (typeof raw === 'object') {
    // sắp xếp theo key A..Z
    arr = Object.entries(raw)
      .sort(([k1], [k2]) => String(k1).localeCompare(String(k2)))
      .map(([, v]) => v);
  } else {
    return null;
  }

  const cleaned = arr.map(x => (x ?? '').toString().trim()).filter(Boolean);
  if (cleaned.length < 2) return null;

  const labels = ['A', 'B', 'C', 'D', 'E', 'F']; // hỗ trợ tối đa 6
  const out = {};
  cleaned.slice(0, labels.length).forEach((v, i) => (out[labels[i]] = v));
  return out; // {A:'..',B:'..',...}
};

// Hỏi Free có fallback an toàn (không để văng lỗi)
const safeFree = async (text, conversationId) => {
  try {
    const reply = await askFreeQuestion(text, conversationId);
    return (reply && reply.trim()) || 'Xin chào!';
  } catch (e) {
    console.warn('Free fallback error:', e?.message);
    return 'Xin chào!';
  }
};

// Hỏi trắc nghiệm với số lựa chọn động (2–6 đáp án)
const askWithLocalAIDynamic = async (questionText, optionsObj, type = 'Part 5', conversationId) => {
  const letters = Object.keys(optionsObj);             // ví dụ: ['A','B','C'] hoặc nhiều hơn
  if (letters.length < 2) return { _fallbackFree: true };

  const { data: history } = await getMessagesForGemini(conversationId);
  const optionsText = letters.map(l => `${l}. ${optionsObj[l]}`).join('\n');
  const allowed = letters.join('/'); // "A/B/C" hay "A/B/C/D/E/F"

  const intro =
    type === 'Vocabulary'
      ? 'Bạn là trợ lý luyện từ vựng tiếng Anh. Hãy chọn đáp án đúng và giải thích bằng tiếng Việt.'
      : 'Bạn là trợ lý tiếng Anh. Hãy chọn đáp án đúng và giải thích bằng tiếng Việt.';

  const prompt = `${intro}

Lịch sử:
${JSON.stringify(history)}
Câu hỏi: ${questionText}
${optionsText}

⚠️ Chỉ trả lời đúng định dạng sau:
Đáp án: ${allowed}
Giải thích: <giải thích ngắn bằng tiếng Việt>

Chỉ in kết quả, không thêm gì khác.`;

  const reply = await callGemini(history.concat({ role: 'user', parts: [{ text: prompt }] }));

  // Bắt đáp án theo tập chữ hiện có
  const re = new RegExp(`Đáp án[:：]?\\s*(${letters.join('|')})\\b`, 'i');
  const answerMatch = reply.match(re);
  const expMatch = reply.match(/Giải thích[:：]?\s*([\s\S]*?)$/i);

  if (answerMatch) {
    return {
      answer: answerMatch[1].toUpperCase(),
      explanation: expMatch?.[1]?.trim() || '',
    };
  }

  // fallback nếu không parse được: chọn A và trả lại toàn bộ reply làm explanation
  return { answer: letters[0], explanation: reply.trim() };
};

// === Hàm chính ============================================================

// Note: dùng chung các hàm/biến bạn đã có sẵn:
// - Vocabulary, Synonym, Antonym, Question, db
// - askFreeQuestion, askVocabularyAI, askVietnameseExplanation
// - detectQuestionType, classifyTypeAndPart, findOrCreateTypeAndPart
// - callGemini, getMessagesForGemini (đã tồn tại trong code của bạn)

const getItemWithAI = async (item, conversationId) => {
  let { type, questionText, options: rawOptions, word } = item || {};

  const hasText = typeof questionText === 'string' && questionText.trim().length > 0;
  const hasWord = typeof word === 'string' && word.trim().length > 0;

  // Chuẩn hóa options (2–6 đáp án). Nếu <2 thì trả null
  const normalizedOptions = normalizeOptions(rawOptions);

  // 1) Suy luận type nếu chưa có
  if (!type) {
    if (hasWord) type = 'Vocabulary-Lookup';
    else if (hasText && normalizedOptions) {
      // có đủ dữ liệu trắc nghiệm thì detect type (hoặc gán mặc định Part 5)
      try {
        type = await detectQuestionType(questionText, normalizedOptions, conversationId);
      } catch {
        type = 'Part 5';
      }
    } else if (hasText) {
      type = 'Free';
    }
  }

  // 2) Vocab
  if (type === 'Vocabulary-Lookup') {
    if (!hasWord) {
      // thiếu word -> rơi về Free
      const safe = await safeFree(questionText || 'Xin chào', conversationId);
      return { type: 'Free', source: 'ai', answer: safe };
    }

    let vocab = await Vocabulary.findOne({ where: { word } });
    let source = 'database';

    if (!vocab) {
      source = 'ai';
      const aiData = await askVocabularyAI(word, conversationId);
      if (!aiData?.definition) {
        // fallback Free nếu AI không ra dữ liệu
        const safe = await safeFree(questionText || word, conversationId);
        return { type: 'Free', source: 'ai', answer: safe };
      }

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

  // 3) Free (hoặc rơi về Free nếu không đủ options)
  if (type === 'Free' || !normalizedOptions) {
    const safe = await safeFree(questionText || word || 'Xin chào', conversationId);
    return { type: 'Free', source: 'ai', answer: safe };
  }

  // 4) MCQ (2–6 lựa chọn)
  // Kiểm tra đã có câu trong DB chưa
  const existing = await Question.findOne({ where: { question: questionText } });
  if (existing) return { source: 'database', question: existing };

  // Hỏi AI với options động
  const aiResult = await askWithLocalAIDynamic(questionText, normalizedOptions, type, conversationId);
  if (aiResult._fallbackFree) {
    const safe = await safeFree(questionText, conversationId);
    return { type: 'Free', source: 'ai', answer: safe };
  }

  // Phân loại questionType/part an toàn
  let qt = 'Multiple Choice';
  let part = 'Part 5';
  try {
    const r = await classifyTypeAndPart(questionText, normalizedOptions, conversationId);
    if (r?.questionType) qt = r.questionType;
    if (r?.part) part = r.part;
  } catch (_) {}

  let typeId = null,
    partId = null;
  try {
    const ids = await findOrCreateTypeAndPart(qt, part);
    typeId = ids.typeId;
    partId = ids.partId;
  } catch (_) {}

  // Lưu DB: chỉ A..D; nếu thiếu thì để null/"" (tùy schema bạn cho phép)
  const opt = normalizedOptions;
  const newQuestion = await Question.create({
    question: questionText,
    optionA: opt.A ?? null,
    optionB: opt.B ?? null,
    optionC: opt.C ?? null,
    optionD: opt.D ?? null,
    correctAnswer: aiResult.answer,
    explanation: aiResult.explanation,
    type,
    topic: type === 'Vocabulary' ? 'Vocabulary' : 'General',
    typeId,
    partId,
  });

  // Gắn vào Test "AI-Test" như logic cũ
  const [aiCourse] = await db.Course.findOrCreate({ where: { name: 'AI-Test' } });
  const tests = await db.Test.findAll({
    include: [{ model: db.Course, where: { id: aiCourse.id }, through: { attributes: [] } }],
    order: [['id', 'DESC']],
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

  const prompt = `Bạn là trợ lý trích xuất dữ liệu câu hỏi tiếng Anh. 
Dưới đây là chuỗi đầu vào chứa nhiều câu hỏi, hãy phân tích và trả về một mảng JSON gồm các object có định dạng như sau:

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
  }
]

Nếu chỉ là câu chào hoặc hội thoại thông thường (ví dụ: "hi", "hello", "chào bạn") thì hãy trả về đúng JSON sau:
[
  {
    "type": "Free",
    "questionText": "${rawText}"
  }
]

Chỉ trả về JSON thuần túy, không markdown hay giải thích. 
Nếu một dòng không đủ dữ liệu thì bỏ qua.

Lịch sử hội thoại: ${JSON.stringify(history)}
Chuỗi mới:
"""${rawText}"""`;

  const reply = await callGemini(
    history.concat({ role: "user", parts: [{ text: prompt }] })
  );
  const cleaned = reply.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) throw new Error("Không phải mảng");
    return parsed;
  } catch (err) {
    console.warn("❌ Không phân tích được mảng JSON từ AI:", reply);
    // fallback Free luôn
    return [
      {
        type: "Free",
        questionText: rawText
      }
    ];
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
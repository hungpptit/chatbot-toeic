import db from '../models/index.js';
import axios from 'axios';
const Vocabulary = db.Vocabulary;
const Pronunciation = db.Pronunciation;
const Synonym = db.Synonym;
const Antonym = db.Antonym;
const Meaning = db.Meaning;
const getAllVocabulary = async () => {
  try {
    const vocabList = await db.Vocabulary.findAll({
      limit: 20,
      order: [['id', 'ASC']]
    });
    return vocabList;
  } catch (err) {
    throw err;
  }
};
const getVocabularyById = async id => {
  try {
    const word = await db.Vocabulary.findByPk(id);
    return word;
  } catch (err) {
    console.error('❌ Error fetching or saving word:', err);
    throw err;
  }
};
// Lấy từ theo word và tự động gọi API nếu chưa có
const getVocabularyByWord = async word => {
  try {
    let vocab = await Vocabulary.findOne({
      where: {
        word
      }
    });
    if (!vocab) {
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
      const response = await axios.get(url);
      const entries = response.data;
      if (!entries?.length) throw new Error('No dictionary data');

      // Gộp dữ liệu từ tất cả entries
      const phonetics = [];
      const allMeanings = [];
      const allSynonyms = new Set();
      const allAntonyms = new Set();
      for (const entry of entries) {
        if (entry.phonetics) phonetics.push(...entry.phonetics);
        if (entry.meanings) {
          for (const meaning of entry.meanings) {
            const partOfSpeech = meaning.partOfSpeech || null;
            for (const def of meaning.definitions || []) {
              if (def.definition) {
                allMeanings.push({
                  definition: def.definition,
                  example: def.example || null,
                  partOfSpeech
                });
              }
              def.synonyms?.forEach(s => allSynonyms.add(s));
              def.antonyms?.forEach(a => allAntonyms.add(a));
            }
            meaning.synonyms?.forEach(s => allSynonyms.add(s));
            meaning.antonyms?.forEach(a => allAntonyms.add(a));
          }
        }
      }

      // Ưu tiên nghĩa đầu tiên có ví dụ
      const firstDefWithExample = allMeanings.find(d => d.definition && d.example);
      const firstDef = allMeanings.find(d => d.definition);
      const definition = firstDefWithExample?.definition || firstDef?.definition || null;
      const example = firstDefWithExample?.example || null;

      // Lưu từ chính
      vocab = await Vocabulary.create({
        word,
        definition,
        example,
        topic: 'general'
      });

      // Lưu các meanings chi tiết
      for (const meaning of allMeanings) {
        try {
          await Meaning.create({
            vocabId: vocab.id,
            definition: meaning.definition,
            example: meaning.example,
            partOfSpeech: meaning.partOfSpeech
          });
        } catch (err) {
          console.error('❌ Failed to save meaning:', meaning, err.message);
        }
      }

      // Lọc phát âm (tránh trùng)
      const uniquePhonetics = new Map();
      for (const p of phonetics) {
        const phoneticText = p.text?.trim() || null;
        const audioUrl = p.audio?.trim() || null;
        if (!phoneticText && !audioUrl) continue;
        const key = `${phoneticText}|${audioUrl}`;
        if (uniquePhonetics.has(key)) continue;
        uniquePhonetics.set(key, {
          phoneticText,
          audioUrl
        });
      }
      for (const {
        phoneticText,
        audioUrl
      } of uniquePhonetics.values()) {
        const accent = audioUrl?.includes('uk') ? 'UK' : audioUrl?.includes('us') ? 'US' : audioUrl?.includes('au') ? 'AU' : 'Other';
        try {
          await Pronunciation.create({
            vocabId: vocab.id,
            phoneticText,
            audioUrl,
            accent
          });
        } catch (err) {
          console.error('❌ Failed to save pronunciation:', {
            word,
            phoneticText,
            audioUrl,
            error: err.message
          });
        }
      }

      // Lưu synonyms
      for (const syn of allSynonyms) {
        try {
          await Synonym.create({
            vocabId: vocab.id,
            synonym: syn
          });
        } catch (err) {
          console.error('❌ Failed to save synonym:', syn, err.message);
        }
      }

      // Lưu antonyms
      for (const ant of allAntonyms) {
        try {
          await Antonym.create({
            vocabId: vocab.id,
            antonym: ant
          });
        } catch (err) {
          console.error('❌ Failed to save antonym:', ant, err.message);
        }
      }
    }

    // Trả về đầy đủ thông tin đã lưu
    const fullData = await Vocabulary.findOne({
      where: {
        id: vocab.id
      },
      include: [{
        model: Pronunciation,
        as: 'pronunciations',
        attributes: ['id', 'phoneticText', 'audioUrl', 'accent']
      }, {
        model: Synonym,
        as: 'synonyms',
        attributes: ['id', 'synonym']
      }, {
        model: Antonym,
        as: 'antonyms',
        attributes: ['id', 'antonym']
      }, {
        model: Meaning,
        as: 'meanings',
        attributes: ['id', 'partOfSpeech', 'definition', 'example']
      }]
    });
    return fullData;
  } catch (err) {
    console.error('❌ Error fetching or saving word:', err.message);
    throw err;
  }
};
export { getAllVocabulary, getVocabularyById, getVocabularyByWord };
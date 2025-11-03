// ========================================
// FILE: src/controllers/ml_recommendation_detail_controller.js
// MỤC ĐÍCH: Lấy chi tiết các câu hỏi gợi ý từ ML (gồm media, type, part)
// ========================================

import db from '../models/index.js';
import { getRecommendations } from './ml_recommendation_controller.js';

export const getRecommendationDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ code: 400, message: "userId is required" });
    }

    // 🧠 Gọi ML controller trực tiếp thay vì fetch (tránh vấn đề cookie)
    let mlData;
    await new Promise((resolve, reject) => {
      const mockRes = {
        status: (code) => ({
          json: (data) => {
            if (code === 200 && data.data) {
              mlData = data.data;
              resolve();
            } else {
              reject(new Error(data.message || 'ML call failed'));
            }
          }
        })
      };
      getRecommendations(req, mockRes, reject);
    });

    if (!mlData) {
      return res.status(500).json({
        code: 500,
        message: "Failed to retrieve ML recommendation data"
      });
    }

    console.log('🧩 Raw ML data:', JSON.stringify(mlData, null, 2));

    // ✅ Lấy danh sách ID câu hỏi từ ML
    // ML controller trả về questionIds trực tiếp, KHÔNG phải recommendations object
    const questionIds = mlData.questionIds || [];

    console.log('✅ Question IDs to query:', questionIds);

    if (!questionIds.length) {
      return res.status(200).json({
        code: 200,
        message: "No recommended questions found",
        data: { weak_skills: mlData.weak_skills, questions: [] }
      });
    }

    // ✅ Truy vấn chi tiết các câu hỏi từ DB, giống RandomQuestionsByTestId
    const questions = await db.Question.findAll({
      where: { id: questionIds },
      include: [
        { model: db.QuestionType, as: 'questionType', required: false },
        { model: db.Part, as: 'part', required: false },
        {
          model: db.QuestionMediaMap,
          as: 'mediaMappings',
          required: false,
          include: [{
            model: db.MediaFiles,
            as: 'media',
            attributes: ['id', 'mediaType', 'mediaUrl', 'description', 'duration'],
            required: false
          }],
          attributes: ['id', 'mediaId', 'startSecond', 'endSecond', 'sortOrder']
        }
      ],
      logging: console.log // 🪶 Log SQL query để debug nếu cần
    });

    // ✅ Sắp xếp lại theo thứ tự ID trong danh sách ML (để đồng nhất frontend)
    const orderedQuestions = questions.sort((a, b) =>
      questionIds.indexOf(a.id) - questionIds.indexOf(b.id)
    );

    // ✅ Chuyển đổi dữ liệu media giống chuẩn RandomQuestionsByTestId
    const transformedQuestions = orderedQuestions.map(q => {
      const qData = q.toJSON();

      if (qData.mediaMappings) {
        qData.mediaMappings = qData.mediaMappings.map(mapping => ({
          ...mapping,
          media: mapping.media
            ? {
                id: mapping.media.id,
                type: mapping.media.mediaType,
                url: mapping.media.mediaUrl,
                description: mapping.media.description,
                duration: mapping.media.duration
              }
            : null
        }));
      }

      return qData;
    });

    console.log(`📤 Sending ${transformedQuestions.length} questions with full details`);

    return res.status(200).json({
      code: 200,
      message: "Detailed recommendations retrieved successfully",
      data: {
        weak_skills: mlData.weakSkills || mlData.weak_skills || [],
        questions: transformedQuestions
      }
    });
  } catch (error) {
    console.error("❌ Error in getRecommendationDetails:", error);
    return res.status(500).json({
      code: 500,
      message: "Failed to get recommendation details",
      error: error.message
    });
  }
};

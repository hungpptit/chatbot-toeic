import db from "../models/index.js";
const {
  Op
} = db.Sequelize;
const Test = db.Test;
const Users = db.User;
const UserTests = db.UserTest;
const Part = db.Part;
const UserResult = db.UserResult;
const Question = db.Question;
/**
 * Thống kê số lần làm đề và tổng thời gian làm đề (tính bằng giây)
 * @param {number} userId 
 * @returns {Promise<{ totalAttempts: number, totalTimeSeconds: number }>}
 */
const getUserTestStats = async userId => {
  try {
    const userTests = await UserTests.findAll({
      where: {
        userId,
        startedAt: {
          [db.Sequelize.Op.ne]: null
        },
        completedAt: {
          [db.Sequelize.Op.ne]: null
        }
      },
      attributes: ['startedAt', 'completedAt']
    });
    const totalAttempts = userTests.length;
    const totalTimeSeconds = userTests.reduce((total, test) => {
      const start = new Date(test.startedAt);
      const end = new Date(test.completedAt);
      const seconds = Math.floor((end - start) / 1000);
      return total + (seconds > 0 ? seconds : 0);
    }, 0);
    return {
      totalAttempts,
      totalTimeSeconds
    };
  } catch (error) {
    console.error("[getUserTestStats] Error:", error);
    throw error;
  }
};

/**
 * Lấy thống kê tổng hợp theo từng part cho user
 * @param {number} userId 
 * @returns {Promise<Array>} Mỗi phần có: name, done, avgTime, avgScore, maxScore, accuracy
 */
const getPartStatisticsByUser = async userId => {
  try {
    // Lấy danh sách part
    const parts = await Part.findAll();
    const results = [];
    for (const part of parts) {
      const userResults = await UserResult.findAll({
        include: [{
          model: Question,
          where: {
            partId: part.id
          },
          attributes: [] // không cần lấy gì từ question
        }, {
          model: UserTests,
          where: {
            userId,
            startedAt: {
              [Op.ne]: null
            },
            completedAt: {
              [Op.ne]: null
            }
          },
          attributes: ['id', 'startedAt', 'completedAt', 'score']
        }]
      });
      const doneSet = new Set();
      let totalTime = 0;
      let totalScore = 0;
      let maxScore = 0;
      let totalCorrect = 0;
      let totalQuestions = 0;
      for (const ur of userResults) {
        const ut = ur.UserTest;
        if (!ut) continue;
        const duration = (new Date(ut.completedAt) - new Date(ut.startedAt)) / 1000;
        totalTime += duration;
        totalQuestions += 1;
        if (ur.isCorrect) {
          totalCorrect += 1;
          totalScore += 1; // hoặc tùy theo cách bạn chấm
        }
        doneSet.add(ut.id);
        if (ut.score > maxScore) maxScore = ut.score;
      }
      const done = doneSet.size;
      results.push({
        name: part.name,
        done,
        avgTime: done ? Math.round(totalTime / done) : 0,
        avgScore: done ? Number((totalScore / done).toFixed(2)) : 0,
        maxScore,
        accuracy: totalQuestions ? Number((totalCorrect / totalQuestions * 100).toFixed(2)) : 0
      });
    }
    return results;
  } catch (err) {
    console.error('[getPartStatisticsByUser] Error:', err);
    throw err;
  }
};
const getAccuracyOverTime = async (userId, days = 30) => {
  try {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);
    const results = await UserResult.findAll({
      where: {
        userId,
        answeredAt: {
          [Op.gte]: dateLimit
        }
      },
      include: [{
        model: UserTests,
        required: true,
        attributes: ['id', 'startedAt', 'completedAt'],
        where: {
          startedAt: {
            [Op.ne]: null
          },
          completedAt: {
            [Op.ne]: null
          }
        }
      }]
    });
    console.log("🔍 [getAccuracyOverTime] Kết quả truy vấn:", results.length, "kết quả");
    // Nhóm theo ngày
    const grouped = {};
    for (const result of results) {
      const date = new Date(result.answeredAt).toISOString().slice(0, 10); // yyyy-mm-dd
      if (!grouped[date]) {
        grouped[date] = {
          total: 0,
          correct: 0
        };
      }
      grouped[date].total += 1;
      if (result.isCorrect) grouped[date].correct += 1;
    }
    const accuracyData = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, data]) => ({
      date,
      accuracy: Number((data.correct / data.total * 100).toFixed(2))
    }));
    return accuracyData;
  } catch (err) {
    console.error('[getAccuracyOverTime] Error:', err);
    throw err;
  }
};
const getAccuracyOverTests = async (userId, days = 30) => {
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - days);
  const results = await UserResult.findAll({
    where: {
      userId,
      answeredAt: {
        [Op.gte]: dateLimit
      }
    },
    include: [{
      model: UserTests,
      required: true,
      attributes: ['id', 'startedAt', 'completedAt'],
      where: {
        startedAt: {
          [Op.ne]: null
        },
        completedAt: {
          [Op.ne]: null
        }
      }
    }]
  });
  const grouped = {};
  for (const result of results) {
    const testId = result.UserTest?.id;
    const date = new Date(result.answeredAt).toISOString().slice(0, 10);
    if (!grouped[testId]) {
      grouped[testId] = {
        date,
        total: 0,
        correct: 0
      };
    }
    grouped[testId].total += 1;
    if (result.isCorrect) grouped[testId].correct += 1;
  }
  const accuracyData = Object.values(grouped).map(({
    date,
    total,
    correct
  }) => ({
    date,
    // hoặc `date + ' - Test #' + testId` nếu muốn phân biệt
    accuracy: Number((correct / total * 100).toFixed(2))
  }));
  return accuracyData;
};
const getUserTestHistory = async userId => {
  const userTests = await UserTests.findAll({
    where: {
      userId,
      startedAt: {
        [Op.ne]: null
      },
      completedAt: {
        [Op.ne]: null
      }
    },
    order: [['completedAt', 'DESC']],
    include: [{
      model: db.Test,
      attributes: ['title']
    }, {
      model: db.UserResult,
      attributes: ['isCorrect']
    }]
  });
  return userTests.map(test => {
    const correct = test.UserResults.filter(r => r.isCorrect).length;
    const total = test.UserResults.length;
    const duration = getDuration(test.startedAt, test.completedAt); // ví dụ "0:08:51"

    return {
      userTestId: test.id,
      date: test.completedAt.toISOString().slice(0, 10),
      title: test.Test?.title || 'Không rõ',
      correct,
      total,
      duration
    };
  });
};
function getDuration(start, end) {
  const seconds = Math.floor((end - start) / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}:${mm.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
export { getUserTestStats, getPartStatisticsByUser, getAccuracyOverTests, getAccuracyOverTime, getUserTestHistory };
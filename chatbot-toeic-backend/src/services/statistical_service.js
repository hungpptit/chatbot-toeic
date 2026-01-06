import db from "../models/index.js";
import { toToeicScore, toeicMaxScore } from "../utils/toeicScoring.js";
const { Op } = db.Sequelize;

const Test = db.Test;
const Users = db.User;
const UserTests = db.UserTest;
const TestQuestions = db.TestQuestion;
const Part = db.Part;
const UserResult = db.UserResult;
const Question = db.Question;

const getDateLimitFromLastCompletedTest = async (userId, days) => {
  const parsedDays = Number(days);
  if (!Number.isFinite(parsedDays) || parsedDays <= 0) return null;

  const lastCompletedAt = await UserTests.max('completedAt', {
    where: {
      userId,
      status: 'completed',
      testId: { [Op.ne]: null },
      startedAt: { [Op.ne]: null },
      completedAt: { [Op.ne]: null },
    },
  });

  if (!lastCompletedAt) return null;
  const base = new Date(lastCompletedAt);
  if (Number.isNaN(base.getTime())) return null;

  // Treat "days" as calendar days counted backward from the last completed test's date.
  // days=1 => start of that same day.
  // days=7 => start of day, minus 6 days.
  const startOfLastDay = new Date(base);
  startOfLastDay.setHours(0, 0, 0, 0);

  const dateLimit = new Date(startOfLastDay);
  dateLimit.setDate(dateLimit.getDate() - (parsedDays - 1));
  return dateLimit;
};
/**
 * Thống kê số lần làm đề và tổng thời gian làm đề (tính bằng giây)
 * @param {number} userId 
 * @returns {Promise<{ totalAttempts: number, totalTimeSeconds: number }>}
 */
const getUserTestStats = async (userId, days) => {
  try {
    const dateLimit = await getDateLimitFromLastCompletedTest(userId, days);
    const userTests = await UserTests.findAll({
      where: {
        userId,
        status: 'completed',
        testId: { [Op.ne]: null },
        startedAt: { [db.Sequelize.Op.ne]: null },
        completedAt: {
          [db.Sequelize.Op.ne]: null,
          ...(dateLimit ? { [Op.gte]: dateLimit } : {}),
        },
      },
      attributes: ['id', 'testId', 'startedAt', 'completedAt', 'score'],
    });

    const totalAttempts = userTests.length;

    const totalTimeSeconds = userTests.reduce((total, test) => {
      const start = new Date(test.startedAt);
      const end = new Date(test.completedAt);
      const seconds = Math.floor((end - start) / 1000);
      return total + (seconds > 0 ? seconds : 0);
    }, 0);

    // Compute totals per test (exam) and per attempt (practice)
    const attempts = userTests.map(t => ({ id: t.id, testId: t.testId }));

    const examTestIds = Array.from(new Set(attempts.filter(a => a.testId != null).map(a => a.testId)));
    const examCountsByTestId = new Map();

    if (examTestIds.length) {
      const rows = await TestQuestions.findAll({
        where: { testId: examTestIds },
        attributes: [
          'testId',
          [db.Sequelize.fn('COUNT', db.Sequelize.col('questionId')), 'totalQuestions'],
        ],
        group: ['testId'],
        raw: true,
      });

      for (const r of rows) {
        examCountsByTestId.set(Number(r.testId), Number(r.totalQuestions) || 0);
      }
    }

    // Aggregate results per attempt: answered + correct
    const attemptIds = attempts.map(a => a.id);
    const resultAgg = new Map();
    if (attemptIds.length) {
      const rows = await UserResult.findAll({
        where: { userTestId: attemptIds },
        attributes: [
          'userTestId',
          [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'answered'],
          [
            db.Sequelize.fn(
              'SUM',
              db.Sequelize.literal('CASE WHEN isCorrect = 1 THEN 1 ELSE 0 END')
            ),
            'correct',
          ],
        ],
        group: ['userTestId'],
        raw: true,
      });

      for (const r of rows) {
        resultAgg.set(Number(r.userTestId), {
          answered: Number(r.answered) || 0,
          correct: Number(r.correct) || 0,
        });
      }
    }

    // Recompute scores from correctness so stored legacy scores can't break denominators
    const scores = [];
    let maxScore = 0;
    const maxScoreTotal = 990;
    for (const a of attempts) {
      const agg = resultAgg.get(Number(a.id)) || { answered: 0, correct: 0 };
      const totalQuestions = a.testId != null
        ? (examCountsByTestId.get(Number(a.testId)) || 0)
        : agg.answered;

      const score = toToeicScore(agg.correct, totalQuestions);
      scores.push(score);

      if (score > maxScore) {
        maxScore = score;
      }
    }

    const avgScore = scores.length
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
      : 0;

    return { totalAttempts, totalTimeSeconds, avgScore, maxScore, maxScoreTotal };
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
const getPartStatisticsByUser = async (userId, days) => {
  try {
    const dateLimit = await getDateLimitFromLastCompletedTest(userId, days);
    // Lấy danh sách part
    const parts = await Part.findAll();

    const results = [];

  for (const part of parts) {
    const userResults = await UserResult.findAll({
      attributes: ['isCorrect'],
      include: [
        {
          model: Question,
          where: { partId: part.id },
          attributes: [],
        },
        {
          model: UserTests,
          where: {
            userId,
            status: 'completed',
            testId: { [Op.ne]: null },
            startedAt: { [Op.ne]: null },
            completedAt: {
              [Op.ne]: null,
              ...(dateLimit ? { [Op.gte]: dateLimit } : {}),
            },
          },
          attributes: ['id', 'startedAt', 'completedAt'],
        },
      ],
    });

    // Group by UserTest so durations aren't multiplied by number of questions
    const byTest = new Map();
    let totalCorrect = 0;
    let totalQuestions = 0;

    for (const ur of userResults) {
      const ut = ur.UserTest;
      if (!ut) continue;

      const userTestId = ut.id;
      if (!byTest.has(userTestId)) {
        const durationSeconds = (new Date(ut.completedAt) - new Date(ut.startedAt)) / 1000;
        byTest.set(userTestId, {
          durationSeconds: durationSeconds > 0 ? durationSeconds : 0,
          total: 0,
          correct: 0,
        });
      }

      const agg = byTest.get(userTestId);
      agg.total += 1;
      totalQuestions += 1;
      if (ur.isCorrect) {
        agg.correct += 1;
        totalCorrect += 1;
      }
    }

    const done = byTest.size;
    const totalTime = Array.from(byTest.values()).reduce((sum, t) => sum + t.durationSeconds, 0);

    const scoresByAttempt = Array.from(byTest.values()).map(t => toToeicScore(t.correct, t.total));
    const avgScore = done
      ? Math.round(scoresByAttempt.reduce((sum, s) => sum + s, 0) / done)
      : 0;
    const maxScore = done ? Math.max(...scoresByAttempt) : 0;

    const maxScoreTotal = 990;

    results.push({
      name: part.name,
      done,
      avgTime: done ? Math.round(totalTime / done) : 0,
      avgScore,
      maxScore,
      maxScoreTotal,
      accuracy: totalQuestions ? Number(((totalCorrect / totalQuestions) * 100).toFixed(2)) : 0,
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
      const dateLimit = (await getDateLimitFromLastCompletedTest(userId, days)) || (() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - (Number(days) - 1));
        return d;
      })();

      // Use completedAt-based window to match other analytics cards.
      // This avoids discrepancies when answeredAt is stored in UTC or when a test spans midnight.
      const tests = await UserTests.findAll({
        where: {
          userId,
          status: 'completed',
          testId: { [Op.ne]: null },
          startedAt: { [Op.ne]: null },
          completedAt: {
            [Op.ne]: null,
            [Op.gte]: dateLimit,
          },
        },
        attributes: ['id', 'completedAt'],
        include: [
          {
            model: UserResult,
            required: true,
            attributes: ['isCorrect'],
          },
        ],
        order: [['completedAt', 'ASC']],
      });

      const grouped = {};
      for (const t of tests) {
        const date = new Date(t.completedAt).toISOString().slice(0, 10);
        if (!grouped[date]) grouped[date] = { total: 0, correct: 0 };

        const results = Array.isArray(t.UserResults) ? t.UserResults : [];
        grouped[date].total += results.length;
        grouped[date].correct += results.filter(r => r.isCorrect).length;
      }

    const accuracyData = Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        accuracy: Number(((data.correct / data.total) * 100).toFixed(2)),
      }));

    return accuracyData;
  } catch (err) {
    console.error('[getAccuracyOverTime] Error:', err);
    throw err;
  }
};

const getAccuracyOverTests = async (userId, days = 30) => {
  const dateLimit = (await getDateLimitFromLastCompletedTest(userId, days)) || (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (Number(days) - 1));
    return d;
  })();

  const tests = await UserTests.findAll({
    where: {
      userId,
      status: 'completed',
      testId: { [Op.ne]: null },
      startedAt: { [Op.ne]: null },
      completedAt: {
        [Op.ne]: null,
        [Op.gte]: dateLimit,
      },
    },
    attributes: ['id', 'completedAt'],
    include: [
      {
        model: UserResult,
        required: true,
        attributes: ['isCorrect'],
      },
    ],
    order: [['completedAt', 'ASC']],
  });

  return tests.map(t => {
    const results = Array.isArray(t.UserResults) ? t.UserResults : [];
    const total = results.length;
    const correct = results.filter(r => r.isCorrect).length;
    return {
      date: new Date(t.completedAt).toISOString().slice(0, 10),
      accuracy: total ? Number(((correct / total) * 100).toFixed(2)) : 0,
    };
  });
};

const getUserTestHistory = async (userId, days) => {
  const dateLimit = await getDateLimitFromLastCompletedTest(userId, days);
  const userTests = await UserTests.findAll({
    where: {
      userId,
      status: 'completed',
      testId: { [Op.ne]: null },
      startedAt: { [Op.ne]: null },
      completedAt: {
        [Op.ne]: null,
        ...(dateLimit ? { [Op.gte]: dateLimit } : {}),
      },
    },
    order: [['completedAt', 'DESC']],
    include: [
      {
        model: db.Test,
        attributes: ['title'],
      },
      {
        model: db.UserResult,
        attributes: ['isCorrect'],
      },
    ],
  });

  return userTests.map(test => {
    const correct = test.UserResults.filter(r => r.isCorrect).length;
    const total = test.UserResults.length;
    const duration = getDuration(test.startedAt, test.completedAt); // ví dụ "0:08:51"

    return {
      userTestId: test.id,
      date: test.completedAt.toISOString().slice(0, 10),
      title: test.Test?.title || 'Bài luyện tập thích ứng (Adaptive Practice)',
      correct,
      total,
      duration,
    };
  });
};

function getDuration(start, end){
  const seconds = Math.floor((end - start) / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}:${mm.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}


export  {
  getUserTestStats, 
  getPartStatisticsByUser,
  getAccuracyOverTests,
  getAccuracyOverTime,
  getUserTestHistory
}
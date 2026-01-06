// Convert correctness into an approximate TOEIC-like score.
// User requirement:
// - Full TOEIC: 200 questions => maxScore = 990
// - Shorter tests: maxScore scales by question count:
//   maxScore = 990 * (totalQuestions / 200)
// - Score = (correct / totalQuestions) * maxScore
// NOTE: Real TOEIC uses a conversion table; this is a linear approximation.

export const clampNumber = (value, min, max) => {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
};

export const roundToNearest = (value, step) => {
  if (!step || step <= 0) return value;
  return Math.round(value / step) * step;
};

export const toToeicScoreFromRatio = (ratio, { maxScore = 990, roundStep = 1 } = {}) => {
  const safeRatio = clampNumber(ratio, 0, 1);
  const raw = safeRatio * maxScore;
  const rounded = roundToNearest(raw, roundStep);
  return clampNumber(rounded, 0, maxScore);
};

export const toeicMaxScore = (totalQuestions, { fullQuestions = 200, fullScore = 990, roundStep = 1 } = {}) => {
  const total = Number(totalQuestions) || 0;
  if (total <= 0) return 0;
  const rawMax = (fullScore * total) / fullQuestions;
  const roundedMax = roundToNearest(rawMax, roundStep);
  return clampNumber(roundedMax, 0, fullScore);
};

export const toToeicScore = (correctCount, totalQuestions, opts) => {
  const total = Number(totalQuestions) || 0;
  const correct = Number(correctCount) || 0;
  if (total <= 0) return 0;
  const maxScore = toeicMaxScore(total, opts);
  return toToeicScoreFromRatio(correct / total, { ...(opts || {}), maxScore });
};

// Backward-compat: some historical rows stored score on a 0–10 scale.
// If it looks like that, convert to 0–990 (approx).
export const normalizeStoredScoreToToeic = (storedScore, { maxScore = 990, roundStep = 5 } = {}) => {
  const s = Number(storedScore);
  if (!Number.isFinite(s)) return 0;

  // If score is already in TOEIC range, keep it.
  // Do NOT round here: DB may already store integer scores like 347.
  if (s > 10) return clampNumber(s, 0, maxScore);

  // Treat <= 10 as legacy 0–10 scale.
  return toToeicScoreFromRatio(s / 10, { maxScore, roundStep });
};

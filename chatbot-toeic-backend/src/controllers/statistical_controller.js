import {getUserTestStats,
  getPartStatisticsByUser,
  getAccuracyOverTime,
  getUserTestHistory
} from "../services/statistical_service.js";

const getUserTestStatsController = async (req, res) => {
  const userId = req.user?.id; 

    if (isNaN(userId)) {
    return res.status(400).json({ message: "userId không hợp lệ." });
  }
  try {
    const stats = await getUserTestStats(userId);
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching user test stats:', error);
    res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
}

const getPartStatisticsByUserController = async (req, res) => {
  const userId = req.user?.id;

  if (isNaN(userId)) {
    return res.status(400).json({ message: "userId không hợp lệ." });
  }

  try {
    const stats = await getPartStatisticsByUser(userId);
    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching part statistics:", error);
    res.status(500).json({ message: "Internal server error", code: "INTERNAL_ERROR" });
  }
};

const getAccuracyOverTimeController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const days = parseInt(req.query.days) || 30;

    if (!userId) return res.status(400).json({ message: 'Thiếu user' });

    const data = await getAccuracyOverTime(userId, days);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
};


const getUserTestHistoryController = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy từ middleware xác thực JWT

    if (!userId) {
      return res.status(401).json({ message: 'Người dùng chưa đăng nhập.' });
    }

    const history = await getUserTestHistory(userId);

    res.status(200).json({
      message: 'Lấy lịch sử làm bài thành công.',
      data: history,
    });
  } catch (error) {
    console.error('[getUserTestHistoryController] Lỗi:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy lịch sử làm bài.' });
  }
};

export {
  getUserTestStatsController,   
  getPartStatisticsByUserController,
  getAccuracyOverTimeController,
  getUserTestHistoryController
};
import "../styles/testReview.css";
import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserTestHistoryByTestIdAPI } from "../services/question_test_services";

interface UserTestHistory {
  date: string;
  score: string;
  duration: string;
  userTestId: number;
}

export default function TestReview() {
  const { testId } = useParams(); // ✅ lấy testId từ URL
  console.log("🔍 testId:", testId);
  const location = useLocation();
  const testTitle = location.state?.title || "New Economy TOEIC Test";

  const [history, setHistory] = useState<UserTestHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!testId) return;
      try {
        const data = await getUserTestHistoryByTestIdAPI(Number(testId));
        console.log("✅ History fetched:", data); // ✅ Debug
        setHistory(data);
      } catch (error) {
        console.error("❌ Lỗi lấy lịch sử:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [testId]);

  return (
    <div className="review-page">
      <div className="review-container">
        <div className="review1">{testTitle}</div>
        <div className="review2">
          <h3>Kết quả làm bài của bạn:</h3>
          <table className="result-table">
            <thead>
              <tr>
                <th>Ngày làm</th>
                <th>Kết quả</th>
                <th>Thời gian làm bài</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4}>Đang tải...</td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={4}>Chưa có lịch sử làm bài</td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.userTestId}>
                    <td>{item.date}</td>
                    <td>{item.score}</td>
                    <td>{item.duration}</td>
                    <td>
                      <a href="#">Xem chi tiết</a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

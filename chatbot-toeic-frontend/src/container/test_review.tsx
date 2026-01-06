import "../styles/testReview.css";
import { useParams, useLocation, Link } from "react-router-dom";
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
  const [testTitle, setTestTitle] = useState<string>(location.state?.title || "New Economy TOEIC Test");

  const [history, setHistory] = useState<UserTestHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!testId) return;
      try {
        const res = await getUserTestHistoryByTestIdAPI(Number(testId));
        console.log("✅ History fetched:", res); // ✅ Debug
        setHistory(res.history);

        if (!location.state?.title && res.testTitle) {
          setTestTitle(res.testTitle);
        }
      } catch (error) {
        console.error("❌ Lỗi lấy lịch sử:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [testId, location.state?.title]);

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
                      <Link to={`/test-review-detail/${item.userTestId}`} state={{ mode: "review" }}>
                        Xem chi tiết
                      </Link>
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

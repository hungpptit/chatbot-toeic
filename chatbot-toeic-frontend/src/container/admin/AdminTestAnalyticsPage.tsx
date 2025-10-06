import '../../styles/AdminTestAnalyticsPage.css';
import { useEffect } from 'react';
import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {getUserTestStatsAPI, getPartStatisticsByUserAPI, type PartStat, getAccuracyOverTimeAPI, type AccuracyPoint, getUserTestHistoryAPI, type UserTestHistoryItem} from '../../services/statisticalService';
import { getCurrentUser } from '../../services/authService';
// import {getAllPartsAPI, type Part, } from '../../services/adminTestService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
// Demo dữ liệu biểu đồ



const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: { color: '#ff6699', font: { size: 16 } },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => `${context.parsed.y}%`,
      },
    },
  },
  scales: {
    y: {
      min: 0,
      max: 100,
      ticks: { color: '#888', font: { size: 14 } },
      grid: { color: '#eee' },
    },
    x: {
      ticks: { color: '#888', font: { size: 14 } },
      grid: { color: '#eee' },
    },
  },
};





export default function AdminTestAnalyticsPage() {
  const [activeSection, setActiveSection] = useState(0);
  const [stats, setStats] = useState({
    totalTests: 0,
    totalMinutes: 0,
    targetScore: null,
    sections: [] as PartStat[],
  });
  const [, setUser] = useState<{ id: string } | null>(null);
  const [sectionNames, setSectionNames] = useState<string[]>([]);
  const [chartPoints, setChartPoints] = useState<AccuracyPoint[]>([]);
  const [testHistory, setTestHistory] = useState<UserTestHistoryItem[]>([]);



  useEffect(() => {
    const fetchUserAndStats = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (currentUser?.id) {
          const [general, partStats] = await Promise.all([
            getUserTestStatsAPI(), // không cần truyền userId nếu backend lấy từ token
            getPartStatisticsByUserAPI(),
          ]);

          setStats({
            totalTests: general.totalAttempts,
            totalMinutes: Math.floor(general.totalTimeSeconds / 60),
            targetScore: null,
            sections: partStats.map(p => ({
              ...p,
              maxScoreTotal: 9 // giả sử mỗi part tối đa 9 điểm
            })),
          });

          // Đồng bộ section name từ partStats nếu bạn không cần gọi getAllPartsAPI()
          setSectionNames(partStats.map(p => p.name));
        }
      } catch (err) {
        console.error("❌ Lỗi khi lấy user/stats:", err);
      }
    };

    fetchUserAndStats();
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const data = await getAccuracyOverTimeAPI(30);
        setChartPoints(data);
      } catch (error) {
        console.error('❌ Lỗi lấy dữ liệu biểu đồ:', error);
      }
    };

    fetchChartData();
  }, []);

  useEffect(() => {
    const fetchTestHistory = async () => {
      try {
        const data = await getUserTestHistoryAPI();
        setTestHistory(data);
      } catch (error) {
        console.error('❌ Lỗi khi lấy lịch sử đề thi:', error);
      }
    };

    fetchTestHistory();
  }, []);




  const currentPartName = sectionNames[activeSection];
  const currentStats = stats.sections.find(p => p.name === currentPartName);

  const chartData = {
    labels: chartPoints.map(p => p.date),
    datasets: [
      {
        label: '%Correct (30D)',
        data: chartPoints.map(p => p.accuracy),
        fill: false,
        borderColor: '#ff6699',
        backgroundColor: '#ff6699',
        tension: 0.3,
        pointBackgroundColor: '#ff6699',
        pointBorderColor: '#ff6699',
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };


  return (
    <div className="analytics-scroll-page">
      <div className="user-analytics-page">
        <div className="filter-row">
          <label>Lọc kết quả theo ngày (tính từ bài thi cuối):</label>
          <select className="filter-select">
            <option>30 ngày</option>
            <option>7 ngày</option>
            <option>90 ngày</option>
          </select>
          <button className="btn-search">Search</button>
          <button className="btn-clear">Clear</button>
        </div>
        <div className="summary-row">
          <div className="summary-card">
            <div className="summary-icon">📚</div>
            <div className="summary-title">Số đề đã làm</div>
            <div className="summary-value">{stats.totalTests}</div>
            <div className="summary-desc">đề thi</div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">⏰</div>
            <div className="summary-title">Thời gian luyện thi</div>
            <div className="summary-value">{stats.totalMinutes}</div>
            <div className="summary-desc">phút</div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">🎯</div>
            <div className="summary-title">Điểm mục tiêu</div>
            <div className="summary-value summary-link">Tạo ngay</div>
          </div>
        </div>
        <div className="section-tabs">
          {sectionNames.map((name, idx) => (
            <button
              key={name}
              className={idx === activeSection ? 'tab active' : 'tab'}
              onClick={() => setActiveSection(idx)}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="section-stats-row">
          <div className="section-card">
            <div className="section-title">Số đề đã làm</div>
            <div className="section-value">{currentStats?.done || 0}</div>
            <div className="section-desc">đề thi</div>
          </div>
          <div className="section-card">
            <div className="section-title">Độ chính xác (#đúng/#tổng)</div>
            <div className="section-value">{currentStats?.accuracy || 0}%</div>
          </div>
          <div className="section-card">
            <div className="section-title">Thời gian trung bình</div>
            <div className="section-value">{currentStats?.avgTime || 0}</div>
          </div>
          <div className="section-card">
            <div className="section-title">Điểm trung bình</div>
            <div className="section-value">{currentStats?.avgScore || 0}/9.0</div>
          </div>
          <div className="section-card">
            <div className="section-title">Điểm cao nhất</div>
            <div className="section-value">{currentStats?.maxScore || 0}/{currentStats?.maxScoreTotal || 9}</div>
          </div>
        </div>

        {/* Chart card moved to a separate card below all other cards */}
        <div className="chart-card">
          <div className="chart-title">Thống kê kết quả theo thời gian</div>
          <Line data={chartData} options={chartOptions} height={320} />
        </div>
        {/* Test list card below chart */}
        <div className="test-list-card">
          <div className="test-list-title">Danh sách đề thi đã làm:</div>
          <table className="test-list-table">
            <thead>
              <tr>
                <th>Ngày làm</th>
                <th>Đề thi</th>
                <th>Kết quả</th>
                <th>Thời gian làm bài</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {testHistory.length === 0 ? (
                <tr>
                  <td colSpan={5}>Chưa có đề thi nào.</td>
                </tr>
              ) : (
                testHistory.map((item) => (
                  <tr key={item.userTestId}>
                    <td>{new Date(item.date).toLocaleDateString('vi-VN')}</td>
                    <td>{item.title} <span className="test-tag">Luyện tập</span></td>
                    <td>{item.correct}/{item.total}</td>
                    <td>{item.duration}</td>
                    <td>
                      <a
                        className="test-detail-link"
                        href={`/test-review-detail/${item.userTestId}`} // hoặc route phù hợp
                      >
                        Xem chi tiết
                      </a>
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

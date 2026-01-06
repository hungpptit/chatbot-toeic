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
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: { size: 14, weight: 'bold' as const },
      bodyFont: { size: 13 },
      callbacks: {
        title: (context: any) => {
          const date = new Date(context[0].label);
          return date.toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        },
        label: (context: any) => {
          return `Độ chính xác: ${context.parsed.y.toFixed(2)}%`;
        },
        afterLabel: (context: any) => {
          const accuracy = context.parsed.y;
          let performance = '';
          if (accuracy >= 80) {
            performance = '🎉 Xuất sắc! Tiếp tục phát huy!';
          } else if (accuracy >= 60) {
            performance = '👍 Khá tốt! Cố gắng thêm nhé!';
          } else if (accuracy >= 40) {
            performance = '📚 Cần cố gắng thêm!';
          } else {
            performance = '💪 Đừng bỏ cuộc, cố lên!';
          }
          return performance;
        }
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
  const [sectionNames, setSectionNames] = useState<string[]>(['Tất cả']); // Bắt đầu với tab "Tất cả"
  const [chartPoints, setChartPoints] = useState<AccuracyPoint[]>([]);
  const [testHistory, setTestHistory] = useState<UserTestHistoryItem[]>([]);

  const DAY_OPTIONS = [1, 7, 30, 90];
  const DEFAULT_DAYS = 7;
  const [daysInput, setDaysInput] = useState<number>(DEFAULT_DAYS);
  const [appliedDays, setAppliedDays] = useState<number>(DEFAULT_DAYS);


  useEffect(() => {
    const fetchUserAndStats = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (currentUser?.id) {
          const [general, partStats, chartDataPoints, history] = await Promise.all([
            getUserTestStatsAPI(appliedDays), // không cần truyền userId nếu backend lấy từ token
            getPartStatisticsByUserAPI(appliedDays),
            getAccuracyOverTimeAPI(appliedDays),
            getUserTestHistoryAPI(appliedDays),
          ]);

          // Lọc chỉ Part 1-7
          const filteredParts = partStats.filter(p => 
            p.name.match(/Part [1-7]$/)
          );

          // Tính tổng hợp cho tab "Tất cả"
          const allStats: PartStat = {
            name: 'Tất cả',
            done: filteredParts.reduce((sum, p) => sum + p.done, 0),
            avgTime: filteredParts.length > 0 
              ? Math.round(filteredParts.reduce((sum, p) => sum + p.avgTime, 0) / filteredParts.length)
              : 0,
            // ✅ Use overall test stats from backend (TOEIC 0-990)
            avgScore: general.avgScore || 0,
            maxScore: general.maxScore || 0,
            maxScoreTotal: general.maxScoreTotal || 990,
            accuracy: typeof general.accuracy === 'number'
              ? general.accuracy
              : (filteredParts.length > 0
                ? Number((filteredParts.reduce((sum, p) => sum + p.accuracy, 0) / filteredParts.length).toFixed(2))
                : 0)
          };

          setStats({
            totalTests: general.totalAttempts,
            totalMinutes: Math.floor(general.totalTimeSeconds / 60),
            targetScore: null,
            sections: [allStats, ...filteredParts.map(p => ({
              ...p,
              maxScoreTotal: p.maxScoreTotal || 990 // fallback
            }))],
          });

          // Thêm "Tất cả" vào đầu danh sách tabs
          setSectionNames(['Tất cả', ...filteredParts.map(p => p.name)]);

          setChartPoints(chartDataPoints);
          setTestHistory(history);
        }
      } catch (err) {
        console.error("❌ Lỗi khi lấy user/stats:", err);
      }
    };

    fetchUserAndStats();
  }, [appliedDays]);




  const currentPartName = sectionNames[activeSection] || 'Tất cả';
  const currentStats = stats.sections.find(p => p.name === currentPartName) || stats.sections[0];

  const chartData = {
    labels: chartPoints.map(p => p.date),
    datasets: [
      {
        label: `%Correct (${appliedDays}D)`,
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
          <select
            className="filter-select"
            value={daysInput}
            onChange={(e) => setDaysInput(Number(e.target.value) || DEFAULT_DAYS)}
          >
            {DAY_OPTIONS
              .slice()
              .sort((a, b) => a - b)
              .map(d => (
                <option key={d} value={d}>{d} ngày</option>
              ))}
          </select>
          <button className="btn-search" onClick={() => setAppliedDays(daysInput)}>Search</button>
          <button
            className="btn-clear"
            onClick={() => {
              setDaysInput(DEFAULT_DAYS);
              setAppliedDays(DEFAULT_DAYS);
            }}
          >
            Clear
          </button>
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
            <div className="section-value">
              {(() => {
                const totalSeconds = currentStats?.avgTime || 0;
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                
                if (hours > 0) {
                  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                } else {
                  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                }
              })()}
            </div>
          </div>
          <div className="section-card">
            <div className="section-title">Điểm trung bình</div>
            <div className="section-value">{currentStats?.avgScore || 0}/990</div>
          </div>
          <div className="section-card">
            <div className="section-title">Điểm cao nhất</div>
            <div className="section-value">{currentStats?.maxScore || 0}/990</div>
          </div>
        </div>

        {/* Chart card moved to a separate card below all other cards */}
        <div className="chart-card">
          <div className="chart-title">Thống kê kết quả theo thời gian</div>
          {chartPoints.length > 0 ? (
            <Line data={chartData} options={chartOptions} height={320} />
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px', 
              color: '#888',
              fontSize: '16px'
            }}>
              Chưa có dữ liệu để hiển thị biểu đồ. Hãy làm thêm bài test!
            </div>
          )}
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

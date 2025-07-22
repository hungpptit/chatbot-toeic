import './AdminTestAnalyticsPage.css';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
// Demo dữ liệu biểu đồ
const chartData = {
  labels: [
    '2025-03-10', '2025-03-19', '2025-03-20', '2025-03-21', '2025-03-22', '2025-03-25', '2025-03-27'
  ],
  datasets: [
    {
      label: '%Correct (30D)',
      data: [56.52, 62.5, 58.06, 41.94, 50, 10, 14.29],
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

const demoStats = {
  totalTests: 15,
  totalMinutes: 836,
  targetScore: null,
  sections: [
    {
      name: 'Listening',
      done: 8,
      accuracy: 47.8,
      avgTime: 0,
      avgScore: 0,
      maxScore: 0,
      maxScoreTotal: 9,
    },
    // ... các section khác
  ],
};

const sectionNames = ['Listening', 'Reading', 'Writing', 'Speaking'];

export default function AdminTestAnalyticsPage() {
  const [activeSection, setActiveSection] = useState(0);
  const stats = demoStats;

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
            <div className="section-value">{stats.sections[activeSection]?.done || 0}</div>
            <div className="section-desc">đề thi</div>
          </div>
          <div className="section-card">
            <div className="section-title">Độ chính xác (#đúng/#tổng)</div>
            <div className="section-value">{stats.sections[activeSection]?.accuracy || 0}%</div>
          </div>
          <div className="section-card">
            <div className="section-title">Thời gian trung bình</div>
            <div className="section-value">{stats.sections[activeSection]?.avgTime || 0}</div>
          </div>
          <div className="section-card">
            <div className="section-title">Điểm trung bình</div>
            <div className="section-value">{stats.sections[activeSection]?.avgScore || 0}/9.0</div>
          </div>
          <div className="section-card">
            <div className="section-title">Điểm cao nhất</div>
            <div className="section-value">{stats.sections[activeSection]?.maxScore || 0}/{stats.sections[activeSection]?.maxScoreTotal || 9}</div>
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
              {/* Demo data, replace with real data if available */}
              <tr>
                <td>27/03/2025</td>
                <td>IELTS Simulation Listening test 8 <span className="test-tag">Luyện tập</span> <span className="test-tag">Recording 4</span></td>
                <td>0/10</td>
                <td>0:12:38</td>
                <td><a className="test-detail-link" href="#">Xem chi tiết</a></td>
              </tr>
              <tr>
                <td>27/03/2025</td>
                <td>IELTS Simulation Listening test 8 <span className="test-tag">Luyện tập</span> <span className="test-tag">Recording 3</span></td>
                <td>7/10</td>
                <td>0:08:35</td>
                <td><a className="test-detail-link" href="#">Xem chi tiết</a></td>
              </tr>
              <tr>
                <td>27/03/2025</td>
                <td>IELTS Simulation Listening test 8 <span className="test-tag">Luyện tập</span> <span className="test-tag">Recording 3</span></td>
                <td>3/10</td>
                <td>0:09:44</td>
                <td><a className="test-detail-link" href="#">Xem chi tiết</a></td>
              </tr>
              <tr>
                <td>27/03/2025</td>
                <td>IELTS Simulation Listening test 8 <span className="test-tag">Luyện tập</span> <span className="test-tag">Recording 2</span></td>
                <td>7/10</td>
                <td>0:09:31</td>
                <td><a className="test-detail-link" href="#">Xem chi tiết</a></td>
              </tr>
              <tr>
                <td>27/03/2025</td>
                <td>IELTS Simulation Listening test 8 <span className="test-tag">Luyện tập</span> <span className="test-tag">Recording 2</span></td>
                <td>0/10</td>
                <td>0:08:51</td>
                <td><a className="test-detail-link" href="#">Xem chi tiết</a></td>
              </tr>
              <tr>
                <td>27/03/2025</td>
                <td>IELTS Simulation Listening test 8 <span className="test-tag">Luyện tập</span> <span className="test-tag">Recording 1</span></td>
                <td>7/10</td>
                <td>0:33:54</td>
                <td><a className="test-detail-link" href="#">Xem chi tiết</a></td>
              </tr>
              <tr>
                <td>27/03/2025</td>
                <td>IELTS Simulation Listening test 8 <span className="test-tag">Luyện tập</span> <span className="test-tag">Recording 1</span></td>
                <td>1/10</td>
                <td>0:11:29</td>
                <td><a className="test-detail-link" href="#">Xem chi tiết</a></td>
              </tr>
              <tr>
                <td>25/03/2025</td>
                <td>IELTS Simulation Listening test 7 <span className="test-tag">Luyện tập</span> <span className="test-tag">Recording 1</span></td>
                <td>7/10</td>
                <td>0:06:20</td>
                <td><a className="test-detail-link" href="#">Xem chi tiết</a></td>
              </tr>
              <tr>
                <td>25/03/2025</td>
                <td>IELTS Simulation Listening test 7 <span className="test-tag">Luyện tập</span> <span className="test-tag">Recording 1</span></td>
                <td>1/10</td>
                <td>0:10:14</td>
                <td><a className="test-detail-link" href="#">Xem chi tiết</a></td>
              </tr>
              <tr>
                <td>22/03/2025</td>
                <td>IELTS Simulation Listening test 6 <span className="test-tag">Luyện tập</span> <span className="test-tag">Recording 4</span></td>
                <td>1/10</td>
                <td>0:05:37</td>
                <td><a className="test-detail-link" href="#">Xem chi tiết</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

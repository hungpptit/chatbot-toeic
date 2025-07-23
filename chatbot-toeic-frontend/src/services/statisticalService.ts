import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/statistical';

// Lấy thống kê bài kiểm tra của người dùng
export interface UserTestStats {
  totalAttempts: number;
  totalTimeSeconds: number;
}

export interface PartStat {
  name: string;
  done: number;
  avgTime: number;       // seconds
  avgScore: number;
  maxScore: number;
  maxScoreTotal: number;
  accuracy: number;      // percent
}

export interface AccuracyPoint {
  date: string;
  accuracy: number;
}


export interface UserTestHistoryItem  {
  userTestId: number;
  date: string; // yyyy-mm-dd
  title: string;
  correct: number;
  total: number;
  duration: string; // h:mm:ss
};

export const getUserTestStatsAPI = async () :Promise<UserTestStats> => {
  try {
    const response = await axios.get<UserTestStats>(`${API_BASE_URL}/user-tests`, {
      withCredentials: true, 
    });
   

    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy thống kê bài kiểm tra:", error);
    throw error;
  }
};

export const getPartStatisticsByUserAPI = async (): Promise<PartStat[]> => {
  try {
    const response = await axios.get<PartStat[]>(`${API_BASE_URL}/parts/statistics`, {
      withCredentials: true,
    });

    console.log("Thống kê theo phần:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy thống kê theo phần:", error);
    throw error;
  }
};




export const getAccuracyOverTimeAPI = async (days = 30): Promise<AccuracyPoint[]> => {
  const response = await axios.get<AccuracyPoint[]>(`${API_BASE_URL}/accuracy-over-time?days=${days}`, {
    withCredentials: true,
  });
  console.log("Thống kê độ chính xác theo thời gian:", response.data);
  return response.data;
};

export const getUserTestHistoryAPI = async (): Promise<UserTestHistoryItem[]> => {
  try {
    const response = await axios.get<{ data: UserTestHistoryItem[] }>(
      `${API_BASE_URL}/user-test-history`,
      { withCredentials: true } 
    );
    return response.data.data;
  } catch (error) {
    console.error('❌ Lỗi khi gọi getUserTestHistoryAPI:', error);
    throw error;
  }
};
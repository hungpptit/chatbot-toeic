import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/adminTest';

export interface Test {
    id: number;
    title: string;
    duration: number;
    participants: number;
    courses: [];
    questions: number;

}

// Lấy danh sách tất cả bài test
export const getAllTestsAPI = async (): Promise<Test[]> => {
  const response = await axios.get<Test[]>(`${API_BASE_URL}`, {
    withCredentials: true,
  });
  return response.data;
};
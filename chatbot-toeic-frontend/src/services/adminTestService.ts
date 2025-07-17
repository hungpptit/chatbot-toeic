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
export interface QuestionType {
    id: number;
    name: string;
}
export interface Part {
    id: number;
    name: string;
}

// Lấy danh sách tất cả bài test
export const getAllTestsAPI = async (): Promise<Test[]> => {
  const response = await axios.get<Test[]>(`${API_BASE_URL}`, {
    withCredentials: true,
  });
  return response.data;
};

// Lấy danh sách tất cả loại câu hỏi
export const getAllQuestionTypesAPI = async (): Promise<QuestionType[]> => {
  const response = await axios.get<QuestionType[]>(`${API_BASE_URL}/question-types`, {
    withCredentials: true,
  });
  return response.data;
};

// Lấy danh sách tất cả các phần
export const getAllPartsAPI = async (): Promise<Part[]> => {
  const response = await axios.get<Part[]>(`${API_BASE_URL}/parts`, {
    withCredentials: true,
  });
  return response.data;
}
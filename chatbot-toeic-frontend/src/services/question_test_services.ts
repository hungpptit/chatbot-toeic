import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/questionTest';

export interface QuestionType {
  id: number;
  name: string;
  description: string;
}

export interface Part {
  id: number;
  name: string;
}

export interface Question {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  typeId: number;
  partId: number;
  
  questionType: QuestionType;
  part: Part;
}

export const getQuestionsByTestIdAPI = async (testId: number): Promise<Question[]> => {
  const response = await axios.get<Question[]>(`${API_BASE_URL}/Detail/${testId}`,  { withCredentials: true,    });
  return response.data;
};

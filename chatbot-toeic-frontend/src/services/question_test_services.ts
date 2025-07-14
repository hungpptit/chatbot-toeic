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

export interface Answer {
  questionId: number;
  selectedAnswer: string;
}

export interface SubmitResult {
  correctCount: number;
  total: number;
  incorrectAnswers: {
    questionId: number;
    correctAnswer: string;
    selectedAnswer: string;
    explanation: string;
  }[];
}

export const getQuestionsByTestIdAPI = async (testId: number): Promise<Question[]> => {
  const response = await axios.get<Question[]>(`${API_BASE_URL}/Detail/${testId}`,  { withCredentials: true,    });
  return response.data;
};

// nộp bài 

export const submitTestAPI = async (
  testId: number,

  answers: Answer[]
): Promise<SubmitResult> => {
  const response = await axios.post<SubmitResult>(
    `${API_BASE_URL}/Submit/${testId}`,

    { answers },
    { withCredentials: true }
  );
  console.log("check data gửi lên: ", response.data);
  return response.data;
};
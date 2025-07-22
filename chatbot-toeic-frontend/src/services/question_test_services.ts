import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/questionTest';

// ======================== INTERFACES ========================

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
  id: number ; // Use null if the question is new and doesn't have an ID yet
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  typeId: number;
  partId: number;

  // questionType: QuestionType;
  // part: Part;
}

export interface Answer {
  questionId: number;
  selectedAnswer: string;
}

export interface IncorrectAnswer {
  questionId: number;
  correctAnswer: string;
  selectedAnswer: string;
  explanation: string;
}

export interface SubmitResult {
  message: string;
  userTestId: number;
  correctCount: number;
  total: number;
  score: number;
  incorrectAnswers: IncorrectAnswer[];
}

export interface StartTestResult {
  userTestId: number;
  message: string;
}

export interface UserTestHistory {
  date: string;
  score: string; // dạng "7/40"
  duration: string; // "HH:mm:ss"
  userTestId: number;
}

export interface UserTestDetailItem {
  questionId: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  typeId: number;
  partId:number;
  selectedOption: string | null;
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  answeredAt: string; // ISO Date string
}

export interface UserTestDetailResult {
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  details: UserTestDetailItem[];
}

// ======================== APIS ========================

// Lấy danh sách câu hỏi theo testId
export const getQuestionsByTestIdAPI = async (testId: number): Promise<Question[]> => {
  const response = await axios.get<Question[]>(
    `${API_BASE_URL}/Detail/${testId}`,
    { withCredentials: true }
  );
  return response.data;
};

export const updateQuestionAPI = async (
  id: number,
  updatedData: Partial<Question>
): Promise<Question> => {
  const response = await axios.put<Question>(
    `${API_BASE_URL}/update-question`,
    {
      id, 
      ...updatedData
    },
    { withCredentials: true }
  );
  return response.data;
};

// Bắt đầu làm bài (gọi khi user nhấn "Bắt đầu")
export const startTestAPI = async (testId: number): Promise<StartTestResult> => {
  const response = await axios.post<StartTestResult>(
    `${API_BASE_URL}/StartTest/${testId}`,
    {},
    { withCredentials: true }
  );
  console.log("Start test result: ", response.data);
  return response.data;
};

// Nộp bài
export const submitTestAPI = async (
  testId: number,
  answers: Answer[]
): Promise<SubmitResult> => {
  const response = await axios.post<SubmitResult>(
    `${API_BASE_URL}/Submit/${testId}`,
    { answers },
    { withCredentials: true }
  );
  console.log("Submit test response:", response);
  console.log("Submit test result (data):", response.data);
  return response.data;
};

export const getUserTestHistoryByTestIdAPI = async (testId: number) => {
  try {
    const res = await axios.get<{ message: string; data: UserTestHistory[] }>(
      `${API_BASE_URL}/HistoryTest/${testId}`,
      {
        withCredentials: true, // nếu backend dùng cookie hoặc cần token
      }
    );
    return res.data.data;
  } catch (error: any) {
    console.error("Error fetching test history:", error);
    throw error.response?.data || { message: "Unknown error" };
  }
};


export const getUserTestDetailByIdAPI = async (userTestId: number): Promise<UserTestDetailResult> => {
  try {
    const response = await axios.get<{ message: string; data: UserTestDetailResult }>(
      `${API_BASE_URL}/DetailResult/${userTestId}`,
      { withCredentials: true }
    );
    console.log("test data nhận từ api: " ,response.data.data);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching user test details:", error);
    throw error.response?.data || { message: "Unknown error" };
  }
};
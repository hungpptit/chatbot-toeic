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

export interface Question {
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

export interface TestCreate {
    title: string;
    courseId: number;
    questions: Question[];
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


// Tạo mới một Part
export const createPartAPI = async (name: string): Promise<Part> => {
  const response = await axios.post<Part>(
    `${API_BASE_URL}/parts`,
    { name },
    { withCredentials: true }
  );
  return response.data;
};

// Tạo mới một QuestionType
export const createQuestionTypeAPI = async (
  name: string,
  description?: string
): Promise<QuestionType> => {
  const response = await axios.post<QuestionType>(
    `${API_BASE_URL}/question-types`,
    { name, description },
    { withCredentials: true }
  );
  return response.data;
};



// Xóa một Part theo id
export const deletePartAPI = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/parts/${id}`, {
    withCredentials: true,
  });
};

// Xóa một QuestionType theo id
export const deleteQuestionTypeAPI = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/question-types/${id}`, {
    withCredentials: true,
  });
};

// Tạo mới một bài test
export const createNewTestAPI = async (testData: TestCreate): Promise<TestCreate> => {
  const response = await axios.post<TestCreate>(
    `${API_BASE_URL}/createTestNew`,
    testData,
    { withCredentials: true }
  );
  return response.data;
};
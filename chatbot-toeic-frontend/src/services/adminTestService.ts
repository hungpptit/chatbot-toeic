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
  skillId?: number | null;

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


export interface Skill {
  id: number;
  name: string;
  description?: string;
  parentId?: number | null;
  parent?: Skill | null;
  children?: Skill[];
}

// interface DeleteTestResponse {
//   success: boolean;
//   message: string;
// }

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
// export const createNewTestAPI = async (testData: TestCreate): Promise<TestCreate> => {
//   const response = await axios.post<TestCreate>(
//     `${API_BASE_URL}/createTestNew`,
//     testData,
//     { withCredentials: true }
//   );
//   return response.data;
// };

export interface CreateTestResponse {
  message: string;
  data: {
    testId: number;
    questionIds: number[];
  };
}

export const createNewTestAPI = async (
  testData: TestCreate
): Promise<CreateTestResponse> => {
  const response = await axios.post<CreateTestResponse>(
    `${API_BASE_URL}/createTestNew`,
    testData,
    { withCredentials: true }
  );
  return response.data;
};

export const deleteTestByIdAPI = async (testId: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/deleteTest/${testId}`, {
    withCredentials: true,
  });
};

// update Part
export const updatePartNameAPI = async (partId: number, newName: string): Promise<Part> => {
  try {
    const response = await axios.put<{ part: Part }>(
      `${API_BASE_URL}/parts/update`,
      { partId, name: newName },
      { withCredentials: true }
    );
    console.log("✅ Part updated successfully:", response.data);
    return response.data.part; // ✅ đổi từ .Part sang .part
  } catch (error) {
    console.error("❌ Error updating part name:", error);
    throw error;
  }
};

// update Question Type
export const updateQuestionTypeAPI = async (
  questionTypeId: number,
  newName: string,
  newDescription: string | null = null
): Promise<QuestionType> => {
  try {
    const response = await axios.put<{ questionType: QuestionType }>(
      `${API_BASE_URL}/question-types/update`,
      {
        typeId: questionTypeId,
        name: newName,
        description: newDescription,
      },
      {
        withCredentials: true,
      }
    );

    return response.data.questionType;
  } catch (error) {
    console.error("❌ Error updating question type:", error);
    throw error;
  }
};

// ================== SKILLS ==================

// Lấy tất cả skills
export const getAllSkillsAPI = async (): Promise<Skill[]> => {
  const response = await axios.get<Skill[]>(`${API_BASE_URL}/skills`, {
    withCredentials: true,
  });
  return response.data;
};

// Lấy skill theo id
export const getSkillByIdAPI = async (id: number): Promise<Skill> => {
  const response = await axios.get<Skill>(`${API_BASE_URL}/skills/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

// Tạo skill mới
export const createSkillAPI = async (
  name: string,
  description?: string,
  parentId?: number | null
): Promise<Skill> => {
  const response = await axios.post<Skill>(
    `${API_BASE_URL}/skills`,
    { name, description, parentId },
    { withCredentials: true }
  );
  return response.data;
};

// Cập nhật skill
export const updateSkillAPI = async (
  id: number,
  updates: { name?: string; description?: string; parentId?: number | null }
): Promise<Skill> => {
  const response = await axios.put<Skill>(
    `${API_BASE_URL}/skills/${id}`,
    updates,
    { withCredentials: true }
  );
  return response.data;
};

// Xóa skill
export const deleteSkillAPI = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/skills/${id}`, {
    withCredentials: true,
  });
};


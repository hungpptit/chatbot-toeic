import axios from 'axios';
import { uploadFileAPI } from './uploadService';




const API_BASE_URL = 'http://localhost:8080/api/adminTest';

export interface Test {
    id: number;
    title: string;
    duration: number;
    participants: number;
    courses: [];
    questions: number;

}

// ✅ Media interface for questions
export interface MediaFile {
  type: 'audio' | 'image' | 'video';
  url: string;
  description?: string;
  startSecond?: number;
  endSecond?: number;
}

// ✅ Media input from frontend (with File object)
export interface MediaInput {
  type: 'audio' | 'image' | 'video';
  file: File; // File object to upload
  description?: string;
  startSecond?: number;
  endSecond?: number;
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
  media?: MediaFile[]; // ✅ URLs after upload

  // questionType: QuestionType;
  // part: Part;
}

// ✅ Question input from frontend (before upload)
export interface QuestionInput {
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
  mediaFiles?: MediaInput[]; // ✅ Files to upload
}

export interface TestCreate {
    title: string;
    courseId: number;
    questions: Question[];
}

// ✅ Test input from frontend (before upload)
export interface TestCreateInput {
  title: string;
  courseId: number;
  questions: QuestionInput[];
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

export interface CreateTestResponse {
  message: string;
  data: {
    testId: number;
    questionIds: number[];
  };
}

/**
 * ✅ Create new test with automatic file upload
 * Steps:
 * 1. Upload all media files to Cloudinary
 * 2. Replace File objects with URLs
 * 3. Send test data to backend
 */
export const createNewTestAPI = async (
  testData: TestCreateInput
): Promise<CreateTestResponse> => {
  try {
    console.log('📤 Starting test creation with file uploads...');
    
    // ✅ LOG: Check input data
    console.log('🔍 Input testData:', {
      title: testData.title,
      courseId: testData.courseId,
      totalQuestions: testData.questions.length,
      firstQuestion: {
        question: testData.questions[0]?.question?.substring(0, 50),
        hasMediaFiles: testData.questions[0]?.mediaFiles !== undefined,
        mediaFilesLength: testData.questions[0]?.mediaFiles?.length || 0,
        mediaFiles: testData.questions[0]?.mediaFiles
      }
    });
    
    // ✅ STEP 1: Process each question and upload media files
    const processedQuestions: Question[] = await Promise.all(
      testData.questions.map(async (questionInput) => {
        let uploadedMedia: MediaFile[] = [];

        // Upload media files if they exist
        if (questionInput.mediaFiles && questionInput.mediaFiles.length > 0) {
          console.log(`📁 Uploading ${questionInput.mediaFiles.length} media file(s)...`);
          
          uploadedMedia = await Promise.all(
            questionInput.mediaFiles.map(async (mediaInput) => {
              try {
                // ✅ Nếu đã có URL (từ batch upload), skip upload
                let uploadedUrl: string;
                
                if ((mediaInput as any).url) {
                  // Batch upload đã có URL rồi
                  uploadedUrl = (mediaInput as any).url;
                  console.log(`✅ Using existing URL: ${uploadedUrl}`);
                } else {
                  // Upload file mới lên Cloudinary
                  uploadedUrl = await uploadFileAPI(
                    mediaInput.file,
                    mediaInput.type
                  );
                  console.log(`✅ Uploaded new file: ${uploadedUrl}`);
                }

                return {
                  type: mediaInput.type,
                  url: uploadedUrl,
                  description: mediaInput.description,
                  startSecond: mediaInput.startSecond,
                  endSecond: mediaInput.endSecond,
                };
              } catch (error) {
                console.error('❌ Failed to upload media:', error);
                throw new Error(`Failed to upload ${mediaInput.type} file`);
              }
            })
          );

          console.log('✅ All media files uploaded successfully');
        }

        // Return question with uploaded media URLs
        return {
          question: questionInput.question,
          optionA: questionInput.optionA,
          optionB: questionInput.optionB,
          optionC: questionInput.optionC,
          optionD: questionInput.optionD,
          correctAnswer: questionInput.correctAnswer,
          explanation: questionInput.explanation,
          typeId: questionInput.typeId,
          partId: questionInput.partId,
          skillId: questionInput.skillId,
          media: uploadedMedia.length > 0 ? uploadedMedia : undefined,
        };
      })
    );

    // ✅ STEP 2: Send processed data to backend
    const finalTestData: TestCreate = {
      title: testData.title,
      courseId: testData.courseId,
      questions: processedQuestions,
    };

    // ✅ DEBUG: Check final payload
    console.log('🔍 Final payload check:', {
      title: finalTestData.title,
      courseId: finalTestData.courseId,
      questionsCount: finalTestData.questions.length,
      hasQuestions: Array.isArray(finalTestData.questions),
      firstQuestionMedia: finalTestData.questions[0]?.media,
      fullPayload: JSON.stringify(finalTestData, null, 2)
    });

    console.log('📤 Sending test data to backend...');
    const response = await axios.post<CreateTestResponse>(
      `${API_BASE_URL}/createTestNew`,
      finalTestData,
      { withCredentials: true }
    );

    console.log('✅ Test created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating test:', error);
    throw error;
  }
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
  const response = await axios.put<{ skill: Skill }>(
    `${API_BASE_URL}/skills/${id}`,
    updates,
    { withCredentials: true }
  );
  return response.data.skill; 
};


// Xóa skill
export const deleteSkillAPI = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/skills/${id}`, {
    withCredentials: true,
  });
};


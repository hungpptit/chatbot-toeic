import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/testcourses';

export interface Test {
    id: number;
    title: string;
    duration: string;
    participants: number;
    comments: number;
    questions: number;
    parts: number;
    tags: string[];
}

export interface Course {
    id: number;
    name: string;
}

export interface CourseWithTests {
  id: number;
  name: string;
  tests: {
    id: number;
    title: string;
    // add other properties if needed
  }[];
}

export const getAllTestsWithCourseAPI = async (): Promise<Test[]> =>{
    const response = await axios.get<Test[]>(`${API_BASE_URL}/all`);
    return response.data;
};

export const getAllCourseNamesAPI = async (): Promise<Course[]> => {
    const response = await axios.get<Course[]>(`${API_BASE_URL}/courses`,{withCredentials: true});
    return response.data;
};


// Lấy danh sách course + các bài test tương ứng
export const getCoursesWithTestsAPI = async (): Promise<CourseWithTests[]> => {
  const response = await axios.get<CourseWithTests[]>(
    `${API_BASE_URL}/with-tests`,
    { withCredentials: true }
  );
  return response.data;
};

// Cập nhật tên khóa học
export const updateCourseNameAPI = async (
  courseId: number,
  newName: string
): Promise<Course> => {
  try {
    const response = await axios.put<Course>(
      `${API_BASE_URL}/update/${courseId}`,
      { name: newName },
      { withCredentials: true }
    );
    console.log("🟢 Response:", response.data);
    return response.data; 
  } catch (error) {
    console.error("❌ Error updating course name:", error);
    throw error;
  }
};

export const deleteCourseByIdAPI = async (courseId: number): Promise<Course> => {
  try {
    const response = await axios.delete<Course>(`${API_BASE_URL}/delete/${courseId}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting course:", error);
    throw error;
  }
};
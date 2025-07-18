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
    title: string;
}

export interface CourseWithTests {
  id: number;
  name: string;
  tests: Course[];
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
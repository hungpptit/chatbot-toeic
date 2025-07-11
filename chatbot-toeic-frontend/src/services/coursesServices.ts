import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/courses';

export interface Course {
  id: number;
  name: string;
}

export const getAllCoursesAPI = async (): Promise<Course[]> => {
  const response = await axios.get<Course[]>(`${API_BASE_URL}`);
  return response.data;
};

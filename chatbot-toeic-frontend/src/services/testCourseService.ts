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

export const getAllTestsWithCourseAPI = async (): Promise<Test[]> =>{
    const response = await axios.get<Test[]>(`${API_BASE_URL}/all`);
    return response.data;
};
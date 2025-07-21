import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/account';

export interface User {
  id: number;
  username: string;
  email: string;
  role_id: number;
  status: string;
  password: string; 
}

// Lấy thông tin user theo ID
export const getUserById = async (id: number): Promise<User> => {
  const response = await axios.get<User>(`${API_BASE_URL}/detail/${id}`,
    {
      withCredentials: true,
    }
  );
  return response.data;
};

// Cập nhật thông tin user theo ID
export const updateUser = async (id: number, data: Partial<User>): Promise<User> => {
  const response = await axios.put<User>(`${API_BASE_URL}/update/${id}`, data,
    {
      withCredentials: true,
    }
  );
  return response.data;
};
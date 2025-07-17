// src/services/adminService.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/adminUser';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string; // hoặc có thể bỏ nếu backend không trả
  role_id: number;
  avatar: string | null;
  status?: boolean; // thêm nếu dùng khoá tài khoản
}

// Lấy danh sách user
export const getAllUsersAPI = async (): Promise<User[]> => {
  const response = await axios.get<User[]>(`${API_BASE_URL}/all`, {
    withCredentials: true
  });
  return response.data;
};

// Cập nhật role
export const updateUserRoleAPI = async (userId: number, newRoleId: number) => {
  const response = await axios.put(`${API_BASE_URL}/role`, {
    userId,
    newRoleId
  }, {
    withCredentials: true
  });
  return response.data;
};

// Xoá user
export const deleteUserAPI = async (userId: number) => {
  const response = await axios.request({
    url: `${API_BASE_URL}`,
    method: 'DELETE',
    data: { userId },
    withCredentials: true
  });
  return response.data;
};

// Khoá / mở user
export const lockUserAPI = async (userId: number, newStatus: number) => {
  const response = await axios.put(`${API_BASE_URL}/lock`, {
    userId,
    newStatus
  }, {
    withCredentials: true
  });
  return response.data;
};

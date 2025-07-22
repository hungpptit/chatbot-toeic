import axios from 'axios';



const API_BASE_URL = 'http://localhost:8080/api/account';

export interface User {
  id: number;
  username: string;
  email: string;
  role_id: number;
  status: string;
  password: string; 
  currentPassword: string;
}

export interface UpdateEmailVerifyResponse {
  requireEmailVerify: true;
  message: string;
  pendingEmail: string;
}

export type UpdateUserResponse = User | UpdateEmailVerifyResponse;


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
export const updateUser = async (
  id: number,
  data: Partial<User>
): Promise<UpdateUserResponse> => {
  try {
    const response = await axios.put<UpdateUserResponse>(`${API_BASE_URL}/update/${id}`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      const errorData = error.response.data as { message: string; code?: string };

      if (errorData.code === 'INVALID_CURRENT_PASSWORD') {
        throw new Error('Mật khẩu hiện tại không chính xác.');
      }

      if (errorData.code === 'USER_NOT_FOUND') {
        throw new Error('Người dùng không tồn tại.');
      }

      throw new Error(errorData.message || 'Đã xảy ra lỗi khi cập nhật người dùng.');
    }

    throw new Error('Không thể kết nối đến máy chủ.');
  }
};

export const verifyEmailOtp = async (
  userId: number,
  email: string,
  otp: string
): Promise<User> => {
  const response = await axios.post<User>(
    `${API_BASE_URL}/verify-email-otp`,
    { userId, email, otp },
    { withCredentials: true }
  );
  return response.data;
};
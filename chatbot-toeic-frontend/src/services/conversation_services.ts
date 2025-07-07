import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/conversations';

export interface Message {
  id: number;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: number;
  userId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}
interface GetConversationsResponse {
  code: number;
  message: string;
  data: Conversation[];
}

// ✅ Lấy danh sách conversation (không cần truyền token nữa)
export const getConversationsByUserAPI = async (): Promise<Conversation[]> => {
  const response = await axios.get<GetConversationsResponse>(`${API_BASE_URL}/user`, {
    withCredentials: true,
  });
  return response.data.data; 
}

// ✅ Lấy 1 conversation theo ID
export const getConversationByIdAPI = async (id: number): Promise<Conversation> => {
  const response = await axios.get<Conversation>(`${API_BASE_URL}/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

// ✅ Tạo conversation mới
export const createConversationAPI = async (title: string): Promise<Conversation> => {
  const response = await axios.post<Conversation>(
    `${API_BASE_URL}`,
    { title },
    {
      withCredentials: true,
    }
  );
  return response.data;
};

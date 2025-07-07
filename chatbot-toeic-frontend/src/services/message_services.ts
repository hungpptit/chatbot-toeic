import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/messages';

export interface RawMessageFromDB {
  id?: number;
  conversationId: number;
  role: 'user' | 'model';
  content: string;
  createdAt?: string;
}

// ✅ Lấy danh sách tin nhắn theo conversationId
export const getMessagesByConversationId = async (
  conversationId: number
): Promise<RawMessageFromDB[]> => {
  const response = await axios.get<{ code: number; message: string; data: RawMessageFromDB[] }>(
    `${API_BASE_URL}/${conversationId}`,
    {
      withCredentials: true,
    }
  );
  return response.data.data;
};

// ✅ Tạo một tin nhắn mới trong conversation
export const createMessageAPI = async (message: {
  conversationId: number;
  role: 'user' | 'model';
  content: string;
}): Promise<RawMessageFromDB> => {
  const response = await axios.post<{ code: number; message: string; data: RawMessageFromDB }>(
    `${API_BASE_URL}`,
    message,
    {
      withCredentials: true,
    }
  );
  return response.data.data;
};

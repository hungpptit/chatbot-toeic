import React, { useEffect, useState, useCallback } from 'react';
import {
  getConversationsByUserAPI,
  createConversationAPI,
  type Conversation,
} from '../services/conversation_services';

interface SidebarProps {
  onSelectConversation: (conversation: Conversation) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectConversation }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getConversationsByUserAPI(); 
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setConversations(sorted);
    } catch (error) {
      console.error('Lỗi lấy danh sách conversation:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateNew = async () => {
    const newTitle = prompt('Nhập tên đoạn chat mới') || 'Đoạn chat mới';
    try {
      const newConv = await createConversationAPI(newTitle); 
      setConversations((prev) => [newConv, ...prev]);
      onSelectConversation(newConv);
    } catch (error: unknown) {
      const err = error as any;
      console.error('Lỗi tạo đoạn chat mới:', err);
      const message = err?.response?.data?.message || err?.message || 'Lỗi không xác định';
      alert(`Không thể tạo đoạn chat mới: ${message}`);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return (
    <div className="sidebar p-4 w-64 bg-gray-100 h-screen overflow-y-auto border-r">
      <button
        onClick={handleCreateNew}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 transition"
      >
        + Tạo đoạn chat mới
      </button>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <ul className="space-y-2">
          {conversations.map((conv) => (
            <li
              key={conv.id}
              onClick={() => onSelectConversation(conv)}
              className="cursor-pointer hover:bg-gray-200 p-2 rounded truncate"
              title={conv.title}
            >
              {conv.title || 'Không tiêu đề'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;

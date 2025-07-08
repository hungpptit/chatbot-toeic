import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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
      <div className='sidebar-button'>
          <button
        onClick={handleCreateNew}
        className="create-chat-btn"
      >
        + Tạo đoạn chat mới
      </button>
      </div>
      
      <div className='sidebar-conversation'>
          {loading ? (
        <p>Đang tải...</p>
      ) : (
        <ul className="space-y-2">
          {conversations.map((conv) => (
            <li
              key={conv.id}
              onClick={() => {
                onSelectConversation(conv);
                navigate(`/chat/${conv.id}`); // ✅ đổi URL khi click
              }}
              className="conversation-item"
              title={conv.title}
            >
              {conv.title || 'Không tiêu đề'}
            </li>
          ))}
        </ul>
      )}
      </div>
      
    </div>
  );
};

export default Sidebar;

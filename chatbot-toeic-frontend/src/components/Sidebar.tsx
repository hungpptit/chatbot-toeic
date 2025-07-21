import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getConversationsByUserAPI,
  createConversationAPI,
  type Conversation,
  updateConversationTitleAPI,
  deleteConversationAPI,
} from '../services/conversation_services';

interface SidebarProps {
  onSelectConversation: (conversation: Conversation) => void;
  show: boolean;
  setShow: (show: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectConversation, show, setShow }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
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
      // Đảm bảo title đúng
      const convWithTitle = { ...newConv, title: newTitle };
      setConversations((prev) => [convWithTitle, ...prev]);
      onSelectConversation(convWithTitle);
      if (convWithTitle.id) {
        navigate(`/chat/${convWithTitle.id}`);
      } else {
        alert('Không lấy được id đoạn chat mới, vui lòng thử lại!');
      }
      setShow(false); // Ẩn sau khi tạo
    } catch (error: unknown) {
      const err = error as any;
      const message = err?.response?.data?.message || err?.message || 'Lỗi không xác định';
      alert(`Không thể tạo đoạn chat mới: ${message}`);
    }
  };
  const handleRename = async (convId: number) => {
    const newTitle = prompt('Nhập tên mới');
    if (!newTitle) return;

    try {
      await updateConversationTitleAPI(convId, newTitle);
      setConversations(prev =>
        prev.map(c => (c.id === convId ? { ...c, title: newTitle } : c))
      );
      setActiveMenuId(null);
    } catch (err) {
      console.error(err);
      alert('Không thể đổi tên');
    }
  };

  const handleDelete = async (convId: number) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa đoạn chat này?')) return;
    try {
      await deleteConversationAPI(convId);
      setConversations(prev => prev.filter(c => c.id !== convId));
      setActiveMenuId(null);
    } catch (err) {
      console.error(err);
      alert('Không thể xóa');
    }
  };


  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };

    if (activeMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenuId]);

  return (
  <div className={`sidebar ${show ? 'show' : 'minimized'}`}>
    {show ? (
      <div className="sidebar-inner">
        <div className="sidebar-header">
          <button className="close-sidebar" onClick={() => setShow(false)}>✖</button>
        </div>

        <div className="sidebar-button">
          <button onClick={handleCreateNew} className="create-chat-btn">
            + Tạo đoạn chat mới
          </button>
        </div>

         <div className="sidebar-conversation">
            {loading ? (
              <p>Đang tải...</p>
            ) : (
              <ul className="space-y-2">
                {conversations.map((conv) => (
                  <li
                    key={conv.id}
                    className="conversation-item-wrapper"
                  >
                    <div
                      className="conversation-item"
                      onClick={() => {
                        onSelectConversation(conv);
                        navigate(`/chat/${conv.id}`);
                        setShow(false);
                      }}
                      title={conv.title}
                    >
                      {(conv.title && conv.title.length > 25)
                        ? conv.title.slice(0, 25) + '...'
                        : (conv.title || 'Không tiêu đề')}
                    </div>

                    <button
                      className="menu-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === conv.id ? null : conv.id);
                      }}
                    >
                      ...
                    </button>

                    {activeMenuId === conv.id && (
                      <div className="menu-dropdown" ref={menuRef}>
                        <button onClick={() => handleRename(conv.id)}>Đổi tên</button>
                        <button onClick={() => handleDelete(conv.id)}>Xóa</button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
      <button className="sidebar-toggle-btn" onClick={() => setShow(true)}>
        ☰
      </button>
    )}
  </div>
);


};

export default Sidebar;
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/authService';
import { getUserById, type User } from '../services/accountServices';
import '../styles/Profile.css';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [username, setName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Bước 1: Lấy user hiện tại từ authService (ví dụ: decode từ JWT hoặc lấy từ localStorage)
    getCurrentUser().then((current) => {
      if (!current || !current.id) {
        setUser(null);
        return;
      }

      // Bước 2: Gọi API để lấy thông tin chi tiết từ DB bằng ID
      getUserById(Number(current.id))
        .then((fullUser) => {
          setUser(fullUser);
          setName(fullUser.username);
          setEmail(fullUser.email);
        })
        .catch((err) => {
          console.error('Lỗi khi lấy thông tin người dùng:', err);
          setUser(null);
        });
    });
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate('/login');
    window.location.reload(); 
  };

  const handleEdit = () => setEditMode(true);

  const handleSave = () => {
    // TODO: Gọi API update thông tin tại đây nếu cần
    setEditMode(false);
    if (user) {
      setUser({ ...user, username, email });
    }
  };

  if (!user) {
    return (
      <div className="profile-page">
        <h2>Thông tin cá nhân</h2>
        <p>Không tìm thấy thông tin người dùng.</p>
      </div>
    );
  }



  return (
    <div className="profile-page">
      <h2>Thông tin cá nhân</h2>
      <div className="profile-info">
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Tên:</strong> {editMode ? (
          <input className="profile-input" value={username} onChange={e => setName(e.target.value)} />
        ) : user.username}</p>
        <p><strong>Email:</strong> {editMode ? (
          <input className="profile-input" value={email} onChange={e => setEmail(e.target.value)} />
        ) : user.email}</p>
        <p><strong>Vai trò:</strong> {user.role_id === 1 ? 'User' : user.role_id === 2 ? 'Admin' : 'Không xác định'}</p>
        <p><strong>Trạng thái:</strong> {user.status ? 'Actived' : 'Locked'}</p>
        <p><strong>Mật khẩu:</strong> {'●'.repeat(8)}</p>

      </div>

      <div className="profile-actions">
        {editMode ? (
          <>
            <button onClick={handleSave}>Lưu</button>
            <button onClick={() => setEditMode(false)}>Hủy</button>
          </>
        ) : (
          <button className="edit-btn" onClick={handleEdit}>Chỉnh sửa</button>
        )}
        <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
      </div>
    </div>
  );
}

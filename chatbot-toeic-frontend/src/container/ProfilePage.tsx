import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/authService';
import {
  getUserById,
  type User,
  updateUser,
  verifyEmailOtp,
} from '../services/accountServices';
import '../styles/Profile.css';
import Swal from 'sweetalert2';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [username, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser().then((current) => {
      if (!current || !current.id) {
        setUser(null);
        return;
      }

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




const handleSave = async () => {
  if (!user) return;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    await Swal.fire({
      icon: 'warning',
      title: 'Email không hợp lệ',
      text: 'Vui lòng nhập đúng định dạng email (VD: example@gmail.com)',
    });
    return;
  }

  if (!currentPassword.trim()) {
    await Swal.fire({
      icon: 'warning',
      title: 'Thiếu mật khẩu hiện tại',
      text: 'Vui lòng nhập mật khẩu hiện tại để xác nhận cập nhật.',
    });
    return;
  }

  try {
     await Swal.fire({
      title: 'Đang xử lý...',
      text: 'Vui lòng chờ trong giây lát.',
      allowOutsideClick: true,
      timer: 3000, // ⏱️ Tự đóng sau 5 giây
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const updatedUser = await updateUser(user.id, {
      username,
      email,
      currentPassword,
      password: password,
    });

    Swal.close(); 
    // Nếu cần xác minh email
    if ('requireEmailVerify' in updatedUser && updatedUser.requireEmailVerify) {
      setOtpMode(true);
      setEditMode(false);
      setPendingEmail(updatedUser.pendingEmail);
      setCurrentPassword('');
      setPassword('');
      await Swal.fire({
        icon: 'info',
        title: 'Xác minh email',
        text: updatedUser.message,
      });
      return;
    }

    // Chỉ chạy nếu kiểu trả về là User
    if ('id' in updatedUser && 'username' in updatedUser && 'email' in updatedUser) {
      setUser(updatedUser);
    }
    setEditMode(false);
    setCurrentPassword('');
    setPassword('');
    await Swal.fire({
      icon: 'success',
      title: 'Thành công',
      text: 'Cập nhật thông tin thành công.',
    });
  } catch (err: any) {
    console.error('Lỗi khi cập nhật thông tin:', err);
    await Swal.fire({
      icon: 'error',
      title: 'Lỗi',
      text: err?.message || 'Cập nhật thất bại.',
    });
  }
};


  const handleVerifyOtp = async () => {
    if (!user || !pendingEmail || !otp) return;

    try {
      const verifiedUser = await verifyEmailOtp(user.id, pendingEmail, otp);
      setUser(verifiedUser); 
      setName(verifiedUser.username);
      setEmail(verifiedUser.email);
      setOtp('');
      setOtpMode(false);
      setPendingEmail('');
      await Swal.fire({
        icon: 'success',
        title: 'Xác minh thành công',
        text: 'Email đã được cập nhật.',
      });
    } catch (err: any) {
      console.error('Xác minh OTP thất bại:', err);
      await Swal.fire({
        icon: 'error',
        title: 'OTP không hợp lệ',
        text: err?.message || 'Vui lòng thử lại.',
      });
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

  // Hiển thị form OTP riêng nếu đang ở chế độ xác minh
  if (otpMode) {
    return (
      <div className="profile-page">
        <h2>Xác minh email mới</h2>
        <p>Vui lòng nhập mã OTP được gửi tới: <strong>{pendingEmail}</strong></p>
        <input
          className="profile-input"
          type="text"
          placeholder="Nhập mã OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <div className="profile-actions">
          <button onClick={handleVerifyOtp}>Xác minh</button>
          <button
            onClick={() => {
              setOtpMode(false);
              setOtp('');
              setPendingEmail('');
            }}
          >
            Hủy
          </button>
        </div>
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
          <input className="profile-input" value={email} type="email" onChange={e => setEmail(e.target.value)} />
        ) : user.email}</p>
        <p><strong>Vai trò:</strong> {user.role_id === 1 ? 'User' : user.role_id === 2 ? 'Admin' : 'Không xác định'}</p>
        <p><strong>Trạng thái:</strong> {user.status ? 'Actived' : 'Locked'}</p>
        {editMode ? (
          <div className="profile-row">
            <p><strong>Mật khẩu mới:</strong></p>
            <input
              className="profile-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        ) : (
          <p><strong>Mật khẩu:</strong> {'●'.repeat(8)}</p>
        )}
        {editMode && (
          <div className="profile-row">
            <p><strong>Xác nhận mật khẩu hiện tại*:</strong></p>
            <input
              className="profile-input"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
        )}
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

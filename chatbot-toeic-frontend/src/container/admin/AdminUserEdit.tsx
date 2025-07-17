import { useEffect, useState } from "react";

import {
  getAllUsersAPI,
  updateUserRoleAPI,
  deleteUserAPI,
  lockUserAPI,
  type User
} from '../../services/adminUserService';
import '../../styles/AdminUserEdit.css';
import Swal from 'sweetalert2';

export default function AdminUserEdit() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const data = await getAllUsersAPI();
      setUsers(data);
    } catch (err) {
      console.error("Không thể tải danh sách", err);
      setError("Không thể tải danh sách");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId: number, newRoleId: number) => {
    const roleName = newRoleId === 2 ? "Admin" : "User";

    const result = await Swal.fire({
      title: 'Xác nhận',
      text: `Bạn có chắc muốn đổi vai trò thành "${roleName}" không?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Huỷ',
      customClass: {
        confirmButton: 'btn-confirm-role',
        cancelButton: 'swal-cancel-custom'
      },
      backdrop: false, 
      allowOutsideClick: false,
      allowEscapeKey: false
    });

    if (result.isConfirmed) {
      try {
        await updateUserRoleAPI(userId, newRoleId);

        // ✅ Cập nhật state ngay lập tức
        setUsers(prev =>
          prev.map(u =>
            u.id === userId ? { ...u, roleId: newRoleId } : u
          )
        );

        Swal.fire('Cập nhật thành công!', '', 'success');
      } catch (err) {
        console.error("Không thể cập nhật vai trò", err);
        const error = err as any;
        const errorMsg = error.response?.data?.message || 'Cập nhật thất bại!';
        Swal.fire(errorMsg, '', 'error');
      }
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const result = await Swal.fire({
      title: 'Xác nhận xoá',
      text: "Bạn có chắc muốn xoá không?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xoá',
      cancelButtonText: 'Huỷ',
      customClass: {
        confirmButton: 'btn-confirm-delete',
        cancelButton: 'swal-cancel-custom'
      },
      backdrop: false, 
      allowOutsideClick: false,
      allowEscapeKey: false
    });

    if (result.isConfirmed) {
      try {
        await deleteUserAPI(userId);
        // Cập nhật state để xoá ngay trên UI
        setUsers(prev => prev.filter(u => u.id !== userId));
        Swal.fire('Đã xoá!', '', 'success');
      } catch (err) {
        console.error("Không thể xoá user", err);
        const error = err as any;
        const errorMsg = error.response?.data?.message || 'Xoá thất bại!';
        Swal.fire(errorMsg, '', 'error');
      }
    }
  };

  const handleLockUser = async (userId: number, newStatus: number) => {
    const actionText = newStatus === 1 ? "mở khoá" : "khoá"; // Tuỳ trạng thái muốn đổi

    const result = await Swal.fire({
      title: 'Xác nhận',
      text: `Bạn có chắc muốn ${actionText} tài khoản này không?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Huỷ',
      customClass: {
        confirmButton: 'btn-confirm-lock',
        cancelButton: 'swal-cancel-custom'
      },
      backdrop: false, 
      allowOutsideClick: false,
      allowEscapeKey: false
    });

    if (result.isConfirmed) {
      try {
        await lockUserAPI(userId, newStatus);

        // Cập nhật state ngay trên UI
        setUsers(prev =>
          prev.map(u =>
            u.id === userId ? { ...u, status: newStatus === 1 } : u
          )
        );

        Swal.fire(`Đã ${actionText}!`, '', 'success');
      } catch (err) {
        console.error("Không thể cập nhật trạng thái user", err);
        const error = err as any;
        const errorMsg = error.response?.data?.message || `Cập nhật thất bại!`;
        Swal.fire(errorMsg, '', 'error');
      }
    }
  };

  return (
    <div className="admin-user-container">
      <h2>👥 Danh sách người dùng</h2>
      {error && <p className="error">{error}</p>}
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.role_id}</td>
              <td>{u.status ? 'Active' : 'Locked'}</td>
             <td className="admin-user-actions">
                <button className="update-role" onClick={() => handleUpdateRole(u.id, u.role_id === 1 ? 2 : 1)}>
                  Đổi role
                </button>
                <button className="lock-user" onClick={() => handleLockUser(u.id, u.status ? 0 : 1)}>
                  {u.status ? 'Khoá' : 'Mở'}
                </button>
                <button className="delete-user" onClick={() => handleDeleteUser(u.id)}>
                  Xoá
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

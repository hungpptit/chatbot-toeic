import { useEffect, useState } from "react";
import{getAllUsersAPI, type User} from '../../services/adminUserService';


export default function AdminUserPage() {
    const [users, setUsers] = useState<User[]>([]);
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const data = await getAllUsersAPI();
          setUsers(data);
        } catch (error) {
          console.error("Không thể tải danh sách", error);
        }
      };

      fetchUsers();
    }, []);

  // console.log("test data nhận user: ", users);

  return (
    <div>
      <h2>👥 Danh sách người dùng</h2>
      <table border={1} cellPadding={8} style={{ width: "100%", marginTop: 10 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.role_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

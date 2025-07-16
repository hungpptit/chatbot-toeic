export default function AdminUserPage() {
  const fakeUsers = [
    { id: 1, username: "admin", email: "admin@gmail.com", role: "Admin" },
    { id: 2, username: "user1", email: "user1@gmail.com", role: "User" },
    { id: 3, username: "user2", email: "user2@gmail.com", role: "User" },
  ];

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
          {fakeUsers.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

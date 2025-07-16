// src/services/adminService.ts

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role_id: number;
  avatar: string | null;
}

export const getAllUsersAPI = async (): Promise<User[]> => {
  // Fake data mô phỏng bảng [ChatbotToeic].[dbo].[Users]
  return Promise.resolve([
    {
      id: 1,
      username: "admin",
      email: "admin@gmail.com",
      password: "hashed_password_1",
      role_id: 2,
      avatar: "https://i.pravatar.cc/100?img=1",
    },
    {
      id: 2,
      username: "nguyenvana",
      email: "nguyenvana@gmail.com",
      password: "hashed_password_2",
      role_id: 1,
      avatar: "https://i.pravatar.cc/100?img=2",
    },
    {
      id: 3,
      username: "tranthib",
      email: "tranthib@gmail.com",
      password: "hashed_password_3",
      role_id: 1,
      avatar: "https://i.pravatar.cc/100?img=3",
    },
    {
      id: 4,
      username: "lequangc",
      email: "lequangc@gmail.com",
      password: "hashed_password_4",
      role_id: 1,
      avatar: "https://i.pravatar.cc/100?img=4",
    },
    {
      id: 5,
      username: "phamthid",
      email: "phamthid@gmail.com",
      password: "hashed_password_5",
      role_id: 1,
      avatar: "https://i.pravatar.cc/100?img=5",
    },
  ]);
};

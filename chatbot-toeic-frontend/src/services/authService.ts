import axios from "axios";
export interface User {
  id: string;
  name: string;
  email: string;
}
const BACKEND_URL = 'http://localhost:8080';

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    console.log("🔥 [getCurrentUser] Gọi tới API /api/me");

    const res = await axios.get<User>(`${BACKEND_URL}/api/me`, {
      withCredentials: true,
    });

    console.log("✅ [getCurrentUser] Nhận user từ backend:", res.data);
    return res.data;

  } catch (error: any) {
    console.error("❌ [getCurrentUser] Lỗi khi gọi /api/me:", error?.response?.data || error.message);
    return null;
  }
};
export const logout = async (): Promise<void> => {
  try {
    console.log("🚪 [logout] Gửi yêu cầu POST /api/logout");

    await axios.post(`${BACKEND_URL}/api/logout`, {}, {
      withCredentials: true,
    });

    console.log("✅ [logout] Đã logout và xóa cookie");
  } catch (error: any) {
    console.error("❌ [logout] Lỗi khi logout:", error?.response?.data || error.message);
  }
};
import { type ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface RequireAuthProps {
  children: ReactNode;
}

interface MeResponse {
  id: number;
  email: string;
  role_id: number;
}

const BACKEND_URL = 'http://localhost:8080';

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get<MeResponse>(`${BACKEND_URL}/api/me`, {
          withCredentials: true,
        });
        const { role_id } = res.data;

        // ✅ CHỈ cho phép user thường (1) hoặc admin (2)
        if (role_id !== 1 && role_id !== 2) {
          navigate("/");
        }
      } catch (error) {
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  return <>{children}</>;
};

export default RequireAuth;

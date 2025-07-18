import { type ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface RequireAdminProps {
  children: ReactNode;
}

interface MeResponse {
  id: number;
  email: string;
  role_id: number;
}

const BACKEND_URL = "http://localhost:8080";

const RequireAdmin: React.FC<RequireAdminProps> = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get<MeResponse>(`${BACKEND_URL}/api/me`, { withCredentials: true });
        const { role_id } = res.data;

        if (role_id === 2) {
          setAuthorized(true); // đúng là admin
        } else {
          navigate("/"); // user thường
        }
      } catch (error) {
        navigate("/login"); // chưa đăng nhập
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  return authorized ? <>{children}</> : null;
};

export default RequireAdmin;

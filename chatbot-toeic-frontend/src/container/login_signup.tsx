import React, { useState } from "react";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import "../styles/login_signup.css";
interface LoginResponse {
  data: any;

}

const API_URL = "http://localhost:8080";
const Role = {
  USER: 1,
  ADMIN: 2,
  MODERATOR: 3,
} as const;

const LoginSignup: React.FC = () => {
  const [action, setAction] = useState<"Login" | "Sign Up" | "ForgotPassword" | "ResetPassword" | "VerifyEmail">("Login");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [verifyOtp, setVerifyOtp] = useState<string>("");

  const navigate = useNavigate();

  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const googleToken = credentialResponse.credential;
      if (!googleToken) {
        alert("❌ No credential received.");
        return;
      }
      console.log("🔑 Google token:", googleToken);
      const res = await axios.post(`${API_URL}/api/auth/google-login`, { token: googleToken }, { withCredentials: true });
      const user = (res.data as any).data;
     
      localStorage.setItem("user", JSON.stringify(user));
      alert("✅ Logged in with Google successfully!");
      navigate("/home");
    } catch (err) {
       const error = err as { response?: { data?: { message?: string } } };
      alert(`❌ ${error.response?.data?.message || "Google login failed!"}`);
    }
  };

  const handleSubmit = async () => {
  if (action === "Login") {
    if (!email || !password) {
      alert("❌ Please enter both Email and Password!");
      return;
    }

    try {
      const res = await axios.post<LoginResponse>(
        `${API_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true } // quan trọng để cookie đi kèm request
      );

      const user = res.data.data; // token đã nằm trong cookie, không cần lấy
      Swal.fire({ icon: 'success', title: 'Đăng nhập thành công!' });
      navigate(user.role_id === Role.ADMIN ? "/admin/users" : "/home", {
        state: { justLoggedIn: true },
      });
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      Swal.fire({
        icon: 'error',
        title: 'Đăng nhập thất bại',
        text: error.response?.data?.message || "Login failed!"
      });
    }

  } else if (action === "Sign Up") {
    if (!username || !email || !password) {
      alert("❌ Please fill in Username, Email, and Password!");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/auth/send-register-otp`, { email });
      Swal.fire({ icon: 'success', title: 'Đã gửi OTP', text: '📩 OTP has been sent to your email. Please verify to complete registration.' });
      setAction("VerifyEmail");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      Swal.fire({ icon: 'error', title: 'Lỗi', text: error.response?.data?.message || "Failed to send OTP." });
    }
  }
};


  const handleForgotPassword = async () => {
    if (!email) {
      Swal.fire({ icon: 'error', title: 'Thiếu email', text: '❌ Please enter your email.' });
      return;
    }
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setMessage("✅ OTP has been sent to your email.");
      setAction("ResetPassword");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      Swal.fire({ icon: 'error', title: 'Lỗi', text: error.response?.data?.message || "Failed to send OTP." });
    }
  };

  const handleResetPassword = async () => {
    if (!email || !otp || !newPassword) {
      Swal.fire({ icon: 'error', title: 'Thiếu thông tin', text: '❌ Please fill in all fields' });
      return;
    }
    try {
      await axios.post(`${API_URL}/api/auth/reset-password`, { email, otp, newPassword });
      Swal.fire({ icon: 'success', title: 'Đặt lại mật khẩu thành công!', text: '✅ Password has been reset! You can now log in.' });
      setAction("Login");
      setEmail("");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      Swal.fire({ icon: 'error', title: 'Lỗi', text: error.response?.data?.message || "Reset failed." });
    }
  };

  const handleVerifyEmail = async () => {
    if (!verifyOtp || !email || !username || !password) {
      Swal.fire({ icon: 'error', title: 'Thiếu thông tin', text: '❌ Please complete all fields' });
      return;
    }
    try {
      await axios.post(`${API_URL}/api/auth/verify-register-otp`, {
        email,
        otp: verifyOtp,
        name: username,
        password,
      });
      Swal.fire({ icon: 'success', title: 'Đăng ký thành công!', text: '✅ Registration complete! You can now log in.' });
      setAction("Login");
      setUsername("");
      setEmail("");
      setPassword("");
      setVerifyOtp("");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      Swal.fire({ icon: 'error', title: 'Lỗi', text: error.response?.data?.message || "OTP verification failed" });
    }
  };

  return (
    <div className="account-page">
      <div className="account-container">
        <div className="account-header">
          <div className="account-text">
            {action === "Login" && "LOGIN"}
            {action === "Sign Up" && "SIGN UP"}
            {action === "ForgotPassword" && "FORGOT PASSWORD"}
            {action === "ResetPassword" && "RESET PASSWORD"}
            {action === "VerifyEmail" && "VERIFY EMAIL"}
          </div>
        </div>

        {(action === "Login" || action === "Sign Up") && (
          <div className="account-inputs">
            {action === "Sign Up" && (
              <div className="account-input">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}
            <div className="account-input">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="account-input">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {action === "Login" && (
              <div className="forgot-password" onClick={() => setAction("ForgotPassword")}>
                Forgot Password?
              </div>
            )}
          </div>
        )}

        {action === "ForgotPassword" && (
          <>
            <div className="account-inputs forgot-mode">
              <div className="account-input">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <p className={`account-message ${message.startsWith("✅") ? "success" : ""}`}>{message}</p>
          </>
        )}

        {action === "ResetPassword" && (
          <>
            <div className="account-inputs forgot-mode">
              <div className="account-input">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <div className="account-input">
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            <p className={`account-message ${message.startsWith("✅") ? "success" : ""}`}>{message}</p>
          </>
        )}

        {action === "VerifyEmail" && (
          <>
            <div className="account-inputs">
              <div className="account-input">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={verifyOtp}
                  onChange={(e) => setVerifyOtp(e.target.value)}
                />
              </div>
            </div>
            <div className="account-submit-container">
              <div className="account-submit" onClick={handleVerifyEmail}>
                Verify and Register
              </div>
            </div>
          </>
        )}

        {action !== "VerifyEmail" && (
          <div className="account-submit-container">
            {action === "ForgotPassword" ? (
              <>
                <div className="account-submit" onClick={handleForgotPassword}>Send OTP</div>
                <div className="account-submit secondary" onClick={() => setAction("Login")}>
                  Back to Login
                </div>
              </>
            ) : action === "ResetPassword" ? (
              <>
                <div className="account-submit" onClick={handleResetPassword}>Reset Password</div>
                <div className="account-submit secondary" onClick={() => setAction("Login")}>
                  Back to Login
                </div>
              </>
            ) : (
              <>
                <div className="account-submit" onClick={handleSubmit}>
                  {action === "Login" ? "Sign in" : "Create Account"}
                </div>
                {action === "Login" ? (
                  <>
                    <div className="no-account-text">Don't have an account?</div>
                    <div className="account-submit secondary" onClick={() => setAction("Sign Up")}>Sign Up</div>
                  </>
                ) : (
                  <>
                    <div className="no-account-text">Already have an account?</div>
                    <div className="account-submit secondary" onClick={() => setAction("Login")}>
                      Log In
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {action !== "ForgotPassword" && action !== "ResetPassword" && action !== "VerifyEmail" && (
          <div className="social-login" style={{ marginTop: 24, textAlign: "center" }}>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => alert("❌ Google login failed!")}
            />
          </div>
        )}

        <div className="return-store" onClick={() => navigate("/home")}>Return to Store</div>
      </div>
    </div>
  );
};

export default LoginSignup;
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import ChatPage from "./container/ChatPage";
import VocabularyPage from "./container/VocabularyPage";
import LoginSignup from "./container/login_signup";
import TestExam from "./container/test_exam";
import TestReview from "./container/test_review";
import AdminPage from "./pages/AdminPage";

import AdminUserPage from "./container/admin/AdminUserPage";
import AdminTestPage from "./container/admin/AdminTestPage";
import AdminCoursePage from "./container/admin/AdminCoursePage";
import AdminStatsPage from "./container/admin/AdminStatsPage";

const GOOGLE_CLIENT_ID =
  "882409050775-mq8rrausj32gudb5fmni8gn28qg23nk4.apps.googleusercontent.com";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const path = location.pathname;
  const activeTab =
    path === "/chat" ? "chat" : path === "/vocab" ? "vocab" : "home";

  const handleTabChange = (tab: "home" | "chat" | "vocab") => {
    navigate(tab === "home" ? "/home" : `/${tab}`);
  };

  return (
    <div className="container">
      <Header activeTab={activeTab} onChangeTab={handleTabChange} />

      <div className="main-content">
        <Routes>
          {/* ✅ ADMIN */}
          <Route path="/admin" element={<AdminPage />}>
            <Route path="users" element={<AdminUserPage />} />
            <Route path="tests" element={<AdminTestPage />} />
            <Route path="courses" element={<AdminCoursePage />} />
            <Route path="stats" element={<AdminStatsPage />} />
          </Route>

          {/* ✅ USER */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
          <Route path="/vocab" element={<VocabularyPage />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/TestExam" element={<TestExam mode="exam" />} />
          <Route path="/TestExam/:id" element={<TestExam mode="exam" />} />
          <Route
            path="/test-review-detail/:userTestId"
            element={<TestExam mode="review" />}
          />
          <Route path="/TestReview" element={<TestReview />} />
          <Route path="/TestReview/:testId" element={<TestReview />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <AppContent />
      </Router>
    </GoogleOAuthProvider>
  );
}

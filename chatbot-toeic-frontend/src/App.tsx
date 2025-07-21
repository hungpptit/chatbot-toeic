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
import ProfilePage from "./container/ProfilePage";

import AdminUserPage from "./container/admin/AdminUserPage";
import AdminTestPage from "./container/admin/AdminTestPage";
import AdminCoursePage from "./container/admin/AdminCoursePage";
import AdminStatsPage from "./container/admin/AdminStatsPage";
import AdminUserEdit from "./container/admin/AdminUserEdit";
import AdminTestViewPage from "./container/admin/AdminTestViewPage";
import AdminTestAddPage from "./container/admin/AddTestForm";
import AdminAddCourse from "./container/admin/AdminAddCourse";

import RequireAdmin from "./components/RequireAdmin";
import RequireAuth from "./components/RequireAuth";



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
          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminPage />
              </RequireAdmin>
            }
          >
            <Route path="users" element={<AdminUserPage />} />
            <Route path="users/edit" element={<AdminUserEdit />} />
            <Route path="tests" element={<AdminTestPage />} />
            <Route path="tests/:id/view" element={<AdminTestViewPage />} />
            <Route path="tests/add" element={<AdminTestAddPage />} />
            <Route path="courses" element={<AdminCoursePage />} />
            <Route path="stats" element={<AdminStatsPage />} />
            <Route path="courses/manage" element={<AdminAddCourse />} />
          </Route>

          {/* USER */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/vocab" element={<VocabularyPage />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/profile" element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          } />
          {/* cần kiểm tra người dùng mới vô dc trang */}
          <Route path="/chat" element={
            <RequireAuth>
              <ChatPage />
            </RequireAuth>
          } />

          <Route path="/chat/:conversationId" element={
            <RequireAuth>
              <ChatPage />
            </RequireAuth>
          } />

          <Route path="/TestExam" element={
            <RequireAuth>
              <TestExam mode="exam" />
            </RequireAuth>
          } />

          <Route path="/TestExam/:id" element={
            <RequireAuth>
              <TestExam mode="exam" />
            </RequireAuth>
          } />

          <Route path="/test-review-detail/:userTestId" element={
            <RequireAuth>
              <TestExam mode="review" />
            </RequireAuth>
          } />

          <Route path="/TestReview" element={
            <RequireAuth>
              <TestReview />
            </RequireAuth>
          } />

          <Route path="/TestReview/:testId" element={
            <RequireAuth>
              <TestReview />
            </RequireAuth>
          } />
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

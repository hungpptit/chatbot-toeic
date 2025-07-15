import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ChatPage from './container/ChatPage';
import VocabularyPage from './container/VocabularyPage';
import LoginSignup from './container/login_signup';
import TestExam from './container/test_exam';
import TestReview from './container/test_review';

const GOOGLE_CLIENT_ID = '1029337181318-1skvm4fd9cg3ehpvqu8t6m6q5lkbfk5o.apps.googleusercontent.com'; // ← Thay bằng client ID thực tế

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const path = location.pathname;
  const activeTab = path === '/chat' ? 'chat' : path === '/vocab' ? 'vocab' : 'home';

  const handleTabChange = (tab: 'home' | 'chat' | 'vocab') => {
    navigate(tab === 'home' ? '/home' : `/${tab}`);
  };

  
  return (
    <div className="container">
      <Header activeTab={activeTab} onChangeTab={handleTabChange} />
      <div className="main-content">
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
          <Route path="/vocab" element={<VocabularyPage />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/TestExam" element={<TestExam mode="exam" />} />
          <Route path="/TestExam/:id" element={<TestExam mode="exam" />} />
          <Route path="/test-review-detail/:userTestId" element={<TestExam mode="review" />} />

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
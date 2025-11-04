import { useEffect, useState } from 'react';
import { getCurrentUser, type User } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { getMLRecommendationDetailsAPI } from '../services/mlRecommendation_services';
import '../styles/MLRecommendationsPage.css';

export default function MLRecommendationsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [weakSkills, setWeakSkills] = useState<string[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    getCurrentUser().then((u) => {
      if (!mounted) return;
      if (!u) {
        navigate('/login');
        return;
      }
      setUser(u);
      fetchRecommendations(Number(u.id));
    });
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const fetchRecommendations = async (userId: number) => {
    try {
      setLoading(true);
      console.log('🔍 Fetching ML recommendations for userId:', userId);
      const response = await getMLRecommendationDetailsAPI(userId);
      console.log('✅ ML API response:', response);
      
      if (response && response.code === 200 && response.data) {
        const skills = response.data.weak_skills || [];
        const qs = response.data.questions || [];
        console.log('📊 Parsed weak_skills:', skills);
        console.log('📊 Parsed questions:', qs.length);
        setWeakSkills(skills);
        setQuestions(qs);
      } else {
        console.warn('⚠️ Unexpected response structure:', response);
      }
    } catch (err) {
      console.error('❌ Error fetching ML recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPractice = () => {
    if (questions.length === 0) {
      alert('Không có câu hỏi để luyện tập');
      return;
    }
    // Navigate to TestExam practice route with questions in state
    navigate('/test-practice', {
      state: {
        title: 'Luyện tập kỹ năng yếu',
        questions: questions
      }
    });
  };

  if (loading || !user) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>Đang phân tích kỹ năng của bạn...</p>
      </div>
    );
  }

  return (
    <div className="ml-recommendations-page">
      <h1>📊 Phân tích kỹ năng & Gợi ý luyện tập</h1>
      
      {weakSkills.length > 0 ? (
        <>
          <div className="ml-weak-skills-box">
            <h3>🎯 Kỹ năng cần cải thiện:</h3>
            <div className="ml-skills-container">
              {weakSkills.map((skill, i) => (
                <span key={i} className="ml-skill-badge">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="ml-questions-section">
            <h3>💡 Câu hỏi gợi ý: {questions.length} câu</h3>
            <p className="ml-questions-description">
              Hệ thống đã phân tích kết quả của bạn và chọn {questions.length} câu hỏi phù hợp để bạn luyện tập.
              Các câu hỏi thuộc kỹ năng{' '}
              <strong style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                {weakSkills.join(', ')}
              </strong>{' '}
              để giúp bạn cải thiện kỹ năng yếu.
            </p>
            <button
              onClick={handleStartPractice}
              className="ml-start-practice-btn"
            >
              🚀 Bắt đầu luyện tập
            </button>
          </div>

          <div className="ml-questions-list-section">
            <details className="ml-questions-details" open>
              <summary className="ml-questions-summary">
                Danh sách câu hỏi ({questions.length})
              </summary>

              <div className="ml-scrollable-container">
                <ul className="ml-questions-list">
                  {questions.map((q, i) => (
                    <li key={q.id} className="ml-question-item">
                      <span className="ml-question-number">#{i + 1}</span>
                      <span className="ml-question-part">Part {q.partId}</span>
                      <span className="ml-question-text">
                        {q.question.substring(0, 80)}...
                      </span>
                      {q.mediaMappings && q.mediaMappings.length > 0 && (
                        <span className="ml-audio-badge">🎵 Có audio</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          </div>


        </>
      ) : (
        <div className="ml-empty-state">
          <h2>🎉 Tuyệt vời!</h2>
          <p>Bạn không có kỹ năng nào yếu. Hãy tiếp tục luyện tập để duy trì!</p>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { getCurrentUser, type User } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { getMLRecommendationDetailsAPI } from '../services/mlRecommendation_services';

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
    <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 20 }}>📊 Phân tích kỹ năng & Gợi ý luyện tập</h1>
      
      {weakSkills.length > 0 ? (
        <>
          <div style={{ background: '#f5f5f5', padding: 20, borderRadius: 8, marginBottom: 30 }}>
            <h3 style={{ margin: '0 0 15px 0' }}>🎯 Kỹ năng cần cải thiện:</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {weakSkills.map((skill, i) => (
                <span
                  key={i}
                  style={{
                    background: '#e74c3c',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: 20,
                    fontSize: 14,
                    fontWeight: 'bold'
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 30 }}>
            <h3 style={{ margin: '0 0 15px 0' }}>💡 Câu hỏi gợi ý: {questions.length} câu</h3>
            <p style={{ color: '#666', marginBottom: 20 }}>
              Hệ thống đã phân tích kết quả của bạn và chọn {questions.length} câu hỏi phù hợp để bạn luyện tập.
              Các câu hỏi bao gồm cả Reading và Listening để giúp bạn cải thiện kỹ năng yếu.
            </p>
            <button
              onClick={handleStartPractice}
              style={{
                background: '#27ae60',
                color: 'white',
                border: 'none',
                padding: '15px 40px',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#229954')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#27ae60')}
            >
              🚀 Bắt đầu luyện tập
            </button>
          </div>

          <div style={{ borderTop: '1px solid #ddd', paddingTop: 20 }}>
            <details>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: 10 }}>
                Xem danh sách câu hỏi ({questions.length})
              </summary>
              <ul style={{ maxHeight: 400, overflow: 'auto', background: '#fafafa', padding: 20, borderRadius: 4 }}>
                {questions.map((q, i) => (
                  <li key={q.id} style={{ marginBottom: 10 }}>
                    <strong>#{i + 1}</strong> - Part {q.partId} - {q.question.substring(0, 60)}...
                    {q.mediaMappings && q.mediaMappings.length > 0 && (
                      <span style={{ marginLeft: 10, color: '#e67e22', fontSize: 12 }}>
                        🎵 Có audio
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <h2>🎉 Tuyệt vời!</h2>
          <p>Bạn không có kỹ năng nào yếu. Hãy tiếp tục luyện tập để duy trì!</p>
        </div>
      )}
    </div>
  );
}

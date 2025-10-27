// ========================================
// FILE: src/components/MLRecommendations.tsx
// MỤC ĐÍCH: Component hiển thị weak skills và gợi ý câu hỏi
// ========================================

import React, { useState, useEffect } from 'react';
import { getMLRecommendationsAPI } from '../services/mlRecommendation_services';
import type { WeakSkill, RecommendedQuestion } from '../services/mlRecommendation_services';
import '../styles/MLRecommendations.css';

interface Props {
    userId: number;
}

const MLRecommendations: React.FC<Props> = ({ userId }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [weakSkills, setWeakSkills] = useState<WeakSkill[]>([]);
    const [recommendations, setRecommendations] = useState<RecommendedQuestion[]>([]);
    const [selectedSkill, setSelectedSkill] = useState<number | null>(null);

    useEffect(() => {
        fetchRecommendations();
    }, [userId]);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getMLRecommendationsAPI(userId);

            if (response.code === 200) {
                setWeakSkills(response.data.weakSkills);
                setRecommendations(response.data.recommendations);
                
                // Auto-select first weak skill
                if (response.data.weakSkills.length > 0) {
                    setSelectedSkill(response.data.weakSkills[0].skillId);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Không thể tải gợi ý');
            console.error('Error fetching recommendations:', err);
        } finally {
            setLoading(false);
        }
    };

    const getSkillStatusColor = (status: string) => {
        switch (status) {
            case 'WEAK':
                return '#e74c3c';
            case 'MODERATE':
                return '#f39c12';
            case 'STRONG':
                return '#27ae60';
            default:
                return '#95a5a6';
        }
    };

    const getModelBadge = (model: string) => {
        return model === 'GLOBAL' ? '🌍 Global' : '🎯 Personalized';
    };

    const filteredRecommendations = selectedSkill
        ? recommendations.filter(q => q.skillId === selectedSkill)
        : recommendations;

    if (loading) {
        return (
            <div className="ml-recommendations loading">
                <div className="spinner"></div>
                <p>Đang phân tích kỹ năng của bạn...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="ml-recommendations error">
                <h3>⚠️ Lỗi</h3>
                <p>{error}</p>
                <button onClick={fetchRecommendations}>Thử lại</button>
            </div>
        );
    }

    if (weakSkills.length === 0) {
        return (
            <div className="ml-recommendations empty">
                <h3>🎉 Tuyệt vời!</h3>
                <p>Bạn không có kỹ năng nào yếu. Hãy tiếp tục luyện tập!</p>
            </div>
        );
    }

    return (
        <div className="ml-recommendations">
            <div className="recommendations-header">
                <h2>📊 Phân Tích Kỹ Năng & Gợi Ý</h2>
                <button className="refresh-btn" onClick={fetchRecommendations}>
                    🔄 Làm mới
                </button>
            </div>

            {/* Weak Skills Section */}
            <div className="weak-skills-section">
                <h3>🎯 Kỹ Năng Cần Cải Thiện</h3>
                <div className="skills-grid">
                    {weakSkills.map((skill) => (
                        <div
                            key={skill.skillId}
                            className={`skill-card ${selectedSkill === skill.skillId ? 'selected' : ''}`}
                            onClick={() => setSelectedSkill(skill.skillId)}
                            style={{ borderLeftColor: getSkillStatusColor(skill.status) }}
                        >
                            <div className="skill-header">
                                <h4>{skill.skillName}</h4>
                                <span className="model-badge">{getModelBadge(skill.modelUsed)}</span>
                            </div>
                            <div className="skill-stats">
                                <div className="stat">
                                    <span className="label">Độ chính xác:</span>
                                    <span className="value" style={{ color: getSkillStatusColor(skill.status) }}>
                                        {skill.accuracy.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="stat">
                                    <span className="label">Số lần làm:</span>
                                    <span className="value">{skill.attempts}</span>
                                </div>
                                <div className="stat">
                                    <span className="label">Đúng/Tổng:</span>
                                    <span className="value">{skill.correct}/{skill.attempts}</span>
                                </div>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${skill.accuracy}%`,
                                        backgroundColor: getSkillStatusColor(skill.status)
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommendations Section */}
            <div className="recommendations-section">
                <h3>💡 Câu Hỏi Được Gợi Ý</h3>
                {selectedSkill && (
                    <p className="section-description">
                        Hiển thị câu hỏi cho: <strong>
                            {weakSkills.find(s => s.skillId === selectedSkill)?.skillName}
                        </strong>
                    </p>
                )}
                
                {filteredRecommendations.length === 0 ? (
                    <div className="no-recommendations">
                        <p>Không có câu hỏi gợi ý cho kỹ năng này.</p>
                    </div>
                ) : (
                    <div className="questions-list">
                        {filteredRecommendations.map((question, index) => (
                            <div key={question.questionId} className="question-card">
                                <div className="question-number">#{index + 1}</div>
                                <div className="question-content">
                                    <p>{question.question}</p>
                                    <div className="question-meta">
                                        <span className="meta-item">📝 Part {question.partId}</span>
                                        <span className="meta-item">🔖 Type {question.typeId}</span>
                                        {question.difficulty && (
                                            <span className="meta-item difficulty">
                                                ⭐ {question.difficulty}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button className="practice-btn">
                                    Luyện tập →
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MLRecommendations;

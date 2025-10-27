// ========================================
// FILE: src/services/mlRecommendation_services.ts
// MỤC ĐÍCH: API calls cho ML recommendations
// ========================================

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface WeakSkill {
    skillId: number;
    skillName: string;
    accuracy: number;
    attempts: number;
    correct: number;
    status: 'WEAK' | 'MODERATE' | 'STRONG';
    modelUsed: 'GLOBAL' | 'UNIFIED';
}

export interface RecommendedQuestion {
    questionId: number;
    question: string;
    skillId: number;
    partId: number;
    typeId: number;
    difficulty?: string;
}

export interface MLRecommendationResponse {
    code: number;
    message: string;
    data: {
        userId: number;
        totalSkills: number;
        weakSkills: WeakSkill[];
        recommendations: RecommendedQuestion[];
        strategy: string;
    };
}

/**
 * Get weak skills and question recommendations for a user
 */
export const getMLRecommendationsAPI = async (userId: number): Promise<MLRecommendationResponse> => {
    try {
        const response = await axios.get(`${API_URL}/api/ml/recommend/${userId}`, {
            withCredentials: true
        });
        return response.data as MLRecommendationResponse;
    } catch (error: any) {
        console.error('Error fetching ML recommendations:', error);
        throw error.response?.data || error;
    }
};

/**
 * Trigger model retraining (Admin only)
 */
export const retrainMLModelsAPI = async (): Promise<{ code: number; message: string }> => {
    try {
        const response = await axios.post(`${API_URL}/api/ml/retrain`, {}, {
            withCredentials: true
        });
        return response.data as { code: number; message: string };
    } catch (error: any) {
        console.error('Error retraining ML models:', error);
        throw error.response?.data || error;
    }
};

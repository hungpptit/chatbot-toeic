import axios from "axios";

const API_BASE_URL = 'http://localhost:8080/api/question';

export interface Question {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  type: string;
  topic: string;
}

export interface VocabularyResult {
  type: 'Vocabulary-Lookup';
  source: 'database' | 'ai';
  word: string;
  definition: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
  viExplanation: string;
}
export interface FreeResult {
  type: 'Free';
  source: 'ai';
  answer: string;
}

export interface QuestionResult {
  type: string;
  source: 'database' | 'ai';
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: string;
  explanation: string;
}

export type QuestionType = 'Vocabulary-Lookup' | 'Vocabulary' | 'Part 5' | 'Free';

export interface QuestionResponse {
  type: QuestionType;
  source: 'ai' | 'database';
   conversationId?: string;
  question?: string;
  options?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer?: string;
  explanation?: string;
  word?: string;
  definition?: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
  viExplanation?: string;
}

/**
 * Gửi rawText tới API để phân tích câu hỏi/từ vựng/tự do
 * @param rawText Chuỗi người dùng nhập vào
 * @returns Câu trả lời từ bot (trắc nghiệm / từ vựng / tự do)
 */
export const getQuestionFromRawText = async (
  rawText: string,
  conversationId?: string
): Promise<QuestionResponse & { conversationId?: string }> => {
  const token = localStorage.getItem("token");

  const response = await axios.post<QuestionResponse & { conversationId?: string }>(
    API_BASE_URL,
    {
      rawText, // ✅ Đúng key mà backend cần
      conversationId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
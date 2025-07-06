import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/vocabulary';

// const BACKEND_URL = 'http://localhost:8080';

export interface VocabularyData{
    id: number,
    word: string,
    definition: string;
    example: string;
    topic: string;
    pronunciations?: Pronunciation[];
    synonyms?: Synonym[];
    antonyms?: Antonym[];
    meanings?: Meaning[];
}
export interface Pronunciation {
    id: number;
    vocabId: number;
    accent: string;
    phoneticText: string;
    audioUrl: string;
}

export interface Synonym {
    id: number;
    synonym: string; 
}

export interface Antonym {
    id: number;
    antonym: string; 
}

export interface Meaning {
    id: number;
    partOfSpeech: string;
    definition: string;  
    example: string;    
}

export const getVocabularyByWordAPI = async (word: string): Promise<VocabularyData> => {
  const response = await axios.get<VocabularyData>(`${API_BASE_URL}/word/${word}`);
  return response.data;
};

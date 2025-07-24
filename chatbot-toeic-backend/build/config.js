import dotenv from 'dotenv';
dotenv.config();
export const GEMINI_API_URL = process.env.GEMINI_API_URL;
export const GEMINI_API_KEYS = process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',').map(key => key.trim()) : [];
export const PORT = process.env.PORT || 8080;
export const HOSTNAME = process.env.HOST_NAME || 'localhost';
import { apiService } from './api';

export const hasGeminiKey = () => true; // Backend handles this

export const generateWithGemini = async (prompt: string, systemInstruction?: string) => {
  try {
    const response = await apiService.post('/ai/generate-book', {
      form: { idea: prompt },
      instruction: systemInstruction
    });
    return response.content;
  } catch (error) {
    console.error('Failed to generate with Gemini:', error);
    throw error;
  }
};


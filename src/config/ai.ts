// AI Configuration - Legacy file for compatibility
// The actual AI configuration is now handled by the backend

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-pro';

// These are kept for backward compatibility but are not used directly
// The frontend now communicates with the backend which handles AI integration
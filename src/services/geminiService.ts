// ============================================
// GEMINI AI SERVICE - TEXT POLISHING
// ============================================

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI (API key should be set in environment)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI | null {
    if (!API_KEY) {
        console.warn('Gemini API key not configured. AI features will be disabled.');
        return null;
    }
    if (!genAI) {
        genAI = new GoogleGenerativeAI(API_KEY);
    }
    return genAI;
}

export type PolishType = 'kaizen' | 'kudos';

const PROMPTS: Record<PolishType, string> = {
    kaizen: `You are a professional business writing assistant. 
Rewrite the following text to be:
- Professional and clear
- Focused on impact and actionable outcomes
- Concise (under 50 words)
- Keep the same meaning but improve clarity

Text to polish:`,
    kudos: `You are a warm and encouraging writing assistant.
Rewrite the following message to be:
- Warm, sincere, and encouraging
- Enthusiastic but professional
- Concise (under 40 words)
- Keep the same meaning but make it more heartfelt

Message to polish:`,
};

/**
 * Polish text using Gemini AI
 * @param draft - Original text to polish
 * @param type - Type of polishing ('kaizen' for ideas, 'kudos' for recognition messages)
 * @returns Polished text or original if API fails
 */
export async function generateRefinedText(draft: string, type: PolishType): Promise<string> {
    const ai = getGenAI();

    if (!ai) {
        console.log('AI not available, returning original text');
        return draft;
    }

    try {
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `${PROMPTS[type]}

"${draft}"

Provide only the polished text, no explanations or quotes.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        // Remove quotes if the AI added them
        const cleaned = text.replace(/^["']|["']$/g, '').trim();

        return cleaned || draft;
    } catch (error) {
        console.error('AI polishing failed:', error);
        return draft;
    }
}

/**
 * Check if AI features are available
 */
export function isAIAvailable(): boolean {
    return !!API_KEY;
}

import { GoogleGenAI } from '@google/genai';

// Cosine similarity
export function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

// Clean OCR noise from text chunks
export function cleanText(text: string): string {
  if (!text) return '';

  return text.split('\n')
    .map(line => {
      const simpleClean = line.replace(/[|{}]/g, ' ').trim();
      if (simpleClean.length === 0) return null;

      const totalChars = simpleClean.length;
      const alphaChars = (simpleClean.match(/[a-zA-Z]/g) || []).length;
      const words = simpleClean.split(/\s+/);
      const avgWordLength = words.length > 0 ? simpleClean.replace(/\s/g, '').length / words.length : 0;

      if (/^[\s._-]+$/.test(simpleClean)) return null;
      if (totalChars > 4 && (alphaChars / totalChars) < 0.4) return null;
      if (words.length > 2 && avgWordLength < 2) return null;

      return simpleClean;
    })
    .filter(line => line !== null)
    .join('\n');
}

// Embed query using Google's embedding model
export async function embedQuery(query: string): Promise<number[]> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Google API key');
  }

  const genAI = new GoogleGenAI({apiKey});

  try {
    const result = await genAI.models.embedContent({
      model: 'text-embedding-004',
      contents: query
    });
    return result.embeddings?.[0]?.values || [];
  } catch (error) {
    console.error('Error embedding query:', error);
    throw new Error('Failed to embed query');
  }
}

// Tavily search result type
export interface TavilyResult {
  content?: string;
  snippet?: string;
  url?: string;
  [key: string]: unknown;
}

// Search Tavily for web results
export async function searchTavily(query: string): Promise<TavilyResult[]> {
  const tavilyApiKey = process.env.TAVILY_API_KEY;
  if (!tavilyApiKey) {
    console.warn('Missing Tavily API key, skipping web search');
    return [];
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tavilyApiKey}`,
      },
      body: JSON.stringify({
        query,
        max_results: 5,
        search_depth: 'basic',
      }),
    });

    if (!response.ok) {
      console.error('Tavily search failed:', response.status);
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching Tavily:', error);
    return [];
  }
}

// Citation type for responses
export interface Citation {
  text: string;
  citation: string;
  sourceType: string;
  score: number;
}

// Generate response using Gemini
export async function generateResponse(prompt: string): Promise<{ answer: string; citations: Citation[] }> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Google API key');
  }

  const genAI = new GoogleGenAI({apiKey});

  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    const text = result.text || '';

    // Try to parse as JSON, fallback to plain text
    try {
      const parsed = JSON.parse(text);
      return {
        answer: parsed.answer || text,
        citations: parsed.citations || [],
      };
    } catch {
      return {
        answer: text,
        citations: [],
      };
    }
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate response');
  }
}

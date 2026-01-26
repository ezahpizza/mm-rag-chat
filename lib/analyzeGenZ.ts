import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export interface GenZAnalysisResult {
  clauses: string[];
  category: string;
  summary: string;
  explanation: string;
}

const ALLOWED_CATEGORIES = [
  'Obligations & Responsibilities',
  'Liabilities & Risks',
  'Financial Commitments',
  'Rights & Benefits',
  'Termination & Exit Conditions',
  'Loopholes & Grey Areas',
  'Privacy & Data Use'
];

export async function analyzeGenZDocument(file: File): Promise<GenZAnalysisResult[]> {
  const start = Date.now();
  console.log(`Starting Gen-Z analysis for: ${file.name}`);

  // Convert file to base64 for Gemini
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  // System prompt for Gen-Z style analysis
  const systemPrompt = `You are a legal document analyst specializing in making complex legal terms accessible to Gen-Z and millennials. Your task is to analyze legal documents and break down clauses into categories with fun, relatable summaries using current pop culture references, memes, and "brainrot" language that resonates with youth culture.

Focus on identifying key clauses that could impact someone's rights, obligations, or financial situation. For each category, provide:
1. The actual clauses from the document
2. A short, meme-filled summary (1 paragraph) using Gen-Z slang, pop culture refs, TikTok trends
3. A more detailed explanation (1-2 paragraphs) in casual tone explaining implications

Be authentic to Gen-Z voice: use terms like "lit", "sus", "bet", "no cap", "slay", "vibe check", reference current memes, social media trends, and pop culture. Make it engaging and not boring legal jargon.`;

  const schemaInstruction = `Return ONLY JSON array (no markdown, no commentary):
[
  {
    "clauses": ["exact clause text 1", "exact clause text 2"],
    "category": "One of: ${ALLOWED_CATEGORIES.join(' | ')}",
    "summary": "1 paragraph Gen-Z style summary with memes/pop culture refs",
    "explanation": "1-2 paragraph casual explanation of implications"
  }
]

Rules:
- Extract exact clause text from the document
- Use ONLY the allowed categories listed above
- Make summaries fun and relatable with current Gen-Z language
- Keep explanations informative but conversational
- Group related clauses under appropriate categories
- Focus on clauses with real impact (financial, legal, rights-based)`;

  // Use Gemini's multimodal capabilities to process PDF directly
  const { text: raw } = await generateText({
    model: google('gemini-3-flash-preview'),
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Please analyze this legal document "${file.name}" and break down the key clauses into Gen-Z friendly categories and summaries. ${schemaInstruction}`
          },
          {
            type: 'file',
            data: base64,
            mimeType: 'application/pdf'
          }
        ]
      }
    ]
  });

  const cleaned = sanitizeJsonString(raw);
  const parsed = strictParse(cleaned, file.name);
  const validated = validateAndNormalize(parsed, file.name);

  console.log(`Gen-Z analysis completed in ${(Date.now() - start)}ms with ${validated.length} categories.`);
  return validated;
}

function sanitizeJsonString(raw: string): string {
  let txt = raw.trim();
  if (txt.startsWith('```')) {
    txt = txt.replace(/```(?:json)?/g, '').trim();
  }
  const firstBracket = txt.indexOf('[');
  if (firstBracket > 0) txt = txt.slice(firstBracket);
  const lastBracket = txt.lastIndexOf(']');
  if (lastBracket !== -1) txt = txt.slice(0, lastBracket + 1);
  return txt;
}

function strictParse(cleaned: string, docName: string): GenZAnalysisResult[] {
  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array');
    }
    return parsed as GenZAnalysisResult[];
  } catch (error) {
    console.error(`Failed to parse Gen-Z analysis response for ${docName}:`, error);
    console.error('Raw response:', cleaned);
    throw new Error(`Failed to parse analysis results for ${docName}`);
  }
}

function validateAndNormalize(results: GenZAnalysisResult[], docName: string): GenZAnalysisResult[] {
  const validCategories = new Set(ALLOWED_CATEGORIES);

  const validated: GenZAnalysisResult[] = [];

  for (const result of results) {
    // Validate required fields
    if (!result.clauses || !Array.isArray(result.clauses) || result.clauses.length === 0) {
      console.warn(`Skipping result with invalid clauses for ${docName}`);
      continue;
    }

    if (!result.category || typeof result.category !== 'string') {
      console.warn(`Skipping result with invalid category for ${docName}`);
      continue;
    }

    if (!result.summary || typeof result.summary !== 'string') {
      console.warn(`Skipping result with invalid summary for ${docName}`);
      continue;
    }

    if (!result.explanation || typeof result.explanation !== 'string') {
      console.warn(`Skipping result with invalid explanation for ${docName}`);
      continue;
    }

    // Validate category is allowed
    if (!validCategories.has(result.category)) {
      console.warn(`Invalid category "${result.category}" for ${docName}, skipping`);
      continue;
    }

    // Clean up clauses (remove empty strings, trim)
    const cleanClauses = result.clauses
      .filter(clause => typeof clause === 'string' && clause.trim().length > 0)
      .map(clause => clause.trim())
      .filter((clause, index, arr) => arr.indexOf(clause) === index); // Remove duplicates

    if (cleanClauses.length === 0) {
      console.warn(`No valid clauses after cleaning for ${docName}`);
      continue;
    }

    validated.push({
      clauses: cleanClauses,
      category: result.category,
      summary: result.summary.trim(),
      explanation: result.explanation.trim()
    });
  }

  // Remove duplicate categories, keeping the first occurrence
  const seenCategories = new Set<string>();
  const deduped = validated.filter(result => {
    if (seenCategories.has(result.category)) {
      return false;
    }
    seenCategories.add(result.category);
    return true;
  });

  return deduped;
}
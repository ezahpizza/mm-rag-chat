import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { ComparisonResponse } from '@/components/compare/types';

export interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  citations?: Array<{
    source?: string;
    url?: string;
    title?: string;
  }>;
}

export interface SummaryOptions {
  title?: string;
  includeMetadata?: boolean;
  customInstructions?: string;
}

export interface SummaryResult {
  summary: string;
  metadata: {
    messageCount: number;
    generatedAt: string;
    title: string;
    wordCount: number;
  };
}

/**
 * Generates a comprehensive summary of a chat transcript using Gemini
 */
export async function generateChatSummary(
  messages: ChatMessage[], 
  options: SummaryOptions = {}
): Promise<SummaryResult> {
  if (!messages || messages.length === 0) {
    throw new Error('Messages array cannot be empty');
  }

  // Prepare chat transcript for summarization
  const transcript = messages.map((msg, index) => {
    const speaker = msg.role === 'user' ? 'User' : 'Lexi (AI Assistant)';
    const content = msg.text;
    const citations = msg.citations && msg.citations.length > 0 
      ? `\n[Sources: ${msg.citations.map(c => c.source || c.title || 'Document').join(', ')}]`
      : '';
    
    return `${index + 1}. ${speaker}: ${content}${citations}`;
  }).join('\n\n');

  const systemPrompt = options.customInstructions || `You are an expert legal document analyst tasked with creating comprehensive summaries of legal document consultation sessions.

**SUMMARY REQUIREMENTS:**

1. **Executive Summary**: 2-3 sentences capturing the main legal consultation topic
2. **Key Legal Issues Discussed**: Bullet points of main legal concepts, documents, or questions addressed
3. **Important Findings**: Critical insights, risks, or recommendations provided
4. **Document References**: List any documents or legal sources mentioned
5. **Action Items/Recommendations**: Specific next steps or advice given
6. **Legal Context**: Brief explanation of relevant legal framework or implications

**TONE**: Professional, clear, suitable for legal professionals and clients
**LENGTH**: Comprehensive but concise (300-500 words)
**FORMAT**: Use clear headings and bullet points for readability

Create a detailed summary that captures the essence and value of this legal consultation session.`;

  // Generate detailed summary using Gemini
  const summaryResult = await generateText({
    model: google('gemini-3-flash-preview'),
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: `Please create a comprehensive summary of this legal document consultation session:

**Chat Transcript:**
${transcript}

${options.title ? `**Session Title:** ${options.title}` : ''}

Please provide a detailed, professional summary following the format requirements above.`
      }
    ],
    temperature: 0.3,
  });

  const summary = summaryResult.text;
  const wordCount = summary.split(/\s+/).length;

  return {
    summary,
    metadata: {
      messageCount: messages.length,
      generatedAt: new Date().toISOString(),
      title: options.title || 'Legal Consultation Session',
      wordCount
    }
  };
}

/**
 * Validates a comparison response before saving
 */
export function validateComparisonResponse(response: ComparisonResponse): boolean {
  try {
    // Check required top-level properties
    if (!response.comparisons || !response.summary || !response.metadata) {
      return false;
    }

    // Check if comparisons is an array
    if (!Array.isArray(response.comparisons)) {
      return false;
    }

    // Check if each comparison has required fields
    const hasValidComparisons = response.comparisons.every(comp => 
      comp.clause && 
      comp.docA_text && 
      comp.docB_text && 
      comp.difference_summary &&
      comp.impact &&
      comp.risk_level &&
      comp.category
    );

    if (!hasValidComparisons) {
      return false;
    }

    // Check metadata structure
    if (!response.metadata.docA || !response.metadata.docB || !response.metadata.alignment_stats) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating comparison response:', error);
    return false;
  }
}

/**
 * Creates metadata for saving comparison reports
 */
export function createSaveMetadata(docNames: string[]) {
  return {
    docNames,
    savedAt: new Date().toISOString(),
    version: '1.0'
  };
}

/**
 * Validates document names for saving
 */
export function validateDocNames(docNames: string[]): boolean {
  return Array.isArray(docNames) && 
         docNames.length === 2 && 
         docNames.every(name => typeof name === 'string' && name.trim().length > 0);
}

/**
 * Extracts key insights from a comparison response for quick reference
 */
export function extractComparisonInsights(response: ComparisonResponse) {
  const stats = response.metadata.alignment_stats;
  const highRiskCount = stats.high_risk || 0;
  const mediumRiskCount = stats.medium_risk || 0;
  const lowRiskCount = stats.low_risk || 0;
  const totalComparisons = response.comparisons.length;

  // Get top risk categories
  const categoryCounts = response.comparisons.reduce((acc, comp) => {
    acc[comp.category] = (acc[comp.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([category, count]) => ({ category, count }));

  return {
    totalComparisons,
    riskDistribution: {
      high: highRiskCount,
      medium: mediumRiskCount,
      low: lowRiskCount
    },
    riskPercentages: {
      high: Math.round((highRiskCount / totalComparisons) * 100),
      medium: Math.round((mediumRiskCount / totalComparisons) * 100),
      low: Math.round((lowRiskCount / totalComparisons) * 100)
    },
    topCategories,
    overallRiskLevel: highRiskCount > 0 ? 'high' : mediumRiskCount > 0 ? 'medium' : 'low'
  };
}
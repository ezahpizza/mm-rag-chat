import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { ComparisonResponse, ComparisonResult, Extraction } from '@/components/compare';

// Public entry point 
export async function compareDocuments(fileA: File, fileB: File): Promise<ComparisonResponse> {
  const start = Date.now();
  const [bufA, bufB] = await Promise.all([fileA.arrayBuffer(), fileB.arrayBuffer()]);

  const systemInstruction = `You are an expert legal document comparison engine.
You receive TWO full legal documents (Document A and Document B) as PDF file inputs.
TASKS:
1. Extract salient CLAUSES from each document. A clause is a coherent provision. Focus on: Financial, Termination, Liability, Obligations, Rights. Others go to Other.
2. For each clause in A find the best corresponding clause in B (semantic + functional similarity). If no suitable match (similarity < meaningful alignment) you may skip it.
3. Produce at most the top 60 most material aligned clause differences (prioritize higher risk & substantive differences; exclude trivial punctuation-only differences).
4. For each aligned pair produce:
   - clause: short human-readable label (e.g. Payment Terms, Termination Notice, Liability Cap)
   - docA_text: concise excerpt (<= 500 chars) capturing essence of A clause
   - docB_text: concise excerpt (<= 500 chars)
   - difference_summary: concrete, specific difference (quote figures/periods/caps)
   - impact: which party benefits / practical consequence
   - risk_level: high | medium | low (high = material financial/legal exposure; medium = notable but moderate; low = stylistic/minor)
   - category: one of Financial | Termination | Liability | Obligations | Rights | Other
5. Generate an EXECUTIVE SUMMARY (3-4 paragraphs) that:
   - Opens with quantitative overview (counts by risk/category)
   - Details key high & medium risk diffs SPECIFICALLY (include numbers, timeframes, caps)
   - Gives category clustering insights
   - Concludes with prioritized actionable recommendations.
6. Output STRICT JSON ONLY matching this TypeScript schema (no markdown fences, no commentary):
{
  "comparisons": [
    {
      "clause": string,
      "docA_text": string,
      "docB_text": string,
      "difference_summary": string,
      "impact": string,
      "risk_level": "high"|"medium"|"low",
      "category": "Financial"|"Termination"|"Liability"|"Obligations"|"Rights"|"Other"
    }
  ],
  "summary": string,
  "metadata": {
    "docA": { "id": string, "total_clauses": number, "compared_clauses": number },
    "docB": { "id": string, "total_clauses": number, "compared_clauses": number },
    "alignment_stats": { "total_alignments": number, "high_risk": number, "medium_risk": number, "low_risk": number },
    "generated_at": string
  }
}
RULES:
- MUST be valid JSON parsable by JSON.parse.
- Do not include keys with null/undefined.
- Use ISO8601 UTC timestamp for generated_at.
- If a doc lacks a category entirely set counts accordingly but still include category in any comparisons where relevant.
`;

  const [extractedA, extractedB] = await Promise.all([
    extractPdf(Buffer.from(bufA), fileA.name),
    extractPdf(Buffer.from(bufB), fileB.name)
  ]);

  const maxCharsPerDoc = 45000; // safeguard against context window
  const docATrimmed = extractedA.text.slice(0, maxCharsPerDoc);
  const docBTrimmed = extractedB.text.slice(0, maxCharsPerDoc);

  const maybeEmbedA = extractedA.lowConfidence ? `\n<<DOCUMENT_A_BASE64_PDF>>\n${extractedA.base64?.slice(0, 12000) || ''}\n<<END_DOCUMENT_A_BASE64_PDF>>` : '';
  const maybeEmbedB = extractedB.lowConfidence ? `\n<<DOCUMENT_B_BASE64_PDF>>\n${extractedB.base64?.slice(0, 12000) || ''}\n<<END_DOCUMENT_B_BASE64_PDF>>` : '';

  const documentsSection = `<<DOCUMENT_A_START>>\n${docATrimmed}\n<<DOCUMENT_A_END>>${maybeEmbedA}\n\n<<DOCUMENT_B_START>>\n${docBTrimmed}\n<<DOCUMENT_B_END>>${maybeEmbedB}`;

  const fullPrompt = `${systemInstruction}\n\nDOCUMENT SOURCE TEXTS:\n${documentsSection}`;

  const { text: raw } = await generateText({
    model: google('gemini-2.5-flash'),
    prompt: fullPrompt,
  });

  const cleaned = sanitizeJsonString(raw);
  let parsed: ComparisonResponse | null = null;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    // Attempt to salvage JSON substring
    const salvage = attemptSalvage(cleaned);
    if (salvage) {
      try { parsed = JSON.parse(salvage); } catch {/* ignore */}
    }
  }

  if (!parsed) {
    return buildFallbackResponse(fileA.name, fileB.name, cleaned);
  }

  // Post-process / normalize
  const normalized = normalizeResponse(parsed, fileA.name, fileB.name);
  console.log(`Gemini comparison completed in ${(Date.now() - start)}ms with ${normalized.comparisons.length} comparisons.`);
  return normalized;
}

// -------------------- Helpers --------------------

function sanitizeJsonString(raw: string): string {
  let txt = raw.trim();
  // Remove markdown code fences if present
  if (txt.startsWith('```')) {
    txt = txt.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
  }
  // Remove any leading explanation before first '{'
  const firstBrace = txt.indexOf('{');
  if (firstBrace > 0) txt = txt.slice(firstBrace);
  // Remove trailing after last '}'
  const lastBrace = txt.lastIndexOf('}');
  if (lastBrace !== -1) txt = txt.slice(0, lastBrace + 1);
  return txt;
}

function attemptSalvage(txt: string): string | null {
  const first = txt.indexOf('{');
  const last = txt.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) return null;
  return txt.slice(first, last + 1);
}

function buildFallbackResponse(docAId: string, docBId: string, raw: string): ComparisonResponse {
  return {
    comparisons: [],
    summary: `Automated structured comparison failed to parse. Raw model output retained for manual review.`,
    metadata: {
      docA: { id: docAId, total_clauses: 0, compared_clauses: 0 },
      docB: { id: docBId, total_clauses: 0, compared_clauses: 0 },
      alignment_stats: { total_alignments: 0, high_risk: 0, medium_risk: 0, low_risk: 0 },
      generated_at: new Date().toISOString(),
    },
  };
}

function normalizeResponse(resp: ComparisonResponse, docAId: string, docBId: string): ComparisonResponse {
  const validCategories = new Set(['Financial','Termination','Liability','Obligations','Rights','Other']);
  const validRisks = new Set(['high','medium','low']);

  const cleanedComparisons: ComparisonResult[] = (resp.comparisons || []).map(c => ({
    clause: truncate(c.clause || 'Clause', 80),
    docA_text: truncate(c.docA_text || '', 500),
    docB_text: truncate(c.docB_text || '', 500),
    difference_summary: truncate(c.difference_summary || 'No difference summary provided.', 600),
    impact: truncate(c.impact || 'Impact not provided.', 400),
    risk_level: validRisks.has(c.risk_level) ? c.risk_level : 'medium',
    category: validCategories.has(c.category) ? c.category : 'Other',
  }));

  const high = cleanedComparisons.filter(c => c.risk_level === 'high').length;
  const medium = cleanedComparisons.filter(c => c.risk_level === 'medium').length;
  const low = cleanedComparisons.filter(c => c.risk_level === 'low').length;

  // Derive totals if model omitted or miscounted.
  const totalAlignments = cleanedComparisons.length;

  // Extract numbers the model claimed for total clauses if present; else estimate.
  const docAClauses = resp.metadata?.docA?.total_clauses ?? cleanedComparisons.length;
  const docBClauses = resp.metadata?.docB?.total_clauses ?? cleanedComparisons.length;

  return {
    comparisons: cleanedComparisons,
    summary: resp.summary || 'No summary generated.',
    metadata: {
      docA: { id: docAId, total_clauses: docAClauses, compared_clauses: cleanedComparisons.length },
      docB: { id: docBId, total_clauses: docBClauses, compared_clauses: cleanedComparisons.length },
      alignment_stats: { total_alignments: totalAlignments, high_risk: high, medium_risk: medium, low_risk: low },
      generated_at: resp.metadata?.generated_at || new Date().toISOString(),
    },
  };
}

function truncate(str: string, max: number): string {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 3) + '...' : str;
}

// -------------------- PDF Text Extraction --------------------


async function extractPdf(buffer: Buffer, fileName: string): Promise<Extraction> {
  let rawText = '';
  let lowConfidence = false;
  try {
    const pdfParseModule = await import('pdf-parse');
    const pdf = (pdfParseModule as any).default || pdfParseModule;
    const data: { text: string; numpages: number } = await pdf(buffer);
    rawText = (data.text || '').replace(/\u0000/g, ' ').trim();
    if (!rawText || rawText.length < 50) {
      lowConfidence = true;
    }
  } catch (e) {
    console.warn('Primary pdf-parse failed for', fileName);
    lowConfidence = true;
  }

  // Heuristic fallback: attempt to salvage printable characters if pdf-parse weak.
  if (lowConfidence) {
    if (!rawText) {
      // extract naive printable bytes
      const ascii = buffer.toString('latin1').replace(/[^\x20-\x7E\n]+/g, ' ').replace(/ +/g, ' ').trim();
      rawText = ascii.slice(0, 20000) || `Unable to extract meaningful text from ${fileName}.`;
    }
  }

  // Final sanitation: collapse excessive blank lines
  const cleaned = rawText.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0).join('\n');

  return {
    text: cleaned || `No extractable text found in ${fileName}.`,
    lowConfidence,
    base64: lowConfidence ? buffer.toString('base64') : undefined,
  };
}


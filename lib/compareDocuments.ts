import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { ComparisonResponse, ComparisonResult } from '@/components/compare';

export async function compareDocuments(fileA: File, fileB: File): Promise<ComparisonResponse> {
  const start = Date.now();
  console.log(`Starting Gemini native PDF comparison for: ${fileA.name} and ${fileB.name}`);

  // Convert files to base64 for Gemini
  const [bufferA, bufferB] = await Promise.all([
    fileA.arrayBuffer(),
    fileB.arrayBuffer()
  ]);

  const [base64A, base64B] = [
    Buffer.from(bufferA).toString('base64'),
    Buffer.from(bufferB).toString('base64')
  ];

  // Enhanced system prompt for better legal document analysis
  const systemPrompt = `You are an expert legal document analyst. Compare these two legal documents comprehensively and identify all substantive differences. Focus on:

1. **Financial Terms**: Salary, bonuses, benefits, compensation structures, payment schedules
2. **Employment Terms**: Job titles, responsibilities, reporting structures, work arrangements
3. **Time-based Clauses**: Contract duration, notice periods, probation periods, renewal terms
4. **Termination Conditions**: Grounds for termination, severance, post-termination obligations
5. **Legal Obligations**: Confidentiality, non-compete, intellectual property, compliance requirements
6. **Rights and Benefits**: Leave policies, training, equipment, reimbursements
7. **Liability and Risk**: Indemnification, limitation of liability, dispute resolution
8. **Governance**: Jurisdiction, governing law, amendment procedures

Analyze both documents thoroughly and provide detailed comparisons with specific examples and implications.`;

  const schemaInstruction = `Return ONLY JSON (no markdown, no commentary):
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

Rules:
- Identify ALL substantive differences, no limit on number
- Focus on material changes that affect rights, obligations, or financial terms
- Extract exact text excerpts from both documents for comparison
- Assess risk level based on potential impact on the parties
- Use concise but descriptive clause labels
- Provide detailed impact analysis for each difference
- Use UTC ISO timestamp for generated_at
- If no differences found, explain why in the summary`;

  // Use Gemini's multimodal capabilities to process PDFs directly
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
            text: `Please compare these two legal documents and identify all substantive differences. Document A is "${fileA.name}" and Document B is "${fileB.name}". ${schemaInstruction}`
          },
          {
            type: 'file',
            data: base64A,
            mimeType: 'application/pdf'
          },
          {
            type: 'file', 
            data: base64B,
            mimeType: 'application/pdf'
          }
        ]
      }
    ]
  });

  const cleaned = sanitizeJsonString(raw);
  const parsed = strictParse(cleaned, fileA.name, fileB.name);
  const validated = simpleValidate(parsed, fileA.name, fileB.name);
  const normalized = normalizeResponse(validated, fileA.name, fileB.name);
  console.log(`Gemini comparison completed in ${(Date.now() - start)}ms with ${normalized.comparisons.length} comparisons.`);
  return normalized;
}

function sanitizeJsonString(raw: string): string {
  let txt = raw.trim();
  if (txt.startsWith('```')) {
    txt = txt.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
  }
  const firstBrace = txt.indexOf('{');
  if (firstBrace > 0) txt = txt.slice(firstBrace);
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

function buildFallbackResponse(docAId: string, docBId: string): ComparisonResponse {
  return {
    comparisons: [],
    summary: 'Model output could not be parsed into JSON. Raw output truncated.',
    metadata: {
      docA: { id: docAId, total_clauses: 0, compared_clauses: 0 },
      docB: { id: docBId, total_clauses: 0, compared_clauses: 0 },
      alignment_stats: { total_alignments: 0, high_risk: 0, medium_risk: 0, low_risk: 0 },
      generated_at: new Date().toISOString(),
    },
  };
}

function strictParse(cleaned: string, docAId: string, docBId: string): ComparisonResponse {
  let parsed: unknown = null;
  try { parsed = JSON.parse(cleaned); } catch {
    const salvage = attemptSalvage(cleaned);
    if (salvage) {
      try { parsed = JSON.parse(salvage); } catch { return buildFallbackResponse(docAId, docBId); }
    } else {
      return buildFallbackResponse(docAId, docBId);
    }
  }
  if (!parsed || typeof parsed !== 'object') return buildFallbackResponse(docAId, docBId);
  if (!Array.isArray((parsed as Record<string, unknown>).comparisons) || typeof (parsed as Record<string, unknown>).summary !== 'string' || !(parsed as Record<string, unknown>).metadata) {
    return buildFallbackResponse(docAId, docBId);
  }
  return parsed as ComparisonResponse;
}

function simpleValidate(resp: ComparisonResponse, docAId: string, docBId: string): ComparisonResponse {
  const validCategories = new Set(['Financial','Termination','Liability','Obligations','Rights','Other']);
  const validRisks = new Set(['high','medium','low']);
  const structuralNoisePatterns = [
    /cross[- ]?reference/i,
    /xref/i,
    /object offsets?/i,
    /stream length/i,
    /unique file identifier/i,
    /trailer dictionary/i,
    /pdf version/i,
    /byte (?:range|offset)/i,
    /object id/i,
    /internal structure/i
  ];

  const cleaned: ComparisonResult[] = [];
  for (const c of resp.comparisons || []) {
    if (!c) continue;
    const clause = (c.clause || '').toString().trim();
    const docA_text = (c.docA_text || '').toString().trim();
    const docB_text = (c.docB_text || '').toString().trim();
    const difference_summary = (c.difference_summary || '').toString().trim();
    const impact = (c.impact || '').toString().trim();
    const risk_level = validRisks.has(c.risk_level) ? c.risk_level : 'medium';
    const category = validCategories.has(c.category) ? c.category : 'Other';

    if (!clause || !docA_text || !docB_text || !difference_summary || !impact) continue;
    
    // Allow longer text excerpts for better legal analysis
    if (docA_text.length > 1000 || docB_text.length > 1000) continue;

    // Filter structural noise - should be less likely with native PDF processing
    const structuralHit = structuralNoisePatterns.some(rx => 
      rx.test(difference_summary) || rx.test(docA_text) || rx.test(docB_text) || rx.test(clause)
    );
    if (structuralHit) continue;

    cleaned.push({ clause, docA_text, docB_text, difference_summary, impact, risk_level: risk_level as 'high' | 'medium' | 'low', category: category as 'Financial' | 'Termination' | 'Liability' | 'Obligations' | 'Rights' | 'Other' });
  }

  // Deduplicate by clause and content similarity
  const seen = new Set<string>();
  const deduped: ComparisonResult[] = [];
  for (const c of cleaned) {
    const key = c.clause + '|' + c.difference_summary.slice(0, 50);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(c);
  }

  return {
    comparisons: deduped, 
    summary: resp.summary || (deduped.length === 0 ? 'No substantive differences identified between the documents.' : `Identified ${deduped.length} substantive differences between the documents.`),
    metadata: {
      docA: { id: docAId, total_clauses: resp.metadata?.docA?.total_clauses ?? deduped.length, compared_clauses: deduped.length },
      docB: { id: docBId, total_clauses: resp.metadata?.docB?.total_clauses ?? deduped.length, compared_clauses: deduped.length },
      alignment_stats: resp.metadata?.alignment_stats || { total_alignments: deduped.length, high_risk: 0, medium_risk: 0, low_risk: 0 },
      generated_at: new Date().toISOString(),
    }
  };
}

function normalizeResponse(resp: ComparisonResponse, docAId: string, docBId: string): ComparisonResponse {
  const validCategories = new Set(['Financial','Termination','Liability','Obligations','Rights','Other']);
  const validRisks = new Set(['high','medium','low']);

  const cleanedComparisons: ComparisonResult[] = (resp.comparisons || []).map(c => ({
    clause: truncate(c.clause || 'Clause', 100), // Longer clause descriptions
    docA_text: truncate(c.docA_text || '', 800), // Longer excerpts for legal context
    docB_text: truncate(c.docB_text || '', 800),
    difference_summary: truncate(c.difference_summary || 'No difference summary provided.', 800), // More detailed summaries
    impact: truncate(c.impact || 'Impact not provided.', 600), // More detailed impact analysis
    risk_level: validRisks.has(c.risk_level) ? c.risk_level : 'medium',
    category: validCategories.has(c.category) ? c.category : 'Other',
  }));

  const high = cleanedComparisons.filter(c => c.risk_level === 'high').length;
  const medium = cleanedComparisons.filter(c => c.risk_level === 'medium').length;
  const low = cleanedComparisons.filter(c => c.risk_level === 'low').length;

  const totalAlignments = cleanedComparisons.length;
  const docAClauses = resp.metadata?.docA?.total_clauses ?? cleanedComparisons.length;
  const docBClauses = resp.metadata?.docB?.total_clauses ?? cleanedComparisons.length;

  return {
    comparisons: cleanedComparisons,
    summary: resp.summary || 'No summary generated.',
    metadata: {
      docA: { id: docAId, total_clauses: docAClauses, compared_clauses: cleanedComparisons.length },
      docB: { id: docBId, total_clauses: docBClauses, compared_clauses: cleanedComparisons.length },
      alignment_stats: { total_alignments: totalAlignments, high_risk: high, medium_risk: medium, low_risk: low },
      generated_at: new Date().toISOString(),
    },
  };
}

function truncate(str: string, max: number): string {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 3) + '...' : str;
}

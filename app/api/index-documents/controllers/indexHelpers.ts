import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { LlamaParseReader } from '@llamaindex/cloud';
import { writeFile, unlink } from 'fs/promises';
import os from 'os';
import path from 'path';

export async function parseFormData(req: Request): Promise<{ files: File[] }> {
  try {
    const formData = await req.formData();
    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key === 'files' && value instanceof File) {
        files.push(value);
      }
    }
    return { files };
  } catch (error) {
    console.error('Error parsing form data:', error);
    throw new Error('Failed to parse form data');
  }
}

export async function parsePdfWithFallback(buffer: Buffer, fileName: string): Promise<Array<{ text: string; metadata: Record<string, unknown> }>> {
  try {
    const apiKey = process.env.LLAMA_CLOUD_API_KEY || process.env.LLAMA_CLOUD_APIKEY;
    if (!apiKey) {
      console.warn('Missing LlamaCloud API key, using fallback');
      return await parseWithBasicExtraction(buffer, fileName);
    }
    const reader = new LlamaParseReader({
      resultType: 'markdown',
      apiKey: apiKey,
      verbose: true,
    });
    const tmpDir = os.tmpdir();
    const fileExtension = path.extname(fileName) || '.pdf';
    const tmpPath = path.join(tmpDir, `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${fileExtension}`);
    await writeFile(tmpPath, buffer);
    try {
      console.log('Starting LlamaParse for:', fileName);
      const docs = await reader.loadData(tmpPath);
      console.log('LlamaParse completed, docs:', docs?.length || 0);
      if (!docs || docs.length === 0) {
        console.warn('No documents parsed with LlamaParse, using fallback');
        return await parseWithBasicExtraction(buffer, fileName);
      }
      return docs.map((doc: { getText?: () => string; text?: string; metadata?: Record<string, unknown> }, index: number) => {
        const text = doc.getText ? doc.getText() : doc.text || '';
        const metadata = doc.metadata || {};
        return {
          text: text.trim(),
          metadata: {
            file_name: fileName,
            page_number: metadata.page_number || index + 1,
            content_type: 'pdf',
            parsing_method: 'llamaparse',
            ...metadata,
          },
        };
      }).filter(doc => doc.text.length > 0);
    } finally {
      try {
        await unlink(tmpPath);
      } catch {
        // Lint: ignore unused error variable
        console.warn('Could not delete temp file:', tmpPath);
      }
    }
  } catch {
    // Lint: ignore unused error variable
    console.error('Error in LlamaParse, falling back');
    return await parseWithBasicExtraction(buffer, fileName);
  }
}

export async function parseWithBasicExtraction(buffer: Buffer, fileName: string): Promise<Array<{ text: string; metadata: Record<string, unknown> }>> {
  try {
    try {
      // Dynamic import for pdf-parse to avoid require lint error
      const pdfParseModule = await import('pdf-parse');
      const pdf = pdfParseModule.default || pdfParseModule;
      const data = await pdf(buffer);
      if (data.text && data.text.trim().length > 0) {
        return [{
          text: data.text.trim(),
          metadata: {
            file_name: fileName,
            page_number: 1,
            content_type: 'pdf',
            parsing_method: 'pdf-parse',
            total_pages: data.numpages || 1,
          },
        }];
      }
    } catch {
      // Lint: ignore unused error variable
      console.warn('pdf-parse not available or failed');
    }
    return [{
      text: `PDF document: ${fileName}. Please ensure the PDF is readable and contains extractable text.`,
      metadata: {
        file_name: fileName,
        page_number: 1,
        content_type: 'pdf',
        parsing_method: 'fallback',
      },
    }];
  } catch {
    // Lint: ignore unused error variable
    console.error('Basic PDF extraction failed');
    return [{
      text: `PDF document: ${fileName}. Content extraction failed.`,
      metadata: {
        file_name: fileName,
        page_number: 1,
        content_type: 'pdf',
        parsing_method: 'error',
      },
    }];
  }
}

export async function describeImageWithGemini(buffer: Buffer, fileName: string): Promise<{ text: string; metadata: Record<string, unknown> }> {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('Missing Google API key');
    }

    const prompt = `You are an expert at describing images for RAG systems. Provide a detailed, factual description of this image, focusing on:
- Any text content visible in the image
- Charts, graphs, or data visualizations
- Key visual elements and their relationships
- Technical details if it's a diagram or schematic
- Context that would be useful for search and retrieval

Be concise but comprehensive. Do not speculate or add information not visible in the image.`;

    const base64Image = buffer.toString('base64');
    const mimeType = fileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

    // Use AI SDK for image analysis
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image',
              image: `data:${mimeType};base64,${base64Image}`,
            },
          ],
        },
      ],
    });

    return {
      text: text.trim() || 'No description available.',
      metadata: {
        file_name: fileName,
        content_type: 'image_description',
        parsing_method: 'gemini_vision',
      },
    };
  } catch (error) {
    console.error('Error in describeImageWithGemini:', error);
    throw new Error('Failed to describe image');
  }
}

// Lint: ignore unused error variable
// 'overlap' is currently unused but kept for API compatibility
export function chunkText(text: string, maxChunkSize: number = 1000, _overlap: number = 200) {
  const chunks = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let currentChunk = '';
  let currentSize = 0;
  for (const sentence of sentences) {
    const sentenceWithPunctuation = sentence.trim() + '.';
    if (currentSize + sentenceWithPunctuation.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      const overlapText = currentChunk.split(/[.!?]+/).slice(-2).join('.') + '.';
      currentChunk = overlapText + ' ' + sentenceWithPunctuation;
      currentSize = currentChunk.length;
    } else {
      currentChunk += ' ' + sentenceWithPunctuation;
      currentSize += sentenceWithPunctuation.length;
    }
  }
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  return chunks.length > 0 ? chunks : [text];
}

import { GoogleGenAI } from '@google/genai';
import { LlamaParseReader } from '@llamaindex/cloud';
import { promises as fs } from 'fs';
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

export async function parsePdfWithFallback(buffer: Buffer, fileName: string) {
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
    await fs.writeFile(tmpPath, buffer);
    try {
      console.log('Starting LlamaParse for:', fileName);
      const docs = await reader.loadData(tmpPath);
      console.log('LlamaParse completed, docs:', docs?.length || 0);
      if (!docs || docs.length === 0) {
        console.warn('No documents parsed with LlamaParse, using fallback');
        return await parseWithBasicExtraction(buffer, fileName);
      }
      return docs.map((doc: any, index: number) => {
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
        await fs.unlink(tmpPath);
      } catch (unlinkError) {
        console.warn('Could not delete temp file:', tmpPath);
      }
    }
  } catch (error: any) {
    console.error('Error in LlamaParse, falling back:', error);
    return await parseWithBasicExtraction(buffer, fileName);
  }
}

export async function parseWithBasicExtraction(buffer: Buffer, fileName: string) {
  try {
    try {
      const pdf = require('pdf-parse');
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
    } catch (pdfParseError) {
      console.warn('pdf-parse not available or failed:', pdfParseError);
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
  } catch (error: any) {
    console.error('Basic PDF extraction failed:', error);
    return [{
      text: `PDF document: ${fileName}. Content extraction failed: ${error.message}`,
      metadata: {
        file_name: fileName,
        page_number: 1,
        content_type: 'pdf',
        parsing_method: 'error',
      },
    }];
  }
}

export async function describeImageWithGemini(buffer: Buffer, fileName: string) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('Missing Google API key');
    }
    const genAI = new GoogleGenAI({apiKey});
    const prompt = `You are an expert at describing images for RAG systems. Provide a detailed, factual description of this image, focusing on:\n- Any text content visible in the image\n- Charts, graphs, or data visualizations\n- Key visual elements and their relationships\n- Technical details if it's a diagram or schematic\n- Context that would be useful for search and retrieval\n\nBe concise but comprehensive. Do not speculate or add information not visible in the image.`;
    const base64Image = buffer.toString('base64');
    const mimeType = fileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Image,
              },
            },
            { text: prompt }
          ]
        }
      ]
    });
    const text = result.text || 'No description available.';
    return {
      text: text.trim(),
      metadata: {
        file_name: fileName,
        content_type: 'image_description',
        parsing_method: 'gemini_vision',
      },
    };
  } catch (error: any) {
    console.error('Error in describeImageWithGemini:', error);
    throw new Error(`Failed to describe image: ${error.message}`);
  }
}

export async function embedDocs(docs: { text: string }[]) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('Missing Google API key');
    }
    const genAI = new GoogleGenAI({apiKey});
    const embeddings = [];
    const batchSize = 5;
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = docs.slice(i, i + batchSize);
      const batchPromises = batch.map(async (doc, batchIndex) => {
        try {
          if (batchIndex > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          const result = await genAI.models.embedContent({
            model: 'text-embedding-004',
            contents: doc.text.slice(0, 8000)
          });
          return result.embeddings?.[0]?.values || null;
        } catch (error) {
          console.error(`Error embedding document ${i + batchIndex}:`, error);
          return null;
        }
      });
      const batchEmbeddings = await Promise.all(batchPromises);
      embeddings.push(...batchEmbeddings);
      if (i + batchSize < docs.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    return embeddings.filter(emb => emb !== null);
  } catch (error: any) {
    console.error('Error in embedDocs:', error);
    throw new Error(`Failed to embed documents: ${error.message}`);
  }
}

export function chunkText(text: string, maxChunkSize: number = 1000, overlap: number = 200) {
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

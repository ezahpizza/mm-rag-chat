import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { promises as fs } from 'fs';
import { GoogleGenAI } from '@google/genai';
import { LlamaParseReader } from '@llamaindex/cloud';
import os from 'os';
import path from 'path';

const PINECONE_INDEX = 'multimodal-rag-demo';

export const maxDuration = 60;

async function parseFormData(req: Request): Promise<{ files: File[] }> {
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

// Enhanced PDF parsing with proper fallback
async function parsePdfWithFallback(buffer: Buffer, fileName: string) {
  // Try LlamaParse first
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

    // Create temp file
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

      // Process docs with proper text extraction
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
      // Clean up temp file
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

// Basic PDF extraction fallback
async function parseWithBasicExtraction(buffer: Buffer, fileName: string) {
  try {
    // Try to use pdf-parse if available
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
    
    // Ultimate fallback
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

async function describeImageWithGemini(buffer: Buffer, fileName: string) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('Missing Google API key');
    }

    const genAI = new GoogleGenAI({apiKey});

    const prompt = `You are an expert at describing images for RAG systems. Provide a detailed, factual description of this image, focusing on:
- Any text content visible in the image
- Charts, graphs, or data visualizations
- Key visual elements and their relationships
- Technical details if it's a diagram or schematic
- Context that would be useful for search and retrieval

Be concise but comprehensive. Do not speculate or add information not visible in the image.`;

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

// embedding with batching and error handling
async function embedDocs(docs: { text: string }[]) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('Missing Google API key');
    }

    const genAI = new GoogleGenAI({apiKey});
    const embeddings = [];

    // Process in smaller batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = docs.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (doc, batchIndex) => {
        try {
          // Add delay to avoid rate limiting
          if (batchIndex > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          const result = await genAI.models.embedContent({
            model: 'text-embedding-004',
            contents: doc.text.slice(0, 8000) // Truncate if too long
          });
          
          return result.embeddings?.[0]?.values || null;
        } catch (error) {
          console.error(`Error embedding document ${i + batchIndex}:`, error);
          return null;
        }
      });
      
      const batchEmbeddings = await Promise.all(batchPromises);
      embeddings.push(...batchEmbeddings);
      
      // Add delay between batches
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

// chunking for better retrieval
function chunkText(text: string, maxChunkSize: number = 1000, overlap: number = 200) {
  const chunks = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  let currentSize = 0;
  
  for (const sentence of sentences) {
    const sentenceWithPunctuation = sentence.trim() + '.';
    
    if (currentSize + sentenceWithPunctuation.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Create overlap by keeping last few sentences
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

export async function POST(req: Request) {
  try {
    console.log('Starting document indexing...');
    
    const { files } = await parseFormData(req);
    if (!files || files.length === 0) {
      return NextResponse.json({ message: 'No files uploaded.' }, { status: 400 });
    }

    console.log('Files received:', files.map(f => f.name));

    const pineconeApiKey = process.env.PINECONE_API_KEY;
    if (!pineconeApiKey) {
      return NextResponse.json({ message: 'Missing Pinecone API key' }, { status: 500 });
    }

    const pinecone = new Pinecone({ apiKey: pineconeApiKey });
    const index = pinecone.Index(PINECONE_INDEX);
    
    let allDocs: any[] = [];

    // Process files
    for (const file of files) {
      try {
        console.log(`Processing file: ${file.name} (${file.type})`);
        
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = file.name;
        const mimetype = file.type;

        let fileDocs: any[] = [];

        if (mimetype === 'application/pdf') {
          fileDocs = await parsePdfWithFallback(buffer, fileName);
        } else if (mimetype === 'image/png' || mimetype === 'image/jpeg') {
          const imageDesc = await describeImageWithGemini(buffer, fileName);
          fileDocs = [imageDesc];
        } else {
          console.warn(`Unsupported file type: ${mimetype}`);
          continue;
        }

        // Chunk large documents for better retrieval
        const chunkedDocs = [];
        for (const doc of fileDocs) {
          if (doc.text.length > 1000) {
            const chunks = chunkText(doc.text);
            chunks.forEach((chunk, chunkIndex) => {
              chunkedDocs.push({
                text: chunk,
                metadata: {
                  ...doc.metadata,
                  chunk_index: chunkIndex,
                  total_chunks: chunks.length,
                  is_chunked: true,
                }
              });
            });
          } else {
            chunkedDocs.push({
              ...doc,
              metadata: {
                ...doc.metadata,
                is_chunked: false,
              }
            });
          }
        }

        allDocs = allDocs.concat(chunkedDocs);
        
      } catch (fileError: any) {
        console.error(`Error processing file ${file.name}:`, fileError);
        return NextResponse.json({ 
          message: `Failed to process file ${file.name}: ${fileError.message}` 
        }, { status: 400 });
      }
    }

    if (!allDocs || allDocs.length === 0) {
      return NextResponse.json({ message: 'No documents to embed.' }, { status: 400 });
    }

    console.log(`Processing ${allDocs.length} document chunks...`);
    
    // Filter out empty documents
    const validDocs = allDocs.filter(doc => doc.text && doc.text.trim().length > 10);
    if (validDocs.length === 0) {
      return NextResponse.json({ message: 'No valid document content found.' }, { status: 400 });
    }

    console.log(`Embedding ${validDocs.length} valid documents...`);
    const embeddings = await embedDocs(validDocs);

    if (embeddings.length !== validDocs.length) {
      return NextResponse.json({ 
        message: `Embedding count mismatch: ${embeddings.length} embeddings for ${validDocs.length} documents` 
      }, { status: 500 });
    }

    console.log('Upserting to Pinecone...');
    
    // Upsert to Pinecone in batches
    const batchSize = 50; // Smaller batches for better reliability
    let totalUpserted = 0;
    
    for (let i = 0; i < validDocs.length; i += batchSize) {
      const batch = [];
      for (let j = i; j < Math.min(i + batchSize, validDocs.length); j++) {
        const doc = validDocs[j];
        const embedding = embeddings[j];
        
        if (embedding && embedding.length > 0) {
          const docId = `${doc.metadata.file_name}-${doc.metadata.page_number || 1}-${doc.metadata.chunk_index || 0}-${j}`;
          
          batch.push({
            id: docId,
            values: embedding,
            metadata: {
              text: doc.text,
              ...doc.metadata,
              indexed_at: new Date().toISOString(),
            },
          });
        }
      }
      
      if (batch.length > 0) {
        await index.upsert(batch);
        totalUpserted += batch.length;
        console.log(`Upserted batch ${Math.floor(i / batchSize) + 1}, total: ${totalUpserted}`);
      }
    }

    console.log(`Document indexing completed successfully. Total documents indexed: ${totalUpserted}`);
    return NextResponse.json({ 
      message: 'Documents indexed successfully.',
      stats: {
        total_files: files.length,
        total_chunks: totalUpserted,
        valid_documents: validDocs.length,
      }
    });
    
  } catch (error: any) {
    console.error('Error in POST handler:', error);
    return NextResponse.json({ 
      message: error.message || 'Indexing failed.' 
    }, { status: 500 });
  }
}
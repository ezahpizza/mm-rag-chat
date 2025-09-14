import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { google } from '@ai-sdk/google';
import { embed } from 'ai';
import { parseFormData } from '@/lib/formUtils';
import {
  parseFallback,
  describeImageWithGemini,
  chunkText
} from './controllers/indexHelpers';

const PINECONE_INDEX = 'multimodal-rag-demo';

export const maxDuration = 60;

// Interface for document structure
interface Doc {
  text: string;
  metadata: Record<string, unknown>;
}

// Embed documents using AI SDK
async function embedDocs(docs: Doc[]): Promise<number[][]> {
  try {
    const embeddings = [];
    
    // Process embeddings in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = docs.slice(i, i + batchSize);
      const batchPromises = batch.map(async (doc) => {
        const { embedding } = await embed({
          model: google.textEmbeddingModel('text-embedding-004'),
          value: doc.text,
        });
        return embedding;
      });
      
      const batchEmbeddings = await Promise.all(batchPromises);
      embeddings.push(...batchEmbeddings);
    }
    
    return embeddings;
  } catch (error) {
    console.error('Error embedding documents:', error);
    throw new Error('Failed to embed documents');
  }
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
    
    interface Doc {
      text: string;
      metadata: Record<string, unknown>;
    }
    let allDocs: Doc[] = [];

    // Process files
    for (const file of files) {
      try {
        console.log(`Processing file: ${file.name} (${file.type})`);
        
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = file.name;
        const mimetype = file.type;

        let fileDocs: Doc[] = [];

        if (mimetype === 'application/pdf') {
          fileDocs = await parseFallback(buffer, fileName);
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
        
      } catch (fileError: unknown) {
        let message = 'Unknown error';
        if (fileError instanceof Error) message = fileError.message;
        console.error(`Error processing file ${file.name}:`, fileError);
        return NextResponse.json({ 
          message: `Failed to process file ${file.name}: ${message}` 
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
    
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Error) message = error.message;
    console.error('Error in POST handler:', error);
    return NextResponse.json({ 
      message: message || 'Indexing failed.' 
    }, { status: 500 });
  }
}
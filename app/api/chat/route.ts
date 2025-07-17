import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import {
  cosineSimilarity,
  cleanText,
  embedQuery,
  searchTavily,
  generateResponse,
  Citation,
  TavilyResult
} from './controllers/chatHelpers';

const PINECONE_INDEX = 'multimodal-rag-demo';

// ...existing code...

export async function POST(req: Request) {
  try {
    const { query_text } = await req.json();
    
    if (!query_text) {
      return NextResponse.json({ message: 'No query_text provided.' }, { status: 400 });
    }

    console.log('Processing query:', query_text);

    // Initialize Pinecone
    const pineconeApiKey = process.env.PINECONE_API_KEY;
    if (!pineconeApiKey) {
      return NextResponse.json({ message: 'Missing Pinecone API key' }, { status: 500 });
    }

    const pinecone = new Pinecone({ apiKey: pineconeApiKey });
    const index = pinecone.Index(PINECONE_INDEX);

    // Embed the query
    const queryEmbedding = await embedQuery(query_text);

    // Search both RAG and web in parallel
    const [ragResults, webResults] = await Promise.all([
      // Search Pinecone
      index.query({
        vector: queryEmbedding,
        topK: 10,
        includeMetadata: true,
      }),
      // Search web
      searchTavily(query_text),
    ]);

    // Process RAG results
    const ragChunks: Citation[] = ragResults.matches?.map((match: { metadata?: { text?: string; file_name?: string; page_number?: number }; score?: number }) => ({
      text: cleanText(match.metadata?.text || ''),
      citation: match.metadata?.file_name
        ? `${match.metadata.file_name}${match.metadata.page_number ? ' p.' + match.metadata.page_number : ''}`
        : 'Unknown source',
      sourceType: 'internal',
      score: match.score || 0,
    })) || [];

    // Process web results
    const webChunks: Citation[] = (webResults as TavilyResult[]).map((result) => ({
      text: cleanText(result.content || result.snippet || ''),
      citation: result.url || '',
      sourceType: 'web',
      score: 0.8,
    }));

    // Combine and sort by relevance
    const allChunks = [...ragChunks, ...webChunks];
    
    // Re-rank by embedding similarity if we have embeddings
    let topChunks: Citation[] = [];
    
    if (queryEmbedding.length > 0) {
      const chunksWithEmbeddings = [];
      
      for (const chunk of allChunks) {
        if (chunk.text.trim().length > 0) {
          try {
            const chunkEmbedding = await embedQuery(chunk.text);
            const similarity = cosineSimilarity(queryEmbedding, chunkEmbedding);
            chunksWithEmbeddings.push({ ...chunk, score: similarity });
          } catch (error) {
            console.error('Error embedding chunk:', error);
            chunksWithEmbeddings.push({ ...chunk, score: chunk.score || 0 });
          }
        }
      }
      
      // Sort by score and take top 5
      chunksWithEmbeddings.sort((a, b) => b.score - a.score);
      topChunks = chunksWithEmbeddings.slice(0, 5);
    } else {
      topChunks = allChunks.slice(0, 5);
    }

    // Filter out empty chunks
    const validChunks = topChunks.filter(chunk => chunk.text.trim().length > 0);

    if (validChunks.length === 0) {
      return NextResponse.json({
        answer: "I couldn't find relevant information to answer your question. Please try rephrasing or check if documents have been uploaded.",
        citations: [],
      });
    }

    // Build context for the prompt
    const contextText = validChunks
      .map((chunk, i) => `[${i + 1}] ${chunk.text}\nSource: ${chunk.citation}\n`)
      .join('\n');

    const prompt = `You are a helpful assistant. Using the following context, answer the user's question accurately and concisely. 

Important instructions:
1. Base your answer ONLY on the provided context
2. If you can't find relevant information in the context, say so
3. Include inline citations using [1], [2], etc. format
4. Keep your answer under 150 words
5. Respond in JSON format with "answer" and "citations" fields

User question: ${query_text}

Context:
${contextText}

Provide your response as JSON with:
- "answer": your response with inline citations
- "citations": array of objects with "text" (relevant excerpt) and "citation" (source reference)`;

    // Generate response
    const { answer, citations } = await generateResponse(prompt);

    // Format citations for frontend
    const formattedCitations = citations.length > 0 
      ? citations 
      : validChunks.map(chunk => ({
          text: chunk.text.slice(0, 100) + (chunk.text.length > 100 ? '...' : ''),
          citation: chunk.citation,
        }));

    return NextResponse.json({
      answer: answer || "I couldn't generate a response based on the available information.",
      citations: formattedCitations,
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in chat handler:', error);
      return NextResponse.json({ 
        message: error.message || 'Chat processing failed.' 
      }, { status: 500 });
    } else {
      console.error('Unknown error in chat handler:', error);
      return NextResponse.json({ message: 'Chat processing failed.' }, { status: 500 });
    }
  }
}
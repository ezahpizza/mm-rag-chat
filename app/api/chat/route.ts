import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from '@google/genai';

const PINECONE_INDEX = 'multimodal-rag-demo';

//cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

// clean OCR noise from text chunks
function cleanText(text: string): string {
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
async function embedQuery(query: string): Promise<number[]> {
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

// Search Tavily for web results
async function searchTavily(query: string): Promise<any[]> {
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

// Generate response using Gemini
async function generateResponse(prompt: string): Promise<{ answer: string; citations: any[] }> {
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
    const ragChunks = ragResults.matches?.map((match: any) => ({
      text: cleanText(match.metadata?.text || ''), 
      citation: match.metadata?.file_name 
        ? `${match.metadata.file_name}${match.metadata.page_number ? ' p.' + match.metadata.page_number : ''}`
        : 'Unknown source',
      sourceType: 'internal',
      score: match.score || 0,
    })) || [];

    // Process web results
    const webChunks = webResults.map((result: any) => ({
      text: cleanText(result.content || result.snippet || ''),
      citation: result.url || '',
      sourceType: 'web',
      score: 0.8, 
    }));

    // Combine and sort by relevance
    const allChunks = [...ragChunks, ...webChunks];
    
    // Re-rank by embedding similarity if we have embeddings
    let topChunks: { text: any; citation: any; sourceType: string; score: any; }[] = [];
    
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

  } catch (error: any) {
    console.error('Error in chat handler:', error);
    return NextResponse.json({ 
      message: error.message || 'Chat processing failed.' 
    }, { status: 500 });
  }
}
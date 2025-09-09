import { tool } from 'ai';
import { z } from 'zod';
import { Pinecone } from '@pinecone-database/pinecone';
import { google } from '@ai-sdk/google';

const PINECONE_INDEX = 'multimodal-rag-demo';

// Clean OCR noise from text chunks
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

// Cosine similarity function
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

export interface RAGResult {
  text: string;
  citation: string;
  sourceType: string;
  score: number;
}

export const createRAGTool = () => 
  tool({
    description: 'Search through uploaded documents including resumes, PDFs, and other files in the knowledge base. Use this tool FIRST when users mention specific names, people, documents, or ask about uploaded content. This contains the most relevant and specific information about individuals and documents.',
    parameters: z.object({
      query: z.string().describe('The search query to find relevant information in uploaded documents'),
      topK: z.number().optional().default(10).describe('Number of top similar documents to retrieve'),
    }),
    execute: async ({ query, topK = 10 }: { query: string; topK?: number }) => {
      console.log('RAG Tool called with query:', query);
      
      const pineconeApiKey = process.env.PINECONE_API_KEY;
      if (!pineconeApiKey) {
        console.warn('Missing Pinecone API key, skipping document search');
        return 'Document search is currently unavailable due to missing API configuration. Please provide answers based on general knowledge.';
      }

      try {
        // Initialize Pinecone
        const pinecone = new Pinecone({ apiKey: pineconeApiKey });
        const index = pinecone.Index(PINECONE_INDEX);

        // Embed the query using Google's text embedding model
        const embeddingModel = google.textEmbedding('text-embedding-004');
        const { embeddings: [queryEmbedding] } = await embeddingModel.doEmbed({
          values: [query],
        });

        // Search Pinecone
        const searchResults = await index.query({
          vector: queryEmbedding,
          topK,
          includeMetadata: true,
        });

        // Process results
        const ragResults: RAGResult[] = searchResults.matches?.map((match) => ({
          text: cleanText(match.metadata?.text as string || ''),
          citation: match.metadata?.file_name
            ? `${match.metadata.file_name}${match.metadata.page_number ? ' p.' + match.metadata.page_number : ''}`
            : 'Unknown source',
          sourceType: 'internal',
          score: match.score || 0,
        })).filter(result => result.text.trim().length > 0) || [];

        // Re-rank by embedding similarity for better relevance
        const rerankedResults = [];
        for (const result of ragResults) {
          if (result.text.trim().length > 0) {
            try {
              const { embeddings: [resultEmbedding] } = await embeddingModel.doEmbed({
                values: [result.text],
              });
              const similarity = cosineSimilarity(queryEmbedding, resultEmbedding);
              rerankedResults.push({ ...result, score: similarity });
            } catch (error) {
              console.error('Error re-ranking result:', error);
              rerankedResults.push(result);
            }
          }
        }

        // Sort by score and take top results
        rerankedResults.sort((a, b) => b.score - a.score);
        const topResults = rerankedResults.slice(0, 5);

        if (topResults.length === 0) {
          return `No relevant documents found in the knowledge base for "${query}". Please provide answers based on general knowledge.`;
        }

        // Format results for the AI to use
        let formattedResults = `Document search results for "${query}":\n\n`;
        formattedResults += `Found ${topResults.length} relevant documents:\n\n`;
        
        topResults.forEach((result, index) => {
          formattedResults += `${index + 1}. **Source: ${result.citation}** (Relevance: ${(result.score * 100).toFixed(1)}%)\n`;
          formattedResults += `   Content: ${result.text.substring(0, 500)}${result.text.length > 500 ? '...' : ''}\n\n`;
        });

        return formattedResults;
      } catch (error) {
        console.error('Error searching documents:', error);
        return `Document search encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please provide answers based on general knowledge.`;
      }
    },
  });

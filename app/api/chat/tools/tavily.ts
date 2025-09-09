import { tool } from 'ai';
import { z } from 'zod';

export interface TavilyResult {
  content?: string;
  snippet?: string;
  url?: string;
  title?: string;
  score?: number;
  [key: string]: unknown;
}

export const createTavilyTool = () => {
  return tool({
    description: 'Search the web for current and general information, regulations, and policy updates. Use this as SECONDARY tool after searching uploaded documents, or for general knowledge not found in the knowledge base',
    parameters: z.object({
      query: z.string().describe('The search query to find relevant web information'),
      maxResults: z.number().optional().default(5).describe('Maximum number of results to return'),
      searchDepth: z.enum(['basic', 'advanced']).optional().default('basic').describe('Depth of search to perform'),
    }),
    execute: async ({ query, maxResults = 5, searchDepth = 'basic' }: { 
      query: string; 
      maxResults?: number; 
      searchDepth?: 'basic' | 'advanced' 
    }) => {
    const tavilyApiKey = process.env.TAVILY_API_KEY;
    if (!tavilyApiKey) {
      console.warn('Missing Tavily API key, skipping web search');
      return `Web search is currently unavailable due to missing API configuration. Please provide the information based on general knowledge and recommend checking official government sources for the latest updates.`;
    }

    try {
      console.log('Making Tavily search request for:', query);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: tavilyApiKey,
          query,
          max_results: maxResults,
          search_depth: searchDepth,
          include_answer: true,
          include_raw_content: false,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('Tavily search failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Tavily error details:', errorText);
        return `Web search encountered an error (${response.status}). Please provide the best answer based on available knowledge and recommend checking official sources for the latest information.`;
      }

      const data = await response.json();
      console.log('Tavily search successful, found', data.results?.length || 0, 'results');
      
      if (!data.results || data.results.length === 0) {
        return `No current web results found for "${query}". Please provide the best answer based on general knowledge and recommend checking official government websites for the latest information.`;
      }

      // Format results for the AI to use
      let formattedResults = `Web search results for "${query}":\n\n`;
      
      if (data.answer) {
        formattedResults += `Summary: ${data.answer}\n\n`;
      }
      
      formattedResults += "Sources:\n";
      data.results.slice(0, maxResults).forEach((result: TavilyResult, index: number) => {
        const title = result.title || 'Untitled';
        const url = result.url || 'No URL';
        const content = (result.content || result.snippet || 'No content available').substring(0, 500); // Limit content length
        
        formattedResults += `${index + 1}. **${title}**\n`;
        formattedResults += `   URL: ${url}\n`;
        formattedResults += `   Content: ${content}${content.length === 500 ? '...' : ''}\n\n`;
      });
      
      console.log('Formatted Tavily results length:', formattedResults.length);
      return formattedResults;
      
    } catch (error) {
      console.error('Error searching Tavily:', error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        return `Web search timed out. Please provide the best answer based on available knowledge and recommend checking official sources for current information.`;
      }
      
      return `Web search encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please provide the best answer based on available knowledge and recommend checking official sources for current information.`;
    }
  },
  });
};

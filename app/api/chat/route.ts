import { google } from '@ai-sdk/google';
import { streamText, convertToCoreMessages } from 'ai';
import { createTavilyTool } from './tools/tavily';
import { createRAGTool } from './tools/rag';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages format', { status: 400 });
    }

    console.log('Processing chat request with', messages.length, 'messages');

    // Test without tools first, then add them back
    let result;
    
    try {
      // Try with tools but set toolChoice to 'none' initially
      const ragTool = createRAGTool();
      const tavilyTool = createTavilyTool();
      
      console.log('Tools created successfully: Documents (RAG) and Web (Tavily)');

      result = await streamText({
        model: google('gemini-2.5-flash'),
        messages: convertToCoreMessages(messages),
        tools: {
          Documents: ragTool,
          Web: tavilyTool,
        },
        toolChoice: 'auto',
        maxSteps: 5,
        system: `You are **Lexi**, an intelligent legal document assistant powered by multimodal generative AI. Your role is to **simplify, explain, and analyze complex legal documents** so that users can clearly understand their rights, obligations, and potential risks.

 **TOOL SELECTION PRIORITY**

1. **Documents Tool (Primary)**

   * Always use the Documents tool first when queries involve:

     * Uploaded contracts, agreements, scanned legal files, or resumes.
     * Specific clauses, names, terms, or details that are likely in the knowledge base.
     * Requests for explanation, simplification, or comparison of uploaded text.
     * Specific document analysis or evaluation

2. **Web Tool (Secondary)**

   * Use only if:

     * Query requires current regulations, case law, or policy updates.
     * Supplementary context is needed beyond what documents provide after document search
     * User explicitly requests external information (e.g., “latest Indian rental law”).

 **CRITICAL INSTRUCTIONS**

1. **Always prioritize the user’s uploaded documents** before external sources.
2. **When parsing clauses:**

   * Break them into **plain-language explanations**.
   * Identify potential **risks, obligations, or unusual terms**.
   * Offer examples where appropriate.
3. **Never provide legal advice.** Instead, frame outputs as **informational guidance** (e.g., “This clause suggests…” instead of “You should…”).
4. **Maintain privacy-first reasoning:** never assume or expose unrelated personal data.
5. Always conclude responses with a **clear, structured summary** and, if relevant, **suggested next steps** (e.g., “You may want to clarify this clause with a legal professional”).


 **RESPONSE FLOW**

1. Detect intent: Is the user asking about a **document, clause, or general law?**
2. If documents are relevant → **query Documents tool first**.
3. Summarize findings → simplify into **tiered clarity**:

   * Clause meaning (plain English)
   * Why it matters (risk/obligation/opportunity)
   * Actionable takeaway
4. If broader context needed → supplement with Web tool.
5. Synthesize results into a **cohesive, context-aware explanation**, not just excerpts.
6. Present output in **structured, easy-to-skim format** (e.g., headings, bullet points, highlights).

 **OUTPUT STYLE**

* Clear, neutral, professional tone.
* Use **everyday language** unless legal terms are unavoidable (and explain them if used).
* When comparing multiple documents, present findings in a **side-by-side or bullet comparison**.
* Always label information sources (Document vs Web).
`,
        temperature: 0.3,
      });
    } catch (toolError) {
      console.error('Error with tools, falling back to simple response:', toolError);
      // Fallback to simple response without tools
      result = await streamText({
        model: google('gemini-2.5-flash'),
        messages: convertToCoreMessages(messages),
        system: `You are a helpful AI assistant. Provide clear and concise responses.`,
        temperature: 0.7,
      });
    }

    console.log('StreamText result created successfully');
    return result.toDataStreamResponse();

  } catch (error) {
    console.error('Error in chat API:', error);
    
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ error: error.message }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'An unknown error occurred' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
import { Message } from 'ai/react';
import { ChatMessage } from '@/lib/summary/summaryHelpers';
import { exportChatSummaryToPDF } from '@/lib/pdf';

/**
 * Convert AI SDK messages to ChatMessage format for summarization
 */
export const convertMessagesToChatFormat = (messages: Message[]): ChatMessage[] => {
  return messages.map(message => ({
    role: message.role === 'user' ? 'user' : 'bot',
    text: message.content,
    // Parse citations from content if they exist (simple implementation)
    citations: extractCitationsFromContent(message.content)
  }));
};

/**
 * Extract citations from message content (basic implementation)
 * This is a placeholder - you may need to adjust based on your citation format
 */
const extractCitationsFromContent = (content: string): Array<{source?: string; url?: string; title?: string}> => {
  // Look for citation patterns in the content
  // This is a basic implementation - adjust as needed
  const citationRegex = /\[Source: ([^\]]+)\]/g;
  const citations: Array<{source?: string; url?: string; title?: string}> = [];
  let match;
  
  while ((match = citationRegex.exec(content)) !== null) {
    citations.push({
      source: match[1],
      title: match[1]
    });
  }
  
  return citations;
};

/**
 * Handle summarize and save functionality
 */
export const handleSummarizeAndSave = async (
  messages: Message[],
  title?: string
): Promise<{success: boolean; message: string; chatId?: string}> => {
  try {
    if (!messages || messages.length === 0) {
      throw new Error('No messages to summarize');
    }

    const chatMessages = convertMessagesToChatFormat(messages);
    
    const response = await fetch('/api/chat/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: chatMessages,
        title: title || 'Legal Consultation Summary'
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to summarize chat');
    }

    const result = await response.json();
    
    return {
      success: true,
      message: 'Chat summary saved successfully',
      chatId: result.chatId
    };

  } catch (error) {
    console.error('Error in summarize and save:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to summarize chat'
    };
  }
};

/**
 * Handle summarize and export functionality
 */
export const handleSummarizeAndExport = async (
  messages: Message[],
  title?: string
): Promise<{success: boolean; message: string; chatId?: string}> => {
  try {
    if (!messages || messages.length === 0) {
      throw new Error('No messages to summarize');
    }

    const chatMessages = convertMessagesToChatFormat(messages);
    
    const response = await fetch('/api/chat/summarize-and-export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: chatMessages,
        title: title || 'Legal Consultation Summary',
        exportToPdf: true
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to summarize chat');
    }

    const result = await response.json();
    
    // Export to PDF using the utility
    exportChatSummaryToPDF(result.summary, {
      chatId: result.chatId,
      title: result.metadata.title,
      messageCount: result.metadata.messageCount,
      wordCount: result.metadata.wordCount,
      generatedAt: result.metadata.generatedAt
    });
    
    return {
      success: true,
      message: 'Chat summary saved and PDF exported successfully',
      chatId: result.chatId
    };

  } catch (error) {
    console.error('Error in summarize and export:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to summarize and export chat'
    };
  }
};
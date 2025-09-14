import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { saveChatSummary } from '@/lib/db/operations';
import { generateChatSummary, ChatMessage, SummaryOptions } from '@/lib/summary/summaryHelpers';
import { nanoid } from 'nanoid';

export const maxDuration = 60;

interface SummarizeAndExportRequest {
  messages: ChatMessage[];
  title?: string;
  customInstructions?: string;
  exportToPdf?: boolean;
}

export async function POST(req: Request) {
  try {
    // Get user authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { 
      messages, 
      title, 
      customInstructions, 
      exportToPdf = true 
    }: SummarizeAndExportRequest = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required and must not be empty' },
        { status: 400 }
      );
    }

    console.log(`📝 Generating summary for chat with ${messages.length} messages (export: ${exportToPdf})`);

    // Generate summary using helper function
    const summaryOptions: SummaryOptions = {
      title,
      includeMetadata: true,
      customInstructions
    };

    const summaryResult = await generateChatSummary(messages, summaryOptions);

    // Save summary to database
    const chatId = nanoid(12);
    const saveResult = await saveChatSummary(userId, chatId, summaryResult.summary);

    console.log(`✅ Chat summary generated and saved with chatId: ${chatId}`);

    // Prepare response data
    const responseData = {
      success: true,
      chatId: saveResult.chatId,
      summary: summaryResult.summary,
      message: exportToPdf 
        ? 'Chat summary generated, saved, and ready for PDF export' 
        : 'Chat summary generated and saved successfully',
      metadata: {
        ...summaryResult.metadata,
        title: title || 'Legal Consultation Summary',
        chatId: saveResult.chatId
      },
      exportReady: exportToPdf
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Error in summarize and export:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to generate summary: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate and save chat summary' },
      { status: 500 }
    );
  }
}
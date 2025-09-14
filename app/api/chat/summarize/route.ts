import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { saveChatSummary } from '@/lib/db/operations';
import { generateChatSummary, ChatMessage, SummaryOptions } from '@/lib/summary/summaryHelpers';
import { nanoid } from 'nanoid';

export const maxDuration = 60;

interface SummarizeRequest {
  messages: ChatMessage[];
  title?: string;
  customInstructions?: string;
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

    const { messages, title, customInstructions }: SummarizeRequest = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required and must not be empty' },
        { status: 400 }
      );
    }

    console.log(`📝 Generating summary for chat with ${messages.length} messages`);

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

    return NextResponse.json({
      success: true,
      chatId: saveResult.chatId,
      summary: summaryResult.summary,
      message: 'Chat summary generated and saved successfully',
      metadata: summaryResult.metadata
    });

  } catch (error) {
    console.error('❌ Error generating chat summary:', error);
    
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
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import ChatSummary, { ChatSummaryLean } from '@/lib/models/ChatSummary';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find the specific chat summary for this user
    const { chatId } = await params;
    const chatSummary = await ChatSummary.findOne({ 
      chatId, 
      userId 
    }).lean<ChatSummaryLean>();

    if (!chatSummary) {
      return NextResponse.json(
        { error: 'Chat summary not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Retrieved chat summary ${chatId} for user ${userId}`);

    return NextResponse.json({
      success: true,
      chatId: chatSummary.chatId,
      summary: chatSummary.summary,
      createdAt: chatSummary.createdAt
    });

  } catch (error) {
    console.error('❌ Error retrieving chat summary:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve chat summary' },
      { status: 500 }
    );
  }
}
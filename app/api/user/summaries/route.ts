import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import ChatSummary, { ChatSummaryLean } from '@/lib/models/ChatSummary';

export async function GET() {
  try {
    // Get user authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Fetch all chat summaries for the user, sorted by creation date (newest first)
    const summaries = await ChatSummary.find({ userId })
      .sort({ createdAt: -1 })
      .lean<ChatSummaryLean[]>();

    return NextResponse.json({
      success: true,
      summaries: summaries.map(summary => ({
        chatId: summary.chatId,
        summary: summary.summary,
        createdAt: summary.createdAt,
      })),
    });

  } catch (error) {
    console.error('Error fetching chat summaries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat summaries' },
      { status: 500 }
    );
  }
}
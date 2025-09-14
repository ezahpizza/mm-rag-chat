import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import ChatSummary from '@/lib/models/ChatSummary';
import User from '@/lib/models/User';
import { nanoid } from 'nanoid';

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

    const { summary } = await req.json();
    
    if (!summary || typeof summary !== 'string') {
      return NextResponse.json(
        { error: 'Summary is required and must be a string' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Ensure user exists in our database
    await User.findOneAndUpdate(
      { userId },
      { userId },
      { upsert: true, new: true }
    );

    // Generate unique chat ID
    const chatId = nanoid(12);

    // Create chat summary
    const chatSummary = new ChatSummary({
      chatId,
      userId,
      summary,
    });

    await chatSummary.save();

    return NextResponse.json({
      success: true,
      chatId,
      message: 'Chat summary saved successfully',
    });

  } catch (error) {
    console.error('Error saving chat summary:', error);
    return NextResponse.json(
      { error: 'Failed to save chat summary' },
      { status: 500 }
    );
  }
}
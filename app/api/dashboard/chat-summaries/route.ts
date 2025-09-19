import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserChatSummaries } from '@/lib/db/operations';

export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const summaries = await getUserChatSummaries(userId);

    return NextResponse.json({ summaries });
  } catch (error) {
    console.error('Error fetching chat summaries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
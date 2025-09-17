import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { deleteUserChatSummary } from '@/lib/db/operations';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatId } = await params;
    const result = await deleteUserChatSummary(userId, chatId);

    if (!result.success) {
      return NextResponse.json({ error: 'Chat summary not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
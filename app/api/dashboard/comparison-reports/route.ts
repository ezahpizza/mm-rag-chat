import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserComparisonReports, deleteUserComparisonReport } from '@/lib/db/operations';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reports = await getUserComparisonReports(userId);

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching comparison reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { reportId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await deleteUserComparisonReport(userId, reportId);

    if (!result.success) {
      return NextResponse.json({ error: 'Comparison report not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comparison report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
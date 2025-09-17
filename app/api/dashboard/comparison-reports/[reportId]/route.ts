import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserComparisonReport } from '@/lib/db/operations';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportId } = await params;
    const report = await getUserComparisonReport(userId, reportId);

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ report: report.fullReport, docNames: report.docNames });
  } catch (error) {
    console.error('Error fetching comparison report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
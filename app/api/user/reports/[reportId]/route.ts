import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import ComparisonReport, { ComparisonReportLean } from '@/lib/models/ComparisonReport';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    // Get user authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { reportId } = await params;

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Fetch the specific report ensuring it belongs to the authenticated user
    const report = await ComparisonReport.findOne({ 
      reportId, 
      userId 
    }).lean<ComparisonReportLean>();

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      report: {
        reportId: report.reportId,
        docNames: report.docNames,
        createdAt: report.createdAt,
        fullReport: report.report, // Complete ComparisonResponse object
      },
    });

  } catch (error) {
    console.error('Error fetching comparison report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comparison report' },
      { status: 500 }
    );
  }
}
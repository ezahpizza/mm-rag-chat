import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import ComparisonReport, { ComparisonReportLean } from '@/lib/models/ComparisonReport';

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

    // Fetch all comparison reports for the user, sorted by creation date (newest first)
    const reports = await ComparisonReport.find({ userId })
      .sort({ createdAt: -1 })
      .lean<ComparisonReportLean[]>();

    return NextResponse.json({
      success: true,
      reports: reports.map(report => ({
        reportId: report.reportId,
        docNames: report.docNames,
        summary: report.report.summary, // Extract summary from full report
        createdAt: report.createdAt,
        metadata: report.report.metadata, // Include metadata for dashboard insights
      })),
    });

  } catch (error) {
    console.error('Error fetching comparison reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comparison reports' },
      { status: 500 }
    );
  }
}
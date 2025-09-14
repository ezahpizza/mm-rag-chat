import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import ComparisonReport from '@/lib/models/ComparisonReport';
import User from '@/lib/models/User';
import { nanoid } from 'nanoid';
import { ComparisonResponse } from '@/components/compare/types';

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

    const { report, docNames } = await req.json();
    
    if (!report || !docNames || !Array.isArray(docNames)) {
      return NextResponse.json(
        { error: 'Report and docNames array are required' },
        { status: 400 }
      );
    }

    // Validate that report has the expected structure
    if (!report.comparisons || !report.summary || !report.metadata) {
      return NextResponse.json(
        { error: 'Invalid report structure' },
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

    // Generate unique report ID
    const reportId = nanoid(12);

    // Create comparison report
    const comparisonReport = new ComparisonReport({
      reportId,
      userId,
      report: report as ComparisonResponse,
      docNames,
    });

    await comparisonReport.save();

    return NextResponse.json({
      success: true,
      reportId,
      message: 'Comparison report saved successfully',
    });

  } catch (error) {
    console.error('Error saving comparison report:', error);
    return NextResponse.json(
      { error: 'Failed to save comparison report' },
      { status: 500 }
    );
  }
}
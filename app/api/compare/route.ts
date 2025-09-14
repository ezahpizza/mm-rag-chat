import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { parseFormData } from '@/lib/formUtils';
import { compareDocuments } from '@/lib/compareDocuments';
import { ComparisonResponse } from '@/components/compare/types';
import { auth } from '@clerk/nextjs/server';
import { saveComparisonReport } from '@/lib/db/operations';
import { validateComparisonResponse, validateDocNames, extractComparisonInsights } from '@/lib/summary/summaryHelpers';
import { nanoid } from 'nanoid';

function sanitizeResponse(resp: ComparisonResponse): { sanitized: ComparisonResponse; usedFallback: boolean } {
  return {
    sanitized: {
      ...resp,
      metadata: {
        ...resp.metadata,
        generated_at: new Date().toISOString()
      }
    },
    usedFallback: false
  };
}

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    console.log('Processing file upload and comparison...');
    
    const { files } = await parseFormData(req);
    
    if (!files || files.length !== 2) {
      return NextResponse.json(
        { error: 'Please provide exactly 2 PDF files for comparison' },
        { status: 400 }
      );
    }

    const [fileA, fileB] = files;
    
    // Validate file types
    if (fileA.type !== 'application/pdf' || fileB.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are supported for comparison' },
        { status: 400 }
      );
    }

    console.log(`Starting Gemini native PDF comparison for: ${fileA.name} and ${fileB.name}`);

    const comparison = await compareDocuments(fileA, fileB);
    const { sanitized } = sanitizeResponse(comparison as ComparisonResponse);

    // Validate comparison response
    if (!validateComparisonResponse(sanitized)) {
      console.warn('⚠️ Generated comparison response failed validation');
      return NextResponse.json({
        ...sanitized,
        saved: false,
        warning: 'Comparison generated but may have incomplete data'
      });
    }

    // Auto-save comparison report to database if user is authenticated
    try {
      const { userId } = await auth();
      if (userId) {
        const reportId = nanoid(12);
        const docNames = [fileA.name, fileB.name];
        
        // Validate document names
        if (!validateDocNames(docNames)) {
          throw new Error('Invalid document names for saving');
        }
        
        await saveComparisonReport(userId, reportId, sanitized, docNames);
        
        // Extract insights for logging
        const insights = extractComparisonInsights(sanitized);
        console.log(`✅ Comparison report auto-saved for user ${userId} with reportId: ${reportId}`);
        console.log(`📊 Report insights: ${insights.totalComparisons} comparisons, ${insights.overallRiskLevel} overall risk`);
        
        // Add the reportId and insights to the response
        return NextResponse.json({
          ...sanitized,
          reportId,
          saved: true,
          insights
        });
      } else {
        console.log('⚠️ User not authenticated, comparison report not saved');
        return NextResponse.json({
          ...sanitized,
          saved: false
        });
      }
    } catch (saveError) {
      // Don't fail the entire request if saving fails
      console.error('❌ Failed to auto-save comparison report:', saveError);
      return NextResponse.json({
        ...sanitized,
        saved: false,
        saveError: saveError instanceof Error ? saveError.message : 'Failed to save report to database'
      });
    }

  } catch (error: unknown) {
    console.error('Error in document comparison:', error);
    
    let errorMessage = 'Document comparison failed';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle specific error types
      if (error.message.includes('Unsupported file type')) {
        statusCode = 400;
      } else if (error.message.includes('No content could be extracted')) {
        statusCode = 400;
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      message: 'Document comparison API is available',
      endpoint: 'POST /api/compare with multipart/form-data containing 2 PDF files',
      supported_formats: ['PDF documents'],
      workflow: 'Upload 2 PDFs → Auto-index → Compare → Results',
      requirements: [
        'Exactly 2 PDF files required',
        'Files will be automatically parsed and indexed',
        'Comparison results include risk assessments and clause analysis'
      ]
    });
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API information' },
      { status: 500 }
    );
  }
}
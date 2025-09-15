import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { parseFormData } from '@/lib/formUtils';
import { analyzeGenZDocument } from '@/lib/analyzeGenZ';

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    console.log('Processing Gen-Z document analysis...');

    const { files } = await parseFormData(req);

    if (!files || files.length !== 1) {
      return NextResponse.json(
        { error: 'Please provide exactly 1 PDF file for analysis' },
        { status: 400 }
      );
    }

    const file = files[0];

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are supported for analysis' },
        { status: 400 }
      );
    }

    console.log(`Starting Gen-Z analysis for: ${file.name}`);

    const analysis = await analyzeGenZDocument(file);

    console.log(`Gen-Z analysis completed with ${analysis.length} categories.`);

    return NextResponse.json(analysis);

  } catch (error: unknown) {
    console.error('Error in Gen-Z document analysis:', error);

    let errorMessage = 'Document analysis failed';
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
      message: 'Gen-Z Document Analyzer API is available',
      endpoint: 'POST /api/genZAnalyze with multipart/form-data containing 1 PDF file',
      supported_formats: ['PDF documents'],
      workflow: 'Upload PDF → Analyze clauses → Gen-Z summaries',
      requirements: [
        'Exactly 1 PDF file required',
        'Analysis includes clause categorization and Gen-Z style summaries'
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
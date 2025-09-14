import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { parseFormData } from '@/lib/formUtils';
import { compareDocuments } from '@/lib/compareDocuments';
import { ComparisonResponse } from '@/components/compare/types';

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

    return NextResponse.json(sanitized);

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
// PDF export configuration and types
export const PDF_CONFIG = {
  format: 'a4' as const,
  unit: 'mm' as const,
  margins: {
    top: 20,
    bottom: 20,
    left: 15,
    right: 15
  },
  lineHeight: 6,
  titleSize: 16,
  headerSize: 14,
  bodySize: 10,
  codeSize: 8,
  pageWidth: 210, // A4 width in mm
  pageHeight: 297 // A4 height in mm
};

// PDF metadata types
export interface ChatSummaryMetadata {
  chatId?: string;
  title?: string;
  messageCount?: number;
  wordCount?: number;
  generatedAt?: string;
}

// Helper function to calculate usable page dimensions
export const getUsablePageDimensions = () => ({
  width: PDF_CONFIG.pageWidth - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right,
  height: PDF_CONFIG.pageHeight - PDF_CONFIG.margins.top - PDF_CONFIG.margins.bottom
});

// Helper function to generate safe filename
export const generateSafeFilename = (baseName: string, extension: string = 'pdf'): string => {
  const safeBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
  const timestamp = new Date().toISOString().split('T')[0];
  return `${safeBaseName}_${timestamp}.${extension}`;
};

// Helper function to format date for PDF header
export const formatPDFDate = (): string => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
// Main export file for PDF utilities
// This provides a clean API for the rest of the application

export {
  exportChatSummaryToPDF,
  exportSavedChatSummaryToPDF
} from './chatSummaryExporter';

export {
  exportComparisonReportToPDF,
  exportSavedReportToPDF
} from './comparisonReportExporter';

export {
  PDF_CONFIG,
  type ChatSummaryMetadata
} from './config';

// Re-export commonly used utilities for advanced usage
export {
  addPageHeader,
  addPageFooter,
  splitTextToFitWidth,
  checkAndAddPage
} from './helpers';

export {
  addMarkdownText,
  addSectionHeader,
  addMetadataSection
} from './textFormatters';
import jsPDF from 'jspdf';
import { PDF_CONFIG, ChatSummaryMetadata, generateSafeFilename } from './config';
import { addPageHeader, addFootersToAllPages } from './helpers';
import { addSectionHeader, addMetadataSection, addMarkdownText } from './textFormatters';

/**
 * Export chat summary as PDF
 */
export const exportChatSummaryToPDF = (
  summary: string,
  metadata?: ChatSummaryMetadata
): void => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: PDF_CONFIG.unit,
      format: PDF_CONFIG.format
    });
    
    // Add header
    const title = metadata?.title || 'Legal Consultation Summary';
    const subtitle = metadata?.chatId ? `Chat ID: ${metadata.chatId}` : undefined;
    let currentY = addPageHeader(doc, title, subtitle);
    
    currentY += PDF_CONFIG.lineHeight;
    
    // Add metadata section if available
    if (metadata && (metadata.messageCount || metadata.wordCount)) {
      currentY = addSectionHeader(doc, 'Session Information', currentY);
      
      const metadataInfo: Record<string, string | number> = {};
      if (metadata.messageCount) metadataInfo['Messages Analyzed'] = metadata.messageCount;
      if (metadata.wordCount) metadataInfo['Summary Length'] = `${metadata.wordCount} words`;
      
      currentY = addMetadataSection(doc, metadataInfo, currentY);
    }
    
    // Add summary content
    currentY = addSectionHeader(doc, 'Summary', currentY);
    addMarkdownText(doc, summary, currentY);
    
    // Add footers to all pages
    addFootersToAllPages(doc);
    
    // Generate filename and download
    const filename = metadata?.title 
      ? generateSafeFilename(`${metadata.title}_Summary`)
      : generateSafeFilename('Chat_Summary');
    
    doc.save(filename);
    console.log(`✅ Chat summary PDF exported: ${filename}`);
    
  } catch (error) {
    console.error('❌ Error exporting chat summary to PDF:', error);
    throw new Error('Failed to export chat summary to PDF');
  }
};

/**
 * Utility function to export any saved chat summary by ID (for dashboard use)
 */
export const exportSavedChatSummaryToPDF = async (chatId: string): Promise<void> => {
  try {
    const response = await fetch(`/api/user/summaries/${chatId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch chat summary data');
    }
    
    const { summary, chatId: id, createdAt } = await response.json();
    exportChatSummaryToPDF(summary, {
      chatId: id,
      title: 'Legal Consultation Summary',
      generatedAt: createdAt
    });
    
  } catch (error) {
    console.error('❌ Error exporting saved chat summary to PDF:', error);
    throw new Error('Failed to export saved chat summary to PDF');
  }
};
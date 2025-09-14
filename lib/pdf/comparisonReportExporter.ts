import jsPDF from 'jspdf';
import { ComparisonResponse, ComparisonResult } from '@/components/compare/types';
import { PDF_CONFIG, getUsablePageDimensions, generateSafeFilename } from './config';
import { addPageHeader, addFootersToAllPages, splitTextToFitWidth, checkAndAddPage } from './helpers';
import { addSectionHeader, addMetadataSection } from './textFormatters';

/**
 * Export comparison report as PDF
 */
export const exportComparisonReportToPDF = (
  comparisonData: ComparisonResponse,
  docNames: string[]
): void => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: PDF_CONFIG.unit,
      format: PDF_CONFIG.format
    });
    
    // Add header
    const title = 'Document Comparison Analysis Report';
    const subtitle = `${docNames[0]} vs ${docNames[1]}`;
    let currentY = addPageHeader(doc, title, subtitle);
    
    currentY += PDF_CONFIG.lineHeight;
    
    // Add analysis overview
    currentY = addSectionHeader(doc, 'Analysis Overview', currentY);
    
    const metadata = comparisonData.metadata;
    const overviewInfo: Record<string, string | number> = {
      'Total Comparisons': comparisonData.comparisons.length
    };
    
    if (metadata.alignment_stats) {
      overviewInfo['High Risk Items'] = metadata.alignment_stats.high_risk;
      overviewInfo['Medium Risk Items'] = metadata.alignment_stats.medium_risk;
      overviewInfo['Low Risk Items'] = metadata.alignment_stats.low_risk;
    }
    
    currentY = addMetadataSection(doc, overviewInfo, currentY);
    
    // Add executive summary
    if (comparisonData.summary) {
      addExecutiveSummary(doc, comparisonData.summary, currentY);
    }
    
    // Add detailed comparisons
    addDetailedComparisons(doc, comparisonData.comparisons);
    
    // Add footers to all pages
    addFootersToAllPages(doc);
    
    // Generate filename and download
    const safeDocA = docNames[0].replace(/[^a-zA-Z0-9]/g, '_');
    const safeDocB = docNames[1].replace(/[^a-zA-Z0-9]/g, '_');
    const filename = generateSafeFilename(`Comparison_${safeDocA}_vs_${safeDocB}`);
    
    doc.save(filename);
    console.log(`✅ Comparison report PDF exported: ${filename}`);
    
  } catch (error) {
    console.error('❌ Error exporting comparison report to PDF:', error);
    throw new Error('Failed to export comparison report to PDF');
  }
};

// Add executive summary section
const addExecutiveSummary = (doc: jsPDF, summary: string, startY: number): number => {
  const { width } = getUsablePageDimensions();
  let currentY = addSectionHeader(doc, 'Executive Summary', startY);
  
  doc.setFontSize(PDF_CONFIG.bodySize);
  doc.setFont('helvetica', 'normal');
  
  const summaryLines = splitTextToFitWidth(doc, summary, width);
  for (const line of summaryLines) {
    currentY = checkAndAddPage(doc, currentY, PDF_CONFIG.lineHeight);
    doc.text(line, PDF_CONFIG.margins.left, currentY);
    currentY += PDF_CONFIG.lineHeight;
  }
  
  return currentY + PDF_CONFIG.lineHeight;
};

// Add detailed comparisons section
const addDetailedComparisons = (doc: jsPDF, comparisons: ComparisonResult[]): void => {
  let currentY = addSectionHeader(doc, 'Detailed Comparison Analysis', 0);
  currentY += PDF_CONFIG.lineHeight;
  
  // Group comparisons by risk level
  const riskGroups = {
    high: comparisons.filter(c => c.risk_level === 'high'),
    medium: comparisons.filter(c => c.risk_level === 'medium'),
    low: comparisons.filter(c => c.risk_level === 'low')
  };
  
  for (const [riskLevel, riskComparisons] of Object.entries(riskGroups)) {
    if (riskComparisons.length === 0) continue;
    
    currentY = addRiskLevelSection(doc, riskLevel, riskComparisons, currentY);
  }
};

// Add risk level section
const addRiskLevelSection = (
  doc: jsPDF,
  riskLevel: string,
  comparisons: ComparisonResult[],
  startY: number
): number => {
  let currentY = checkAndAddPage(doc, startY, PDF_CONFIG.lineHeight * 3);
  
  // Risk level header with color coding
  doc.setFontSize(PDF_CONFIG.headerSize - 1);
  doc.setFont('helvetica', 'bold');
  
  // Set color based on risk level
  if (riskLevel === 'high') {
    doc.setTextColor(200, 50, 50); // Red
  } else if (riskLevel === 'medium') {
    doc.setTextColor(200, 150, 50); // Orange
  } else {
    doc.setTextColor(50, 150, 50); // Green
  }
  
  doc.text(`${riskLevel.toUpperCase()} RISK ITEMS (${comparisons.length})`, PDF_CONFIG.margins.left, currentY);
  currentY += PDF_CONFIG.lineHeight * 1.5;
  
  // Reset color to black
  doc.setTextColor(0, 0, 0);
  
  // Add each comparison
  for (let i = 0; i < comparisons.length; i++) {
    currentY = addComparisonItem(doc, comparisons[i], i + 1, currentY);
    
    // Add separator between items (except for the last one)
    if (i < comparisons.length - 1) {
      currentY = addSeparatorLine(doc, currentY);
    }
  }
  
  return currentY + PDF_CONFIG.lineHeight;
};

// Add individual comparison item
const addComparisonItem = (
  doc: jsPDF,
  comparison: ComparisonResult,
  itemNumber: number,
  startY: number
): number => {
  const { width } = getUsablePageDimensions();
  let currentY = checkAndAddPage(doc, startY, PDF_CONFIG.lineHeight * 8);
  
  // Comparison header
  doc.setFontSize(PDF_CONFIG.bodySize + 1);
  doc.setFont('helvetica', 'bold');
  doc.text(`${itemNumber}. ${comparison.clause} [${comparison.category}]`, PDF_CONFIG.margins.left, currentY);
  currentY += PDF_CONFIG.lineHeight * 1.2;
  
  // Document A section
  currentY = addDocumentSection(doc, 'Document A:', comparison.docA_text, currentY, width);
  
  // Document B section
  currentY = addDocumentSection(doc, 'Document B:', comparison.docB_text, currentY, width);
  
  // Key differences section
  currentY = addDocumentSection(doc, 'Key Differences:', comparison.difference_summary, currentY, width);
  
  // Impact analysis section
  currentY = addDocumentSection(doc, 'Impact Analysis:', comparison.impact, currentY, width);
  
  return currentY + PDF_CONFIG.lineHeight;
};

// Add document section (reusable for A, B, differences, impact)
const addDocumentSection = (
  doc: jsPDF,
  label: string,
  content: string,
  startY: number,
  width: number
): number => {
  let currentY = startY;
  
  // Section label
  doc.setFontSize(PDF_CONFIG.bodySize);
  doc.setFont('helvetica', 'bold');
  doc.text(label, PDF_CONFIG.margins.left, currentY);
  currentY += PDF_CONFIG.lineHeight;
  
  // Section content
  doc.setFont('helvetica', 'normal');
  const contentLines = splitTextToFitWidth(doc, content, width - 10);
  for (const line of contentLines) {
    currentY = checkAndAddPage(doc, currentY, PDF_CONFIG.lineHeight);
    doc.text(line, PDF_CONFIG.margins.left + 5, currentY);
    currentY += PDF_CONFIG.lineHeight;
  }
  
  return currentY + PDF_CONFIG.lineHeight * 0.3;
};

// Add separator line between comparison items
const addSeparatorLine = (doc: jsPDF, startY: number): number => {
  const { width } = getUsablePageDimensions();
  let currentY = startY + PDF_CONFIG.lineHeight * 0.5;
  currentY = checkAndAddPage(doc, currentY, PDF_CONFIG.lineHeight);
  
  doc.setLineWidth(0.2);
  doc.line(
    PDF_CONFIG.margins.left + 10,
    currentY,
    PDF_CONFIG.margins.left + width - 10,
    currentY
  );
  
  return currentY + PDF_CONFIG.lineHeight;
};

/**
 * Utility function to export any saved report by ID (for dashboard use)
 */
export const exportSavedReportToPDF = async (reportId: string): Promise<void> => {
  try {
    const response = await fetch(`/api/user/reports/${reportId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch report data');
    }
    
    const { report, docNames } = await response.json();
    exportComparisonReportToPDF(report, docNames);
    
  } catch (error) {
    console.error('❌ Error exporting saved report to PDF:', error);
    throw new Error('Failed to export saved report to PDF');
  }
};
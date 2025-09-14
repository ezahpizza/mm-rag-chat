import jsPDF from 'jspdf';
import { PDF_CONFIG, getUsablePageDimensions } from './config';
import { splitTextToFitWidth, checkAndAddPage } from './helpers';

// Process and add markdown-formatted text to PDF
export const addMarkdownText = (
  doc: jsPDF,
  text: string,
  startY: number
): number => {
  const { width } = getUsablePageDimensions();
  let currentY = startY;
  
  // Split summary into paragraphs and process each
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  
  for (const paragraph of paragraphs) {
    // Check if this is a markdown header
    if (paragraph.startsWith('##')) {
      currentY = checkAndAddPage(doc, currentY, PDF_CONFIG.lineHeight * 2);
      doc.setFontSize(PDF_CONFIG.headerSize);
      doc.setFont('helvetica', 'bold');
      const headerText = paragraph.replace(/^##\s*/, '');
      doc.text(headerText, PDF_CONFIG.margins.left, currentY);
      currentY += PDF_CONFIG.lineHeight * 1.5;
    } else if (paragraph.startsWith('###')) {
      currentY = checkAndAddPage(doc, currentY, PDF_CONFIG.lineHeight * 2);
      doc.setFontSize(PDF_CONFIG.bodySize + 1);
      doc.setFont('helvetica', 'bold');
      const subHeaderText = paragraph.replace(/^###\s*/, '');
      doc.text(subHeaderText, PDF_CONFIG.margins.left, currentY);
      currentY += PDF_CONFIG.lineHeight * 1.2;
    } else {
      // Regular paragraph
      doc.setFontSize(PDF_CONFIG.bodySize);
      doc.setFont('helvetica', 'normal');
      
      // Handle bullet points
      if (paragraph.includes('•') || paragraph.includes('-')) {
        currentY = addBulletList(doc, paragraph, currentY, width);
      } else {
        // Regular paragraph
        currentY = addRegularParagraph(doc, paragraph, currentY, width);
      }
      
      currentY += PDF_CONFIG.lineHeight * 0.5; // Space between paragraphs
    }
  }
  
  return currentY;
};

// Add bullet list to PDF
const addBulletList = (
  doc: jsPDF,
  paragraph: string,
  startY: number,
  width: number
): number => {
  let currentY = startY;
  const lines = paragraph.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      currentY = checkAndAddPage(doc, currentY, PDF_CONFIG.lineHeight);
      const bulletText = line.trim().replace(/^[•-]\s*/, '');
      const wrappedLines = splitTextToFitWidth(doc, `• ${bulletText}`, width - 10);
      
      for (let i = 0; i < wrappedLines.length; i++) {
        currentY = checkAndAddPage(doc, currentY, PDF_CONFIG.lineHeight);
        const indent = i === 0 ? 0 : 10;
        doc.text(wrappedLines[i], PDF_CONFIG.margins.left + indent, currentY);
        currentY += PDF_CONFIG.lineHeight;
      }
    } else if (line.trim()) {
      const wrappedLines = splitTextToFitWidth(doc, line.trim(), width);
      for (const wrappedLine of wrappedLines) {
        currentY = checkAndAddPage(doc, currentY, PDF_CONFIG.lineHeight);
        doc.text(wrappedLine, PDF_CONFIG.margins.left, currentY);
        currentY += PDF_CONFIG.lineHeight;
      }
    }
  }
  
  return currentY;
};

// Add regular paragraph to PDF
const addRegularParagraph = (
  doc: jsPDF,
  paragraph: string,
  startY: number,
  width: number
): number => {
  let currentY = startY;
  const wrappedLines = splitTextToFitWidth(doc, paragraph.trim(), width);
  
  for (const line of wrappedLines) {
    currentY = checkAndAddPage(doc, currentY, PDF_CONFIG.lineHeight);
    doc.text(line, PDF_CONFIG.margins.left, currentY);
    currentY += PDF_CONFIG.lineHeight;
  }
  
  return currentY;
};

// Add a section header to PDF
export const addSectionHeader = (
  doc: jsPDF,
  title: string,
  startY: number
): number => {
  const currentY = checkAndAddPage(doc, startY, PDF_CONFIG.lineHeight * 2);
  doc.setFontSize(PDF_CONFIG.headerSize);
  doc.setFont('helvetica', 'bold');
  doc.text(title, PDF_CONFIG.margins.left, currentY);
  return currentY + PDF_CONFIG.lineHeight * 1.5;
};

// Add metadata information to PDF
export const addMetadataSection = (
  doc: jsPDF,
  metadata: Record<string, string | number>,
  startY: number
): number => {
  let currentY = startY;
  
  doc.setFontSize(PDF_CONFIG.bodySize);
  doc.setFont('helvetica', 'normal');
  
  for (const [key, value] of Object.entries(metadata)) {
    if (value !== undefined && value !== null) {
      doc.text(`${key}: ${value}`, PDF_CONFIG.margins.left, currentY);
      currentY += PDF_CONFIG.lineHeight;
    }
  }
  
  return currentY + PDF_CONFIG.lineHeight;
};
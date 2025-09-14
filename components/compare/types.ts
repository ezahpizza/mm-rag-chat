// Core types for document comparison
export type RiskLevel = 'all' | 'high' | 'medium' | 'low';
export type Category = 'all' | 'Financial' | 'Termination' | 'Liability' | 'Obligations' | 'Rights' | 'Other';

export interface ComparisonResult {
  clause: string;
  docA_text: string;
  docB_text: string;
  difference_summary: string;
  impact: string;
  risk_level: 'high' | 'medium' | 'low';
  category: 'Financial' | 'Termination' | 'Liability' | 'Obligations' | 'Rights' | 'Other';
}

export interface ComparisonResponse {
  comparisons: ComparisonResult[];
  summary: string;
  metadata: {
    docA: { id: string; total_clauses: number; compared_clauses: number };
    docB: { id: string; total_clauses: number; compared_clauses: number };
    alignment_stats: {
      total_alignments: number;
      high_risk: number;
      medium_risk: number;
      low_risk: number;
    };
    generated_at: string;
  };
}

export interface Extraction {
  text: string;
  lowConfidence: boolean;
  base64?: string;
}

// UI Component Props
export interface DocumentUploadProps {
  label: string;
  onFileUpload: (file: File) => void;
  onFileRemove: () => void;
  uploadedFile: File | null;
  isUploading: boolean;
  onPreview?: () => void;
  disabled?: boolean;
}

export interface PDFPreviewProps {
  file: File;
  isOpen: boolean;
  onClose: () => void;
}

export interface SummaryPanelProps {
  summary: string;
  metadata: {
    docA: { id: string; total_clauses: number; compared_clauses: number };
    docB: { id: string; total_clauses: number; compared_clauses: number };
    alignment_stats: {
      total_alignments: number;
      high_risk: number;
      medium_risk: number;
      low_risk: number;
    };
    generated_at: string;
  };
}

export interface FilterControlsProps {
  riskFilter: RiskLevel;
  categoryFilter: Category;
  onRiskFilterChange: (filter: RiskLevel) => void;
  onCategoryFilterChange: (filter: Category) => void;
  totalComparisons: number;
  filteredCount: number;
}

export interface ComparisonTableProps {
  comparisons: ComparisonResult[];
}

// State management types
export interface ComparePageState {
  docAFile: File | null;
  docBFile: File | null;
  uploadingA: boolean;
  uploadingB: boolean;
  previewFile: File | null;
  showPreview: boolean;
  comparisonResult: ComparisonResponse | null;
  isComparing: boolean;
  error: string | null;
  riskFilter: RiskLevel;
  categoryFilter: Category;
}

// API response types
export interface ComparisonApiError {
  error: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

// Event handler types
export interface CompareEventHandlers {
  handleFileUploadA: (file: File) => void;
  handleFileUploadB: (file: File) => void;
  handleFileRemoveA: () => void;
  handleFileRemoveB: () => void;
  handlePreviewA: () => void;
  handlePreviewB: () => void;
  closePreview: () => void;
  handleCompareDocuments: () => Promise<void>;
  clearResults: () => void;
  resetAll: () => void;
}

// Utility types
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

// Constants
export const riskOptions = [
  { value: 'all' as const, label: 'All Risk Levels' },
  { value: 'high' as const, label: '🚩 High Risk Only' },
  { value: 'medium' as const, label: '🟡 Medium Risk Only' },
  { value: 'low' as const, label: '🟢 Low Risk Only' },
];

export const categoryOptions = [
  { value: 'all' as const, label: 'All Categories' },
  { value: 'Financial' as const, label: 'Financial' },
  { value: 'Termination' as const, label: 'Termination' },
  { value: 'Liability' as const, label: 'Liability' },
  { value: 'Obligations' as const, label: 'Obligations' },
  { value: 'Rights' as const, label: 'Rights' },
  { value: 'Other' as const, label: 'Other' },
];

export const getRiskLevelColor = (level: 'high' | 'medium' | 'low') => {
  switch (level) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getRiskIcon = (level: 'high' | 'medium' | 'low') => {
  switch (level) {
    case 'high':
      return '🚩';
    case 'medium':
      return '🟡';
    case 'low':
      return '🟢';
    default:
      return '⚪';
  }
};

// Page Component Interfaces
export interface DocumentUploadSectionProps {
  docAFile: File | null;
  docBFile: File | null;
  uploadingA: boolean;
  uploadingB: boolean;
  isComparing: boolean;
  onFileUploadA: (file: File) => void;
  onFileUploadB: (file: File) => void;
  onFileRemoveA: () => void;
  onFileRemoveB: () => void;
  onPreviewA: () => void;
  onPreviewB: () => void;
}

export interface ActionButtonsProps {
  canCompare: boolean;
  isComparing: boolean;
  hasFiles: boolean;
  hasResults: boolean;
  onCompare: () => void;
  onReset: () => void;
  onClearResults: () => void;
  onExportPDF?: () => void;
  isExporting?: boolean;
  docNames?: string[];
}

export interface ErrorDisplayProps {
  error: string;
}

export interface ResultsSectionProps {
  comparisonResult: ComparisonResponse;
  filteredComparisons: ComparisonResult[];
  riskFilter: RiskLevel;
  categoryFilter: Category;
  onRiskFilterChange: (filter: RiskLevel) => void;
  onCategoryFilterChange: (filter: Category) => void;
}

// DocumentUpload Component Interfaces
export interface UploadZoneProps {
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onClick: () => void;
  dragOver: boolean;
  disabled: boolean;
  isUploading: boolean;
}

export interface FileDisplayProps {
  file: File;
  onPreview?: () => void;
  onRemove: () => void;
  disabled: boolean;
}

export interface FileInfoProps {
  file: File;
}

export interface FileActionsProps {
  onPreview?: () => void;
  onRemove: () => void;
  disabled: boolean;
}

// PDFPreview Component Interfaces
export interface PreviewHeaderProps {
  fileName: string;
  onDownload: () => void;
  onClose: () => void;
}

export interface PreviewContentProps {
  pdfUrl: string | null;
  fileName: string;
  error: string | null;
  onDownload: () => void;
  onError: () => void;
}

export interface ErrorStateProps {
  error: string;
  onDownload: () => void;
}

export interface PreviewFooterProps {
  fileSize: number;
}
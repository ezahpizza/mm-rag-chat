import { Dispatch, SetStateAction, useState } from 'react';
import { 
  ComparisonResponse, 
  ComparisonResult,
  ComparePageState, 
  RiskLevel, 
  Category,
  ComparisonApiError 
} from './types';
import { validateFile } from './helpers';

/**
 * File upload controllers
 */
export const createFileUploadHandler = (
  setter: Dispatch<SetStateAction<File | null>>,
  setError: Dispatch<SetStateAction<string | null>>
) => {
  return (file: File) => {
    const validation = validateFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      return;
    }
    
    setter(file);
    setError(null);
  };
};

export const createFileRemoveHandler = (
  setter: Dispatch<SetStateAction<File | null>>,
  setError: Dispatch<SetStateAction<string | null>>
) => {
  return () => {
    setter(null);
    setError(null);
  };
};

/**
 * Preview controllers
 */
export const createPreviewHandler = (
  file: File | null,
  setPreviewFile: Dispatch<SetStateAction<File | null>>,
  setShowPreview: Dispatch<SetStateAction<boolean>>
) => {
  return () => {
    if (file) {
      setPreviewFile(file);
      setShowPreview(true);
    }
  };
};

export const createClosePreviewHandler = (
  setShowPreview: Dispatch<SetStateAction<boolean>>,
  setPreviewFile: Dispatch<SetStateAction<File | null>>
) => {
  return () => {
    setShowPreview(false);
    setPreviewFile(null);
  };
};

/**
 * Comparison controller
 */
export const createComparisonHandler = (
  docAFile: File | null,
  docBFile: File | null,
  setIsComparing: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string | null>>,
  setComparisonResult: Dispatch<SetStateAction<ComparisonResponse | null>>
) => {
  return async () => {
    if (!docAFile || !docBFile) {
      setError('Please upload both documents before comparing');
      return;
    }

    setIsComparing(true);
    setError(null);
    setComparisonResult(null);

    try {
      const formData = new FormData();
      formData.append('files', docAFile);
      formData.append('files', docBFile);

      const response = await fetch('/api/compare', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData: ComparisonApiError = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ComparisonResponse = await response.json();
      setComparisonResult(result);
    } catch (err) {
      console.error('Comparison error:', err);
      setError(err instanceof Error ? err.message : 'Failed to compare documents');
    } finally {
      setIsComparing(false);
    }
  };
};

/**
 * State reset controllers
 */
export const createClearResultsHandler = (
  setComparisonResult: Dispatch<SetStateAction<ComparisonResponse | null>>,
  setError: Dispatch<SetStateAction<string | null>>,
  setRiskFilter: Dispatch<SetStateAction<RiskLevel>>,
  setCategoryFilter: Dispatch<SetStateAction<Category>>
) => {
  return () => {
    setComparisonResult(null);
    setError(null);
    setRiskFilter('all');
    setCategoryFilter('all');
  };
};

export const createResetAllHandler = (
  setDocAFile: Dispatch<SetStateAction<File | null>>,
  setDocBFile: Dispatch<SetStateAction<File | null>>,
  setComparisonResult: Dispatch<SetStateAction<ComparisonResponse | null>>,
  setError: Dispatch<SetStateAction<string | null>>,
  setRiskFilter: Dispatch<SetStateAction<RiskLevel>>,
  setCategoryFilter: Dispatch<SetStateAction<Category>>
) => {
  return () => {
    setDocAFile(null);
    setDocBFile(null);
    setComparisonResult(null);
    setError(null);
    setRiskFilter('all');
    setCategoryFilter('all');
  };
};

/**
 * Filter helpers
 */
export const filterComparisons = (
  comparisons: ComparisonResult[],
  riskFilter: RiskLevel,
  categoryFilter: Category
) => {
  return comparisons.filter(comparison => {
    const riskMatch = riskFilter === 'all' || comparison.risk_level === riskFilter;
    const categoryMatch = categoryFilter === 'all' || comparison.category === categoryFilter;
    return riskMatch && categoryMatch;
  });
};

/**
 * Validation helpers
 */
export const canCompareDocuments = (
  docAFile: File | null,
  docBFile: File | null,
  isComparing: boolean
): boolean => {
  return Boolean(docAFile && docBFile && !isComparing);
};

export const shouldShowHelp = (
  comparisonResult: ComparisonResponse | null,
  isComparing: boolean,
  docAFile: File | null,
  docBFile: File | null
): boolean => {
  return !comparisonResult && !isComparing && (!docAFile || !docBFile);
};

/**
 * Custom hook for compare page state management
 */
export const useComparePageState = (): ComparePageState & {
  setDocAFile: Dispatch<SetStateAction<File | null>>;
  setDocBFile: Dispatch<SetStateAction<File | null>>;
  setUploadingA: Dispatch<SetStateAction<boolean>>;
  setUploadingB: Dispatch<SetStateAction<boolean>>;
  setPreviewFile: Dispatch<SetStateAction<File | null>>;
  setShowPreview: Dispatch<SetStateAction<boolean>>;
  setComparisonResult: Dispatch<SetStateAction<ComparisonResponse | null>>;
  setIsComparing: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setRiskFilter: Dispatch<SetStateAction<RiskLevel>>;
  setCategoryFilter: Dispatch<SetStateAction<Category>>;
} => {
  const [docAFile, setDocAFile] = useState<File | null>(null);
  const [docBFile, setDocBFile] = useState<File | null>(null);
  const [uploadingA, setUploadingA] = useState(false);
  const [uploadingB, setUploadingB] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResponse | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<RiskLevel>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category>('all');

  return {
    docAFile,
    docBFile,
    uploadingA,
    uploadingB,
    previewFile,
    showPreview,
    comparisonResult,
    isComparing,
    error,
    riskFilter,
    categoryFilter,
    setDocAFile,
    setDocBFile,
    setUploadingA,
    setUploadingB,
    setPreviewFile,
    setShowPreview,
    setComparisonResult,
    setIsComparing,
    setError,
    setRiskFilter,
    setCategoryFilter,
  };
};
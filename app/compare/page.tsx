'use client';

import React from 'react';
import { 
  ComparisonTable, 
  FilterControls, 
  SummaryPanel, 
  DocumentUpload, 
  PDFPreview 
} from '@/components/compare';
import { Button } from '@/components/button';
import { 
  useComparePageState,
  createFileUploadHandler,
  createFileRemoveHandler,
  createPreviewHandler,
  createClosePreviewHandler,
  createComparisonHandler,
  createClearResultsHandler,
  createResetAllHandler,
  filterComparisons,
  canCompareDocuments,
  shouldShowHelp
} from '@/components/compare/controllers';
import {
  DocumentUploadSectionProps,
  ActionButtonsProps,
  ErrorDisplayProps,
  ResultsSectionProps
} from '@/components/compare/types';

// UI Subcomponents for better organization
const PageHeader = () => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-gray-900 mb-2">
      Document Comparison
    </h1>
    <p className="text-gray-600">
      Upload two legal documents to automatically identify differences, risks, and key variations in clauses.
    </p>
  </div>
);

const DocumentUploadSection = ({
  docAFile,
  docBFile,
  uploadingA,
  uploadingB,
  isComparing,
  onFileUploadA,
  onFileUploadB,
  onFileRemoveA,
  onFileRemoveB,
  onPreviewA,
  onPreviewB,
}: DocumentUploadSectionProps) => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
    <h2 className="text-xl font-semibold mb-6 text-gray-800">
      Upload Documents
    </h2>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <DocumentUpload
        label="Document A"
        onFileUpload={onFileUploadA}
        onFileRemove={onFileRemoveA}
        uploadedFile={docAFile}
        isUploading={uploadingA}
        onPreview={onPreviewA}
        disabled={isComparing}
      />
      
      <DocumentUpload
        label="Document B"
        onFileUpload={onFileUploadB}
        onFileRemove={onFileRemoveB}
        uploadedFile={docBFile}
        isUploading={uploadingB}
        onPreview={onPreviewB}
        disabled={isComparing}
      />
    </div>
  </div>
);

const ActionButtons = ({
  canCompare,
  isComparing,
  hasFiles,
  hasResults,
  onCompare,
  onReset,
  onClearResults
}: ActionButtonsProps) => (
  <div className="flex gap-3 flex-wrap">
    <Button
      onClick={onCompare}
      disabled={!canCompare}
      className="bg-electric text-white hover:bg-persian disabled:bg-gray-300"
    >
      {isComparing ? (
        <>
          <span className="mr-2">Processing...</span>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </>
      ) : (
        'Compare Documents'
      )}
    </Button>
    
    {hasFiles && (
      <Button
        onClick={onReset}
        variant="outline"
        className="border-gray-300 text-gray-700 hover:bg-gray-50"
        disabled={isComparing}
      >
        Reset All
      </Button>
    )}
    
    {hasResults && (
      <Button
        onClick={onClearResults}
        variant="outline"
        className="border-gray-300 text-gray-700 hover:bg-gray-50"
      >
        Clear Results
      </Button>
    )}
  </div>
);

const ErrorDisplay = ({ error }: ErrorDisplayProps) => (
  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
    <div className="flex">
      <div className="text-red-800">
        <strong>Error:</strong> {error}
      </div>
    </div>
  </div>
);

const ProgressDisplay = () => (
  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
    <div className="flex items-center">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
      <div>
        <p className="text-blue-800 font-medium">Processing your documents...</p>
        <p className="text-blue-600 text-sm">
          This may take a few moments as we parse, index, and analyze your documents.
        </p>
      </div>
    </div>
  </div>
);

const HelpSection = () => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
    <h3 className="text-lg font-medium text-blue-900 mb-3">
      How to Use Document Comparison
    </h3>
    <ul className="text-blue-800 space-y-2">
      <li className="flex items-start">
        <span className="text-blue-600 mr-2">1.</span>
        Upload two PDF documents using the upload areas above.
      </li>
      <li className="flex items-start">
        <span className="text-blue-600 mr-2">2.</span>
        Preview your documents to ensure they uploaded correctly.
      </li>
      <li className="flex items-start">
        <span className="text-blue-600 mr-2">3.</span>
        Click "Compare Documents" to automatically parse, index, and analyze differences.
      </li>
      <li className="flex items-start">
        <span className="text-blue-600 mr-2">4.</span>
        Review the results with risk assessments and use filters to focus on specific areas.
      </li>
    </ul>
  </div>
);

const ResultsSection = ({
  comparisonResult,
  filteredComparisons,
  riskFilter,
  categoryFilter,
  onRiskFilterChange,
  onCategoryFilterChange
}: ResultsSectionProps) => (
  <div className="space-y-6">
    <SummaryPanel
      summary={comparisonResult.summary}
      metadata={comparisonResult.metadata}
    />

    <FilterControls
      riskFilter={riskFilter}
      categoryFilter={categoryFilter}
      onRiskFilterChange={onRiskFilterChange}
      onCategoryFilterChange={onCategoryFilterChange}
      totalComparisons={comparisonResult.comparisons.length}
      filteredCount={filteredComparisons.length}
    />

    <ComparisonTable
      comparisons={filteredComparisons}
    />

    {filteredComparisons.length === 0 && comparisonResult.comparisons.length > 0 && (
      <div className="text-center py-8">
        <p className="text-gray-500">
          No comparisons match the current filters. Try adjusting your filter criteria.
        </p>
      </div>
    )}
  </div>
);

export default function ComparePage() {
  // State management using custom hook
  const {
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
  } = useComparePageState();

  // Event handlers using controller factories
  const handleFileUploadA = createFileUploadHandler(setDocAFile, setError);
  const handleFileUploadB = createFileUploadHandler(setDocBFile, setError);
  const handleFileRemoveA = createFileRemoveHandler(setDocAFile, setError);
  const handleFileRemoveB = createFileRemoveHandler(setDocBFile, setError);
  const handlePreviewA = createPreviewHandler(docAFile, setPreviewFile, setShowPreview);
  const handlePreviewB = createPreviewHandler(docBFile, setPreviewFile, setShowPreview);
  const closePreview = createClosePreviewHandler(setShowPreview, setPreviewFile);
  const handleCompareDocuments = createComparisonHandler(
    docAFile,
    docBFile,
    setIsComparing,
    setError,
    setComparisonResult
  );
  const clearResults = createClearResultsHandler(
    setComparisonResult,
    setError,
    setRiskFilter,
    setCategoryFilter
  );
  const resetAll = createResetAllHandler(
    setDocAFile,
    setDocBFile,
    setComparisonResult,
    setError,
    setRiskFilter,
    setCategoryFilter
  );

  // Computed values
  const filteredComparisons = comparisonResult 
    ? filterComparisons(comparisonResult.comparisons, riskFilter, categoryFilter)
    : [];
  const canCompare = canCompareDocuments(docAFile, docBFile, isComparing);
  const hasFiles = Boolean(docAFile || docBFile || comparisonResult);
  const showHelpSection = shouldShowHelp(comparisonResult, isComparing, docAFile, docBFile);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <PageHeader />

      <DocumentUploadSection
        docAFile={docAFile}
        docBFile={docBFile}
        uploadingA={uploadingA}
        uploadingB={uploadingB}
        isComparing={isComparing}
        onFileUploadA={handleFileUploadA}
        onFileUploadB={handleFileUploadB}
        onFileRemoveA={handleFileRemoveA}
        onFileRemoveB={handleFileRemoveB}
        onPreviewA={handlePreviewA}
        onPreviewB={handlePreviewB}
      />

      <ActionButtons
        canCompare={canCompare}
        isComparing={isComparing}
        hasFiles={hasFiles}
        hasResults={Boolean(comparisonResult)}
        onCompare={handleCompareDocuments}
        onReset={resetAll}
        onClearResults={clearResults}
      />

      {error && <ErrorDisplay error={error} />}
      {isComparing && <ProgressDisplay />}

      {comparisonResult && (
        <ResultsSection
          comparisonResult={comparisonResult}
          filteredComparisons={filteredComparisons}
          riskFilter={riskFilter}
          categoryFilter={categoryFilter}
          onRiskFilterChange={setRiskFilter}
          onCategoryFilterChange={setCategoryFilter}
        />
      )}

      {showHelpSection && <HelpSection />}

      {previewFile && (
        <PDFPreview
          file={previewFile}
          isOpen={showPreview}
          onClose={closePreview}
        />
      )}
    </div>
  );
}
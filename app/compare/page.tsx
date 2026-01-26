'use client';

import { useState, useEffect } from 'react';
import { PDFPreview } from '@/components/compare';
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

import { PixelBlast, CardNav, SpringModal, Loader } from '@/components/global';

import { items } from '@/constants/home-items';
import { DocumentUploadSection, 
        ActionButtons, 
        ResultsSection, 
        ErrorDisplay, 
        HelpSection, 
        PageHeader } from './sections';
import { exportComparisonReportToPDF } from '@/lib/pdf';

export default function ComparePage() {
  // Export state
  const [isExporting, setIsExporting] = useState(false);

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
    setPreviewFile,
    setShowPreview,
    setComparisonResult,
    setIsComparing,
    setError,
    setRiskFilter,
    setCategoryFilter,
  } = useComparePageState();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
          const timer = setTimeout(() => {
              setLoading(false);
          }, 2000); // 2 second delay for loading screen
    
          return () => clearTimeout(timer);
      }, []);
    
        if (loading) {
          return( <Loader /> );
      }
  

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

  // Export handler
  const handleExportPDF = async () => {
    if (!comparisonResult || !docAFile || !docBFile) return;
    
    setIsExporting(true);
    try {
      const docNames = [docAFile.name, docBFile.name];
      exportComparisonReportToPDF(comparisonResult, docNames);
      console.log('✅ PDF exported successfully');
    } catch (error) {
      console.error('❌ Error exporting PDF:', error);
      setError('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Computed values
  const filteredComparisons = comparisonResult 
    ? filterComparisons(comparisonResult.comparisons, riskFilter, categoryFilter)
    : [];
  const canCompare = canCompareDocuments(docAFile, docBFile, isComparing);
  const hasFiles = Boolean(docAFile || docBFile || comparisonResult);
  const showHelpSection = shouldShowHelp(comparisonResult, isComparing, docAFile, docBFile);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen overflow-hidden bg-obsidian">
      <div className="absolute inset-0 z-0">
       <PixelBlast
        variant="circle"
        pixelSize={6}
        color="#8b67ff"
        patternScale={3}
        patternDensity={1.6}
        pixelSizeJitter={0.5}
        enableRipples
        rippleSpeed={0.4}
        rippleThickness={0.12}
        rippleIntensityScale={1.5}
        liquid
        liquidStrength={0.12}
        liquidRadius={1.2}
        liquidWobbleSpeed={5}
        speed={0.6}
        edgeFade={0.25}
        transparent
      />
      </div>
            
      <div className="flex-1 scrollbar-hide p-2 sm:p-4 relative z-10 items-center w-full container-responsive">
      <CardNav
          logo="/logo/black-no-text.svg"
          logoAlt="Company Logo"
          items={items}
          menuColor="#000"
          ease="power3.out"
      />
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
        onExportPDF={handleExportPDF}
        isExporting={isExporting}
        docNames={docAFile && docBFile ? [docAFile.name, docBFile.name] : []}
      />

      {error && <ErrorDisplay error={error} />}
      <SpringModal
        isOpen={isComparing}
        title="Processing Documents"
        description="This may take a few moments as we parse, index, and analyze your documents."
      />

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

    </main>
  );
}
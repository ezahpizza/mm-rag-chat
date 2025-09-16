'use client';

import React, { useState } from 'react';
import { DocumentUpload } from '@/components/compare/DocumentUpload';
import { GenZAnalysisResult } from '@/lib/analyzeGenZ';
import { TextParallaxContent } from '@/components/genZAnalyze/TextParallaxContent';
import { DragCloseDrawer } from '@/components/genZAnalyze/DragCloseDrawer';
import { DocumentAnalysisLoader } from '@/components/global/SpringModal';
import PixelBlast from '@/components/global/PixelBlast';
import { items } from '@/constants/home-items';
import { CardNav } from '@/components/global/CardNav';
import { FiInfo } from 'react-icons/fi';
import { SiPopos } from "react-icons/si";


export default function GenZAnalyzePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<GenZAnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<GenZAnalysisResult | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResults([]);
    setUploadedFile(file);

    try {
      const formData = new FormData();
      formData.append('files', file);

      const response = await fetch('/api/genZAnalyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const results: GenZAnalysisResult[] = await response.json();
      setAnalysisResults(results);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
    setAnalysisResults([]);
    setError(null);
  };

  const handleLearnMore = (result: GenZAnalysisResult) => {
    setSelectedResult(result);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedResult(null);
  };

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

      <div className="flex-1 scrollbar-hide p-4 relative z-10 items-center w-7xl">
        <CardNav
          logo="/logo.svg"
          logoAlt="Company Logo"
          items={items}
          menuColor="#000"
          ease="power3.out"
        />



        {/* Upload Section */}
        <div className="mb-8 mt-32 bg-pearl p-4 rounded-lg">
          <DocumentUpload
            label="Upload Your Document"
            onFileUpload={handleFileUpload}
            onFileRemove={handleFileRemove}
            uploadedFile={uploadedFile}
            isUploading={isAnalyzing}
            disabled={isAnalyzing}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Analysis Error</p>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Loading State */}
        <DocumentAnalysisLoader
          isOpen={isAnalyzing}
          title="Analyzing Document"
          description="Analyzing your document with Gen-Z vibes..."
        />

        {/* Results */}
        {analysisResults.length > 0 && !isAnalyzing && (
          <div className="space-y-8">
            {analysisResults.map((result, index) => (
              <TextParallaxContent
                key={result.category}
                category={result.category}
                summary={result.summary}
                onLearnMore={() => handleLearnMore(result)}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!uploadedFile && !isAnalyzing && analysisResults.length === 0 && (
          <div className="bg-gradient-to-br from-razza to-persian text-pearl p-6 rounded-lg w-full shadow-xl cursor-default relative overflow-hidden">
            <FiInfo className="text-pearl/10 rotate-12 text-[250px] absolute z-0 -top-24 -left-24" />
            <div className="relative z-10">
              <div className="bg-pearl w-16 h-16 mb-2 rounded-full text-3xl text-indigo-600 grid place-items-center mx-auto">
                <SiPopos />
              </div>
              <h3 className="text-lg font-medium text-pearl mb-3">
                How to Use Document Comparison
                </h3>
                <ul className="text-skye space-y-2">
                    <li className="flex items-start">
                        <span className="mr-2">1.</span>
                        Upload two PDF documents using the upload areas above.
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">2.</span>
                        Preview your documents to ensure they uploaded correctly.
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">3.</span>
                        Click &ldquo;Compare Documents&rdquo; to automatically parse, index, and analyze differences.
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">4.</span>
                        Review the results with risk assessments and use filters to focus on specific areas.
                    </li>
                </ul>

            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      <DragCloseDrawer
        open={isDrawerOpen}
        setOpen={setIsDrawerOpen}
        result={selectedResult}
        onClose={handleCloseDrawer}
      />
    </main>
  );
}
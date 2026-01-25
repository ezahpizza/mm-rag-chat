'use client';

import React, { useEffect, useState } from 'react';
import { GenZAnalysisResult } from '@/lib/analyzeGenZ';
import { TextParallaxContent, DragCloseDrawer } from '@/components/genZAnalyze';

import { SpringModal, PixelBlast, CardNav, Loader, DocumentUpload } from '@/components/global';
import { items } from '@/constants/home-items';
import { FiInfo } from 'react-icons/fi';
import { SiPopos } from "react-icons/si";


export default function GenZAnalyzePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<GenZAnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<GenZAnalysisResult | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

      <div className="flex-1 scrollbar-hide p-2 sm:p-4 relative z-10 items-center w-full container-responsive">
        <CardNav
          logo="/logo/black-no-text.svg"
          logoAlt="Company Logo"
          items={items}
          menuColor="#000"
          ease="power3.out"
        />

        <div className="m-8 mt-48">
          <h1 className="text-3xl font-bold text-pearl mb-2">
            PopLegal
          </h1>
          <p className="text-ocean">
            Understand legal stuff like you would with anything else. Just upload your document and let us bring you the vibes.
          </p>
        </div>

        {/* Upload Section */}
        <div className="mb-6 sm:mb-8 bg-pearl p-3 sm:p-4 rounded-lg">
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
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium text-sm sm:text-base">Analysis Error</p>
            <p className="text-red-600 text-sm sm:text-base">{error}</p>
          </div>
        )}

        {/* Loading State */}
        <SpringModal
          isOpen={isAnalyzing}
          title="Analyzing Document"
          description="Analyzing your document with Gen-Z vibes..."
        />

        {/* Results */}
        {analysisResults.length > 0 && !isAnalyzing && (
          <div className="space-y-6 sm:space-y-8">
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
          <div className="bg-gradient-to-br from-razza to-persian text-pearl p-4 sm:p-6 rounded-lg w-full shadow-xl cursor-default relative overflow-hidden">
            <FiInfo className="text-pearl/10 rotate-12 text-[150px] sm:text-[200px] lg:text-[250px] absolute z-0 -top-12 sm:-top-16 lg:-top-24 -left-12 sm:-left-16 lg:-left-24" />
            <div className="relative z-10 text-center">
              <div className="bg-pearl w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mb-2 sm:mb-3 rounded-full text-xl sm:text-2xl lg:text-3xl text-indigo-600 grid place-items-center mx-auto">
                <SiPopos />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-pearl mb-2 sm:mb-3">
                How to Use Document Analysis
              </h3>
              <ul className="text-skye space-y-1 sm:space-y-2 text-sm sm:text-base">
                <li className="flex items-start text-left">
                  <span className="mr-2 flex-shrink-0">1.</span>
                  <span>Upload a PDF document using the upload area above.</span>
                </li>
                <li className="flex items-start text-left">
                  <span className="mr-2 flex-shrink-0">2.</span>
                  <span>Wait for the AI to analyze your document with Gen-Z insights.</span>
                </li>
                <li className="flex items-start text-left">
                  <span className="mr-2 flex-shrink-0">3.</span>
                  <span>Explore the different categories and summaries provided.</span>
                </li>
                <li className="flex items-start text-left">
                  <span className="mr-2 flex-shrink-0">4.</span>
                  <span>Click &ldquo;Learn More&rdquo; for detailed breakdowns and insights.</span>
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
'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Download } from 'lucide-react';
import { Button } from '../button';
import { PDFPreviewProps, PreviewHeaderProps, PreviewContentProps, ErrorStateProps, PreviewFooterProps } from './types';
import { createFilePreviewUrl, revokeFilePreviewUrl, downloadFile, formatFileSize } from './helpers';

// Subcomponents for better organization
const PreviewHeader =({
  fileName,
  onDownload,
  onClose
}: PreviewHeaderProps) => (
  <div className="flex items-center justify-between p-4 border-b border-pearl">
    <div className="flex items-center space-x-2">
      <FileText size={20} className="text-red-500" />
      <h3 className="text-lg font-semibold text-gray-900 truncate">
        {fileName}
      </h3>
    </div>
    <div className="flex items-center space-x-2">
      <Button
        type="button"
        onClick={onDownload}
        size="lg"
        className="bg-pearl text-cerulean hover:bg-electric"
      >
        <Download size={16} className="mr-1" />
        Download
      </Button>
      <Button
        type="button"
        onClick={onClose}
        size="lg"
        className="text-razza bg-cerulean hover:bg-electric flex items-center justify-center"
      >
        <X size={16} />
      </Button>
    </div>
  </div>
);

const PreviewContent = ({ pdfUrl, fileName, error, onDownload, onError }: PreviewContentProps) => {
  if (error) {
    return <ErrorState error={error} onDownload={onDownload} />;
  }

  if (!pdfUrl) {
    return <LoadingState />;
  }

  return (
    <iframe
      src={pdfUrl}
      className="w-full h-full border border-obsidian rounded"
      title={`Preview of ${fileName}`}
      onError={onError}
    />
  );
};

const ErrorState = ({ error, onDownload }: ErrorStateProps) => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <FileText size={48} className="text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 mb-2">Unable to preview PDF</p>
      <p className="text-sm text-gray-500">{error}</p>
      <Button
        type="button"
        onClick={onDownload}
        variant="outline"
        className="mt-4"
      >
        <Download size={16} className="mr-1" />
        Download to view
      </Button>
    </div>
  </div>
);

const LoadingState = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <FileText size={48} className="text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">Loading preview...</p>
    </div>
  </div>
);

const PreviewFooter = ({ fileSize }: PreviewFooterProps) => (
  <div className="p-4 border-t border-obsidian bg-persian">
    <div className="flex items-center justify-between text-sm text-pearl">
      <span>File size: {formatFileSize(fileSize)}</span>
      <span>Type: PDF Document</span>
    </div>
  </div>
);

export function PDFPreview({ file, isOpen, onClose }: PDFPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Effect to manage PDF URL
  useEffect(() => {
    if (isOpen && file) {
      const url = createFilePreviewUrl(file);
      setPdfUrl(url);
      setError(null);

      return () => {
        revokeFilePreviewUrl(url);
      };
    }
  }, [file, isOpen]);

  // Event handlers
  const handleDownload = () => {
    if (pdfUrl) {
      downloadFile(pdfUrl, file.name);
    }
  };

  const handleError = () => {
    setError('PDF preview not supported in this browser');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99] bg-obsidian/50 flex items-center justify-center p-4">
      <div className="bg-ocean rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        <PreviewHeader
          fileName={file.name}
          onDownload={handleDownload}
          onClose={onClose}
        />

        <div className="flex-1 p-4">
          <PreviewContent
            pdfUrl={pdfUrl}
            fileName={file.name}
            error={error}
            onDownload={handleDownload}
            onError={handleError}
          />
        </div>

        <PreviewFooter fileSize={file.size} />
      </div>
    </div>
  );
}
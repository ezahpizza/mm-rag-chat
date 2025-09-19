
import React from 'react';
import {  DocumentUpload } from '@/components/global';
import { DocumentUploadSectionProps } from '@/components/compare/types';

export const DocumentUploadSection = ({
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
  <div className="bg-pearl rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
    <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">
      Upload Your Documents
    </h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
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
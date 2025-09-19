'use client';

import React, { useRef, useState } from 'react';
import { Button } from '../button';
import { Spinner } from '../spinner';
import { Upload, FileText, X, Eye } from 'lucide-react';
import { DocumentUploadProps, UploadZoneProps, FileDisplayProps, FileInfoProps, FileActionsProps } from '@/components/compare/types';
import { formatFileSize, validateDroppedFiles } from '@/components/compare/helpers';

// Subcomponents for better organization
const UploadZone = ({ onDrop, onDragOver, onDragLeave, onClick, dragOver, disabled, isUploading }: UploadZoneProps) => (
  <div
    className={`
      border-2 border-dashed rounded-lg p-4 sm:p-8 text-center cursor-pointer transition-all border-cerulean
      ${dragOver ? 'bg-ocean' : 'hover:border-gray-400'}
      ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-ocean/20'}
    `}
    onDrop={onDrop}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onClick={onClick}
  >
    {isUploading ? (
      <UploadingState />
    ) : (
      <IdleState />
    )}
  </div>
);

const UploadingState = () => (
  <div className="flex flex-col items-center space-y-3">
    <Spinner size={32} />
    <p className="text-gray-600">Uploading document...</p>
  </div>
);

const IdleState = () => (
  <div className="flex flex-col items-center space-y-2 sm:space-y-3">
    <Upload size={24} className="sm:w-8 sm:h-8 text-gray-400" />
    <div>
      <p className="text-gray-600 mb-1 text-sm sm:text-base">
        Drag and drop your PDF here, or{' '}
        <span className="text-blue-600 font-medium">click to browse</span>
      </p>
      <p className="text-xs sm:text-sm text-gray-500">
        Only PDF files are supported
      </p>
    </div>
  </div>
);

const FileDisplay = ({
  file,
  onPreview,
  onRemove,
  disabled
}: FileDisplayProps) => (
  <div className="border border-gray-200 rounded-lg p-4 bg-skye">
    <div className="flex items-center justify-between">
      <FileInfo file={file} />
      <FileActions 
        onPreview={onPreview} 
        onRemove={onRemove} 
        disabled={disabled} 
      />
    </div>
  </div>
);

const FileInfo = ({ file }: FileInfoProps) => (
  <div className="flex items-center space-x-3">
    <div className="flex-shrink-0 w-10 h-10 bg-electric rounded-lg flex items-center justify-center">
      <FileText size={20} className="text-pearl" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-obsidian truncate">
        {file.name}
      </p>
      <p className="text-sm text-gray-500">
        {formatFileSize(file.size)}
      </p>
    </div>
  </div>
);

const FileActions = ({
  onPreview,
  onRemove,
  disabled
}: FileActionsProps) => (
  <div className="flex items-center space-x-2">
    {onPreview && (
      <Button
        type="button"
        onClick={onPreview}
        size="sm"
        className="text-pearl bg-persian hover:bg-ocean transition-colors duration-150 flex items-center justify-center"
      >
        <Eye size={16} />
      </Button>
    )}
    <Button
      type="button"
      onClick={onRemove}
      size="sm"
      className="text-pearl bg-red-600 hover:bg-cerulean transition-colors duration-150 flex items-center justify-center"
      disabled={disabled}
    >
      <X size={16} />
    </Button>
  </div>
);

export function DocumentUpload({
  label,
  onFileUpload,
  onFileRemove,
  uploadedFile,
  isUploading,
  onPreview,
  disabled = false
}: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // Event handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const { validFiles, errors } = validateDroppedFiles(e.dataTransfer.files);
    
    if (validFiles.length > 0) {
      onFileUpload(validFiles[0]); // Take the first valid file
    }
    
    if (errors.length > 0) {
      console.warn('File validation errors:', errors);
      // Could emit errors to parent component if needed
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const openFileDialog = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{label}</h3>
      
      {!uploadedFile ? (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isUploading}
          />
          <UploadZone
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={openFileDialog}
            dragOver={dragOver}
            disabled={disabled}
            isUploading={isUploading}
          />
        </>
      ) : (
        <FileDisplay
          file={uploadedFile}
          onPreview={onPreview}
          onRemove={onFileRemove}
          disabled={disabled}
        />
      )}
    </div>
  );
}
'use client';

import React, { useRef, useState } from 'react';
import { Button } from '../button';
import { Spinner } from '../spinner';
import { Upload, FileText, X, Eye } from 'lucide-react';
import { DocumentUploadProps, UploadZoneProps, FileDisplayProps, FileInfoProps, FileActionsProps } from './types';
import { formatFileSize, validateDroppedFiles } from './helpers';

// Subcomponents for better organization
const UploadZone = ({ onDrop, onDragOver, onDragLeave, onClick, dragOver, disabled, isUploading }: UploadZoneProps) => (
  <div
    className={`
      border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
      ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
      ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
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
  <div className="flex flex-col items-center space-y-3">
    <Upload size={32} className="text-gray-400" />
    <div>
      <p className="text-gray-600 mb-1">
        Drag and drop your PDF here, or{' '}
        <span className="text-blue-600 font-medium">click to browse</span>
      </p>
      <p className="text-sm text-gray-500">
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
  <div className="border border-gray-200 rounded-lg p-4 bg-white">
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
    <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
      <FileText size={20} className="text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">
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
        variant="outline"
        size="sm"
        className="text-blue-600 border-blue-600 hover:bg-blue-50"
      >
        <Eye size={16} className="mr-1" />
        Preview
      </Button>
    )}
    <Button
      type="button"
      onClick={onRemove}
      variant="outline"
      size="sm"
      className="text-red-600 border-red-600 hover:bg-red-50"
      disabled={disabled}
    >
      <X size={16} className="mr-1" />
      Remove
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
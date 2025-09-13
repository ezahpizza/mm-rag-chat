import { FileValidationResult } from './types';

/**
 * File validation utilities
 */
export const validateFile = (file: File): FileValidationResult => {
  // Check file type
  if (file.type !== 'application/pdf') {
    return {
      isValid: false,
      error: 'Only PDF files are supported'
    };
  }

  // Check file size (50MB limit)
  const maxSize = 50 * 1024 * 1024; // 50MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 50MB'
    };
  }

  // Check if file has content
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'File appears to be empty'
    };
  }

  return { isValid: true };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Create object URL for file preview
 */
export const createFilePreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Cleanup object URL
 */
export const revokeFilePreviewUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};

/**
 * Download file from URL
 */
export const downloadFile = (url: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Extract file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toUpperCase() || 'FILE';
};

/**
 * Check if two files are the same
 */
export const filesAreEqual = (fileA: File | null, fileB: File | null): boolean => {
  if (!fileA || !fileB) return false;
  
  return fileA.name === fileB.name && 
         fileA.size === fileB.size && 
         fileA.lastModified === fileB.lastModified;
};

/**
 * Get file type icon
 */
export const getFileTypeIcon = (file: File): string => {
  if (file.type === 'application/pdf') {
    return '📄';
  }
  return '📁';
};

/**
 * Validate drag and drop files
 */
export const validateDroppedFiles = (files: FileList): { validFiles: File[]; errors: string[] } => {
  const validFiles: File[] = [];
  const errors: string[] = [];

  Array.from(files).forEach(file => {
    const validation = validateFile(file);
    if (validation.isValid) {
      validFiles.push(file);
    } else {
      errors.push(`${file.name}: ${validation.error}`);
    }
  });

  return { validFiles, errors };
};
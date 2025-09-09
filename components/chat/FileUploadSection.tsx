'use client';

import React, { useRef } from 'react';
import { Card, Button, Input, Label } from '../ui';
import { Spinner } from '../spinner';
import { handleUpload } from '../../app/chat/controllers/chatPageControllers';

interface FileUploadSectionProps {
  uploading: boolean;
  setUploading: React.Dispatch<React.SetStateAction<boolean>>;
  indexStatus: string | null;
  setIndexStatus: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function FileUploadSection({
  uploading,
  setUploading,
  indexStatus,
  setIndexStatus,
}: FileUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null!);

  return (
    <Card className="mb-4 p-4 bg-[#23272f]/90 shadow-2xl border border-sidebar-border rounded-2xl">
      <form
        onSubmit={(e) => handleUpload(e, fileInputRef, setUploading, setIndexStatus)}
        className="flex flex-col gap-2 md:flex-row md:items-end md:gap-4"
      >
        <div className="flex-1">
          <Label htmlFor="file-upload" className="text-gray-200">
            Upload PDFs or Images
          </Label>
          <Input
            id="file-upload"
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/png,image/jpeg"
            multiple
            className="mt-1 bg-background border-sidebar-border text-gray-100"
          />
        </div>
        <Button
          type="submit"
          disabled={uploading}
          className="mt-2 md:mt-0 min-w-[140px] bg-gray-300 hover:bg-sidebar-primary text-sidebar-primary font-semibold shadow-lg flex items-center justify-center gap-2"
        >
          {uploading ? <Spinner size={20} /> : null}
          {uploading ? 'Indexing...' : 'Upload & Index'}
        </Button>
      </form>
      {indexStatus && (
        <div
          className={`mt-3 text-sm ${
            indexStatus.includes('success') ? 'text-green-400' : 'text-red-400'
          } text-gray-200`}
        >
          {indexStatus}
        </div>
      )}
    </Card>
  );
}

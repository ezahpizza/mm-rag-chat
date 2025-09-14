import React from 'react';
import { ErrorDisplayProps } from '@/components/compare/types';

export const PageHeader = () => (
  <div className="m-8 mt-24">
    <h1 className="text-3xl font-bold text-pearl mb-2">
      Document Comparison
    </h1>
    <p className="text-ocean">
      Upload two legal documents to automatically identify differences, risks, and key variations in clauses.
    </p>
  </div>
);

export const ErrorDisplay = ({ error }: ErrorDisplayProps) => (
  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
    <div className="flex">
      <div className="text-red-800">
        <strong>Error:</strong> {error}
      </div>
    </div>
  </div>
);

export const ProgressDisplay = () => (
  <div className="mt-4 p-4 bg-ocean rounded-md">
    <div className="flex items-center">
      <div className="w-5 h-5 border-2 border-obsidian border-t-transparent rounded-full animate-spin mr-3" />
      <div>
        <p className="text-pearl font-medium">Processing your documents...</p>
        <p className="text-obsidian text-sm">
          This may take a few moments as we parse, index, and analyze your documents.
        </p>
      </div>
    </div>
  </div>
);

export const HelpSection = () => (
  <div className="bg-pearl mt-8 rounded-lg p-6">
    <h3 className="text-lg font-medium text-cerulean mb-3">
      How to Use Document Comparison
    </h3>
    <ul className="text-obsidian space-y-2">
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
);
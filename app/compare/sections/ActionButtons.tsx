import React from 'react';
import { Button } from '@/components/button';
import { ActionButtonsProps } from '@/components/compare/types';

export const ActionButtons = ({
  canCompare,
  isComparing,
  hasFiles,
  hasResults,
  onCompare,
  onReset,
  onClearResults
}: ActionButtonsProps) => (
  <div className="flex gap-3 flex-wrap">
    <Button
      onClick={onCompare}
      disabled={!canCompare}
      className="bg-electric text-pearl hover:bg-persian  disabled:opacity-50 flex"
    >
      {isComparing ? (
        <>
          <span className="mr-2">Processing...</span>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </>
      ) : (
        'Compare Documents'
      )}
    </Button>
    
    {hasFiles && (
      <Button
        onClick={onReset}
        className="bg-pearl text-cerulean hover:bg-electric"
        disabled={isComparing}
      >
        Reset All
      </Button>
    )}
    
    {hasResults && (
      <Button
        onClick={onClearResults}
        className="bg-pearl text-cerulean hover:bg-electric"      >
        Clear Results
      </Button>
    )}
  </div>
);
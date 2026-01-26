import { Button } from '@/components/button';
import { ActionButtonsProps } from '@/components/compare/types';
import { FiDownload } from 'react-icons/fi';

export const ActionButtons = ({
  canCompare,
  isComparing,
  hasFiles,
  hasResults,
  onCompare,
  onReset,
  onClearResults,
  onExportPDF,
  isExporting = false
}: ActionButtonsProps) => (
  <div className="flex gap-2 sm:gap-3 flex-wrap justify-center sm:justify-start">
    <Button
      onClick={onCompare}
      disabled={!canCompare}
      className="bg-electric text-pearl hover:bg-persian disabled:opacity-50 flex text-sm sm:text-base px-3 sm:px-4 py-2"
    >
      {isComparing ? (
        <>
          <span className="mr-2">Processing...</span>
          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </>
      ) : (
        'Compare Documents'
      )}
    </Button>
    
    {hasResults && onExportPDF && (
      <Button
        onClick={onExportPDF}
        disabled={isExporting}
        className="bg-razza text-white hover:bg-razza/80 flex items-center gap-1 sm:gap-2 text-sm sm:text-base px-3 sm:px-4 py-2"
      >
        {isExporting ? (
          <>
            <span>Exporting...</span>
            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </>
        ) : (
          <>
            <FiDownload className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Export PDF</span>
            <span className="sm:hidden">Export</span>
          </>
        )}
      </Button>
    )}
    
    {hasFiles && (
      <Button
        onClick={onReset}
        className="bg-pearl text-cerulean hover:bg-electric text-sm sm:text-base px-3 sm:px-4 py-2"
        disabled={isComparing}
      >
        <span className="hidden sm:inline">Reset All</span>
        <span className="sm:hidden">Reset</span>
      </Button>
    )}
    
    {hasResults && (
      <Button
        onClick={onClearResults}
        className="bg-pearl text-cerulean hover:bg-electric text-sm sm:text-base px-3 sm:px-4 py-2"
      >
        <span className="hidden sm:inline">Clear Results</span>
        <span className="sm:hidden">Clear</span>
      </Button>
    )}
  </div>
);